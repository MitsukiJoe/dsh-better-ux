import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('loads the client bundle through the official module loader', async () => {
  let plugin
  const React = { createElement: () => null }
  const icons = new Proxy({}, { get: () => () => null })
  globalThis.window = {
    __ModuleLoader__: {
      load(definition) {
        plugin = definition.factory((id) => {
          if (id === 'react') return React
          if (id === 'react-dom') return { createPortal: () => null }
          if (id === '@deepseek-ai/dsh-client-ui-primitives') return icons
          throw new Error('unexpected module: ' + id)
        })
      },
    },
  }
  await import('../lib/client.js?client-load-test')
  assert.equal(typeof plugin.apply, 'function')
  assert.deepEqual(plugin.inject, ['slots', 'sessions', 'workspaces', 'modelDirectories', 'locale'])
  delete globalThis.window
})

test('removes every adjacent stale settings pending key', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const start = source.indexOf('    function loadSettingsPendingPatch() {')
  const end = source.indexOf('    function recordSettingsPending(patch) {', start)
  assert.ok(start >= 0 && end > start)
  const factory = new Function(
    'localStorage', 'getSyncedSettings', 'loadSettings',
    'SYNCED_SETTINGS_KEYS', 'SETTINGS_PENDING_PREFIX',
    source.slice(start, end) + String.fromCharCode(10) + 'return loadSettingsPendingPatch',
  )
  const values = new Map([
    ['pending:a', 'true'],
    ['pending:b', 'true'],
  ])
  const localStorage = {
    get length() { return values.size },
    key(index) { return [...values.keys()][index] ?? null },
    getItem(key) { return values.get(key) ?? null },
    removeItem(key) { values.delete(key) },
  }
  const loadPending = factory(
    localStorage,
    () => ({ a: false, b: false }),
    () => ({}),
    ['a', 'b'],
    'pending:',
  )

  assert.deepEqual(loadPending(), {})
  assert.equal(localStorage.length, 0)
})

test('reconciles archive epochs without rescanning unchanged snapshots', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const start = source.indexOf('    function startSummaryArchiveCleanup(ctx) {')
  const end = source.indexOf('    function loadSummary(sessionId)', start)
  assert.ok(start >= 0 && end > start)

  const summaryDeleteTokens = new Map()
  const archiveEpochs = new Map()
  const advanceSummaryArchiveEpoch = (sessionId) => {
    const key = String(sessionId)
    const next = (archiveEpochs.get(key) || 0) + 1
    archiveEpochs.set(key, next)
    return next
  }
  const storage = new Map([
    ['dsh-better-ux:summary:v1:old', 'legacy'],
    ['dsh-better-ux:summary:v2:a', JSON.stringify({ serverRevision: 5 })],
  ])
  const io = { get: 0, remove: 0 }
  const localStorage = {
    get length() { return storage.size },
    key: (index) => [...storage.keys()][index] ?? null,
    getItem: (key) => {
      io.get += 1
      return storage.get(key) ?? null
    },
    removeItem: (key) => {
      io.remove += 1
      storage.delete(key)
    },
  }
  const deletes = []
  const deleteSummaryFromHost = async (sessionId, revision, token) => {
    deletes.push({ sessionId, revision, live: summaryDeleteTokens.get(sessionId) === token })
    return true
  }
  const summaryCacheKey = (sessionId) => 'dsh-better-ux:summary:v2:' + encodeURIComponent(String(sessionId))
  const factory = new Function(
    'summaryDeleteTokens',
    'advanceSummaryArchiveEpoch',
    'deleteSummaryFromHost',
    'summaryCacheKey',
    'localStorage',
    'window',
    'yieldToMain',
    'LEGACY_SUMMARY_CACHE_PREFIX',
    'SUMMARY_CACHE_PREFIX',
    'return (' + source.slice(start, end).trim() + ')',
  )
  const startCleanup = factory(
    summaryDeleteTokens,
    advanceSummaryArchiveEpoch,
    deleteSummaryFromHost,
    summaryCacheKey,
    localStorage,
    { setTimeout, clearTimeout },
    async () => {},
    'dsh-better-ux:summary:v1:',
    'dsh-better-ux:summary:v2:',
  )

  let snapshot = { phase: 'pending', archivedSessionIds: [] }
  const subscribers = new Set()
  const list = {
    getSnapshot: () => snapshot,
    subscribe: (callback) => {
      subscribers.add(callback)
      return () => subscribers.delete(callback)
    },
  }
  const emit = async (next) => {
    snapshot = next
    for (const callback of [...subscribers]) callback()
    await new Promise(setImmediate)
    await new Promise(setImmediate)
  }
  const ctx = { workspaces: { list } }
  const first = startCleanup(ctx)

  assert.equal(summaryDeleteTokens.size, 0)
  await emit({ phase: 'ready', archivedSessionIds: ['a', 'b'] })
  await first.publishManifest({
    kind: 'manifest',
    summaries: new Map([['a', { revision: 8, deleted: false }]]),
  })
  assert.deepEqual(deletes.map(({ sessionId, revision }) => ({ sessionId, revision })), [
    { sessionId: 'a', revision: 8 },
  ])
  assert.equal(storage.has('dsh-better-ux:summary:v1:old'), false)
  assert.equal(storage.has(summaryCacheKey('a')), false)

  io.get = 0
  io.remove = 0
  for (let index = 0; index < 50; index += 1) {
    await emit({ phase: 'ready', archivedSessionIds: index % 2 ? ['a', 'b'] : ['b', 'a'] })
  }
  assert.deepEqual(io, { get: 0, remove: 0 })

  storage.set(summaryCacheKey('c'), JSON.stringify({ serverRevision: 0 }))
  await emit({ phase: 'ready', archivedSessionIds: ['a', 'b', 'c'] })
  await emit({ phase: 'ready', archivedSessionIds: ['a', 'b'] })
  await emit({ phase: 'ready', archivedSessionIds: ['a', 'b', 'c'] })
  assert.deepEqual(deletes.map(({ sessionId }) => sessionId), ['a', 'c', 'c'])
  assert.ok(deletes.every(({ live }) => live))
  assert.equal(archiveEpochs.get('c'), 3)

  const second = startCleanup(ctx)
  first.stop()
  assert.equal(summaryDeleteTokens.size, 3)

  storage.set(summaryCacheKey('d'), JSON.stringify({ serverRevision: 0 }))
  await emit({ phase: 'ready', archivedSessionIds: ['a', 'b', 'c', 'd'] })
  assert.equal(deletes.at(-1)?.sessionId, 'd')
  assert.equal(summaryDeleteTokens.size, 4)

  second.stop()
  assert.equal(summaryDeleteTokens.size, 0)
})

