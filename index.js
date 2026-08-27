const ROUTE = '/api/dsh-better-ux/summary-v2'
const STATE_ROUTE = '/api/dsh-better-ux/state-v1'
const STATE_DESCRIPTOR = Object.freeze({
  name: 'dsh_better_ux',
  version: 1,
  tables: Object.freeze(['settings', 'summaries']),
  hasGlobal: false,
})
const SETTINGS_KEY = 'global'
const BODY_LIMIT = 32 * 1024
const STATE_BODY_LIMIT = 128 * 1024
const CHUNK_LIMIT = 18000
export const DEFAULT_OVERALL_INSTRUCTION = '400个字以内简明扼要总结当前session干了什么'
export const DEFAULT_RECENT_INSTRUCTION = '100个字以内简明扼要总结这轮对话干了什么'
export const IMMUTABLE_SUMMARY_INSTRUCTION = '每个句号后面都换行尽量格式精美可读性高。'
export const DEFAULT_SUMMARY_INSTRUCTION = IMMUTABLE_SUMMARY_INSTRUCTION
const CUSTOM_PROMPT_LIMIT = 2000
const MODEL_TIMEOUT = 180000

export const name = 'dsh-better-ux'
export const inject = ['llm', 'sessions', 'webServer', 'storage', 'storage.backend.json']

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

async function readJson(req, limit = BODY_LIMIT) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw Object.assign(new Error('请求体过大'), { status: 413 })
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
  } catch {
    throw Object.assign(new Error('请求 JSON 无效'), { status: 400 })
  }
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

const SHARED_SETTING_TYPES = Object.freeze({
  'sessionRow.enabled': 'boolean',
  'sessionRow.open': 'boolean',
  'sessionRow.rename': 'boolean',
  'sessionRow.fork': 'boolean',
  'sessionRow.archive': 'boolean',
  'sessionRow.tooltip': 'boolean',
  'modelPicker.enabled': 'boolean',
  'modelPicker.open': 'boolean',
  'modelPicker.search': 'boolean',
  'modelPicker.providers': 'boolean',
  'modelPicker.efforts': 'boolean',
  'modelPicker.closeOnPick': 'boolean',
  'mobileLayout.enabled': 'boolean',
  'mobileLayout.open': 'boolean',
  'mobileLayout.longPressDrag': 'boolean',
  'mobileLayout.overflowHint': 'boolean',
  'mobileLayout.sidebarCompat': 'boolean',
  'mobileLayout.noPinchZoom': 'boolean',
  'mobileLayout.noAutoFocus': 'boolean',
  'mobileLayout.headerExpanded': 'boolean',
  'fontScale.enabled': 'boolean',
  'fontScale.open': 'boolean',
  'fontScale.mobile': 'scale',
  'fontScale.desktop': 'scale',
  'conversationSummary.enabled': 'boolean',
  'conversationSummary.open': 'boolean',
  'conversationSummary.overall': 'boolean',
  'conversationSummary.recent': 'boolean',
  'conversationSummary.mode': 'mode',
  'conversationSummary.hover': 'boolean',
  'conversationSummary.click': 'boolean',
  'conversationSummary.contentShortcut': 'shortcut',
  'conversationSummary.overallPrompt': 'prompt',
  'conversationSummary.recentPrompt': 'prompt',
  'conversationSummary.provider': 'route',
  'conversationSummary.model': 'route',
  'conversationSummary.modelLabel': 'route',
  'conversationSummary.reasoningEffort': 'effort',
  'conversationSummary.reasoningManual': 'boolean',
  'conversationSummary.modelCollapsed': 'boolean',
  'conversationSummary.contentCollapsed': 'boolean',
  'conversationSummary.overallCollapsed': 'boolean',
  'conversationSummary.recentCollapsed': 'boolean',
  'workspaceView.groupBy': 'workspaceGroup',
  'workspaceView.orderBy': 'workspaceOrder',
})

function stateError(message, status = 400, extra = {}) {
  return Object.assign(new Error(message), { status, ...extra })
}

function checkSameOrigin(req) {
  const origin = req.headers?.origin
  if (!origin) return
  try {
    if (new URL(origin).host !== req.headers.host) throw new Error('origin mismatch')
  } catch {
    throw stateError('Forbidden', 403)
  }
}

function normalizeBaseRevision(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw stateError('baseRevision 必须是非负整数')
  return value
}

