import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import test from 'node:test'
const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
const start = source.indexOf('    function compactModelName(')
const end = source.indexOf('    const COMPOSER_EXTRAS_CSS', start)
assert.ok(start >= 0 && end > start, 'composer helpers exist')
const { compactModelName, contextReading, deepseekTariff } = new Function(source.slice(start, end) + ';return {compactModelName,contextReading,deepseekTariff}')()
test('model label preserves four Unicode characters and leaves short names intact', () => {
  assert.equal(compactModelName('DeepSeek-V4.1'), 'Deep…')
  assert.equal(compactModelName('深度求索模型'), '深度求索…')
  assert.equal(compactModelName('😀😃😄😁😆'), '😀😃😄😁…')
  assert.equal(compactModelName('GPT4'), 'GPT4')
})
test('context reading matches native rounding and K/M formatting; invalid data is absent', () => {
  assert.deepEqual(contextReading({ projectedTokens: 900000, pressureTokens: 1, contextWindow: 1000000 }), { percent: 90, detail: '~900K / 1M' })
  assert.deepEqual(contextReading({ pressureTokens: 0, contextWindow: 128000 }), { percent: 0, detail: '~0 / 128K' })
  assert.equal(contextReading({ projectedTokens: 899500, contextWindow: 1000000 }).percent, 90)
  assert.equal(contextReading({ pressureTokens: 120, contextWindow: 100 }).percent, 100)
  for (const value of [undefined, {}, { pressureTokens: 3, contextWindow: 0 }, { pressureTokens: NaN, contextWindow: 2 }]) assert.equal(contextReading(value), null)
})
const tariff = (time, model = 'deepseek-flash', currency = 'CNY') => deepseekTariff(Date.parse(time), model, currency)
test('tariff switches at Beijing 09/12/14/18 and follows model/currency', () => {
  const a = tariff('2026-09-21T01:00:00Z')
  assert.equal(a.peak, true); assert.deepEqual(a.prices, [2, 8]); assert.equal(a.minutes, 180)
  const b = tariff('2026-09-21T04:00:00Z', 'deepseek-v4-pro')
  assert.equal(b.peak, false); assert.deepEqual(b.prices, [4.5, 13.5]); assert.equal(b.minutes, 120)
  assert.equal(tariff('2026-09-21T06:00:00Z').peak, true)
  assert.equal(tariff('2026-09-21T10:00:00Z').minutes, 15 * 60)
  assert.deepEqual(tariff('2026-09-21T01:00:00Z', 'deepseek-v4-pro', 'USD').prices, [1.32, 3.96])
  assert.deepEqual(tariff('2026-09-21T01:00:00Z', 'deepseek-v4-flash').prices, [2, 8])
  assert.equal(tariff('2026-09-21T01:00:00Z', 'unknown').prices, null)
})
test('weekends, holiday runs and unknown calendar do not advertise false peaks', () => {
  assert.equal(tariff('2026-09-19T01:00:00Z').minutes, 48 * 60)
  assert.equal(tariff('2026-09-20T01:00:00Z').peak, false)
  assert.equal(tariff('2026-09-25T01:00:00Z').minutes, 72 * 60)
  assert.equal(tariff('2026-10-01T01:00:00Z').minutes, 7 * 24 * 60)
  assert.equal(tariff('2027-01-01T01:00:00Z'), null)
  assert.equal(tariff('2026-12-31T10:00:00Z').minutes, null)
})