test('accepts every Host-valid Unicode session id in the summary manifest', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const start = source.indexOf('    async function readSummaryManifest(signal) {')
  const end = source.indexOf('    async function migrateCachedSummariesToHostUnlocked', start)
  assert.ok(start >= 0 && end > start)

  const factory = new Function(
    'fetch',
    'STATE_ROUTE',
    'retryableStatus',
    source.slice(start, end) + '\nreturn readSummaryManifest',
  )
  const sessionId = '😀'.repeat(257)
  const readManifest = factory(
    async () => ({
      ok: true,
      status: 200,
      json: async () => ({ version: 1, summaries: [[sessionId, { revision: 1, deleted: false }]] }),
    }),
    '/state',
    () => false,
  )

  const result = await readManifest(new AbortController().signal)
  assert.equal(result.kind, 'manifest')
  assert.deepEqual(result.summaries.get(sessionId), { revision: 1, deleted: false })
})

test('blocks delayed summary GET and PATCH writes after component disposal', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const extractAssignment = (startMarker, endMarker) => {
    const start = source.indexOf(startMarker)
    const end = source.indexOf(endMarker, start)
    assert.ok(start >= 0 && end > start)
    return source.slice(start + startMarker.length, end).trim()
  }
  const local = {
    overall: '', recent: '', seq: -1, overallSeq: -1,
    revision: 0, serverRevision: 0, syncOverall: false, syncRecent: false,
  }
  const makeOwner = () => ({ controller: new AbortController() })
  const makeRefs = (owner) => ({
    lifecycleRef: { current: owner },
    activeRef: { current: true },
    sessionRef: { current: 's' },
    summaryRef: { current: local },
    pendingSummaryWrites: { current: new Map() },
  })

  {
    const expression = extractAssignment(
      '      const patchSessionSummaryToHost = ',
      '\n\n      React.useEffect(() => {',
    )
    const factory = new Function(
      'STATE_ROUTE', 'summaryDeleteTokens', 'summaryArchiveEpoch', 'pendingSummaryWrites', 'lifecycleRef', 'activeRef',
      'loadSummary', 'normalizedSummaryValue', 'resolveSummaryCache', 'storeSummary',
      'sessionRef', 'summaryRef', 'setSummary', 'EMPTY_SUMMARY', 'mergeSummaryValues', 'fetch',
      'scheduleSummarySyncRetry', 'clearSummarySyncRetry', 'retryableStatus',
      'return (' + expression + ')',
    )
    const owner = makeOwner()
    const refs = makeRefs(owner)
    let resolveJson
    let fetchOptions
    let stores = 0
    const patch = factory(
      '/state', new Map(), () => 0, refs.pendingSummaryWrites, refs.lifecycleRef, refs.activeRef,
      () => local, (value) => value, (_current, value) => value, () => { stores += 1 },
      refs.sessionRef, refs.summaryRef, () => {}, local, () => { throw new Error('unexpected merge') },
      async (_url, options) => {
        fetchOptions = options
        return { ok: true, status: 200, json: () => new Promise((resolve) => { resolveJson = resolve }) }
      },
      () => {},
      () => {},
      (status) => status === 408 || status === 429 || status >= 500,
    )
    const pending = patch('s', local, 0, { overall: true, recent: true }, owner)
    while (!resolveJson) await new Promise(setImmediate)
    refs.activeRef.current = false
    refs.lifecycleRef.current = null
    owner.controller.abort()
    resolveJson({ summary: { revision: 1 } })
    await pending
    assert.equal(fetchOptions?.signal, owner.controller.signal)
    assert.equal(stores, 0)
  }

  {
    const expression = extractAssignment(
      '      const fetchSessionSummary = ',
      '\n\n      const patchSessionSummaryToHost = ',
    )
    const factory = new Function(
      'STATE_ROUTE', 'summaryDeleteTokens', 'summaryArchiveEpoch', 'lifecycleRef', 'activeRef', 'sessionRef',
      'loadSummary', 'pendingSummaryWrites', 'normalizedSummaryValue', 'mergeSummaryValues',
      'patchSessionSummaryToHost', 'storeSummary', 'summaryRef', 'setSummary', 'EMPTY_SUMMARY', 'fetch',
      'return (' + expression + ')',
    )
    const owner = makeOwner()
    const refs = makeRefs(owner)
    let resolveJson
    let fetchOptions
    let stores = 0
    let patches = 0
    const fetchSummary = factory(
      '/state', new Map(), () => 0, refs.lifecycleRef, refs.activeRef, refs.sessionRef,
      () => local, refs.pendingSummaryWrites, (value) => value,
      () => { throw new Error('unexpected merge') }, async () => { patches += 1 },
      () => { stores += 1 }, refs.summaryRef, () => {}, local,
      async (_url, options) => {
        fetchOptions = options
        return { ok: true, status: 200, json: () => new Promise((resolve) => { resolveJson = resolve }) }
      },
    )
    const pending = fetchSummary('s')
    while (!resolveJson) await new Promise(setImmediate)
    refs.activeRef.current = false
    refs.lifecycleRef.current = null
    owner.controller.abort()
    resolveJson({ summary: { revision: 1, value: { overall: 'server', recent: '', seq: 1, overallSeq: 1 } } })
    await pending
    assert.equal(fetchOptions?.signal, owner.controller.signal)
    assert.equal(stores, 0)
    assert.equal(patches, 0)
  }
})

