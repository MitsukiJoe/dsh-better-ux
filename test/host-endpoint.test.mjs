import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { Readable } from 'node:stream'
import test from 'node:test'
import { apply, DEFAULT_OVERALL_INSTRUCTION, DEFAULT_RECENT_INSTRUCTION, IMMUTABLE_SUMMARY_INSTRUCTION } from '../index.js'

class Response extends EventEmitter {
  headersSent = false
  writableEnded = false
  status = 0
  body = ''

  headers = {}

  setHeader(name, value) {
    this.headers[String(name).toLowerCase()] = value
  }

  writeHead(status, headers = {}) {
    this.status = status
    this.headersSent = true
    for (const [name, value] of Object.entries(headers)) this.setHeader(name, value)
  }

  end(body = '') {
    this.body += body
    this.writableEnded = true
  }
}

function request(body, method = 'POST', url = '/') {
  const chunks = body === undefined ? [] : [Buffer.from(typeof body === 'string' ? body : JSON.stringify(body))]
  const req = Readable.from(chunks)
  req.method = method
  req.url = url
  req.headers = body === undefined ? {} : { 'content-type': 'application/json' }
  return req
}

function createMemoryStorage() {
  const tables = { settings: {}, summaries: {} }
  let activeWrites = 0
  let maxActiveWrites = 0
  let closeCount = 0
  const open = async () => ({
    async loadAll() {
      return { tables: structuredClone(tables), global: null }
    },
    async putRecord(table, key, value) {
      activeWrites += 1
      maxActiveWrites = Math.max(maxActiveWrites, activeWrites)
      await new Promise((resolve) => setImmediate(resolve))
      tables[table][key] = structuredClone(value)
      activeWrites -= 1
    },
    async deleteRecord(table, key) {
      activeWrites += 1
      maxActiveWrites = Math.max(maxActiveWrites, activeWrites)
      await new Promise((resolve) => setImmediate(resolve))
      delete tables[table][key]
      activeWrites -= 1
    },
    async close() {
      closeCount += 1
    },
  })
  return {
    service: { backend: { get: (name) => name === 'json' ? { kv: { open } } : undefined } },
    tables,
    get maxActiveWrites() { return maxActiveWrites },
    get closeCount() { return closeCount },
  }
}

