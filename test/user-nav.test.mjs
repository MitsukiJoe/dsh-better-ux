import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
const start = source.indexOf('    const USER_NAV_CSS = [')
const end = source.indexOf('    const ICONS = {', start)
assert.ok(start >= 0 && end > start)
export const navigatorSource = source.slice(start, end)

const CHANGE = 'settings-change'

function fixture(count = 100, overrides = {}) {
  const counts = { geometry: 0, discovery: 0, query: 0, seat: 0 }
  const frames = new Map()
  const timers = new Map()
  const observers = []
  let id = 0
  let settings = { userNav: { enabled: true, open: true, loadOlder: true, ...overrides } }
  class Element extends EventTarget {
    constructor(tag = 'div') {
      super()
      this.tagName = tag
      this.nodeType = 1
      this.children = []
      this.dataset = {}
      this.style = {}
      this.attrs = new Map()
      this.isConnected = true
      this.scrollTop = 0
      this.disabled = false
      this.offsetParent = {}
      this.top = 0
      this.isSeat = false
    }
    appendChild(node) { this.children.push(node); node.parentElement = this; return node }
    remove() { this.isConnected = false; this.parentElement.children = this.parentElement.children.filter(n => n !== this) }
    setAttribute(k, v) { this.attrs.set(k, v) }
    getAttribute(k) { return this.attrs.get(k) ?? null }
    hasAttribute(k) { return this.attrs.has(k) }
    contains(n) { return n === this || this.children.some(c => c.contains(n)) }
    closest(selector) { return selector === '[data-conversation-scroll]' ? port : null }
    matches(selector) {
      if (selector === '[data-chat-flow]') return this === currentFlow
      if (selector === '[data-composer-seat]') return this.isSeat
      return false
    }
    // Counts every element-scoped lookup: a per-frame query here is the regression we guard.
    querySelector(selector) {
      counts.query++
      if (selector === '[data-composer-seat]') counts.seat++
      if (selector === 'button') return this.children.find(c => c instanceof Button) || null
      const hit = (node) => node.matches(selector) ? node : node.children.reduce((found, child) => found || hit(child), null)
      return this.children.reduce((found, child) => found || hit(child), null)
    }
    querySelectorAll(selector) { counts.query++; return selector.includes('aria-label') ? [bottom] : [] }
    getBoundingClientRect() {
      counts.geometry++
      const top = this === port ? 0 : this.top - port.scrollTop
      return { top, bottom: this === port ? 600 : top + 80, right: 800, width: 800, height: this === port ? 600 : 80 }
    }
    click() { if (!this.disabled) this.dispatchEvent(new Event('click')) }
  }
  class Button extends Element { constructor() { super('button') } }
  class Observer {
    constructor(callback) { this.callback = callback; this.targets = []; observers.push(this) }
    observe(target, options) { this.targets.push({ target, options }) }
    disconnect() { this.targets = [] }
  }
  const port = new Element()
  port.scrollTop = 500
  const bottom = new Button()
  bottom.setAttribute('aria-label', 'Back to bottom')
  const head = new Element()
  const body = new Element()
  let currentFlow
  function makeSeat() {
    const seat = new Element()
    seat.isSeat = true
    seat.top = 620
    return seat
  }
  function makeFlow() {
    const flow = new Element()
    const older = new Element()
    older.appendChild(new Button())
    flow.appendChild(older)
    for (let i = 0; i < count; i++) {
      const row = new Element()
      row.dataset.chatFlowKind = 'user'
      row.setAttribute('data-chat-anchor-key', String(i))
      row.top = i * 100
      flow.appendChild(row)
    }
    return flow
  }
  currentFlow = makeFlow()
  port.appendChild(currentFlow)
  port.appendChild(makeSeat())
  const document = {
    head, body, createElement: tag => tag === 'button' ? new Button() : new Element(tag),
    querySelector(selector) { counts.discovery++; return selector === '[data-chat-flow]' ? currentFlow : null },
    querySelectorAll() { counts.discovery++; return [bottom] },
  }
  const window = Object.assign(new EventTarget(), {
    innerWidth: 1000, innerHeight: 800,
    requestAnimationFrame(fn) { frames.set(++id, fn); return id },
    cancelAnimationFrame(id) { frames.delete(id) },
    setTimeout(fn, delay) { timers.set(++id, { fn, delay }); return id },
    clearTimeout(id) { timers.delete(id) },
  })
  const factory = new Function('document', 'window', 'HTMLElement', 'HTMLButtonElement', 'MutationObserver', 'ResizeObserver', 'tt', 'LOCALE_CHANGE', 'loadSettings', 'CHANGE', navigatorSource + '\nreturn startUserNav()')
  const stop = factory(document, window, Element, Button, Observer, Observer, x => x, 'locale', () => settings, CHANGE)
  const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()) }
  flush()
  const drain = (keep) => {
    const due = [...timers].filter(([, timer]) => keep(timer.delay))
    due.forEach(([key]) => timers.delete(key))
    due.forEach(([, timer]) => timer.fn())
    flush()
  }
  return {
    counts, port, frames, timers, observers, stop, flush, head, body,
    get root() { return body.children[0] },
    get flow() { return currentFlow },
    probes() { return [...timers.values()].filter(t => t.delay < 1000).length },
    ceilings() { return [...timers.values()].filter(t => t.delay >= 1000).length },
    reset() { counts.geometry = counts.discovery = counts.query = counts.seat = 0 },
    setEnabled(enabled) { settings = { ...settings, userNav: { ...settings.userNav, enabled } }; window.dispatchEvent(new Event(CHANGE)) },
    resize() { observers.filter(o => o.targets.some(t => t.target === currentFlow && !t.options)).forEach(o => o.callback([])) },
    mutate() { observers.filter(o => o.targets.some(t => t.target === currentFlow && t.options)).forEach(o => o.callback([{ target: currentFlow, addedNodes: [], removedNodes: [] }])) },
    bodyMutate(added) { observers.filter(o => o.targets.some(t => t.target === body)).forEach(o => o.callback([{ target: body, addedNodes: [added], removedNodes: [] }])); flush() },
    newSeat: makeSeat,
    scroll() { port.dispatchEvent(new Event('scroll')); flush() },
    replaceFlow() { currentFlow.isConnected = false; currentFlow = makeFlow(); this.scroll() },
    tick() { drain(delay => delay < 1000) },
    expireCeiling() { drain(delay => delay >= 1000) },
  }
}

