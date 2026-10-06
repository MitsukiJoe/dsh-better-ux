import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
const start = source.indexOf('    function fiberProps(')
const end = source.indexOf('    function menuItems(', start)
assert.ok(start >= 0 && end > start)
const { fiberProps, runSessionRowAction } = new Function(source.slice(start, end) + '\nreturn { fiberProps, runSessionRowAction }')()

function rowWith(nearestFirst) {
  let parent = null
  for (let i = nearestFirst.length - 1; i >= 0; i -= 1) parent = { memoizedProps: nearestFirst[i], return: parent }
  return { __reactFiber$test: parent }
}

function click(id, row, sessions) {
  const button = new EventTarget()
  button.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    runSessionRowAction(id, fiberProps(row), sessions)
  })
  const event = new Event('click', { cancelable: true })
  button.dispatchEvent(event)
  assert.equal(event.defaultPrevented, true)
}

test('click uses the shared row action', () => {
  assert.match(source, /runSessionRowAction\(id, fiberProps\(row\), sessions\)/)
})

test('0.2 click renames through onRenameRequest and forks through sessions.fork', async () => {
  const calls = []
  const sessions = {
    fork(opts) {
      calls.push(['fork', opts])
      return Promise.resolve('child')
    },
  }
  const row = rowWith([
    { className: 'row', role: 'treeitem' },
    {
      node: { id: 's1', title: 'Hello' },
      onRenameRequest(id, title) { calls.push(['rename', id, title]) },
      onOpen() {},
    },
  ])
  click('rename', row, sessions)
  click('fork', row, sessions)
  assert.deepEqual(calls, [
    ['rename', 's1', 'Hello'],
    ['fork', { sessionId: 's1', increaseTitle: true }],
  ])
})

test('0.1 click keeps onRename and onFork', () => {
  const calls = []
  const sessions = { fork() { calls.push('service') } }
  const row = rowWith([{
    node: { id: 's1', title: 'Old' },
    onRename(id, title) { calls.push(['rename', id, title]) },
    onFork(id) { calls.push(['fork', id]) },
    onArchive() { calls.push('archive') },
  }])
  click('rename', row, sessions)
  click('fork', row, sessions)
  assert.deepEqual(calls, [['rename', 's1', 'Old'], ['fork', 's1']])
})

test('0.1 callbacks win when both generations are present', () => {
  const calls = []
  const row = rowWith([{
    node: { id: 's1', title: 'Both' },
    onRename() { calls.push('legacy') },
    onRenameRequest() { calls.push('next') },
    onFork() { calls.push('legacy-fork') },
  }])
  runSessionRowAction('rename', fiberProps(row), { fork() { calls.push('service') } })
  runSessionRowAction('fork', fiberProps(row), { fork() { calls.push('service') } })
  assert.deepEqual(calls, ['legacy', 'legacy-fork'])
})

test('a rejected 0.2 fork does not escape the click', async () => {
  const row = rowWith([{ node: { id: 's1', title: '' }, onRenameRequest() {} }])
  const sessions = { fork() { return Promise.reject(new Error('unavailable')) } }
  assert.equal(runSessionRowAction('fork', fiberProps(row), sessions), true)
  await new Promise((resolve) => setTimeout(resolve, 0))
})