function normalizeSessionId(value) {
  const sessionId = typeof value === 'string' ? value : ''
  if (!sessionId || Array.from(sessionId).length > 512) throw stateError('sessionId 无效')
  return sessionId
}

function flattenSettingsPatch(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw stateError('设置 patch 无效')
  const entries = []
  for (const [key, item] of Object.entries(value)) {
    if (Object.hasOwn(SHARED_SETTING_TYPES, key)) {
      entries.push([key, item])
      continue
    }
    if (['sessionRow', 'modelPicker', 'mobileLayout', 'fontScale', 'conversationSummary', 'workspaceView'].includes(key) && item && typeof item === 'object' && !Array.isArray(item)) {
      for (const [childKey, childValue] of Object.entries(item)) entries.push([key + '.' + childKey, childValue])
      continue
    }
    throw stateError('设置字段不受支持')
  }
  if (!entries.length) throw stateError('设置 patch 不能为空')
  const patch = {}
  for (const [key, item] of entries) {
    const type = SHARED_SETTING_TYPES[key]
    if (!type) throw stateError('设置字段不受支持')
    if (type === 'boolean') {
      if (typeof item !== 'boolean') throw stateError(key + ' 必须是布尔值')
    } else if (type === 'scale') {
      if (!Number.isSafeInteger(item) || item < 10 || item > 200) throw stateError(key + ' 必须是 10 到 200 的整数')
    } else if (type === 'mode') {
      if (!['top', 'left', 'ball'].includes(item)) throw stateError('摘要展示方式无效')
    } else if (type === 'workspaceGroup') {
      if (!['workspace', 'flat'].includes(item)) throw stateError('工作区分组方式无效')
    } else if (type === 'workspaceOrder') {
      if (!['manual', 'updated'].includes(item)) throw stateError('工作区排序方式无效')
    } else {
      const limits = { shortcut: 80, prompt: 2000, route: 500, effort: 80 }
      if (typeof item !== 'string' || Array.from(item).length > limits[type]) throw stateError(key + ' 字符串无效')
      if (type === 'shortcut' && /[\0\r\n]/.test(item)) throw stateError('快捷键无效')
    }
    patch[key] = item
  }
  return patch
}

function normalizeUsage(value) {
  if (value == null) return null
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw stateError('usage 无效')
  const allowed = ['inputTokens', 'outputTokens', 'cacheReadTokens', 'cacheWriteTokens']
  if (Object.keys(value).some((key) => !allowed.includes(key))) throw stateError('usage 字段不受支持')
  const usage = {}
  for (const key of allowed) {
    const amount = value[key] ?? 0
    if (!Number.isSafeInteger(amount) || amount < 0) throw stateError('usage 数值无效')
    usage[key] = amount
  }
  return usage
}

function normalizeStoredSummary(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw stateError('摘要无效')
  const allowed = ['overall', 'recent', 'seq', 'overallSeq', 'usage']
  if (Object.keys(value).some((key) => !allowed.includes(key))) throw stateError('摘要字段不受支持')
  if (value.overall !== undefined && typeof value.overall !== 'string') throw stateError('overall 类型无效')
  if (value.recent !== undefined && typeof value.recent !== 'string') throw stateError('recent 类型无效')
  const overall = value.overall || ''
  const recent = value.recent || ''
  if (Array.from(overall).length > 32000 || Array.from(recent).length > 32000) throw stateError('摘要过长')
  const seq = value.seq ?? -1
  const overallSeq = value.overallSeq ?? -1
  if (!Number.isSafeInteger(seq) || seq < -1 || !Number.isSafeInteger(overallSeq) || overallSeq < -1) throw stateError('摘要序号无效')
  return { overall, recent, seq, overallSeq, usage: normalizeUsage(value.usage) }
}