test('navigator scroll avoids document discovery and keeps directional targets', () => {
  const f = fixture()
  f.reset()
  f.scroll()
  assert.equal(f.counts.discovery, 0)
  f.root.children[0].click()
  assert.equal(f.port.scrollTop, 400)
  f.flush()
  f.root.children[1].click()
  assert.equal(f.port.scrollTop, 500)
  f.stop()
})

test('navigator streaming work is logarithmic in loaded user rows', () => {
  const f = fixture(1024)
  f.reset()
  for (let i = 0; i < 20; i++) { f.resize(); f.flush() }
  assert.equal(f.counts.geometry, 480)
  assert.equal(f.counts.discovery, 0)
  f.stop()
})

test('navigator resolves the composer seat per DOM change, not per frame', () => {
  const f = fixture(1024)
  f.reset()
  for (let i = 0; i < 20; i++) { f.resize(); f.flush() }
  assert.equal(f.counts.query, 0)
  assert.equal(f.counts.seat, 0)
  f.reset()
  f.bodyMutate(f.newSeat())
  assert.equal(f.counts.seat, 1)
  f.reset()
  for (let i = 0; i < 20; i++) { f.resize(); f.flush() }
  assert.equal(f.counts.query, 0)
  assert.equal(f.counts.seat, 0)
  f.stop()
})

