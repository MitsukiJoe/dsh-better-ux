import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { Readable } from 'node:stream'
import test from 'node:test'
import { apply } from '../index.js'

async function harness(options = {}) {
  const routes = new Map(), disposers = [], responses = []
  const services = {
    sessionProjections: { stateOf: () => ({ pending: options.noPending ? null : { provider: options.provider ?? 'deepseek-official', model: options.model ?? 'deepseek-v4-flash' } }) },
    settings: (() => {
      const profile = { baseURL: options.baseURL ?? 'https://api.deepseek.com', apiKeyEnv: 'TEST_KEY' }
      // DSH 0.1 的 settings.get(ns) 与 0.2 的 settings.describe() 两种宿主形态
      return options.legacySettings ? { get: () => profile } : { describe: () => [{ ns: 'other', value: {} }, { ns: 'llm-deepseek', value: profile }] }
    })(),
    credentials: { resolve: async () => options.missing ? undefined : { value: 'secret-test-key' } },
  }
  await apply({
    get: (key) => services[key],
    llm: { listConfigurableProviders: () => [{ provider: 'deepseek-account', settingsNs: 'llm-deepseek-account', settingsPath: [] }, { provider: 'deepseek-official', settingsNs: 'llm-deepseek', settingsPath: [] }] },
    sessions: { get: () => { throw new Error('balance must not read a session') } },
    storage: { backend: { get: () => ({ kv: { open: async () => ({ loadAll: async () => ({}), putRecord: async () => {}, close: async () => {} }) } }) } },
    effect: (factory) => { disposers.push(factory()) },
    connection: { requestRejection: (req) => options.reject ?? (req.headers.origin ? 403 : undefined) },
    webServer: { register: (route) => { routes.set(route.path, route.handler); return () => routes.delete(route.path) } },
  })
  const request = async (path = '/api/dsh-better-ux/deepseek-balance-v1', headers = {}, body) => {
    const req = Readable.from(body ? [Buffer.from(JSON.stringify(body))] : [])
    Object.assign(req, { url: path, method: body ? 'PATCH' : 'GET', headers: { host: 'localhost', ...headers } })
    const res = new EventEmitter()
    responses.push(res)
    Object.assign(res, { writeHead(status) { this.status = status }, setHeader() {}, end(raw) { this.body = JSON.parse(raw); this.writableEnded = true } })
    await routes.get(path.split('?')[0])(req, res)
    return res
  }
  return { request, responses, dispose: () => disposers.reverse().forEach((fn) => fn?.()) }
}

test('balance credentials stay host-side, requests coalesce and cache', async (t) => {
  let calls = 0
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls++
    assert.equal(url, 'https://api.deepseek.com/user/balance')
    assert.equal(options.headers.authorization, 'Bearer secret-test-key')
    assert.equal(options.redirect, 'error')
    await new Promise((resolve) => setImmediate(resolve))
    return { ok: true, json: async () => ({ is_available: true, balance_infos: [{ currency: 'CNY', total_balance: '10', granted_balance: '0', topped_up_balance: '10', secret: 'secret-test-key' }] }) }
  })
  const h = await harness()
  const [a, b] = await Promise.all([h.request(), h.request()])
  assert.equal(a.body.status, 'ok')
  assert.deepEqual(a.body, b.body)
  assert.equal(JSON.stringify(a.body).includes('secret-test-key'), false)
  await h.request()
  assert.equal(calls, 1)
  h.dispose()
})

test('balance rejects cross-origin, nonofficial API endpoints and missing credentials', async (t) => {
  t.mock.method(globalThis, 'fetch', () => { throw new Error('must not fetch') })
  for (const [options, status] of [[{ baseURL: 'https://proxy.example' }, 'unsupported_provider'], [{ missing: true }, 'missing_credentials']]) {
    const h = await harness(options)
    assert.equal((await h.request()).body.status, status)
    h.dispose()
  }
  const h = await harness()
  assert.equal((await h.request(undefined, { origin: 'https://evil.example' })).status, 403)
  h.dispose()
})

