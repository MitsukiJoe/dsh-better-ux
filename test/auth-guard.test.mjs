import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { Readable } from 'node:stream'
import test from 'node:test'
import { apply } from '../index.js'

const ROUTES = [
  ['GET', '/api/dsh-better-ux/deepseek-balance-v1'],
  ['GET', '/api/dsh-better-ux/state-v1'],
  ['PATCH', '/api/dsh-better-ux/state-v1'],
  ['DELETE', '/api/dsh-better-ux/state-v1?sessionId=s&baseRevision=0'],
  ['POST', '/api/dsh-better-ux/summary-v2'],
]

async function boot(rejection, { connection = { requestRejection: () => rejection } } = {}) {
  const touched = []
  const routes = new Map()
  const ctx = {
    connection,
    effect: (factory) => factory(),
    get: (key) => { touched.push('service:' + key) },
    sessions: { get: () => { touched.push('sessions') } },
    llm: { async *stream() { touched.push('llm') } },
    storage: { backend: { get: () => ({ kv: { open: async () => ({ loadAll: async () => ({}), putRecord: async () => { touched.push('write') }, close: async () => {} }) } }) } },
    webServer: { register: (route) => { routes.set(route.path, route.handler); return () => routes.delete(route.path) } },
  }
  await apply(ctx)
  return { routes, touched }
}

async function call(routes, method, url) {
  const req = Readable.from([Buffer.from('{}')])
  Object.assign(req, { url, method, headers: { host: 'localhost', 'content-type': 'application/json' } })
  const res = new EventEmitter()
  Object.assign(res, { writeHead(status) { this.status = status }, setHeader() {}, end(raw) { this.body = raw ? JSON.parse(raw) : null; this.writableEnded = true } })
  await routes.get(url.split('?')[0])(req, res)
  return res
}

test('every route is rejected by host auth before any business code runs', async (t) => {
  t.mock.method(globalThis, 'fetch', () => { throw new Error('must not fetch') })
  for (const rejection of [401, 403]) {
    const { routes, touched } = await boot(rejection)
    for (const [method, url] of ROUTES) {
      const res = await call(routes, method, url)
      assert.equal(res.status, rejection, method + ' ' + url)
    }
    assert.deepEqual(touched, [])
  }
})

test('every registered route goes through the guard', async () => {
  const { routes } = await boot(401)
  assert.deepEqual([...routes.keys()].sort(), [...new Set(ROUTES.map(([, url]) => url.split('?')[0]))].sort())
})

test('registration fails closed when the host cannot authenticate requests', async () => {
  await assert.rejects(boot(undefined, { connection: {} }), /requestRejection/)
})