test('composer adapter ignores unrelated input mutations and restores native nodes on teardown', () => {
  const effects = [], pending = [], observers = [], mediaListeners = new Set()
  let reads = 0
  const node = (extra = {}) => {
    const attrs = new Map()
    return { nodeType: 1, isConnected: true, tagName: 'SPAN', textContent: '', attrs,
      getAttribute: key => attrs.get(key) ?? null,
      setAttribute: (key, value) => attrs.set(key, value), removeAttribute: key => attrs.delete(key),
      matches: () => false, querySelector: () => null, contains: () => false, closest: () => null, ...extra }
  }
  const label = node({ textContent: 'DeepSeek-V41-Flash' })
  const effort = node({ textContent: 'High' })
  const modelButton = node({ children: [label, effort] })
  const modelSlot = node({ querySelector: () => modelButton, contains: target => [label, effort, modelButton].includes(target) })
  modelSlot.parentElement = node()
  const tip = node({ textContent: '上下文已用 90%' })
  const meter = node({ querySelectorAll: () => [1, 2] })
  const meterRoot = node({ querySelector: () => tip })
  meter.parentElement = meterRoot; tip.parentElement = meterRoot
  const card = node({ querySelector: () => { reads++; return modelSlot }, querySelectorAll: () => { reads++; return [meter] } })
  const anchor = node({ closest: () => card })
  const window = { __DSH_BUX_COMPOSER_STATS__: {}, matchMedia: () => ({ matches: true, addEventListener: (_, fn) => mediaListeners.add(fn), removeEventListener: (_, fn) => mediaListeners.delete(fn) }) }
  let ref = 0
  const React = { useRef: value => ({ current: ref++ === 0 ? anchor : value }), useLayoutEffect: fn => effects.push(fn) }
  class Observer { constructor(callback) { this.callback = callback; observers.push(this) } observe() {} disconnect() { this.disconnected = true } }
  const begin = source.indexOf('    function composerPatchLedger()')
  const finish = source.indexOf('    function ContextProjection(', begin)
  const { ComposerAdapter } = new Function('React', 'h', 'window', 'MutationObserver', 'queueMicrotask', 'compactModelName', source.slice(begin, finish) + ';return {ComposerAdapter}')(React, () => null, window, Observer, fn => pending.push(fn), compactModelName)
  ComposerAdapter({ mobileModel: true, reading: { percent: 90, detail: '~900K / 1M' }, threshold: 90 })
  const dispose = effects[0]()
  effects[1]()
  while (pending.length) pending.shift()()
  assert.equal(label.textContent, 'Deep…')
  assert.equal(effort.textContent, 'High')
  assert.equal(tip.getAttribute('data-bux-context-detail'), '~900K / 1M')
  assert.equal(meter.getAttribute('data-bux-context-warning'), '')
  const before = { reads, stats: { ...window.__DSH_BUX_COMPOSER_STATS__ } }
  for (let i = 0; i < 50; i++) observers[0].callback([{ type: 'childList', target: node(), addedNodes: [node()], removedNodes: [] }])
  assert.equal(pending.length, 0)
  assert.equal(reads, before.reads)
  assert.deepEqual(window.__DSH_BUX_COMPOSER_STATS__, before.stats)
  label.textContent = '另一个模型'
  observers[0].callback([{ type: 'childList', target: label, addedNodes: [], removedNodes: [] }])
  while (pending.length) pending.shift()()
  assert.equal(label.textContent, '另一个模…')
  dispose()
  assert.equal(label.textContent, '另一个模型')
  for (const n of [modelButton, modelSlot, modelSlot.parentElement, meter, tip]) assert.equal(n.attrs.size, 0)
  assert.equal(observers[0].disconnected, true)
  assert.equal(mediaListeners.size, 0)
})

test('global DeepSeek account state retains official pricing across third-party selections and view remounts', async () => {
  const listeners = new Map(), timers = new Map(), requests = []
  const document = { hidden: false, addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key) }
  const fetch = (url, options) => new Promise(resolve => requests.push({ url, signal: options.signal, resolve }))
  const begin = source.indexOf('    function rememberDeepseekModel(')
  const end = source.indexOf('    function DeepseekBar(', begin)
  const create = new Function('document', 'fetch', 'setTimeout', 'clearTimeout', 'composerCount', source.slice(begin, end) + ';return createDeepseekAccountState')(document, fetch, fn => { timers.set(fn, fn); return fn }, id => timers.delete(id), () => {})
  const account = create()
  const settle = async value => { requests.at(-1).resolve({ ok: true, json: async () => value }); await new Promise(setImmediate) }
  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, '/api/dsh-better-ux/deepseek-balance-v1')
  account.selectModel('other/deepseek-v4-pro')
  assert.equal(account.getSnapshot().model, 'deepseek-flash')
  await settle({ status: 'ok', balance_infos: [{ currency: 'USD', total_balance: '12.30' }] })
  const first = account.getSnapshot().balance
  for (let i = 0; i < 4; i++) {
    const off = account.subscribe(() => {})
    account.selectModel('deepseek-official/deepseek-v4-pro')
    off()
    account.selectModel('third-party/anything')
    assert.equal(account.getSnapshot().model, 'deepseek-v4-pro')
    assert.equal(account.getSnapshot().balance, first)
  }
  assert.equal(requests.length, 1)
  timers.values().next().value()
  await settle({ status: 'error', balance_infos: [] })
  assert.equal(account.getSnapshot().currency, 'USD')
  assert.equal(account.getSnapshot().model, 'deepseek-v4-pro')
  assert.equal(account.getSnapshot().balance.status, 'error')
  account.selectModel('deepseek-official/deepseek-v4-flash')
  assert.equal(account.getSnapshot().model, 'deepseek-flash')
  document.hidden = true; listeners.get('visibilitychange')()
  assert.equal(timers.size, 0)
  document.hidden = false; listeners.get('visibilitychange')()
  const before = account.getSnapshot()
  account.dispose()
  assert.equal(requests.at(-1).signal.aborted, true)
  await settle({ status: 'ok', balance_infos: [{ currency: 'CNY', total_balance: '999' }] })
  assert.equal(account.getSnapshot(), before)
  assert.equal(timers.size, 0)
  assert.equal(listeners.size, 0)
})