test('fences delayed summary GET and PATCH writes across archive ABA epochs', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const extractAssignment = (startMarker, endMarker) => {
    const start = source.indexOf(startMarker)
    const end = source.indexOf(endMarker, start)
    assert.ok(start >= 0 && end > start)
    return source.slice(start + startMarker.length, end).trim()
  }
  const local = {
    overall: 'local', recent: '', seq: 1, overallSeq: 1,
    revision: 1, serverRevision: 0, syncOverall: true, syncRecent: false,
  }
  const owner = { controller: new AbortController() }
  const refs = {
    lifecycleRef: { current: owner }, activeRef: { current: true }, sessionRef: { current: 's' },
    summaryRef: { current: local }, pendingSummaryWrites: { current: new Map() },
  }
  const archiveEpochs = new Map()
  const getArchiveEpoch = (sessionId) => archiveEpochs.get(String(sessionId)) || 0

  {
    const expression = extractAssignment(
      '      const patchSessionSummaryToHost = ',
      '      React.useEffect(() => {',
    )
    const factory = new Function(
      'STATE_ROUTE', 'summaryDeleteTokens', 'summaryArchiveEpoch', 'claimSummarySyncAttempt',
      'pendingSummaryWrites', 'lifecycleRef', 'activeRef', 'loadSummary', 'normalizedSummaryValue',
      'resolveSummaryCache', 'storeSummary', 'sessionRef', 'summaryRef', 'setSummary', 'EMPTY_SUMMARY',
      'mergeSummaryValues', 'fetch', 'scheduleSummarySyncRetry', 'clearSummarySyncRetry', 'retryableStatus',
      'return (' + expression + ')',
    )
    let resolveJson
    let stores = 0
    const patch = factory(
      '/state', new Map(), getArchiveEpoch, () => ({ overall: 1, recent: 0 }),
      refs.pendingSummaryWrites, refs.lifecycleRef, refs.activeRef, () => local, (value) => value,
      (_current, value) => value, () => { stores += 1 }, refs.sessionRef, refs.summaryRef, () => {},
      local, () => { throw new Error('unexpected merge') },
      async () => ({ ok: true, status: 200, json: () => new Promise((resolve) => { resolveJson = resolve }) }),
      () => {}, () => {}, (status) => status === 408 || status === 429 || status >= 500,
    )
    const pending = patch('s', local, 0, { overall: true, recent: false }, owner)
    while (!resolveJson) await new Promise(setImmediate)
    archiveEpochs.set('s', 2)
    resolveJson({ summary: { revision: 1 } })
    assert.equal(await pending, 'aborted')
    assert.equal(stores, 0)
  }

  archiveEpochs.set('s', 0)
  {
    const expression = extractAssignment(
      '      const fetchSessionSummary = ',
      '      const patchSessionSummaryToHost = ',
    )
    const factory = new Function(
      'STATE_ROUTE', 'summaryDeleteTokens', 'summaryArchiveEpoch', 'lifecycleRef', 'activeRef', 'sessionRef',
      'loadSummary', 'pendingSummaryWrites', 'normalizedSummaryValue', 'mergeSummaryValues',
      'patchSessionSummaryToHost', 'storeSummary', 'summaryRef', 'setSummary', 'EMPTY_SUMMARY', 'fetch',
      'return (' + expression + ')',
    )
    let resolveJson
    let stores = 0
    let patches = 0
    const fetchSummary = factory(
      '/state', new Map(), getArchiveEpoch, refs.lifecycleRef, refs.activeRef, refs.sessionRef,
      () => local, refs.pendingSummaryWrites, (value) => value,
      () => { throw new Error('unexpected merge') }, async () => { patches += 1 },
      () => { stores += 1 }, refs.summaryRef, () => {}, local,
      async () => ({ ok: true, status: 200, json: () => new Promise((resolve) => { resolveJson = resolve }) }),
    )
    const pending = fetchSummary('s')
    while (!resolveJson) await new Promise(setImmediate)
    archiveEpochs.set('s', 2)
    resolveJson({ summary: { revision: 1, value: { overall: 'server', recent: '', seq: 1, overallSeq: 1 } } })
    await pending
    assert.equal(stores, 0)
    assert.equal(patches, 0)
  }
})

test('recreates a dirty summary over a late archive tombstone', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const marker = '      const patchSessionSummaryToHost = '
  const start = source.indexOf(marker)
  const end = source.indexOf('      React.useEffect(() => {', start)
  assert.ok(start >= 0 && end > start)
  const factory = new Function(
    'STATE_ROUTE', 'summaryDeleteTokens', 'summaryArchiveEpoch', 'pendingSummaryWrites',
    'lifecycleRef', 'activeRef', 'loadSummary', 'normalizedSummaryValue', 'resolveSummaryCache',
    'storeSummary', 'sessionRef', 'summaryRef', 'setSummary', 'EMPTY_SUMMARY', 'mergeSummaryValues',
    'fetch', 'scheduleSummarySyncRetry', 'clearSummarySyncRetry', 'retryableStatus',
    'return (' + source.slice(start + marker.length, end).trim() + ')',
  )
  const owner = { controller: new AbortController() }
  let cache = {
    overall: 'new', recent: '', seq: 2, overallSeq: 2, revision: 2,
    serverRevision: 0, syncOverall: true, syncRecent: false,
  }
  const calls = []
  const patch = factory(
    '/state', new Map(), () => 0, { current: new Map() }, { current: owner }, { current: true },
    () => cache,
    (value) => ({ overall: String(value?.overall || ''), recent: String(value?.recent || ''), seq: value?.seq ?? -1, overallSeq: value?.overallSeq ?? -1, usage: null }),
    (_current, value, serverRevision) => ({ ...value, serverRevision, syncOverall: false, syncRecent: false }),
    (_sessionId, value) => { cache = value }, { current: 's' }, { current: cache }, () => {},
    { overall: '', recent: '', seq: -1, overallSeq: -1, revision: 0, serverRevision: 0, syncOverall: false, syncRecent: false },
    (local, server, fields) => ({
      value: {
        overall: fields.overall ? local.overall : server.overall,
        recent: fields.recent ? local.recent : server.recent,
        seq: fields.recent ? local.seq : server.seq,
        overallSeq: fields.overall ? local.overallSeq : server.overallSeq,
        usage: null,
      },
      localFields: fields,
    }),
    async (_url, options) => {
      calls.push(JSON.parse(options.body))
      if (calls.length === 1) {
        return { ok: false, status: 409, json: async () => ({ current: { revision: 1, deleted: true, value: null } }) }
      }
      return { ok: true, status: 200, json: async () => ({ summary: { revision: 2 } }) }
    },
    () => {}, () => {}, (status) => status === 408 || status === 429 || status >= 500,
  )

  assert.equal(await patch('s', cache, 0, { overall: true, recent: false }, owner), 'synced')
  assert.equal(calls.length, 2)
  assert.equal(calls[1].baseRevision, 1)
  assert.equal(calls[1].value.overall, 'new')
  assert.equal(cache.overall, 'new')
  assert.equal(cache.serverRevision, 2)
  assert.equal(cache.syncOverall, false)
})

