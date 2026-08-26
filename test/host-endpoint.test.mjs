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

  writeHead(status) {
    this.status = status
    this.headersSent = true
  }

  end(body = '') {
    this.body += body
    this.writableEnded = true
  }
}

function request(body) {
  const req = Readable.from([Buffer.from(JSON.stringify(body))])
  req.method = 'POST'
  req.headers = { 'content-type': 'application/json' }
  return req
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
  const ctx = {
    effect(factory) {
      return factory()
    },
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
  apply(ctx)
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