test('composer feature labels have matching Chinese and English keys', () => {
  const begin = source.indexOf('    const DICT = ')
  const end = source.indexOf('    const LOCALE = ', begin)
  const dict = new Function(source.slice(begin, end) + ';return DICT')()
  const relevant = key => /^(cat\.(mobileModel|contextMeter|deepseekBar)|mobileModel\.|contextMeter\.|deepseek\.)/.test(key)
  const keys = Object.keys(dict.zh).filter(relevant).sort()
  assert.deepEqual(Object.keys(dict.en).filter(relevant).sort(), keys)
  for (const key of keys) {
    assert.ok(dict.zh[key].trim()); assert.ok(dict.en[key].trim())
    assert.deepEqual(dict.zh[key].match(/\{\w+\}/g), dict.en[key].match(/\{\w+\}/g))
  }
})


test('balance alert accepts nonnegative currency amounts with at most two decimals', () => {
  const begin = source.indexOf('    function validBalanceThreshold(')
  const end = source.indexOf('    function compactModelName(', begin)
  const valid = new Function(source.slice(begin, end) + ';return validBalanceThreshold')()
  for (const value of [0, .29, 10, 10.01, 123456.78]) assert.equal(valid(value), true)
  for (const value of [-1, .001, '10', null, NaN, Infinity, 1e20]) assert.equal(valid(value), false)
})

test('indicator palette switches without remounting and disposes its stylesheet', () => {
  const cssStart = source.indexOf('    const COMPOSER_EXTRAS_CSS =')
  const cssEnd = source.indexOf('    function useComposerSettings()', cssStart)
  const css = new Function(source.slice(cssStart, cssEnd) + ';return COMPOSER_EXTRAS_CSS')()
  const begin = source.indexOf('    function startComposerExtras(ctx)')
  const end = source.indexOf('    function apply(ctx)', begin)
  let listener, writes = 0, text = '', mounts = 0
  const style = { dataset: {}, isConnected: false, get textContent() { return text }, set textContent(value) { text = value; writes++ }, remove() { this.isConnected = false } }
  const settings = { mobileLayout: { enabled: false }, contextMeter: { enabled: true }, deepseekBar: { enabled: false, brightColors: false } }
  const document = { createElement: () => style, head: { appendChild: node => { node.isConnected = true } } }
  const window = { addEventListener: (_, fn) => { listener = fn }, removeEventListener: () => { listener = null } }
  const start = new Function('document', 'window', 'loadSettings', 'CHANGE', 'COMPOSER_EXTRAS_CSS', source.slice(begin, end) + ';return startComposerExtras')(document, window, () => settings, 'change', css)
  const dispose = start({ slots: { inject: () => { mounts++; return () => { mounts-- } } } })
  assert.match(text, /stroke:#ff454f/)
  assert.match(text, /--bux-tariff-color:#249f78/)
  listener(); assert.equal(writes, 1)
  settings.deepseekBar.brightColors = true; listener()
  assert.match(text, /stroke:#fe395d/)
  assert.match(text, /--bux-tariff-color:#00d066/)
  assert.equal(mounts, 1)
  settings.deepseekBar.brightColors = false; listener()
  assert.equal(text, css)
  dispose()
  assert.equal(style.isConnected, false)
  assert.equal(listener, null)
  assert.equal(mounts, 0)
})