test('recreates dirty cached summary when GET observes a tombstone', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const marker = '      const fetchSessionSummary = '
  const start = source.indexOf(marker)
  const end = source.indexOf('      const patchSessionSummaryToHost = ', start)
  assert.ok(start >= 0 && end > start)
  const factory = new Function(
    'STATE_ROUTE', 'summaryDeleteTokens', 'summaryArchiveEpoch', 'lifecycleRef', 'activeRef', 'sessionRef',
    'loadSummary', 'pendingSummaryWrites', 'normalizedSummaryValue', 'mergeSummaryValues',
    'patchSessionSummaryToHost', 'storeSummary', 'summaryRef', 'setSummary', 'EMPTY_SUMMARY', 'fetch',
    'return (' + source.slice(start + marker.length, end).trim() + ')',
  )
  const local = {
    overall: 'new', recent: '', seq: 2, overallSeq: 2, revision: 2,
    serverRevision: 0, syncOverall: true, syncRecent: false,
  }
  const owner = { controller: new AbortController() }
  const patches = []
  let stores = 0
  const fetchSummary = factory(
    '/state', new Map(), () => 0, { current: owner }, { current: true }, { current: 's' },
    () => local, { current: new Map() }, (value) => value,
    () => { throw new Error('unexpected merge') }, async (...args) => { patches.push(args) },
    () => { stores += 1 }, { current: local }, () => {}, local,
    async () => ({ ok: true, status: 200, json: async () => ({ summary: null, summaryRevision: 1 }) }),
  )

  await fetchSummary('s')
  assert.equal(stores, 0)
  assert.equal(patches.length, 1)
  assert.equal(patches[0][2], 1)
  assert.deepEqual(patches[0][3], { overall: true, recent: false })
})

test('tombstones an empty Host summary before archive deletion completes', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const start = source.indexOf('    async function deleteSummaryFromHost(sessionId, knownRevision, token) {')
  const end = source.indexOf('    function startSummaryArchiveCleanup(ctx) {', start)
  assert.ok(start >= 0 && end > start)

  const summaryDeleteTokens = new Map()
  const calls = []
  const token = { controller: new AbortController() }
  summaryDeleteTokens.set('s', token)
  const factory = new Function(
    'summaryDeleteTokens', 'STATE_ROUTE', 'retryableStatus', 'fetch',
    source.slice(start, end) + '\nreturn deleteSummaryFromHost',
  )
  const remove = factory(
    summaryDeleteTokens,
    '/state',
    (status) => status === 408 || status === 429 || status >= 500,
    async (url, options = {}) => {
      const method = options.method || 'GET'
      calls.push({ method, url, signal: options.signal })
      if (method === 'GET') {
        return { ok: true, status: 200, json: async () => ({ summary: null, summaryRevision: 0 }) }
      }
      return { ok: true, status: 200, json: async () => ({}) }
    },
  )

  assert.equal(await remove('s', null, token), true)
  assert.deepEqual(calls.map(({ method, url }) => ({ method, url })), [
    { method: 'GET', url: '/state?sessionId=s' },
    { method: 'DELETE', url: '/state?sessionId=s&baseRevision=0' },
  ])
  assert.ok(calls.every(({ signal }) => signal === token.controller.signal))
})

test('keeps one archive retry timer while manifest reconciliation overlaps', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const start = source.indexOf('    function startSummaryArchiveCleanup(ctx) {')
  const end = source.indexOf('    function loadSummary(sessionId)', start)
  assert.ok(start >= 0 && end > start)

  const summaryDeleteTokens = new Map()
  const timers = new Map()
  let nextTimer = 1
  let deleteCalls = 0
  const fakeWindow = {
    setTimeout(callback) {
      const id = nextTimer++
      timers.set(id, callback)
      return id
    },
    clearTimeout(id) {
      timers.delete(id)
    },
  }
  const localStorage = {
    get length() { return 0 },
    key: () => null,
    getItem: () => null,
    removeItem: () => {},
  }
  const summaryCacheKey = (sessionId) => 'dsh-better-ux:summary:v2:' + encodeURIComponent(String(sessionId))
  const factory = new Function(
    'summaryDeleteTokens', 'advanceSummaryArchiveEpoch', 'deleteSummaryFromHost', 'summaryCacheKey', 'localStorage', 'window',
    'yieldToMain', 'LEGACY_SUMMARY_CACHE_PREFIX', 'SUMMARY_CACHE_PREFIX',
    'return (' + source.slice(start, end).trim() + ')',
  )
  const startCleanup = factory(
    summaryDeleteTokens,
    () => 0,
    async () => { deleteCalls += 1; return false },
    summaryCacheKey,
    localStorage,
    fakeWindow,
    async () => {},
    'dsh-better-ux:summary:v1:',
    'dsh-better-ux:summary:v2:',
  )

  let snapshot = { phase: 'ready', archivedSessionIds: [] }
  const subscribers = new Set()
  const ctx = { workspaces: { list: {
    getSnapshot: () => snapshot,
    subscribe(callback) { subscribers.add(callback); return () => subscribers.delete(callback) },
  } } }
  const cleanup = startCleanup(ctx)
  snapshot = { phase: 'ready', archivedSessionIds: ['s'] }
  for (const callback of subscribers) callback()
  await new Promise(setImmediate)
  await new Promise(setImmediate)
  assert.equal(deleteCalls, 1)
  assert.equal(timers.size, 1)

  await cleanup.publishManifest({ kind: 'manifest', summaries: new Map() })
  assert.equal(deleteCalls, 1)
  assert.equal(timers.size, 1)
  cleanup.stop()
  assert.equal(timers.size, 0)
})