test('navigator drops pending pagination on conversation replacement and disposal', () => {
  const f = fixture()
  f.port.scrollTop = 0
  f.root.children[0].click()
  assert.equal(f.probes(), 1)
  assert.equal(f.ceilings(), 1)
  f.port.scrollTop = 550
  f.replaceFlow()
  f.tick()
  assert.equal(f.port.scrollTop, 550)
  assert.equal(f.timers.size, 0)
  f.stop()
  assert.equal(f.frames.size, 0)
  assert.equal(f.head.children.length, 0)
  assert.ok(f.observers.every(o => o.targets.length === 0))
})

test('navigator resolves late pagination against the original first user row', () => {
  const f = fixture()
  f.port.scrollTop = 0
  f.root.children[0].click()
  for (let i = 0; i < 40; i++) f.tick()
  assert.equal(f.probes(), 0)
  const first = f.flow.children[1]
  const older = new first.constructor()
  older.dataset.chatFlowKind = 'user'
  older.setAttribute('data-chat-anchor-key', 'older')
  older.top = 0
  for (const row of f.flow.children.slice(1)) row.top += 100
  f.flow.children.splice(1, 0, older)
  f.port.scrollTop = 100
  f.mutate()
  f.tick()
  assert.equal(f.port.scrollTop, 0)
  assert.equal(f.timers.size, 0)
  f.stop()
})

test('navigator bounds a pending pagination that never resolves', () => {
  const f = fixture()
  f.port.scrollTop = 0
  f.root.children[0].click()
  assert.equal(f.ceilings(), 1)
  f.expireCeiling()
  assert.equal(f.timers.size, 0)
  f.reset()
  for (let i = 0; i < 20; i++) { f.mutate(); f.flush() }
  assert.equal(f.probes(), 0)
  f.port.scrollTop = 400
  f.mutate()
  f.tick()
  assert.equal(f.port.scrollTop, 400)
  f.stop()
})

test('navigator skips host pagination when the option is off', () => {
  const f = fixture(100, { loadOlder: false })
  f.port.scrollTop = 0
  const older = f.flow.children[0].children[0]
  let clicked = 0
  older.addEventListener('click', () => { clicked++ })
  f.root.children[0].click()
  assert.equal(clicked, 0)
  assert.equal(f.timers.size, 0)
  assert.equal(f.port.scrollTop, 0)
  f.stop()
})

test('navigator master switch restores the original UI and remounts', () => {
  const f = fixture()
  assert.equal(f.body.children.length, 1)
  assert.equal(f.head.children.length, 1)
  f.setEnabled(false)
  assert.equal(f.body.children.length, 0)
  assert.equal(f.head.children.length, 0)
  assert.equal(f.frames.size, 0)
  assert.equal(f.timers.size, 0)
  assert.ok(f.observers.every(o => o.targets.length === 0))
  f.setEnabled(true)
  f.flush()
  assert.equal(f.body.children.length, 1)
  assert.equal(f.head.children.length, 1)
  f.stop()
  assert.equal(f.body.children.length, 0)
  assert.equal(f.head.children.length, 0)
})

test('navigator measures current row positions after layout changes', () => {
  const f = fixture()
  for (const row of f.flow.children.slice(1)) row.top += 50
  f.root.children[0].click()
  assert.equal(f.port.scrollTop, 450)
  f.stop()
})

test('navigator cancels pagination when another navigation command wins', () => {
  const f = fixture()
  f.port.scrollTop = 0
  f.root.children[0].click()
  f.root.children[1].click()
  assert.equal(f.timers.size, 0)
  assert.equal(f.port.scrollTop, 100)
  f.stop()
})

test('navigator hides controls from pointer and keyboard navigation', () => {
  const css = new Function(navigatorSource + '\nreturn USER_NAV_CSS')()
  assert.ok(css.split('}')[0].includes('visibility:hidden'))
  assert.ok(css.includes('[data-visible="1"]{opacity:1;visibility:visible}'))
})
