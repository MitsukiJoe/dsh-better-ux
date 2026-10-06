import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
const used = [...source.matchAll(/\bicon\("(Icon\w+)", (\d+)\)/g)].map((m) => [m[1], m[2]])
const helper = source.match(/const icon = \(name, size\) => .*/)[0]
const resolver = (Icons) => new Function('Icons', helper + '\nreturn icon')(Icons)

test('every host icon goes through the size-suffix compatible resolver', () => {
  assert.ok(used.length > 0)
  assert.equal(/\bIcons\.Icon\w+/.test(source), false)
})

test('session row icons render host Regular 14px markup and fall back when the export is missing', () => {
  const start = source.indexOf('    function sessionIconMarkup(')
  const end = source.indexOf('\n    function fiberProps(', start)
  assert.ok(start >= 0 && end > start)
  const sessionIconMarkup = new Function(source.slice(start, end) + '\nreturn sessionIconMarkup')()
  const host = ({ size }) => ({
    type: ({ size, strokeWidth }) => ({
      type: 'svg',
      props: {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        strokeWidth,
        children: { type: 'path', props: { d: 'M0 0', stroke: 'currentColor' } },
      },
    }),
    props: { size, strokeWidth: 1 },
  })
  const html = sessionIconMarkup(host, '<svg data-fallback="1"></svg>')
  assert.match(html, /width="14"/)
  assert.match(html, /stroke-width="1"/)
  assert.equal(html.includes('data-fallback'), false)
  assert.equal(sessionIconMarkup(undefined, '<svg data-fallback="1"></svg>'), '<svg data-fallback="1"></svg>')
  assert.equal(sessionIconMarkup(() => { throw new Error('missing') }, 'fallback'), 'fallback')
})

test('icons resolve on DSH 0.2 (Regular/Medium only) and DSH 0.1 (size suffix) hosts', () => {
  const next = Object.fromEntries(used.flatMap(([name]) => [[name + 'Regular', () => 'r'], [name + 'Medium', () => 'm']]))
  const legacy = Object.fromEntries(used.map(([name, size]) => [name + size, () => 'l']))
  for (const [Icons, expected] of [[next, 'r'], [legacy, 'l']]) {
    const icon = resolver(Icons)
    for (const [name, size] of used) assert.equal(icon(name, size)(), expected, name)
  }
})