test('propagates retry after transient per-record summary migration failures', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const start = source.indexOf('    async function migrateCachedSummariesToHostUnlocked(signal, publishManifest, retrySessionIds, nextRetrySessionIds) {')
  const end = source.indexOf('    async function migrateCachedSummariesToHost(signal, publishManifest, retrySessionIds, nextRetrySessionIds) {', start)
  assert.ok(start >= 0 && end > start)
  const factory = new Function(
    'readSummaryManifest', 'localStorage', 'SUMMARY_CACHE_PREFIX', 'summaryDeleteTokens', 'summaryArchiveEpoch', 'loadSummary',
    'yieldToMain', 'STATE_ROUTE', 'fetch', 'normalizedSummaryValue', 'resolveSummaryCache',
    'storeSummary', 'mergeSummaryValues', 'retryableStatus',
    source.slice(start, end) + '\nreturn migrateCachedSummariesToHostUnlocked',
  )
  const local = {
    overall: 'local', recent: '', seq: 1, overallSeq: 1, revision: 1,
    serverRevision: 1, syncOverall: true, syncRecent: false,
  }
  const make = (manifest, fetchImpl) => factory(
    async () => manifest,
    { length: 1, key: () => 'dsh-better-ux:summary:v2:s', removeItem: () => {} },
    'dsh-better-ux:summary:v2:',
    new Map(),
    () => 0,
    () => local,
    async () => {},
    '/state',
    fetchImpl,
    (value) => value || { overall: '', recent: '', seq: -1, overallSeq: -1 },
    (_local, value) => value,
    () => {},
    (value) => ({ value, localFields: { overall: true, recent: false } }),
    (status) => status === 408 || status === 429 || status >= 500,
  )
  const signal = new AbortController().signal
  const detailFailure = make(
    { kind: 'manifest', summaries: new Map([['s', { revision: 2, deleted: false }]]) },
    async () => { throw new Error('offline') },
  )
  const patchFailure = make(
    { kind: 'manifest', summaries: new Map() },
    async () => ({ ok: false, status: 503, json: async () => ({}) }),
  )

  assert.deepEqual(await Promise.all([
    detailFailure(signal),
    patchFailure(signal),
  ]), ['retry', 'retry'])

  const calls = []
  const clean = {
    overall: 'same', recent: '', seq: 1, overallSeq: 1, revision: 1,
    serverRevision: 1, syncOverall: false, syncRecent: false,
  }
  let bFailed = false
  let keyReads = 0
  const selectiveRetry = factory(
    async () => ({ kind: 'legacy' }),
    { length: 2, key: (index) => { keyReads += 1; return 'dsh-better-ux:summary:v2:' + (index === 0 ? 'a' : 'b') }, removeItem: () => {} },
    'dsh-better-ux:summary:v2:', new Map(), () => 0, () => clean, async () => {}, '/state',
    async (url) => {
      const id = new URL(url, 'http://local').searchParams.get('sessionId')
      calls.push(id)
      if (id === 'b' && !bFailed) {
        bFailed = true
        return { ok: false, status: 503, json: async () => ({}) }
      }
      return { ok: true, status: 200, json: async () => ({
        summary: { revision: 1, value: clean }, summaryRevision: 1,
      }) }
    },
    (value) => value || { overall: '', recent: '', seq: -1, overallSeq: -1 },
    (_local, value) => value, () => {},
    () => { throw new Error('unexpected merge') },
    (status) => status === 408 || status === 429 || status >= 500,
  )
  const retryIds = new Set()
  assert.equal(await selectiveRetry(signal, null, null, retryIds), 'retry')
  assert.equal(keyReads, 2)
  assert.deepEqual([...retryIds], ['b'])
  const nextRetryIds = new Set()
  assert.equal(await selectiveRetry(signal, null, retryIds, nextRetryIds), undefined)
  assert.equal(keyReads, 2)
  assert.deepEqual(calls, ['a', 'b', 'b'])
})

test('fences delayed summary migration writes across archive ABA epochs', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const start = source.indexOf('    async function migrateCachedSummariesToHostUnlocked(signal, publishManifest, retrySessionIds, nextRetrySessionIds) {')
  const end = source.indexOf('    async function migrateCachedSummariesToHost(signal, publishManifest, retrySessionIds, nextRetrySessionIds) {', start)
  assert.ok(start >= 0 && end > start)
  const factory = new Function(
    'readSummaryManifest', 'localStorage', 'SUMMARY_CACHE_PREFIX', 'summaryDeleteTokens',
    'summaryArchiveEpoch', 'loadSummary', 'yieldToMain', 'STATE_ROUTE', 'fetch',
    'normalizedSummaryValue', 'resolveSummaryCache', 'storeSummary', 'mergeSummaryValues', 'retryableStatus',
    source.slice(start, end) + String.fromCharCode(10) + 'return migrateCachedSummariesToHostUnlocked',
  )
  const epochs = new Map()
  const local = {
    overall: 'local', recent: '', seq: 1, overallSeq: 1, revision: 1,
    serverRevision: 0, syncOverall: true, syncRecent: false,
  }
  let resolvePatch
  let stores = 0
  const migrate = factory(
    async () => ({ kind: 'manifest', summaries: new Map() }),
    { length: 1, key: () => 'dsh-better-ux:summary:v2:s', removeItem: () => {} },
    'dsh-better-ux:summary:v2:', new Map(), (sessionId) => epochs.get(String(sessionId)) || 0,
    () => local, async () => {}, '/state',
    async () => ({ ok: true, status: 200, json: () => new Promise((resolve) => { resolvePatch = resolve }) }),
    (value) => value || { overall: '', recent: '', seq: -1, overallSeq: -1 },
    (_current, value) => value, () => { stores += 1 },
    (value) => ({ value, localFields: { overall: true, recent: false } }),
    (status) => status === 408 || status === 429 || status >= 500,
  )

  const pending = migrate(new AbortController().signal)
  while (!resolvePatch) await new Promise(setImmediate)
  epochs.set('s', 2)
  resolvePatch({ summary: { revision: 1 } })
  await pending
  assert.equal(stores, 0)

  epochs.set('s', 0)
  stores = 0
  let resolveDetail
  let requests = 0
  const migrateLegacy = factory(
    async () => ({ kind: 'legacy' }),
    { length: 1, key: () => 'dsh-better-ux:summary:v2:s', removeItem: () => {} },
    'dsh-better-ux:summary:v2:', new Map(), (sessionId) => epochs.get(String(sessionId)) || 0,
    () => local, async () => {}, '/state',
    async () => {
      requests += 1
      if (requests > 1) throw new Error('stale migration attempted PATCH')
      return { ok: true, status: 200, json: () => new Promise((resolve) => { resolveDetail = resolve }) }
    },
    (value) => value || { overall: '', recent: '', seq: -1, overallSeq: -1 },
    (_current, value) => value, () => { stores += 1 },
    (value) => ({ value, localFields: { overall: true, recent: false } }),
    (status) => status === 408 || status === 429 || status >= 500,
  )
  const legacyPending = migrateLegacy(new AbortController().signal)
  while (!resolveDetail) await new Promise(setImmediate)
  epochs.set('s', 2)
  resolveDetail({ summary: { revision: 1, value: { overall: 'server', recent: '', seq: 1, overallSeq: 1 } } })
  await legacyPending
  assert.equal(requests, 1)
  assert.equal(stores, 0)
})

