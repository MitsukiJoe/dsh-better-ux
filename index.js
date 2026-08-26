const ROUTE = '/api/dsh-better-ux/summary-v2'
const BODY_LIMIT = 32 * 1024
const CHUNK_LIMIT = 18000
export const DEFAULT_OVERALL_INSTRUCTION = '400个字以内简明扼要总结当前session干了什么'
export const DEFAULT_RECENT_INSTRUCTION = '100个字以内简明扼要总结这轮对话干了什么'
export const IMMUTABLE_SUMMARY_INSTRUCTION = '每个句号后面都换行尽量格式精美可读性高。'
export const DEFAULT_SUMMARY_INSTRUCTION = IMMUTABLE_SUMMARY_INSTRUCTION
const CUSTOM_PROMPT_LIMIT = 2000
const MODEL_TIMEOUT = 180000

export const name = 'dsh-better-ux'
export const inject = ['llm', 'sessions', 'webServer']

export function clampText(value, limit) {
  const chars = Array.from(String(value || '').trim())
  return limit == null ? chars.join('') : chars.slice(0, limit).join('')
}

function contentText(content) {
  if (!Array.isArray(content)) return ''
  return content.map((block) => {
    if (block?.type === 'text') return block.text || ''
    if (block?.type === 'image') return '[图片]'
    if (block?.type === 'tool-call') return '[工具调用]'
    return ''
  }).filter(Boolean).join('\n')
}

function compactJson(value, limit = 1200) {
  let text = ''
  try {
    text = JSON.stringify(value)
  } catch {
    text = String(value || '')
  }
  if (text.length <= limit) return text
  return text.slice(0, limit) + '…'
}

export function timelineFromEvents(events, sinceSeq = -1, includeMessages = true) {
  const calls = new Map()
  const lines = []
  for (const event of events || []) {
    if (!event) continue
    const data = event.data || {}
    if (event.type === 'tool/call') calls.set(data.callId, data.name || 'tool')
    if (event.seq <= sinceSeq) continue
    if (!includeMessages && ['user/message', 'assistant/message', 'tool/call', 'tool/result'].includes(event.type)) continue
    if (event.type === 'user/message') {
      const source = data.source || {}
      const text = source.kind === 'user' ? contentText(data.content) : source.form === 'notice' ? source.summary : ''
      if (text) lines.push((source.kind === 'user' ? '用户：' : '上下文：') + text)
      continue
    }
    if (event.type === 'assistant/message') {
      const text = contentText(data.message?.content)
      if (text) lines.push('AI：' + text)
      continue
    }
    if (event.type === 'tool/call') {
      lines.push('工具开始：' + (data.name || 'tool') + ' ' + compactJson(data.arguments, 500))
      continue
    }
    if (event.type === 'tool/result') {
      const callId = data.message?.toolCallId || data.callId
      const toolName = calls.get(callId) || 'tool'
      const result = contentText(data.message?.content)
      lines.push('工具结果：' + toolName + (data.error ? '（失败）' : '（完成）') + ' ' + clampText(result, 1200))
      continue
    }
    if (event.type === 'todo/write') {
      lines.push('任务列表：' + compactJson(data.todos, 1800))
      continue
    }
    if (String(event.type).includes('goal')) lines.push('长期目标：' + compactJson(data, 1200))
  }
  return lines.join('\n')
}

export function timelineFromMessages(messages) {
  const lines = []
  for (const message of messages || []) {
    const text = contentText(message?.content)
    if (!text) continue
    if (message.role === 'user') {
      if (message.source?.kind === 'user') lines.push('用户：' + text)
      else if (message.source?.kind === 'plugin' && message.source?.plugin === 'compact') lines.push('上下文：' + text)
    } else if (message.role === 'assistant') {
      lines.push('AI：' + text)
    } else if (message.role === 'tool') {
      lines.push('工具结果：' + clampText(text, 1200))
    }
  }
  return lines.join('\n')
}

export function latestCompletedTurnFromEvents(events) {
  let current = null
  let latest = ''
  for (const event of events || []) {
    const data = event?.data || {}
    if (event?.type === 'user/message' && data.source?.kind === 'user') {
      const text = contentText(data.content)
      current = text ? ['用户：' + text] : null
      continue
    }
    if (event?.type === 'assistant/message' && current) {
      const text = contentText(data.message?.content)
      if (!text) continue
      current.push('AI：' + text)
      latest = current.join('\n')
    }
  }
  return latest
}