test('serves isolated incremental summaries without appending session events', async () => {
  let handler
  let registeredPath
  let finishKind = 'stop'
  const calls = []
  const session = {
    id: 'session-1',
    events: [
      { seq: 1, type: 'user/message', data: { source: { kind: 'user' }, content: [{ type: 'text', text: '第一轮输入' }] } },
      { seq: 2, type: 'assistant/message', data: { message: { content: [{ type: 'text', text: '第一轮输出' }] } } },
      { seq: 3, type: 'user/message', data: { source: { kind: 'user' }, content: [{ type: 'text', text: '第二轮输入' }] } },
      { seq: 4, type: 'tool/call', data: { callId: 'call-1', name: 'read', arguments: { file: 'details' } } },
      { seq: 5, type: 'tool/result', data: { callId: 'call-1', message: { content: [{ type: 'text', text: '工具详情' }] } } },
      { seq: 6, type: 'assistant/message', data: { message: { content: [{ type: 'text', text: '第二轮输出' }] } } },
      { seq: 7, type: 'request/context', data: { provider: 'demo', model: 'model' } },
    ],
  }
  const storage = createMemoryStorage()
  const ctx = {
    effect(factory) {
      return factory()
    },
    storage: storage.service,
    webServer: {
      register(route) {
        registeredPath = route.path
        handler = route.handler
        return () => {}
      },
    },
    sessions: { get: (id) => id === 'session-1' ? session : undefined },
    llm: {
      async *stream(input) {
        calls.push(input)
        yield { type: 'block-end', index: 0, block: { type: 'text', text: JSON.stringify({ overall: '整'.repeat(450), recent: '近'.repeat(150) }) } }
        yield { type: 'usage', usage: { inputTokens: 120, outputTokens: 40, cacheReadTokens: 10 } }
        yield { type: 'finish', reason: { kind: finishKind } }
      },
    },
  }
  await apply(ctx)
  const res = new Response()
  await handler(request({
    sessionId: 'session-1',
    sinceSeq: 2,
    previous: { overall: '此前整个对话摘要', recent: '旧任务摘要' },
    fields: { overall: true, recent: true },
    instructions: { overall: '突出技术决策', recent: '只写本轮成果' },
    route: { provider: 'summary-provider', model: 'summary-model', reasoningEffort: 'low' },
  }), res)
  const result = JSON.parse(res.body)
  assert.equal(res.status, 200)
  assert.equal(registeredPath, '/api/dsh-better-ux/summary-v2')
  assert.equal(result.seq, 7)
  assert.equal(Array.from(result.overall).length, 450)
  assert.equal(Array.from(result.recent).length, 150)
  assert.equal(result.usage.inputTokens, 240)
  assert.equal(result.usage.outputTokens, 80)
  assert.equal(result.usage.cacheReadTokens, 20)
  assert.equal(calls.length, 2)

  const [overallCall, recentCall] = calls
  const overallPayload = JSON.parse(overallCall.messages[0].content[0].text)
  assert.equal(overallCall.provider, 'summary-provider')
  assert.equal(overallCall.model, 'summary-model')
  assert.equal(overallCall.reasoningEffort, 'low')
  assert.equal(overallCall.maxTokens, 4096)
  assert.equal(overallCall.sessionId, 'session-1')
  assert.equal(overallCall.messages[0].source.plugin, 'dsh-better-ux')
  assert.equal(overallPayload.previous.overall, '此前整个对话摘要')
  assert.match(overallPayload.timeline.overall, /第二轮输入/)
  assert.doesNotMatch(overallPayload.timeline.overall, /第一轮输入/)
  assert.equal(overallPayload.timeline.recent, '')
  assert.match(overallCall.system, /overall 要求：突出技术决策/)
  assert.doesNotMatch(overallCall.system, new RegExp(DEFAULT_OVERALL_INSTRUCTION))
  assert.match(overallCall.system, new RegExp(IMMUTABLE_SUMMARY_INSTRUCTION))

  const recentPayload = JSON.parse(recentCall.messages[0].content[0].text)
  assert.deepEqual(recentPayload.previous, { overall: '', recent: '' })
  assert.equal(recentPayload.timeline.overall, '')
  assert.equal(recentPayload.timeline.recent, '用户：第二轮输入\nAI：第二轮输出')
  assert.doesNotMatch(recentPayload.timeline.recent, /第一轮|工具/)
  assert.match(recentCall.system, /recent 要求：只写本轮成果/)
  assert.doesNotMatch(recentCall.system, new RegExp(DEFAULT_RECENT_INSTRUCTION))
  assert.match(recentCall.system, new RegExp(IMMUTABLE_SUMMARY_INSTRUCTION))
  assert.equal(session.events.length, 7)

  calls.length = 0
  const refreshRes = new Response()
  await handler(request({
    sessionId: 'session-1',
    sinceSeq: 7,
    refresh: true,
    previous: { overall: '缓存中的整个对话摘要', recent: '缓存中的最近任务' },
    fields: { overall: true, recent: true },
    instructions: {},
    route: { provider: 'summary-provider', model: 'summary-model', reasoningEffort: 'low' },
  }), refreshRes)
  assert.equal(refreshRes.status, 200)
  assert.equal(calls.length, 2)
  const refreshOverallPayload = JSON.parse(calls[0].messages[0].content[0].text)
  assert.equal(refreshOverallPayload.previous.overall, '缓存中的整个对话摘要')
  assert.equal(refreshOverallPayload.timeline.overall, '')

  calls.length = 0
  finishKind = 'max-tokens'
  const completeAtLimitRes = new Response()
  await handler(request({
    sessionId: 'session-1',
    sinceSeq: -1,
    previous: {},
    fields: { overall: true, recent: true },
    instructions: {},
    route: { provider: 'summary-provider', model: 'summary-model', reasoningEffort: 'low' },
  }), completeAtLimitRes)
  assert.equal(completeAtLimitRes.status, 200)
  assert.equal(calls.length, 2)
  assert.match(calls[0].system, new RegExp(DEFAULT_OVERALL_INSTRUCTION))
  assert.match(calls[1].system, new RegExp(DEFAULT_RECENT_INSTRUCTION))

  const missingRouteRes = new Response()
  await handler(request({ sessionId: 'session-1', fields: { overall: true, recent: true } }), missingRouteRes)
  assert.equal(missingRouteRes.status, 400)
  assert.equal(JSON.parse(missingRouteRes.body).error, '请先选择摘要模型')
})