test('classifies and schedules live summary PATCH failures', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const start = source.indexOf('      const patchSessionSummaryToHost = ')
  const end = source.indexOf('\n\n      React.useEffect(() => {', start)
  assert.ok(start >= 0 && end > start)
  const expression = source.slice(start + '      const patchSessionSummaryToHost = '.length, end).trim()
  const factory = new Function(
    'STATE_ROUTE', 'summaryDeleteTokens', 'summaryArchiveEpoch', 'pendingSummaryWrites', 'lifecycleRef', 'activeRef',
    'loadSummary', 'normalizedSummaryValue', 'resolveSummaryCache', 'storeSummary',
    'sessionRef', 'summaryRef', 'setSummary', 'EMPTY_SUMMARY', 'mergeSummaryValues', 'fetch',
    'scheduleSummarySyncRetry', 'clearSummarySyncRetry', 'retryableStatus',
    'return (' + expression + ')',
  )
  const local = {
    overall: 'local', recent: '', seq: 1, overallSeq: 1, revision: 1,
    serverRevision: 0, syncOverall: true, syncRecent: false,
  }
  const run = async (fetchImpl) => {
    const owner = { controller: new AbortController() }
    const lifecycleRef = { current: owner }
    const pendingSummaryWrites = { current: new Map() }
    let scheduled = 0
    let cleared = 0
    let current = local
    const patch = factory(
      '/state', new Map(), () => 0, pendingSummaryWrites, lifecycleRef, { current: true },
      () => current, (value) => value,
      (_current, value) => ({ ...value, syncOverall: false, syncRecent: false }),
      (_sessionId, value) => { current = value },
      { current: 's' }, { current: local }, () => {}, local,
      () => { throw new Error('unexpected merge') }, fetchImpl,
      () => { scheduled += 1 }, () => { cleared += 1 },
      (status) => status === 408 || status === 429 || status >= 500,
    )
    return { outcome: await patch('s', local, 0, { overall: true, recent: false }, owner), scheduled, cleared }
  }

  assert.deepEqual(await run(async () => { throw new Error('offline') }), { outcome: 'retry', scheduled: 1, cleared: 0 })
  assert.deepEqual(await run(async () => ({ ok: false, status: 503, json: async () => ({}) })), { outcome: 'retry', scheduled: 1, cleared: 0 })
  assert.deepEqual(await run(async () => ({ ok: false, status: 400, json: async () => ({}) })), { outcome: 'failed', scheduled: 0, cleared: 1 })
  assert.deepEqual(await run(async () => ({ ok: true, status: 200, json: async () => ({ summary: { revision: 1 } }) })), { outcome: 'synced', scheduled: 0, cleared: 1 })
})

test('keeps a newer same-field retry after an older PATCH succeeds', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const start = source.indexOf('      const clearSummarySyncRetry = ')
  const end = source.indexOf('      React.useEffect(() => {', start)
  assert.ok(start >= 0 && end > start)
  const normalizedSummaryValue = (value) => ({
    overall: String(value?.overall || ''), recent: String(value?.recent || ''),
    seq: Number.isSafeInteger(value?.seq) ? value.seq : -1,
    overallSeq: Number.isSafeInteger(value?.overallSeq) ? value.overallSeq : -1,
    usage: value?.usage || null,
  })
  const helperStart = source.indexOf('    function mergeSummaryValues(')
  const helperEnd = source.indexOf('    function formatSummaryTokens(', helperStart)
  const helpers = new Function(
    'normalizedSummaryValue',
    source.slice(helperStart, helperEnd) + String.fromCharCode(10)
      + 'return { mergeSummaryValues, resolveSummaryCache }',
  )(normalizedSummaryValue)
  const factory = new Function(
    'summarySyncRetries', 'activeRef', 'lifecycleRef', 'summaryDeleteTokens', 'window',
    'loadSummary', 'STATE_ROUTE', 'pendingSummaryWrites', 'sessionRef', 'summaryRef', 'setSummary',
    'EMPTY_SUMMARY', 'normalizedSummaryValue', 'resolveSummaryCache', 'storeSummary',
    'mergeSummaryValues', 'fetch', 'retryableStatus', 'summaryArchiveEpoch',
    source.slice(start, end) + String.fromCharCode(10)
      + 'return { patchSessionSummaryToHost, scheduleSummarySyncRetry, clearSummarySyncRetry }',
  )
  const owner = { controller: new AbortController() }
  const activeRef = { current: true }
  const lifecycleRef = { current: owner }
  const pendingSummaryWrites = { current: new Map() }
  const retries = { current: new Map() }
  const timers = new Map()
  const fetches = []
  let nextTimer = 1
  let cache = {
    overall: 'old', recent: '', seq: 1, overallSeq: 1, revision: 1,
    serverRevision: 0, syncOverall: true, syncRecent: false,
  }
  const api = factory(
    retries, activeRef, lifecycleRef, new Map(),
    {
      setTimeout(callback, delay) {
        const id = nextTimer++
        timers.set(id, { callback, delay })
        return id
      },
      clearTimeout(id) { timers.delete(id) },
    },
    () => cache, '/state', pendingSummaryWrites, { current: 's' }, { current: cache }, () => {},
    { overall: '', recent: '', seq: -1, overallSeq: -1, revision: 0, serverRevision: 0, syncOverall: false, syncRecent: false },
    normalizedSummaryValue,
    helpers.resolveSummaryCache,
    (_sessionId, value) => { cache = value },
    helpers.mergeSummaryValues,
    (...args) => new Promise((resolve) => { fetches.push({ args, resolve }) }),
    (status) => status === 408 || status === 429 || status >= 500,
    () => 0,
  )

  const older = api.patchSessionSummaryToHost('s', cache, 0, { overall: true, recent: false }, owner)
  while (fetches.length < 1) await new Promise(setImmediate)
  cache = { ...cache, overall: 'new', overallSeq: 2, revision: 2, syncOverall: true }
  const newer = api.patchSessionSummaryToHost('s', cache, 0, { overall: true, recent: false }, owner)
  while (fetches.length < 2) await new Promise(setImmediate)

  fetches[1].resolve({ ok: false, status: 503, json: async () => ({}) })
  assert.equal(await newer, 'retry')
  assert.equal(timers.size, 1)
  fetches[0].resolve({ ok: true, status: 200, json: async () => ({ summary: { revision: 1 } }) })
  assert.equal(await older, 'synced')
  assert.equal(cache.overall, 'new')
  assert.equal(cache.syncOverall, true)
  assert.equal(timers.size, 1)
})

