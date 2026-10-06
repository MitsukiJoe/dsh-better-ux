import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
const start = source.indexOf('    function clampSummaryFrame(')
const end = source.indexOf('    function useSummaryGeometry(', start)
assert.ok(start >= 0 && end > start)

const { clampSummaryFrame, summaryContentFloor } = new Function(
  source.slice(start, end) + '\nreturn { clampSummaryFrame, summaryContentFloor }',
)()

const content = { top: 112, left: 0, right: 1280, bottom: 800 }

test('keeps a panel top that is already below the content top', () => {
  const frame = clampSummaryFrame(
    { top: 160, left: 24, width: 320, height: 180 },
    content,
  )
  assert.equal(frame.top, 160)
  assert.equal(frame.left, 24)
  assert.equal(frame.width, 320)
  assert.equal(frame.height, 180)
})

test('clamps a panel top that crosses above the content top', () => {
  const frame = clampSummaryFrame(
    { top: 48, left: 24, width: 320, height: 180 },
    content,
  )
  assert.equal(frame.top, 112)
  assert.ok(frame.top + frame.height <= content.bottom)
})

test('clamps a restored frame back inside after the window shrinks', () => {
  const parked = clampSummaryFrame(
    { top: 480, left: 900, width: 300, height: 240 },
    content,
  )
  assert.equal(parked.top, 480)

  const shrunk = { top: 112, left: 0, right: 640, bottom: 360 }
  const fitted = clampSummaryFrame(parked, shrunk)
  assert.equal(fitted.top, 120)
  assert.equal(fitted.height, 240)
  assert.equal(fitted.top + fitted.height, shrunk.bottom)
  assert.ok(fitted.top >= shrunk.top)
  assert.equal(fitted.width, 300)
  assert.equal(fitted.left + fitted.width, shrunk.right)
})

test('content floor stays under the header when the chat column has scrolled up', () => {
  assert.equal(summaryContentFloor(96, -240), 96)
  assert.equal(summaryContentFloor(0, 128), 128)
  assert.equal(summaryContentFloor(96, 140), 140)
  assert.equal(summaryContentFloor(0, 0), 56)
})
