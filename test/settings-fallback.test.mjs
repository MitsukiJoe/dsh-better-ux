import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
const slice = (from, to) => {
  const start = source.indexOf(from)
  const end = source.indexOf(to, start)
  assert.ok(start >= 0 && end > start, from)
  return source.slice(start, end)
}

const BROKEN = {
  'invalid JSON': () => '{not json',
  'JSON null': () => 'null',
  'storage read throws': () => { throw new Error('denied') },
}

function build(read) {
  const code = [
    'const STORAGE_KEY = "k", CHANGE = "change"',
    slice('const DEFAULTS = {', 'const DICT = {'),
    slice('function loadSettings() {', 'const STATE_ROUTE'),
    slice('function validBalanceThreshold(', 'function compactModelName('),
    slice('function startComposerExtras(ctx) {', 'function apply(ctx) {'),
    'return { DEFAULTS, loadSettings, startComposerExtras }',
  ].join('\n')
  const listeners = new Map()
  const window = {
    addEventListener: (type, fn) => listeners.set(fn, type),
    removeEventListener: (type, fn) => { if (listeners.get(fn) === type) listeners.delete(fn) },
  }
  const document = {
    createElement: () => ({ dataset: {}, isConnected: false, remove() { this.isConnected = false } }),
    head: { appendChild(node) { node.isConnected = true } },
  }
  const localStorage = { getItem: () => read() }
  const api = new Function('window', 'document', 'localStorage', 'ComposerExtensions', 'DeepseekBar', 'COMPOSER_EXTRAS_CSS', 'createDeepseekAccountState', code)(
    window, document, localStorage, () => null, () => null, '', () => ({ dispose() {} }),
  )
  return { ...api, listeners }
}

for (const [name, read] of Object.entries(BROKEN)) {
  test(`settings fallback keeps every category when ${name}`, () => {
    const { DEFAULTS, loadSettings } = build(read)
    const settings = loadSettings()
    assert.deepEqual(settings, DEFAULTS)
    assert.notEqual(settings.deepseekBar, DEFAULTS.deepseekBar)
    settings.deepseekBar.enabled = !settings.deepseekBar.enabled
    assert.notDeepEqual(loadSettings().deepseekBar, settings.deepseekBar)
  })

  test(`composer extras start and unload to zero listeners when ${name}`, () => {
    const { startComposerExtras, listeners } = build(read)
    const slots = { inject: (_slot, factory) => { factory(); return () => {} }, register: () => () => {} }
    for (let i = 0; i < 3; i += 1) {
      const stop = startComposerExtras({ slots, modelDirectories: { directoryFor: () => null } })
      assert.equal(listeners.size, 1)
      stop()
      assert.equal(listeners.size, 0)
    }
  })
}

test('old sessionRow.archive is ignored', () => {
  const { DEFAULTS, loadSettings } = build(() => JSON.stringify({
    sessionRow: { archive: true, rename: false },
  }))
  const settings = loadSettings()
  assert.equal(settings.sessionRow.rename, false)
  assert.equal(settings.sessionRow.fork, DEFAULTS.sessionRow.fork)
  assert.equal(Object.hasOwn(settings.sessionRow, 'archive'), false)
  assert.deepEqual(Object.keys(settings.sessionRow).sort(), Object.keys(DEFAULTS.sessionRow).sort())
})

test('settings fallback covers exactly the categories the normal path returns', () => {
  const { DEFAULTS, loadSettings } = build(() => '{}')
  assert.deepEqual(Object.keys(loadSettings()).sort(), Object.keys(DEFAULTS).sort())
})