export function latestCompletedTurnFromMessages(messages) {
  let current = null
  let latest = ''
  for (const message of messages || []) {
    const text = contentText(message?.content)
    if (!text) continue
    if (message.role === 'user' && message.source?.kind === 'user') {
      current = ['用户：' + text]
      continue
    }
    if (message.role === 'assistant' && current) {
      current.push('AI：' + text)
      latest = current.join('\n')
    }
  }
  return latest
}


function latestStateEvents(events) {
  let todo
  let goal
  for (let index = (events || []).length - 1; index >= 0 && (!todo || !goal); index -= 1) {
    const event = events[index]
    if (!todo && event?.type === 'todo/write') todo = event
    if (!goal && String(event?.type || '').includes('goal')) goal = event
  }
  return [todo, goal].filter(Boolean).sort((a, b) => a.seq - b.seq)
}

export function splitTimeline(text, limit = CHUNK_LIMIT) {
  if (!text) return []
  const chunks = []
  let current = ''
  for (const line of text.split('\n')) {
    if (current && current.length + line.length + 1 > limit) {
      chunks.push(current)
      current = ''
    }
    if (line.length > limit) {
      if (current) {
        chunks.push(current)
        current = ''
      }
      for (let start = 0; start < line.length; start += limit) chunks.push(line.slice(start, start + limit))
      continue
    }
    current += (current ? '\n' : '') + line
  }
  if (current) chunks.push(current)
  return chunks
}

function summaryText(value) {
  return String(value || '').trim().replaceAll('\\n', '\n')
}

function parseSummary(raw, fields) {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('摘要模型没有返回 JSON')
  const value = JSON.parse(raw.slice(start, end + 1))
  return {
    overall: fields.overall ? summaryText(value.overall) : '',
    recent: fields.recent ? summaryText(value.recent) : '',
  }
}

async function summarizeChunk(ctx, route, sessionId, previous, timeline, fields, instructions, signal) {
  const requested = [fields.overall && 'overall', fields.recent && 'recent'].filter(Boolean).join('、')
  const system = [
    '你是对话状态摘要器。根据已有摘要和新增时间线，更新指定字段。',
    fields.overall ? 'overall 根据 previous.overall 和 timeline.overall 增量更新，只保留整个 session 的有效状态。' : '',
    fields.overall ? 'overall 要求：' + (instructions.overall || DEFAULT_OVERALL_INSTRUCTION) : '',
    fields.recent ? 'recent 只根据 timeline.recent 总结最近一轮已完成的用户输入与 AI 输出，不沿用更早任务。' : '',
    fields.recent ? 'recent 要求：' + (instructions.recent || DEFAULT_RECENT_INSTRUCTION) : '',
    IMMUTABLE_SUMMARY_INSTRUCTION,
    '换行必须写成 JSON 字符串中的 \\n 转义；只返回一个 JSON 对象，不要 Markdown。',
    '仅生成这些字段：' + requested,
  ].filter(Boolean).join('\n')
  const prompt = JSON.stringify({ previous, timeline })
  const message = Object.freeze({
    id: 'summary-' + Date.now(),
    role: 'user',
    source: Object.freeze({ kind: 'plugin', plugin: name }),
    content: Object.freeze([Object.freeze({ type: 'text', text: prompt })]),
  })
  const modelTimeout = AbortSignal.timeout(MODEL_TIMEOUT)
  const modelSignal = AbortSignal.any([signal, modelTimeout])
  const options = Object.freeze({
    provider: route.provider,
    model: route.model,
    ...(route.reasoningEffort ? { reasoningEffort: route.reasoningEffort } : {}),
    messages: Object.freeze([message]),
    system,
    maxTokens: 4096,
    sessionId,
    signal: modelSignal,
  })
  const blocks = new Map()
  let deltas = ''
  let finish
  let usage
  for await (const chunk of ctx.llm.stream(options)) {
    signal.throwIfAborted()
    if (chunk.type === 'text-delta') deltas += chunk.text
    if (chunk.type === 'block-end' && chunk.block?.type === 'text') blocks.set(chunk.index, chunk.block.text)
    if (chunk.type === 'usage') usage = chunk.usage
    if (chunk.type === 'finish') finish = chunk.reason
  }
  if (modelTimeout.aborted) throw Object.assign(new Error('摘要模型请求超时'), { status: 504 })
  if (finish?.kind === 'error' || finish?.kind === 'aborted') throw Object.assign(new Error(finish.failure?.message || '摘要模型调用失败'), { status: 502 })
  const raw = blocks.size ? [...blocks.entries()].sort((a, b) => a[0] - b[0]).map((entry) => entry[1]).join('') : deltas
  try {
    return { summary: parseSummary(raw, fields), usage }
  } catch (error) {
    if (finish?.kind === 'max-tokens') throw Object.assign(new Error('摘要模型输出超过上限'), { status: 422 })
    throw Object.assign(error, { status: 502 })
  }
}