test('persists shared settings and summaries with serialized CAS writes', async () => {
  const routes = new Map()
  const disposers = []
  const storage = createMemoryStorage()
  const ctx = {
    storage: storage.service,
    sessions: { get: () => undefined },
    llm: { async *stream() {} },
    webServer: {
      register(route) {
        routes.set(route.path, route.handler)
        return () => routes.delete(route.path)
      },
    },
    effect(factory) {
      const dispose = factory()
      if (typeof dispose === 'function') disposers.push(dispose)
      return dispose
    },
  }
  await apply(ctx)
  const handler = routes.get('/api/dsh-better-ux/state-v1')
  assert.equal(typeof handler, 'function')

  const empty = new Response()
  await handler(request(undefined, 'GET', '/api/dsh-better-ux/state-v1'), empty)
  assert.deepEqual(JSON.parse(empty.body), { version: 1, settings: null, summary: null, summaryRevision: 0 })

  const tolerantQuery = new Response()
  await handler(request(undefined, 'GET', '/api/dsh-better-ux/state-v1?foo=ignored'), tolerantQuery)
  assert.deepEqual(JSON.parse(tolerantQuery.body), { version: 1, settings: null, summary: null, summaryRevision: 0 })

  for (const selector of [
    '?summaries',
    '?summaries=0',
    '?summaries=01',
    '?summaries=1&summaries=1',
    '?summaries=1&sessionId=session-sync',
    '?summaries=1&sessionId=',
    '?summaries=1&foo=ignored',
  ]) {
    const invalidSelector = new Response()
    await handler(request(undefined, 'GET', '/api/dsh-better-ux/state-v1' + selector), invalidSelector)
    assert.equal(invalidSelector.status, 400)
  }

  const malformed = new Response()
  await handler(request('{', 'PATCH', '/api/dsh-better-ux/state-v1'), malformed)
  assert.equal(malformed.status, 400)

  const unsupported = new Response()
  await handler(request({ kind: 'settings', baseRevision: 0, patch: { toString: 'not-allowed' } }, 'PATCH', '/api/dsh-better-ux/state-v1'), unsupported)
  assert.equal(unsupported.status, 400)

  const initial = new Response()
  await handler(request({
    kind: 'settings',
    baseRevision: 0,
    patch: {
      'sessionRow.enabled': false,
      'modelPicker.closeOnPick': true,
      'mobileLayout.noAutoFocus': false,
      'mobileLayout.headerExpanded': false,
      'fontScale.mobile': 90,
      'conversationSummary.enabled': true,
      'conversationSummary.mode': 'left',
      'conversationSummary.contentShortcut': 'Tab',
      'conversationSummary.provider': 'provider',
      'conversationSummary.model': 'model',
      'conversationSummary.modelCollapsed': false,
      'conversationSummary.contentCollapsed': true,
      'conversationSummary.overallCollapsed': false,
      'conversationSummary.recentCollapsed': true,
      'workspaceView.groupBy': 'flat',
      'workspaceView.orderBy': 'manual',
    },
  }, 'PATCH', '/api/dsh-better-ux/state-v1'), initial)
  assert.equal(initial.status, 200)
  const initialRecord = JSON.parse(initial.body).settings
  assert.equal(initialRecord.revision, 1)
  assert.equal(initialRecord.value['sessionRow.enabled'], false)
  assert.equal(initialRecord.value['fontScale.mobile'], 90)
  assert.equal(initialRecord.value['conversationSummary.mode'], 'left')
  assert.equal(initialRecord.value['workspaceView.orderBy'], 'manual')

  const concurrent = await Promise.all([
    ['conversationSummary.contentCollapsed', false],
    ['conversationSummary.overallCollapsed', true],
  ].map(async ([key, value]) => {
    const res = new Response()
    await handler(request({ kind: 'settings', baseRevision: 1, patch: { [key]: value } }, 'PATCH', '/api/dsh-better-ux/state-v1'), res)
    return res
  }))
  assert.deepEqual(concurrent.map((res) => res.status).sort(), [200, 409])
  assert.equal(storage.maxActiveWrites, 1)

  const invalidSummaryField = new Response()
  await handler(request({
    kind: 'summary',
    sessionId: 'session-sync',
    baseRevision: 0,
    value: { overall: 123, recent: '最近任务', seq: 8, overallSeq: 8, usage: null },
  }, 'PATCH', '/api/dsh-better-ux/state-v1'), invalidSummaryField)
  assert.equal(invalidSummaryField.status, 400)

  const summaryPut = new Response()
  await handler(request({
    kind: 'summary',
    sessionId: 'session-sync',
    baseRevision: 0,
    value: { overall: '跨浏览器摘要', recent: '最近任务', seq: 8, overallSeq: 8, usage: null },
  }, 'PATCH', '/api/dsh-better-ux/state-v1'), summaryPut)
  assert.equal(summaryPut.status, 200)
  assert.equal(JSON.parse(summaryPut.body).summary.revision, 1)

  const summariesBeforeLiveManifest = structuredClone(storage.tables.summaries)
  const liveManifestResponse = new Response()
  await handler(request(undefined, 'GET', '/api/dsh-better-ux/state-v1?summaries=1'), liveManifestResponse)
  assert.equal(liveManifestResponse.status, 200)
  const liveManifest = JSON.parse(liveManifestResponse.body)
  assert.deepEqual(liveManifest, {
    version: 1,
    summaries: [['session-sync', { revision: 1, deleted: false }]],
  })
  assert.equal(Object.hasOwn(liveManifest.summaries[0][1], 'value'), false)
  assert.deepEqual(storage.tables.summaries, summariesBeforeLiveManifest)

  const readBack = new Response()
  await handler(request(undefined, 'GET', '/api/dsh-better-ux/state-v1?sessionId=session-sync'), readBack)
  const state = JSON.parse(readBack.body)
  assert.equal(state.summary.value.overall, '跨浏览器摘要')
  assert.equal(state.summaryRevision, 1)
  assert.equal(state.settings.revision, 2)

  const tolerantSessionRead = new Response()
  await handler(request(undefined, 'GET', '/api/dsh-better-ux/state-v1?sessionId=session-sync&foo=ignored'), tolerantSessionRead)
  assert.deepEqual(JSON.parse(tolerantSessionRead.body), state)

  const summaryUpdate = new Response()
  await handler(request({
    kind: 'summary',
    sessionId: 'session-sync',
    baseRevision: 1,
    value: { overall: '更新摘要', recent: '更新任务', seq: 9, overallSeq: 9, usage: null },
  }, 'PATCH', '/api/dsh-better-ux/state-v1'), summaryUpdate)
  assert.equal(summaryUpdate.status, 200)
  assert.equal(JSON.parse(summaryUpdate.body).summary.revision, 2)

  const missingDeleteRevision = new Response()
  await handler(request(undefined, 'DELETE', '/api/dsh-better-ux/state-v1?sessionId=session-sync'), missingDeleteRevision)
  assert.equal(missingDeleteRevision.status, 400)

  for (const invalidRevision of ['', '%20', '0x2']) {
    const invalidDeleteRevision = new Response()
    await handler(request(undefined, 'DELETE', '/api/dsh-better-ux/state-v1?sessionId=session-sync&baseRevision=' + invalidRevision), invalidDeleteRevision)
    assert.equal(invalidDeleteRevision.status, 400)
  }

  const staleDelete = new Response()
  await handler(request(undefined, 'DELETE', '/api/dsh-better-ux/state-v1?sessionId=session-sync&baseRevision=1'), staleDelete)
  assert.equal(staleDelete.status, 409)
  assert.equal(storage.tables.summaries['session-sync'].revision, 2)

  const removed = new Response()
  await handler(request(undefined, 'DELETE', '/api/dsh-better-ux/state-v1?sessionId=session-sync&baseRevision=2'), removed)
  assert.equal(removed.status, 204)
  assert.equal(storage.tables.summaries['session-sync'].deleted, true)
  assert.equal(storage.tables.summaries['session-sync'].revision, 3)

  const summariesBeforeDeletedManifest = structuredClone(storage.tables.summaries)
  const deletedManifestResponse = new Response()
  await handler(request(undefined, 'GET', '/api/dsh-better-ux/state-v1?summaries=1'), deletedManifestResponse)
  assert.equal(deletedManifestResponse.status, 200)
  const deletedManifest = JSON.parse(deletedManifestResponse.body)
  assert.deepEqual(deletedManifest, {
    version: 1,
    summaries: [['session-sync', { revision: 3, deleted: true }]],
  })
  assert.equal(Object.hasOwn(deletedManifest.summaries[0][1], 'value'), false)
  assert.deepEqual(storage.tables.summaries, summariesBeforeDeletedManifest)

  const afterDelete = new Response()
  await handler(request(undefined, 'GET', '/api/dsh-better-ux/state-v1?sessionId=session-sync'), afterDelete)
  assert.equal(JSON.parse(afterDelete.body).summary, null)
  assert.equal(JSON.parse(afterDelete.body).summaryRevision, 3)

  const staleCreate = new Response()
  await handler(request({
    kind: 'summary',
    sessionId: 'session-sync',
    baseRevision: 0,
    value: { overall: '陈旧摘要', recent: '陈旧任务', seq: 8, overallSeq: 8, usage: null },
  }, 'PATCH', '/api/dsh-better-ux/state-v1'), staleCreate)
  assert.equal(staleCreate.status, 409)
  assert.equal(JSON.parse(staleCreate.body).current.revision, 3)

  for (const dispose of disposers.reverse()) await dispose()
  assert.equal(storage.closeCount, 1)

  disposers.length = 0
  await apply(ctx)
  const reopenedHandler = routes.get('/api/dsh-better-ux/state-v1')
  const reopened = new Response()
  await reopenedHandler(request(undefined, 'GET', '/api/dsh-better-ux/state-v1?sessionId=session-sync'), reopened)
  assert.equal(JSON.parse(reopened.body).summary, null)
  assert.equal(JSON.parse(reopened.body).summaryRevision, 3)

  const recreated = new Response()
  await reopenedHandler(request({
    kind: 'summary',
    sessionId: 'session-sync',
    baseRevision: 3,
    value: { overall: '恢复摘要', recent: '恢复任务', seq: 10, overallSeq: 10, usage: null },
  }, 'PATCH', '/api/dsh-better-ux/state-v1'), recreated)
  assert.equal(recreated.status, 200)
  assert.equal(JSON.parse(recreated.body).summary.revision, 4)

  const unicodeSessionId = '😀'.repeat(257)
  const unicodeSummaryPut = new Response()
  await reopenedHandler(request({
    kind: 'summary',
    sessionId: unicodeSessionId,
    baseRevision: 0,
    value: { overall: 'Unicode 摘要', recent: '', seq: 1, overallSeq: 1, usage: null },
  }, 'PATCH', '/api/dsh-better-ux/state-v1'), unicodeSummaryPut)
  assert.equal(unicodeSummaryPut.status, 200)
  const unicodeManifestResponse = new Response()
  await reopenedHandler(request(undefined, 'GET', '/api/dsh-better-ux/state-v1?summaries=1'), unicodeManifestResponse)
  const unicodeManifest = JSON.parse(unicodeManifestResponse.body)
  assert.deepEqual(
    unicodeManifest.summaries.find(([sessionId]) => sessionId === unicodeSessionId),
    [unicodeSessionId, { revision: 1, deleted: false }],
  )

  const emptyDelete = new Response()
  await reopenedHandler(request(undefined, 'DELETE', '/api/dsh-better-ux/state-v1?sessionId=session-empty&baseRevision=0'), emptyDelete)
  assert.equal(emptyDelete.status, 204)
  assert.deepEqual(storage.tables.summaries['session-empty'], {
    revision: 1,
    updatedAt: storage.tables.summaries['session-empty'].updatedAt,
    value: null,
    deleted: true,
  })

  const repeatedEmptyDelete = new Response()
  await reopenedHandler(request(undefined, 'DELETE', '/api/dsh-better-ux/state-v1?sessionId=session-empty&baseRevision=1'), repeatedEmptyDelete)
  assert.equal(repeatedEmptyDelete.status, 204)
  assert.equal(storage.tables.summaries['session-empty'].revision, 2)
  assert.equal(storage.tables.summaries['session-empty'].deleted, true)

  const staleEmptyCreate = new Response()
  await reopenedHandler(request({
    kind: 'summary',
    sessionId: 'session-empty',
    baseRevision: 1,
    value: { overall: 'stale', recent: '', seq: 1, overallSeq: 1, usage: null },
  }, 'PATCH', '/api/dsh-better-ux/state-v1'), staleEmptyCreate)
  assert.equal(staleEmptyCreate.status, 409)
  assert.deepEqual(JSON.parse(staleEmptyCreate.body).current, storage.tables.summaries['session-empty'])

  for (const dispose of disposers.reverse()) await dispose()
  assert.equal(storage.closeCount, 2)
})
