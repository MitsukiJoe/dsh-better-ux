import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import test from 'node:test'

const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
const pureStart = source.indexOf('    function contextRingWarning(')
const pureEnd = source.indexOf('    function ComposerAdapter(', pureStart)
assert.ok(pureStart >= 0 && pureEnd > pureStart, 'context meter helpers exist')
const { contextRingWarning, readContextMeterPercent, findContextMeter } = new Function(
  source.slice(pureStart, pureEnd) + ';return {contextRingWarning,readContextMeterPercent,findContextMeter}',
)()

// Host 0.2.0-rc.2 ContextMeter: viewBox 14, r=5.5, two circles, fill is last and carries stroke-dasharray.
const CIRCUMFERENCE = 2 * Math.PI * 5.5

function matches(node, selector) {
  return selector.split(',').some((part) => matchOne(node, part.trim()))
}

function matchOne(node, selector) {
  if (selector === 'svg circle' || selector === 'svg circle:last-child') {
    if (node.tagName !== 'CIRCLE') return false
    let parent = node.parentElement
    while (parent && parent.tagName !== 'SVG') parent = parent.parentElement
    if (!parent) return false
    if (!selector.endsWith(':last-child')) return true
    const kids = node.parentElement.childNodes.filter((child) => child.nodeType === 1)
    return kids[kids.length - 1] === node
  }
  let rest = selector
  let tag = ''
  if (!selector.startsWith('[')) {
    const found = selector.match(/^([a-z]+)/i)
    if (found) {
      tag = found[1].toUpperCase()
      rest = selector.slice(found[1].length)
    }
  }
  if (tag && node.tagName !== tag) return false
  const attrs = [...rest.matchAll(/\[([^\]=]+)(?:="([^"]*)")?\]/g)]
  if (!rest && tag) return true
  if (!attrs.length) return false
  return attrs.every(([, name, value]) => {
    const actual = node.getAttribute(name)
    return value === undefined ? actual !== null : actual === value
  })
}

function el(tag, props = {}, children = []) {
  const attrs = new Map(Object.entries(props.attrs || {}).map(([key, value]) => [key, String(value)]))
  const node = {
    nodeType: 1,
    tagName: String(tag).toUpperCase(),
    isConnected: true,
    childNodes: [],
    parentElement: null,
    nextElementSibling: null,
    _text: props.text || '',
  }
  Object.defineProperty(node, 'textContent', {
    get() {
      return node.childNodes.length ? node.childNodes.map((child) => child.textContent || '').join('') : node._text
    },
    set(value) {
      node._text = String(value)
      node.childNodes = []
    },
  })
  node.getAttribute = (name) => (attrs.has(name) ? attrs.get(name) : null)
  node.setAttribute = (name, value) => attrs.set(name, String(value))
  node.removeAttribute = (name) => attrs.delete(name)
  node.matches = (selector) => matches(node, selector)
  node.querySelectorAll = (selector) => {
    const found = []
    const walk = (current) => {
      for (const child of current.childNodes) {
        if (child.nodeType === 1 && matches(child, selector)) found.push(child)
        if (child.nodeType === 1) walk(child)
      }
    }
    walk(node)
    return found
  }
  node.querySelector = (selector) => node.querySelectorAll(selector)[0] || null
  node.closest = (selector) => {
    let current = node
    while (current) {
      if (current.nodeType === 1 && matches(current, selector)) return current
      current = current.parentElement
    }
    return null
  }
  node.contains = (target) => {
    let current = target
    while (current) {
      if (current === node) return true
      current = current.parentElement
    }
    return false
  }
  let previous = null
  for (const child of children) {
    child.parentElement = node
    child.nextElementSibling = null
    if (previous) previous.nextElementSibling = child
    previous = child
  }
  node.childNodes = children
  return node
}

function host02({ percent = 90, aria = `上下文已用 ${percent}%`, text = `${percent}%`, dasharray = true } = {}) {
  const fillAttrs = { cx: '7', cy: '7', r: '5.5', transform: 'rotate(-90 7 7)' }
  if (dasharray) fillAttrs['stroke-dasharray'] = `${CIRCUMFERENCE * percent / 100} ${CIRCUMFERENCE}`
  const fill = el('circle', { attrs: fillAttrs })
  const svg = el('svg', { attrs: { viewBox: '0 0 14 14', width: '14', height: '14', 'aria-hidden': 'true' } }, [
    el('circle', { attrs: { cx: '7', cy: '7', r: '5.5' } }),
    fill,
  ])
  const button = el('button', {
    attrs: { type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', ...(aria == null ? {} : { 'aria-label': aria }) },
  }, [svg, ...(text == null ? [] : [el('span', { text })])])
  const tooltip = el('span', { attrs: { role: 'tooltip' }, text: aria || '' })
  const root = el('span', {}, [button, tooltip])
  const anchor = el('span', { attrs: { 'data-bux-composer-anchor': '' } })
  const card = el('div', { attrs: { 'data-composer-card': 'true' } }, [el('div', {}, [anchor])])
  const noise = el('span', { text: '¥12.30' })
  const dock = el('div', {}, [noise, root])
  el('div', {}, [card, dock])
  return { card, dock, button, tooltip, anchor, noise, fill }
}

function host01(percent = 90) {
  const fill = el('circle', { attrs: { r: '5.5', 'stroke-dasharray': `${CIRCUMFERENCE * percent / 100} ${CIRCUMFERENCE}` } })
  const button = el('button', {
    attrs: { type: 'button', 'aria-haspopup': 'dialog', 'aria-label': `${percent}% of context used` },
  }, [el('svg', {}, [el('circle'), fill]), el('span', { text: `${percent}%` })])
  const tooltip = el('span', { attrs: { role: 'tooltip' } })
  const anchor = el('span', { attrs: { 'data-bux-composer-anchor': '' } })
  const card = el('div', { attrs: { 'data-composer-card': 'true' } }, [anchor, el('span', {}, [button, tooltip])])
  return { card, button, tooltip, anchor, fill }
}

test('warning follows the threshold and ignores missing numbers', () => {
  assert.equal(contextRingWarning(89, 90), false)
  assert.equal(contextRingWarning(90, 90), true)
  assert.equal(contextRingWarning(91, 90), true)
  assert.equal(contextRingWarning(100, 100), true)
  assert.equal(contextRingWarning(0, 90), false)
  for (const percent of [undefined, null, NaN, '90']) assert.equal(contextRingWarning(percent, 90), false)
  for (const threshold of [undefined, null, NaN]) assert.equal(contextRingWarning(90, threshold), false)
})

test('0.2 ring lives in the dock sibling and its percent parses without throwing', () => {
  const dom = host02()
  assert.equal(dom.card.querySelector('button[aria-haspopup="dialog"]'), null)
  assert.equal(findContextMeter(dom.card), dom.button)
  assert.equal(dom.button.querySelectorAll('svg circle').length, 2)
  assert.equal(dom.button.querySelector('svg circle:last-child'), dom.fill)
  assert.equal(readContextMeterPercent(dom.button), 90)
  assert.equal(readContextMeterPercent(host02({ percent: 89 }).button), 89)
  assert.equal(readContextMeterPercent(host02({ aria: '90% of context used' }).button), 90)
  assert.equal(readContextMeterPercent(host02({ aria: '上下文已用 100%' }).button), 100)
  assert.equal(readContextMeterPercent(host02({ aria: null, text: '88%' }).button), 88)
  for (const percent of [0, 1, 89, 90, 99, 100]) {
    assert.equal(readContextMeterPercent(host02({ percent, aria: null, text: null }).button), percent)
  }
  assert.equal(readContextMeterPercent(host02({ aria: null, text: null, dasharray: false }).button), null)
  for (const value of [null, undefined, {}, { getAttribute: () => null, textContent: '', querySelector: () => null }]) {
    assert.equal(readContextMeterPercent(value), null)
  }
  assert.equal(findContextMeter(null), null)
  assert.equal(findContextMeter(el('div')), null)
})

test('0.1 ring inside the card is still found when a dock sibling has none', () => {
  const inside = host01(90)
  assert.equal(findContextMeter(inside.card), inside.button)
  assert.equal(readContextMeterPercent(inside.button), 90)
  const sibling = el('div', {}, [el('span', { text: 'empty dock' })])
  el('div', {}, [inside.card, sibling])
  assert.equal(findContextMeter(inside.card), inside.button)
})

function boot(dom, reading, threshold) {
  const effects = []
  const pending = []
  const observers = []
  const latest = { current: null }
  let refs = 0
  const React = {
    useRef: (value) => {
      refs += 1
      if (refs === 1) return { current: dom.anchor }
      if (refs === 2) return latest
      return { current: value }
    },
    useLayoutEffect: (fn) => effects.push(fn),
  }
  class Observer {
    constructor(callback) { this.callback = callback; this.targets = []; observers.push(this) }
    observe(node) { this.targets.push(node) }
    disconnect() { this.disconnected = true }
  }
  const window = {
    __DSH_BUX_COMPOSER_STATS__: {},
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  }
  const begin = source.indexOf('    function composerPatchLedger()')
  const finish = source.indexOf('    function ContextProjection(', begin)
  const { ComposerAdapter } = new Function('React', 'h', 'window', 'MutationObserver', 'queueMicrotask', 'compactModelName', source.slice(begin, finish) + ';return {ComposerAdapter}')(
    React, () => null, window, Observer, (fn) => pending.push(fn), () => { throw new Error('compact unused') },
  )
  ComposerAdapter({ mobileModel: false, reading, threshold })
  const dispose = effects[0]()
  const flush = () => { effects[1](); while (pending.length) pending.shift()() }
  flush()
  return { dispose, latest, observers, pending, flush, stats: window.__DSH_BUX_COMPOSER_STATS__ }
}

test('0.2 dock ring turns red at the threshold, stays plain below it, and restores when off', () => {
  const low = host02({ percent: 89 })
  const lowRun = boot(low, { percent: 99, detail: '~890K / 1M' }, 90)
  assert.deepEqual(lowRun.observers[0].targets, [low.card, low.dock])
  assert.equal(low.button.getAttribute('data-bux-context-warning'), null)
  assert.equal(low.tooltip.getAttribute('data-bux-context-detail'), '~890K / 1M')

  for (const percent of [90, 91]) {
    const dom = host02({ percent })
    const run = boot(dom, { percent: 10, detail: '~900K / 1M' }, 90)
    assert.equal(dom.button.getAttribute('data-bux-context-warning'), '')
    assert.equal(dom.tooltip.getAttribute('data-bux-context-detail'), '~900K / 1M')
    run.latest.current = { reading: null, threshold: 90 }
    run.flush()
    assert.equal(dom.button.getAttribute('data-bux-context-warning'), null)
    assert.equal(dom.tooltip.getAttribute('data-bux-context-detail'), null)
    assert.equal(dom.button.getAttribute('aria-label'), `上下文已用 ${percent}%`)
    assert.equal(dom.button.getAttribute('aria-haspopup'), 'dialog')
    run.dispose()
    assert.equal(dom.button.getAttribute('data-bux-context-warning'), null)
    assert.equal(dom.tooltip.getAttribute('data-bux-context-detail'), null)
    assert.equal(run.observers[0].disconnected, true)
  }
})

test('missing host numbers do not throw, and a disabled reading leaves the native ring', () => {
  const blank = host02({ aria: null, text: null, dasharray: false })
  const fallback = boot(blank, { percent: 95, detail: null }, 90)
  assert.equal(blank.button.getAttribute('data-bux-context-warning'), '')
  fallback.dispose()
  assert.equal(blank.button.getAttribute('data-bux-context-warning'), null)

  const off = host02({ percent: 99 })
  const disabled = boot(off, null, 90)
  assert.equal(off.button.getAttribute('data-bux-context-warning'), null)
  assert.equal(off.tooltip.getAttribute('data-bux-context-detail'), null)
  assert.equal(off.button.getAttribute('aria-label'), '上下文已用 99%')
  disabled.dispose()
  assert.equal(disabled.observers[0].disconnected, true)
})

test('0.1 in-card ring still warns, and dock noise does not schedule work', () => {
  const legacy = host01(90)
  const run = boot(legacy, { percent: 90, detail: '~900K / 1M' }, 90)
  assert.deepEqual(run.observers[0].targets, [legacy.card])
  assert.equal(legacy.button.getAttribute('data-bux-context-warning'), '')
  run.dispose()
  assert.equal(legacy.button.getAttribute('data-bux-context-warning'), null)
  assert.equal(legacy.button.getAttribute('aria-label'), '90% of context used')

  const dom = host02({ percent: 90 })
  const live = boot(dom, { percent: 90, detail: '~900K / 1M' }, 90)
  const before = { ...live.stats }
  for (let i = 0; i < 20; i += 1) {
    live.observers[0].callback([{ type: 'characterData', target: dom.noise, addedNodes: [], removedNodes: [] }])
    live.observers[0].callback([{ type: 'childList', target: dom.dock, addedNodes: [el('span', { text: 'noise' })], removedNodes: [] }])
  }
  assert.equal(live.pending.length, 0)
  assert.deepEqual(live.stats, before)
  dom.tooltip.removeAttribute?.('role')
  const late = el('span', { attrs: { role: 'tooltip' } })
  dom.button.parentElement.childNodes.push(late)
  late.parentElement = dom.button.parentElement
  live.observers[0].callback([{ type: 'childList', target: dom.button.parentElement, addedNodes: [late], removedNodes: [] }])
  assert.equal(live.pending.length, 1)
  live.flush()
  assert.equal(late.getAttribute('data-bux-context-detail'), '~900K / 1M')
  live.dispose()
  assert.equal(late.getAttribute('data-bux-context-detail'), null)
})