async function readJson(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > BODY_LIMIT) throw Object.assign(new Error('请求体过大'), { status: 413 })
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  res.end(body)
}

export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ROUTE,
    handler: async (req, res) => {
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'Method Not Allowed' })
        return
      }
      if (!String(req.headers?.['content-type'] || '').toLowerCase().startsWith('application/json')) {
        sendJson(res, 415, { error: 'Content-Type must be application/json' })
        return
      }
      const origin = req.headers?.origin
      if (origin) {
        try {
          if (new URL(origin).host !== req.headers.host) {
            sendJson(res, 403, { error: 'Forbidden' })
            return
          }
        } catch {
          sendJson(res, 403, { error: 'Forbidden' })
          return
        }
      }
      const controller = new AbortController()
      res.on('close', () => {
        if (!res.writableEnded) controller.abort()
      })
      try {
        const input = await readJson(req)
        const sessionId = typeof input.sessionId === 'string' ? input.sessionId : ''
        const session = ctx.sessions.get(sessionId)
        if (!session) {
          sendJson(res, 404, { error: '当前会话不可用' })
          return
        }
        const fields = {
          overall: input.fields?.overall !== false,
          recent: input.fields?.recent !== false,
        }
        if (!fields.overall && !fields.recent) {
          sendJson(res, 400, { error: '至少开启一种摘要' })
          return
        }
        const route = {
          provider: clampText(input.route?.provider, 200),
          model: clampText(input.route?.model, 500),
          ...(typeof input.route?.reasoningEffort === 'string' && input.route.reasoningEffort ? { reasoningEffort: clampText(input.route.reasoningEffort, 50) } : {}),
        }
        if (!route.provider || !route.model) {
          sendJson(res, 400, { error: '请先选择摘要模型' })
          return
        }
        const previous = {
          overall: fields.overall ? summaryText(input.previous?.overall) : '',
          recent: fields.recent ? summaryText(input.previous?.recent) : '',
        }
        const instructions = {
          overall: clampText(input.instructions?.overall, CUSTOM_PROMPT_LIMIT),
          recent: clampText(input.instructions?.recent, CUSTOM_PROMPT_LIMIT),
        }
        const sinceSeq = Number.isSafeInteger(input.sinceSeq) ? input.sinceSeq : -1
        const lastSeq = session.events.at(-1)?.seq ?? -1
        const messages = sinceSeq < 0 && typeof session.deriveMessages === 'function' ? session.deriveMessages() : null
        const overallTimeline = fields.overall
          ? sinceSeq < 0 && messages
            ? [timelineFromMessages(messages), timelineFromEvents(latestStateEvents(session.events), -1, false)].filter(Boolean).join('\n')
            : timelineFromEvents(session.events, sinceSeq)
          : ''
        const recentTimeline = fields.recent
          ? latestCompletedTurnFromEvents(session.events) || (messages ? latestCompletedTurnFromMessages(messages) : '')
          : ''
        const overallChunks = splitTimeline(overallTimeline)
        if (!overallChunks.length && fields.overall && input.refresh === true && previous.overall) overallChunks.push('')
        if (!overallChunks.length && !recentTimeline) {
          sendJson(res, 200, { ...previous, seq: lastSeq, model: route })
          return
        }
        let summary = previous
        let usage
        const addUsage = (value) => {
          if (!value) return
          usage ||= { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, reasoningTokens: 0 }
          for (const key of Object.keys(usage)) usage[key] += Number(value[key]) || 0
        }
        for (const chunk of overallChunks) {
          const result = await summarizeChunk(ctx, route, session.id || sessionId, { overall: summary.overall, recent: '' }, { overall: chunk, recent: '' }, { overall: true, recent: false }, instructions, controller.signal)
          summary = { ...summary, overall: result.summary.overall }
          addUsage(result.usage)
        }
        if (recentTimeline) {
          const result = await summarizeChunk(ctx, route, session.id || sessionId, { overall: '', recent: '' }, { overall: '', recent: recentTimeline }, { overall: false, recent: true }, instructions, controller.signal)
          summary = { ...summary, recent: result.summary.recent }
          addUsage(result.usage)
        }
        sendJson(res, 200, { ...summary, seq: lastSeq, model: route, ...(usage ? { usage } : {}) })
      } catch (error) {
        if (!res.headersSent && !res.destroyed) sendJson(res, error?.status || 500, { error: error?.message || '摘要生成失败' })
      } finally {
        if (!controller.signal.aborted) controller.abort()
      }
    },
  }), 'dsh-better-ux: summary endpoint')
}
