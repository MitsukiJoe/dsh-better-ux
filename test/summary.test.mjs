import assert from 'node:assert/strict'
import test from 'node:test'
import { latestCompletedTurnFromEvents, latestCompletedTurnFromMessages, splitTimeline, timelineFromEvents, timelineFromMessages } from '../index.js'

test('extracts incremental task timeline', () => {
  const events = [
    { seq: 1, type: 'user/message', data: { source: { kind: 'user' }, content: [{ type: 'text', text: '新增摘要窗口' }] } },
    { seq: 2, type: 'todo/write', data: { todos: [{ content: '实现窗口', status: 'in_progress' }] } },
    { seq: 3, type: 'assistant/message', data: { message: { content: [{ type: 'text', text: '正在实现' }] } } },
  ]
  const all = timelineFromEvents(events)
  assert.match(all, /新增摘要窗口/)
  assert.match(all, /实现窗口/)
  assert.equal(timelineFromEvents(events, 2), 'AI：正在实现')
})

test('uses compacted surface messages instead of hidden history', () => {
  const timeline = timelineFromMessages([
    { role: 'user', source: { kind: 'plugin', plugin: 'compact' }, content: [{ type: 'text', text: '此前任务检查点' }] },
    { role: 'user', source: { kind: 'plugin', plugin: 'injected' }, content: [{ type: 'text', text: '隐藏指令' }] },
    { role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text: '继续实现' }] },
    { role: 'assistant', content: [{ type: 'text', text: '正在处理' }] },
  ])
  assert.match(timeline, /此前任务检查点/)
  assert.match(timeline, /继续实现/)
  assert.doesNotMatch(timeline, /隐藏指令/)
})

test('extracts only the latest completed user and assistant turn', () => {
  const events = [
    { seq: 1, type: 'user/message', data: { source: { kind: 'user' }, content: [{ type: 'text', text: '第一轮输入' }] } },
    { seq: 2, type: 'assistant/message', data: { message: { content: [{ type: 'text', text: '第一轮输出' }] } } },
    { seq: 3, type: 'user/message', data: { source: { kind: 'user' }, content: [{ type: 'text', text: '第二轮输入' }] } },
    { seq: 4, type: 'tool/call', data: { callId: 'call-1', name: 'read', arguments: { path: 'secret' } } },
    { seq: 5, type: 'tool/result', data: { callId: 'call-1', message: { content: [{ type: 'text', text: '工具详情' }] } } },
    { seq: 6, type: 'assistant/message', data: { message: { content: [{ type: 'text', text: '第二轮输出一' }] } } },
    { seq: 7, type: 'assistant/message', data: { message: { content: [{ type: 'text', text: '第二轮输出二' }] } } },
    { seq: 8, type: 'user/message', data: { source: { kind: 'user' }, content: [{ type: 'text', text: '尚未完成的新输入' }] } },
  ]
  const turn = latestCompletedTurnFromEvents(events)
  assert.equal(turn, '用户：第二轮输入\nAI：第二轮输出一\nAI：第二轮输出二')
  assert.doesNotMatch(turn, /第一轮|工具|尚未完成/)

  const messages = [
    { role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text: '最近输入' }] },
    { role: 'tool', content: [{ type: 'text', text: '工具结果' }] },
    { role: 'assistant', content: [{ type: 'text', text: '最近输出' }] },
  ]
  assert.equal(latestCompletedTurnFromMessages(messages), '用户：最近输入\nAI：最近输出')
})

test('splits long timelines without losing content', () => {
  const text = ['a'.repeat(8), 'b'.repeat(8), 'c'.repeat(25)].join('\n')
  const chunks = splitTimeline(text, 10)
  assert.ok(chunks.every((chunk) => chunk.length <= 10))
  assert.equal(chunks.join('').replaceAll('\n', ''), text.replaceAll('\n', ''))
})