test('keeps one lifecycle-owned live summary retry timer', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const marker = '      const clearSummarySyncRetry = '
  const start = source.indexOf(marker)
  const end = source.indexOf('      const fetchSessionSummary = ', start)
  assert.ok(start >= 0 && end > start)
  const factory = new Function(
    'summarySyncRetries', 'activeRef', 'lifecycleRef', 'summaryDeleteTokens',
    'window', 'loadSummary', 'patchSessionSummaryToHost',
    source.slice(start, end) + String.fromCharCode(10) + 'return { clearSummarySyncRetry, scheduleSummarySyncRetry }',
  )
  const lifecycle = { controller: new AbortController() }
  const retries = { current: new Map() }
  const timers = new Map()
  const latest = { overall: 'latest', recent: 'recent', syncOverall: true, syncRecent: true }
  let nextTimer = 1
  const patches = []
  const { clearSummarySyncRetry: clear, scheduleSummarySyncRetry: schedule } = factory(
    retries,
    { current: true },
    { current: lifecycle },
    new Map(),
    {
      setTimeout(callback, delay) {
        const id = nextTimer++
        timers.set(id, { callback, delay })
        return id
      },
      clearTimeout(id) { timers.delete(id) },
    },
    () => latest,
    async (...args) => { patches.push(args) },
  )

  schedule('s', lifecycle, { overall: false, recent: true })
  schedule('s', lifecycle, { overall: true, recent: false })
  assert.equal(timers.size, 1)
  clear('s', { overall: true, recent: false })
  assert.equal(timers.size, 1)
  const [id, timer] = [...timers][0]
  assert.equal(timer.delay, 1000)
  timers.delete(id)
  timer.callback()
  await new Promise(setImmediate)
  assert.equal(patches.length, 1)
  assert.equal(patches[0][1], latest)
  assert.deepEqual(patches[0][3], { overall: false, recent: true })

  lifecycle.controller.abort()
  schedule('s', lifecycle, { overall: true, recent: true })
  assert.equal(timers.size, 0)
})
test('fences delayed summary generation writes across archive ABA epochs', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const marker = '      const refresh = '
  const start = source.indexOf(marker)
  const end = source.indexOf('      React.useEffect(() => {', start)
  assert.ok(start >= 0 && end > start)
  const factory = new Function(
    'React', 'summaryRef', 'lifecycleRef', 'activeRef', 'sessionRef', 'sessionId',
    'summaryArchiveEpoch', 'summaryDeleteTokens', 'fetchSessionSummary', 'loadSummary', 'loadSettings', 'runningRef',
    'requestRef', 'setSummary', 'fetch', 'normalizeSummary', 'normalizeSummaryUsage',
    'storeSummary', 'patchSessionSummaryToHost', 'tt', 'navigator',
    'return (' + source.slice(start + marker.length, end).trim() + ')',
  )
  const owner = { controller: new AbortController() }
  const local = {
    overall: '', recent: '', seq: -1, overallSeq: -1, revision: 0,
    serverRevision: 0, syncOverall: false, syncRecent: false, status: 'idle', error: '', usage: null,
  }
  const epochs = new Map()
  const requestRef = { current: null }
  let resolveJson
  let stores = 0
  let patches = 0
  let updates = 0
  const refresh = factory(
    { useCallback: (callback) => callback }, { current: local }, { current: owner },
    { current: true }, { current: 's' }, 's', (id) => epochs.get(String(id)) || 0, new Map(),
    async () => {}, () => local,
    () => ({ conversationSummary: {
      enabled: true, provider: 'p', model: 'm', overall: true, recent: false,
      overallCollapsed: false, recentCollapsed: false, overallPrompt: '', recentPrompt: '',
    } }),
    { current: false }, requestRef, () => { updates += 1 },
    async () => ({ ok: true, status: 200, json: () => new Promise((resolve) => { resolveJson = resolve }) }),
    (value) => String(value || ''), (value) => value || null,
    () => { stores += 1 }, async () => { patches += 1; return 'synced' },
    (key) => key, {},
  )

  const pending = refresh(true)
  while (!resolveJson) await new Promise(setImmediate)
  epochs.set('s', 2)
  resolveJson({ overall: 'late', recent: '', seq: 1, usage: null })
  await pending
  assert.equal(stores, 0)
  assert.equal(patches, 0)

  epochs.set('s', 0)
  resolveJson = null
  const superseded = refresh(true)
  while (!resolveJson) await new Promise(setImmediate)
  const updatesAfterSupersede = updates
  requestRef.current = { newer: true }
  epochs.set('s', 2)
  resolveJson({ overall: 'older', recent: '', seq: 2, usage: null })
  await superseded
  assert.equal(updates, updatesAfterSupersede)
})

test('binds queued summary generation locks to the component lifecycle signal', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const marker = '      const refresh = '
  const start = source.indexOf(marker)
  const end = source.indexOf('\n\n      React.useEffect(() => {', start)
  assert.ok(start >= 0 && end > start)
  const factory = new Function(
    'React', 'summaryRef', 'lifecycleRef', 'activeRef', 'sessionRef',
    'summaryArchiveEpoch', 'summaryDeleteTokens', 'navigator', 'sessionId',
    'return (' + source.slice(start + marker.length, end).trim() + ')',
  )
  const lifecycle = { controller: new AbortController() }
  let lockOptions
  let lockCallback
  const refresh = factory(
    { useCallback: (callback) => callback },
    { current: { revision: 0 } },
    { current: lifecycle },
    { current: true },
    { current: 's' },
    () => 0,
    new Map(),
    { locks: { request: (_name, options, callback) => {
      lockOptions = options
      lockCallback = callback
      return new Promise((_resolve, reject) => {
        if (!options?.signal) return reject(new Error('missing lifecycle signal'))
        options.signal.addEventListener('abort', () => {
          const error = new Error('aborted')
          error.name = 'AbortError'
          reject(error)
        }, { once: true })
      })
    } } },
    's',
  )

  const pending = refresh()
  assert.equal(lockOptions.signal, lifecycle.controller.signal)
  assert.equal(typeof lockCallback, 'function')
  lifecycle.controller.abort()
  await assert.doesNotReject(pending)
})