test('balance sanitizes errors and aborts requests on unload', async (t) => {
  let signal
  t.mock.method(globalThis, 'fetch', async (_, options) => {
    signal = options.signal
    await new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('secret-test-key')), { once: true }))
  })
  const h = await harness()
  const pending = h.request()
  await new Promise((resolve) => setImmediate(resolve))
  h.dispose()
  const response = await pending
  assert.equal(signal.aborted, true)
  assert.equal(response.body.status, 'error')
  assert.equal(JSON.stringify(response.body).includes('secret-test-key'), false)
})

test('shared composer leaves validate booleans and integer threshold boundaries', async () => {
  for (const threshold of [1, 90, 100, 0, 101, 1.5, '90']) {
    const h = await harness()
    const res = await h.request('/api/dsh-better-ux/state-v1', { 'content-type': 'application/json' }, { kind: 'settings', baseRevision: 0, patch: { contextMeter: { threshold, enabled: true, open: true }, mobileModel: { enabled: true, open: false }, deepseekBar: { enabled: true, open: false } } })
    assert.equal(res.status, [1, 90, 100].includes(threshold) ? 200 : 400)
    h.dispose()
  }
})


test('balance expires after 60 seconds and disconnect aborts only the last reader', async (t) => {
  let now = 100000, calls = 0, signal, complete
  t.mock.method(Date, 'now', () => now)
  t.mock.method(globalThis, 'fetch', async (_, options) => {
    calls++
    signal = options.signal
    await new Promise((resolve, reject) => {
      complete = resolve
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
    })
    return { ok: true, json: async () => ({ is_available: false, balance_infos: [] }) }
  })
  const h = await harness()
  const a = h.request(), b = h.request()
  await new Promise((resolve) => setImmediate(resolve))
  h.responses[0].emit('close')
  assert.equal(signal.aborted, false)
  complete()
  await Promise.all([a, b])
  now += 59999
  await h.request()
  assert.equal(calls, 1)
  now++
  const next = h.request()
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(calls, 2)
  h.responses.at(-1).emit('close')
  assert.equal(signal.aborted, true)
  await next
  h.dispose()
})

test('balance is independent of session model and accepts requests without a session', async () => {
  for (const options of [{ model: 'deepseek-v4-pro', missing: true }, { provider: 'other', missing: true }, { noPending: true, missing: true }]) {
    const h = await harness(options)
    const response = await h.request()
    assert.equal(response.body.status, 'missing_credentials')
    assert.equal(response.body.provider, 'deepseek-official')
    assert.equal(response.body.model, undefined)
    h.dispose()
  }
})

test('official account balance is available for current aliases and unknown pricing models', async (t) => {
  let calls = 0
  t.mock.method(globalThis, 'fetch', async () => {
    calls++
    return { ok: true, json: async () => ({ is_available: true, balance_infos: [{ currency: 'CNY', total_balance: '12.30', granted_balance: '0', topped_up_balance: '12.30' }] }) }
  })
  for (const model of ['deepseek-flash', 'deepseek-v4-flash', 'deepseek-v4-flash-vision-exp', 'deepseek-v4-pro', 'future-official-model']) {
    const h = await harness({ model })
    const response = await h.request()
    assert.equal(response.body.status, 'ok')
    assert.equal(response.body.model, undefined)
    assert.equal(response.body.balance_infos[0].total_balance, '12.30')
    h.dispose()
  }
  assert.equal(calls, 5)
})


test('account settings persist decimal alert and playful labels with validation', async () => {
  for (const balanceThreshold of [0, .29, 10, 10.01, -1, .001, '10', 1e20]) {
    const h = await harness()
    const res = await h.request('/api/dsh-better-ux/state-v1', { 'content-type': 'application/json' }, { kind: 'settings', baseRevision: 0, patch: { deepseekBar: { balanceThreshold, funLabels: true, brightColors: true } } })
    assert.equal(res.status, [0, .29, 10, 10.01].includes(balanceThreshold) ? 200 : 400)
    h.dispose()
  }
})

test('balance reads the DeepSeek profile from both DSH 0.1 (get) and 0.2 (describe) settings services', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ is_available: true, balance_infos: [{ currency: 'CNY', total_balance: '1', granted_balance: '0', topped_up_balance: '1' }] }) }))
  for (const legacySettings of [false, true]) {
    const h = await harness({ legacySettings })
    assert.equal((await h.request()).body.status, 'ok', legacySettings ? 'settings.get' : 'settings.describe')
    h.dispose()
  }
})