function createStateStore(unit, snapshot) {
  let settings = snapshot.tables?.settings?.[SETTINGS_KEY] || null
  const summaries = new Map(Object.entries(snapshot.tables?.summaries || {}))
  let writes = Promise.resolve()
  const enqueue = (operation) => {
    const result = writes.then(operation, operation)
    writes = result.catch(() => {})
    return result
  }
  const nextRecord = (current, value) => ({
    revision: (Number.isSafeInteger(current?.revision) ? current.revision : 0) + 1,
    updatedAt: Date.now(),
    value,
  })
  return {
    getSettings: () => settings,
    getSummary: (sessionId) => {
      const record = summaries.get(sessionId) || null
      return record?.deleted ? null : record
    },
    getSummaryRevision: (sessionId) => {
      const record = summaries.get(sessionId) || null
      return Number.isSafeInteger(record?.revision) ? record.revision : 0
    },
    patchSettings: (baseRevision, patch) => enqueue(async () => {
      const revision = Number.isSafeInteger(settings?.revision) ? settings.revision : 0
      if (baseRevision !== revision) throw stateError('revision_conflict', 409, { current: settings })
      const record = nextRecord(settings, { ...(settings?.value || {}), ...patch })
      await unit.putRecord('settings', SETTINGS_KEY, record)
      settings = record
      return record
    }),
    patchSummary: (sessionId, baseRevision, value) => enqueue(async () => {
      const current = summaries.get(sessionId) || null
      const revision = Number.isSafeInteger(current?.revision) ? current.revision : 0
      if (baseRevision !== revision) throw stateError('revision_conflict', 409, { current })
      const record = { ...nextRecord(current, value), deleted: false }
      await unit.putRecord('summaries', sessionId, record)
      summaries.set(sessionId, record)
      return record
    }),
    deleteSummary: (sessionId, baseRevision) => enqueue(async () => {
      const current = summaries.get(sessionId) || null
      const revision = Number.isSafeInteger(current?.revision) ? current.revision : 0
      if (baseRevision !== revision) throw stateError('revision_conflict', 409, { current })
      if (current?.deleted) return
      const tombstone = { ...nextRecord(current, null), deleted: true }
      await unit.putRecord('summaries', sessionId, tombstone)
      summaries.set(sessionId, tombstone)
    }),
    close: async () => {
      await writes
      await unit.close()
    },
  }
}

export async function apply(ctx) {
  const unit = await ctx.storage.backend.get('json').kv.open(STATE_DESCRIPTOR)
  const store = createStateStore(unit, await unit.loadAll())
  ctx.effect(() => () => store.close(), 'dsh-better-ux: state storage')
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_ROUTE,
    handler: async (req, res) => {
      try {
        checkSameOrigin(req)
        const url = new URL(req.url || STATE_ROUTE, 'http://localhost')
        if (req.method === 'GET') {
          const requestedSessionId = url.searchParams.get('sessionId')
          const sessionId = requestedSessionId ? normalizeSessionId(requestedSessionId) : null
          sendJson(res, 200, {
            version: 1,
            settings: store.getSettings(),
            summary: sessionId ? store.getSummary(sessionId) : null,
            summaryRevision: sessionId ? store.getSummaryRevision(sessionId) : 0,
          })
          return
        }
        if (req.method === 'PATCH') {
          if (!String(req.headers?.['content-type'] || '').toLowerCase().startsWith('application/json')) throw stateError('Content-Type must be application/json', 415)
          const input = await readJson(req, STATE_BODY_LIMIT)
          const baseRevision = normalizeBaseRevision(input.baseRevision)
          if (input.kind === 'settings') {
            const settings = await store.patchSettings(baseRevision, flattenSettingsPatch(input.patch))
            sendJson(res, 200, { settings })
            return
          }
          if (input.kind === 'summary') {
            const sessionId = normalizeSessionId(input.sessionId)
            const summary = await store.patchSummary(sessionId, baseRevision, normalizeStoredSummary(input.value))
            sendJson(res, 200, { summary })
            return
          }
          throw stateError('kind 无效')
        }
        if (req.method === 'DELETE') {
          const sessionId = normalizeSessionId(url.searchParams.get('sessionId'))
          const rawRevision = url.searchParams.get('baseRevision')
          if (rawRevision === null) throw stateError('baseRevision 缺失')
          if (!/^(0|[1-9]\d*)$/.test(rawRevision)) throw stateError('baseRevision 无效')
          const baseRevision = normalizeBaseRevision(Number(rawRevision))
          await store.deleteSummary(sessionId, baseRevision)
          res.writeHead(204, { 'cache-control': 'no-store' })
          res.end()
          return
        }
        res.setHeader('allow', 'GET, PATCH, DELETE')
        sendJson(res, 405, { error: 'Method Not Allowed' })
      } catch (error) {
        if (res.headersSent || res.destroyed) return
        if (error?.status === 409) {
          sendJson(res, 409, { error: 'revision_conflict', current: error.current || null })
          return
        }
        sendJson(res, error?.status || 500, { error: error?.message || '状态同步失败' })
      }
    },
  }), 'dsh-better-ux: state endpoint')
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