test('reconciles mobile list rows without rebuilding unchanged items', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const start = source.indexOf('    function reconcileListRow(')
  const end = source.indexOf('    const SESSION_CSS = ', start)
  assert.ok(start >= 0 && end > start)
  const reconcileListRow = new Function(source.slice(start, end) + String.fromCharCode(10) + 'return reconcileListRow')()

  const host = { childNodes: [], firstChild: null }
  const sync = () => {
    host.childNodes.forEach((node, index) => { node.nextSibling = host.childNodes[index + 1] || null })
    host.firstChild = host.childNodes[0] || null
  }
  host.detach = (node) => {
    const index = host.childNodes.indexOf(node)
    if (index >= 0) host.childNodes.splice(index, 1)
    node.parentNode = null
    node.nextSibling = null
    sync()
  }
  host.insertBefore = (node, ref) => {
    if (node.parentNode) node.parentNode.detach(node)
    const index = ref ? host.childNodes.indexOf(ref) : -1
    host.childNodes.splice(index < 0 ? host.childNodes.length : index, 0, node)
    node.parentNode = host
    sync()
    return node
  }

  let created = 0
  const bound = []
  const hooks = {
    keyOf: (entry) => entry.id,
    signatureOf: (entry) => entry.id + ':' + entry.value,
    createNode: (entry) => {
      created += 1
      const node = { label: entry.id, parentNode: null, nextSibling: null }
      node.remove = () => { if (node.parentNode) node.parentNode.detach(node) }
      return node
    },
    bindNode: (node, record) => { bound.push(record) },
  }
  const labels = () => host.childNodes.map((node) => node.label)
  const cache = new Map()

  const a = { id: 'a', value: 1 }
  const b = { id: 'b', value: 1 }
  const c = { id: 'c', value: 1 }
  reconcileListRow(host, cache, [a, b, c], hooks)
  assert.equal(created, 3)
  assert.deepEqual(labels(), ['a', 'b', 'c'])
  const nodeA = cache.get('a').node
  const nodeC = cache.get('c').node

  const b2 = { id: 'b', value: 2 }
  reconcileListRow(host, cache, [a, b2, c], hooks)
  assert.equal(created, 4)
  assert.deepEqual(labels(), ['a', 'b', 'c'])
  assert.equal(cache.get('a').node, nodeA)
  assert.equal(cache.get('c').node, nodeC)
  assert.equal(cache.get('b').entry, b2)

  reconcileListRow(host, cache, [c, a, b2], hooks)
  assert.equal(created, 4)
  assert.deepEqual(labels(), ['c', 'a', 'b'])
  assert.equal(cache.get('a').node, nodeA)

  const a2 = { id: 'a', value: 1 }
  reconcileListRow(host, cache, [c, a2], hooks)
  assert.equal(created, 4)
  assert.deepEqual(labels(), ['c', 'a'])
  assert.equal(cache.size, 2)
  assert.equal(cache.has('b'), false)
  assert.equal(cache.get('a').entry, a2)
  assert.equal(bound.length, 4)

  reconcileListRow(host, cache, [a2], hooks)
  assert.equal(created, 4)
  assert.deepEqual(labels(), ['a'])

  const d = { id: 'd', value: 1 }
  const e = { id: 'e', value: 1 }
  reconcileListRow(host, cache, [a2, d, e], hooks)
  assert.equal(created, 6)
  assert.deepEqual(labels(), ['a', 'd', 'e'])
  reconcileListRow(host, cache, [d, e], hooks)
  assert.equal(created, 6)
  assert.deepEqual(labels(), ['d', 'e'])
  assert.equal(cache.has('a'), false)
})

test('clears stale host semantic marks without scanning the document', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const start = source.indexOf('    function markHostSemantics() {')
  const end = source.indexOf('    function reconcileListRow(', start)
  assert.ok(start >= 0 && end > start)
  const factory = new Function(
    'document', 'slotNode', 'sidebarColumnNode', 'conversationHeaderNode', 'composerBarNode',
    'buttonByLabel', 'HOST_ARIA', 'markedSessionHeader', 'markedDetailsToggle',
    'markedDetailsPanel', 'markedSettingsLayer', 'markedSettingsCells',
    source.slice(start, end) + String.fromCharCode(10) + 'return markHostSemantics',
  )
  let header = null
  const element = () => ({ dataset: {}, parentElement: null })
  const document = {
    querySelector: () => null,
    querySelectorAll: () => { throw new Error('document scan on the semantic hot path') },
  }
  const markHostSemantics = factory(
    document,
    () => null,
    () => null,
    () => header,
    () => null,
    () => null,
    { expandSidebar: [], collapseSidebar: [], unavailableSidebar: [] },
    null, null, null, null, [],
  )

  const first = element()
  header = first
  markHostSemantics()
  assert.equal(first.dataset.dshBuxSessionHeader, '1')

  const second = element()
  header = second
  markHostSemantics()
  assert.equal(first.dataset.dshBuxSessionHeader, undefined)
  assert.equal(second.dataset.dshBuxSessionHeader, '1')

  header = null
  markHostSemantics()
  assert.equal(second.dataset.dshBuxSessionHeader, undefined)
})

test('positions the mobile sidebar toggle below the plugin shell', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const start = source.indexOf("    const MOBILE_CSS = \`")
  const end = source.indexOf("\n\`\n", start)
  assert.ok(start >= 0 && end > start)
  const css = source.slice(start, end)
  const row = 'var(--dsh-mobile-session-row-height,33.8px)'
  const workspaceTop = 'top:calc(48px + ' + row + ' + ' + row + ' + env(safe-area-inset-top) + 4px)!important'
  const flatTop = 'top:calc(48px + ' + row + ' + env(safe-area-inset-top) + 4px)!important'

  assert.ok(css.includes(workspaceTop))
  assert.ok(css.includes(flatTop))
  assert.equal(css.includes('sidebar-compat [data-dsh-bux-details-toggle]{top:4px!important'), false)
})
