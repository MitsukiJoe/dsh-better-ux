window.__ModuleLoader__.load({
  id: "dsh-better-ux",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    var React = require("react")
    var ReactDOM = require("react-dom")
    var Icons = require("@deepseek-ai/dsh-client-ui-primitives")
    if (typeof ReactDOM.createPortal !== "function") ReactDOM = ReactDOM.default || ReactDOM
    var h = React.createElement

    const STORAGE_KEY = "dsh-better-ux:v1"
    const CHANGE = "dsh-better-ux-change"
    const DEFAULTS = {
      sessionRow: { enabled: true, open: true, rename: true, fork: true, archive: true, tooltip: true },
      modelPicker: { enabled: true, open: true, search: true, providers: true, efforts: true, closeOnPick: false },
      mobileLayout: { enabled: true, open: true, longPressDrag: true, overflowHint: true, sidebarCompat: true, noPinchZoom: true, noAutoFocus: true, headerExpanded: true },
      fontScale: { enabled: true, open: true, mobile: 80, desktop: 100 },
      conversationSummary: { enabled: false, open: true, overall: true, recent: true, mode: "top", hover: true, click: true, contentShortcut: "Tab", overallPrompt: "", recentPrompt: "", provider: "", model: "", modelLabel: "", reasoningEffort: "", reasoningManual: false, modelCollapsed: false, contentCollapsed: false, overallCollapsed: false, recentCollapsed: false },
    }

    const NS = "better-ux"
    const LOCALE_CHANGE = "dsh-better-ux-locale"
    const DICT = {
      zh: {
        "section.label": "交互体验",
        "lead": "按分类调整网页交互；关闭分类总开关后恢复对应的原版界面。",
        "cat.sessionRow": "会话行快捷操作",
        "sessionRow.rename": "重命名",
        "sessionRow.fork": "分叉会话",
        "sessionRow.archive": "归档会话",
        "sessionRow.tooltip": "悬停显示功能名",
        "cat.modelPicker": "模型选择器",
        "pickerOpt.search": "搜索框",
        "pickerOpt.providers": "供应商筛选",
        "pickerOpt.efforts": "底部思考档位",
        "pickerOpt.closeOnPick": "点选后关闭",
        "cat.mobile": "移动端优化",
        "mobile.longPressDrag": "长按调序胶囊",
        "mobile.overflowHint": "横向溢出渐变提示",
        "mobile.sidebarCompat": "兼容右侧侧边栏按钮",
        "mobile.noPinchZoom": "禁止双指缩放页面",
        "mobile.noAutoFocus": "切换会话不自动聚焦输入框",
        "cat.fontScale": "全局字体缩放",
        "fontScale.mobile": "移动端（手机 / 平板）",
        "fontScale.desktop": "桌面 / 其他",
        "cat.summary": "对话情况总结",
        "summary.overall": "整个对话总结",
        "summary.recent": "最近任务",
        "summary.mode": "展示方式",
        "summary.mode.top": "大卡片",
        "summary.mode.left": "小卡片",
        "summary.mode.ball": "折叠",
        "summary.hover": "小球悬停展开",
        "summary.click": "小球点击展开",
        "summary.contentShortcut": "折叠摘要正文快捷键",
        "summary.shortcutRecord": "点击后按下快捷键",
        "summary.shortcutUnset": "未设置",
        "summary.shortcutClear": "清除快捷键",
        "summary.model": "摘要模型",
        "summary.selectModel": "请选择摘要模型",
        "summary.reasoning": "推理强度",
        "summary.noReasoning": "该模型没有可选推理档位",
        "summary.overallPrompt": "整个对话要求（可选）",
        "summary.recentPrompt": "最近任务要求（可选）",
        "summary.usage": "输入 {input} · 输出 {output}",
        "summary.title": "对话情况",
        "summary.overallTitle": "整个对话",
        "summary.recentTitle": "最近任务",
        "summary.refresh": "重新生成摘要",
        "summary.close": "收起摘要",
        "summary.collapseModel": "折叠模型选择",
        "summary.expandModel": "展开模型选择",
        "summary.collapseBody": "折叠摘要正文",
        "summary.expandBody": "展开摘要正文",
        "summary.collapseSection": "折叠{section}",
        "summary.expandSection": "展开{section}",
        "summary.ball": "展开对话情况",
        "summary.lock": "锁定展开对话情况",
        "summary.unlock": "解锁并收起对话情况",
        "summary.loading": "正在归纳…",
        "summary.progress": "正在归纳 · {model} · {seconds}秒",
        "summary.hostRestart": "摘要 Host 未加载最新版本，请重启 DSH Web",
        "summary.waiting": "发送首条消息后生成",
        "summary.empty": "暂无摘要",
        "summary.failed": "摘要生成失败",
        "toggle.aria": "{title}总开关",
        "fold.collapse": "收起{title}",
        "fold.expand": "展开{title}",
        "scale.decrease": "{label}减少 5%",
        "scale.increase": "{label}增加 5%",
        "scale.ratio": "{label}缩放比例",
        "tip.rename": "重命名",
        "tip.fork": "分叉会话",
        "tip.archive": "归档会话",
        "action.newSession": "新建会话",
        "action.addWorkspace": "添加工作区",
        "action.search": "搜索会话",
        "action.viewOptions": "视图选项",
        "action.settings": "设置",
        "shell.aria": "移动端会话栏",
        "header.collapse": "收起会话头部",
        "header.expand": "展开会话头部",
        "image.attach": "添加图片",
        "search.placeholder": "搜索会话…",
        "search.close": "关闭搜索",
        "empty.sessions": "当前工作区暂无会话",
        "fallback.session": "未命名会话",
        "fallback.workspace": "未命名工作区",
        "fallback.allSessions": "全部会话",
        "sort.aria": "调整排序",
        "view.groupBy": "分组方式",
        "view.orderBy": "排序方式",
        "sort.prev": "前移一位",
        "sort.next": "后移一位",
        "item.more.aria": "“{name}”的操作",
        "status.approval": "等待审批",
        "status.planReview": "计划待审",
        "status.question": "等待回答",
        "status.pending": "等待操作",
        "status.running": "进行中",
        "status.completedUnread": "已完成未读",
        "picker.title": "选择模型",
        "picker.searchPlaceholder": "搜索模型或供应商",
        "picker.all": "全部",
        "picker.vision": "自动识图",
        "picker.loading": "正在加载模型…",
        "picker.noMatch": "没有匹配的模型",
        "picker.noEffort": "当前模型没有思考档位",
        "picker.effortLabel": "思考程度",
        "picker.close": "关闭",
      },
      en: {
        "section.label": "Better UX",
        "lead": "Adjust the web interface by category; turning a category off restores the original UI.",
        "cat.sessionRow": "Session row actions",
        "sessionRow.rename": "Rename",
        "sessionRow.fork": "Fork session",
        "sessionRow.archive": "Archive session",
        "sessionRow.tooltip": "Show name on hover",
        "cat.modelPicker": "Model picker",
        "pickerOpt.search": "Search box",
        "pickerOpt.providers": "Provider filter",
        "pickerOpt.efforts": "Reasoning levels",
        "pickerOpt.closeOnPick": "Close on pick",
        "cat.mobile": "Mobile optimization",
        "mobile.longPressDrag": "Long-press reorder capsule",
        "mobile.overflowHint": "Horizontal overflow hints",
        "mobile.sidebarCompat": "Right-sidebar compatibility",
        "mobile.noPinchZoom": "Disable page pinch-zoom",
        "mobile.noAutoFocus": "No auto-focus on session switch",
        "cat.fontScale": "Global font scale",
        "fontScale.mobile": "Mobile (phone / tablet)",
        "fontScale.desktop": "Desktop / other",
        "cat.summary": "Conversation summary",
        "summary.overall": "Whole conversation",
        "summary.recent": "Recent task",
        "summary.mode": "Display mode",
        "summary.mode.top": "Large card",
        "summary.mode.left": "Small card",
        "summary.mode.ball": "Collapsed",
        "summary.hover": "Expand ball on hover",
        "summary.click": "Expand ball on click",
        "summary.contentShortcut": "Collapse summary content shortcut",
        "summary.shortcutRecord": "Press a shortcut",
        "summary.shortcutUnset": "Not set",
        "summary.shortcutClear": "Clear shortcut",
        "summary.model": "Summary model",
        "summary.selectModel": "Select a summary model",
        "summary.reasoning": "Reasoning effort",
        "summary.noReasoning": "This model has no selectable reasoning effort",
        "summary.overallPrompt": "Whole conversation instructions (optional)",
        "summary.recentPrompt": "Recent task instructions (optional)",
        "summary.usage": "Input {input} · Output {output}",
        "summary.title": "Conversation status",
        "summary.overallTitle": "Whole conversation",
        "summary.recentTitle": "Recent task",
        "summary.refresh": "Regenerate summaries",
        "summary.close": "Collapse summary",
        "summary.collapseModel": "Collapse model controls",
        "summary.expandModel": "Expand model controls",
        "summary.collapseBody": "Collapse summary content",
        "summary.expandBody": "Expand summary content",
        "summary.collapseSection": "Collapse {section}",
        "summary.expandSection": "Expand {section}",
        "summary.ball": "Open conversation status",
        "summary.lock": "Lock conversation status open",
        "summary.unlock": "Unlock and collapse conversation status",
        "summary.loading": "Summarizing…",
        "summary.progress": "Summarizing · {model} · {seconds}s",
        "summary.hostRestart": "The summary Host is outdated; restart DSH Web",
        "summary.waiting": "Available after the first message",
        "summary.empty": "No summary yet",
        "summary.failed": "Summary failed",
        "toggle.aria": "{title} master switch",
        "fold.collapse": "Collapse {title}",
        "fold.expand": "Expand {title}",
        "scale.decrease": "Decrease {label} by 5%",
        "scale.increase": "Increase {label} by 5%",
        "scale.ratio": "{label} scale",
        "tip.rename": "Rename",
        "tip.fork": "Fork session",
        "tip.archive": "Archive session",
        "action.newSession": "New session",
        "action.addWorkspace": "Add workspace",
        "action.search": "Search sessions",
        "action.viewOptions": "View options",
        "action.settings": "Settings",
        "shell.aria": "Mobile session bar",
        "header.collapse": "Collapse conversation header",
        "header.expand": "Expand conversation header",
        "image.attach": "Attach images",
        "search.placeholder": "Search sessions...",
        "search.close": "Close search",
        "empty.sessions": "No sessions in this workspace",
        "fallback.session": "Untitled session",
        "fallback.workspace": "Untitled workspace",
        "fallback.allSessions": "All sessions",
        "sort.aria": "Reorder",
        "view.groupBy": "Group by",
        "view.orderBy": "Order by",
        "sort.prev": "Move earlier",
        "sort.next": "Move later",
        "item.more.aria": "Actions for {name}",
        "status.approval": "Waiting for approval",
        "status.planReview": "Plan awaiting review",
        "status.question": "Waiting for answer",
        "status.pending": "Awaiting action",
        "status.running": "Running",
        "status.completedUnread": "Completed · unread",
        "picker.title": "Select model",
        "picker.searchPlaceholder": "Search models or providers",
        "picker.all": "All",
        "picker.vision": "Auto Vision",
        "picker.loading": "Loading models…",
        "picker.noMatch": "No matching models",
        "picker.noEffort": "No reasoning levels for this model",
        "picker.effortLabel": "Reasoning effort",
        "picker.close": "Close",
      },
    }
    const LOCALE = { t: null, lang: "zh" }
    const tt = (key, params) => {
      if (LOCALE.t) return LOCALE.t(key, params)
      let template = DICT.zh[key] ?? DICT.en[key] ?? key
      if (params) template = template.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match)
      return template
    }

    function loadSettings() {
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
        const fontScale = { ...DEFAULTS.fontScale, ...(raw.fontScale || {}) }
        if (raw.fontScale && raw.fontScale.mobile === undefined) fontScale.mobile = raw.fontScale.phone ?? raw.fontScale.tablet ?? DEFAULTS.fontScale.mobile
        const mobileLayout = { ...DEFAULTS.mobileLayout, ...(raw.mobileLayout || {}), headerExpanded: raw.mobileLayout?.headerExpanded !== false }
        return {
          sessionRow: { ...DEFAULTS.sessionRow, ...(raw.sessionRow || {}) },
          modelPicker: { ...DEFAULTS.modelPicker, ...(raw.modelPicker || {}) },
          mobileLayout,
          fontScale,
          conversationSummary: {
            ...DEFAULTS.conversationSummary,
            ...(raw.conversationSummary || {}),
            overallPrompt: typeof raw.conversationSummary?.overallPrompt === "string" ? Array.from(raw.conversationSummary.overallPrompt).slice(0, 2000).join("") : typeof raw.conversationSummary?.prompt === "string" ? Array.from(raw.conversationSummary.prompt).slice(0, 2000).join("") : "",
            recentPrompt: typeof raw.conversationSummary?.recentPrompt === "string" ? Array.from(raw.conversationSummary.recentPrompt).slice(0, 2000).join("") : typeof raw.conversationSummary?.prompt === "string" ? Array.from(raw.conversationSummary.prompt).slice(0, 2000).join("") : "",
            provider: typeof raw.conversationSummary?.provider === "string" ? raw.conversationSummary.provider : "",
            model: typeof raw.conversationSummary?.model === "string" ? raw.conversationSummary.model : "",
            modelLabel: typeof raw.conversationSummary?.modelLabel === "string" ? raw.conversationSummary.modelLabel : "",
            reasoningEffort: typeof raw.conversationSummary?.reasoningEffort === "string" ? raw.conversationSummary.reasoningEffort : "",
            reasoningManual: raw.conversationSummary?.reasoningManual === true,
            contentShortcut: typeof raw.conversationSummary?.contentShortcut === "string" ? Array.from(raw.conversationSummary.contentShortcut).slice(0, 80).join("") : DEFAULTS.conversationSummary.contentShortcut,
            modelCollapsed: raw.conversationSummary?.modelCollapsed === true,
            contentCollapsed: raw.conversationSummary?.contentCollapsed === true,
            overallCollapsed: raw.conversationSummary?.overallCollapsed === true,
            recentCollapsed: raw.conversationSummary?.recentCollapsed === true,
          },
        }
      } catch {
        return {
          sessionRow: { ...DEFAULTS.sessionRow },
          modelPicker: { ...DEFAULTS.modelPicker },
          mobileLayout: { ...DEFAULTS.mobileLayout },
          fontScale: { ...DEFAULTS.fontScale },
          conversationSummary: { ...DEFAULTS.conversationSummary },
        }
      }
    }

    const STATE_ROUTE = "/api/dsh-better-ux/state-v1"
    const SETTINGS_PENDING_PREFIX = "dsh-better-ux:settings-pending:v1:"
    const SETTINGS_REJECTED_PREFIX = "dsh-better-ux:settings-rejected:v1:"
    const WORKSPACE_VIEW_KEY = "dsh.workspace.view.v5"
    const SYNCED_SETTINGS_KEYS = [
      ...Object.entries(DEFAULTS).flatMap(([category, values]) => Object.keys(values).map((key) => category + "." + key)),
      "workspaceView.groupBy",
      "workspaceView.orderBy",
    ]

    let hostSettingsRevision = 0
    let lastSyncedSettings = null
    let settingsSyncPromise = Promise.resolve()
    let settingsMutationVersion = 0
    let settingsRetryPatch = {}
    let settingsRetryTimer = 0
    let settingsRetryDelay = 1000
    let settingsReplayTimer = 0
    let settingsSyncGeneration = 0
    let workspaceMutationVersion = 0

    function normalizedSettingValue(fallback, value) {
      if (typeof fallback === "boolean") return typeof value === "boolean" ? value : fallback
      if (typeof fallback === "number") return Number.isFinite(value) ? value : fallback
      return typeof value === "string" ? value : fallback
    }

    function loadWorkspaceView() {
      try {
        const value = JSON.parse(localStorage.getItem(WORKSPACE_VIEW_KEY) || "{}")
        return {
          groupBy: value.groupBy === "flat" ? "flat" : "workspace",
          orderBy: value.orderBy === "manual" ? "manual" : "updated",
        }
      } catch {
        return { groupBy: "workspace", orderBy: "updated" }
      }
    }

    function applySyncedWorkspaceView(value) {
      const current = loadWorkspaceView()
      const groupBy = readLeaf(value, "workspaceView.groupBy")
      const orderBy = readLeaf(value, "workspaceView.orderBy")
      if ((groupBy === undefined || groupBy === current.groupBy) && (orderBy === undefined || orderBy === current.orderBy)) return
      try {
        const raw = JSON.parse(localStorage.getItem(WORKSPACE_VIEW_KEY) || "{}")
        if (groupBy !== undefined) raw.groupBy = groupBy
        if (orderBy !== undefined) raw.orderBy = orderBy
        const serialized = JSON.stringify(raw)
        localStorage.setItem(WORKSPACE_VIEW_KEY, serialized)
        window.dispatchEvent(new StorageEvent("storage", { key: WORKSPACE_VIEW_KEY, newValue: serialized }))
      } catch {}
    }

    function getSyncedSettings(settings) {
      const result = {}
      for (const [category, defaults] of Object.entries(DEFAULTS)) {
        for (const [key, fallback] of Object.entries(defaults)) {
          result[category + "." + key] = normalizedSettingValue(fallback, settings?.[category]?.[key])
        }
      }
      const workspaceView = loadWorkspaceView()
      result["workspaceView.groupBy"] = workspaceView.groupBy
      result["workspaceView.orderBy"] = workspaceView.orderBy
      return result
    }

    const settingsPendingStorageKey = (key) => SETTINGS_PENDING_PREFIX + encodeURIComponent(key)
    const settingsRejectedStorageKey = (key) => SETTINGS_REJECTED_PREFIX + encodeURIComponent(key)

    function loadSettingsPendingPatch() {
      const pending = {}
      const current = getSyncedSettings(loadSettings())
      try {
        for (let index = 0; index < localStorage.length; index += 1) {
          const storageKey = localStorage.key(index)
          if (!storageKey?.startsWith(SETTINGS_PENDING_PREFIX)) continue
          let key
          try { key = decodeURIComponent(storageKey.slice(SETTINGS_PENDING_PREFIX.length)) } catch { continue }
          if (!SYNCED_SETTINGS_KEYS.includes(key)) continue
          const value = JSON.parse(localStorage.getItem(storageKey))
          if (current[key] === value) pending[key] = value
          else localStorage.removeItem(storageKey)
        }
      } catch {}
      return pending
    }

    function recordSettingsPending(patch) {
      try {
        for (const [key, value] of Object.entries(patch)) {
          localStorage.removeItem(settingsRejectedStorageKey(key))
          localStorage.setItem(settingsPendingStorageKey(key), JSON.stringify(value))
        }
      } catch {}
      settingsRetryPatch = loadSettingsPendingPatch()
    }

    function clearSettingsPending(patch) {
      try {
        for (const [key, value] of Object.entries(patch)) {
          const storageKey = settingsPendingStorageKey(key)
          if (JSON.parse(localStorage.getItem(storageKey)) === value) localStorage.removeItem(storageKey)
          const rejectedKey = settingsRejectedStorageKey(key)
          if (JSON.parse(localStorage.getItem(rejectedKey))?.value === value) localStorage.removeItem(rejectedKey)
        }
      } catch {}
      settingsRetryPatch = loadSettingsPendingPatch()
    }

    function rejectSettingsPending(patch, status) {
      try {
        for (const [key, value] of Object.entries(patch)) {
          const storageKey = settingsPendingStorageKey(key)
          if (JSON.parse(localStorage.getItem(storageKey)) !== value) continue
          localStorage.removeItem(storageKey)
          localStorage.setItem(settingsRejectedStorageKey(key), JSON.stringify({ value, status, updatedAt: Date.now() }))
        }
      } catch {}
      settingsRetryPatch = loadSettingsPendingPatch()
    }

    const retryableStatus = (status) => status === 408 || status === 429 || status >= 500

    function readLeaf(obj, path) {
      if (!obj || typeof obj !== "object") return undefined
      if (path in obj) return obj[path]
      const parts = path.split(".")
      let cur = obj
      for (const p of parts) {
        if (cur == null || typeof cur !== "object") return undefined
        cur = cur[p]
      }
      return cur
    }

    function scheduleSettingsPatchRetry(patch, generation) {
      if (generation !== settingsSyncGeneration) return
      recordSettingsPending(patch)
      if (settingsRetryTimer) return
      settingsRetryTimer = window.setTimeout(() => {
        settingsRetryTimer = 0
        if (generation !== settingsSyncGeneration) return
        const current = getSyncedSettings(loadSettings())
        const retry = {}
        const stale = {}
        for (const [key, value] of Object.entries(settingsRetryPatch)) {
          if (current[key] === value) retry[key] = value
          else stale[key] = value
        }
        if (Object.keys(stale).length) clearSettingsPending(stale)
        if (Object.keys(retry).length) pushSettingsPatch(retry)
        else settingsRetryDelay = 1000
      }, settingsRetryDelay)
      settingsRetryDelay = Math.min(30000, settingsRetryDelay * 2)
    }

    function pushSettingsPatch(patch, explicitBaseRev) {
      const generation = settingsSyncGeneration
      recordSettingsPending(patch)
      settingsMutationVersion += 1
      settingsSyncPromise = settingsSyncPromise.then(async () => {
        const send = async () => {
          try {
          let baseRevision = explicitBaseRev !== undefined ? explicitBaseRev : hostSettingsRevision
          while (true) {
            const res = await fetch(STATE_ROUTE, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ kind: "settings", baseRevision, patch }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
              const record = data.settings || data
              hostSettingsRevision = Number.isSafeInteger(record?.revision) ? record.revision : baseRevision + 1
              settingsRetryDelay = 1000
              clearSettingsPending(patch)
              return
            }
            if (res.status !== 409) {
              if (retryableStatus(res.status)) scheduleSettingsPatchRetry(patch, generation)
              else rejectSettingsPending(patch, res.status)
              return
            }
            const currentRecord = data.current || data.settings || data
            if (!Number.isSafeInteger(currentRecord?.revision)) {
              rejectSettingsPending(patch, res.status)
              return
            }
            baseRevision = currentRecord.revision
            hostSettingsRevision = baseRevision
          }
          } catch {
            scheduleSettingsPatchRetry(patch, generation)
          }
        }
        if (navigator.locks?.request) return navigator.locks.request("dsh-better-ux:settings-sync", send)
        return send()
      })
    }

    async function fetchHostSettings() {
      const generation = settingsSyncGeneration
      try {
        await settingsSyncPromise
        if (generation !== settingsSyncGeneration || settingsRetryTimer || Object.keys(settingsRetryPatch).length) return
        const fetchVersion = settingsMutationVersion
        const fetchWorkspaceVersion = workspaceMutationVersion
        const res = await fetch(STATE_ROUTE)
        if (!res.ok) return
        const data = await res.json().catch(() => ({}))
        if (generation !== settingsSyncGeneration || settingsMutationVersion !== fetchVersion || workspaceMutationVersion !== fetchWorkspaceVersion || settingsRetryTimer || Object.keys(settingsRetryPatch).length) return
        const serverSettings = data.settings
        if (serverSettings && typeof serverSettings === "object" && serverSettings.value) {
          hostSettingsRevision = Number.isSafeInteger(serverSettings.revision) ? serverSettings.revision : 0
          const current = loadSettings()
          const before = getSyncedSettings(current)
          const val = serverSettings.value
          let settingsChanged = false
          for (const [category, defaults] of Object.entries(DEFAULTS)) {
            for (const key of Object.keys(defaults)) {
              const path = category + "." + key
              const remote = readLeaf(val, path)
              if (remote !== undefined && before[path] !== remote) {
                current[category][key] = remote
                settingsChanged = true
              }
            }
          }
          applySyncedWorkspaceView(val)
          if (settingsChanged) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
            window.dispatchEvent(new Event(CHANGE))
          }
          const currentSynced = getSyncedSettings(current)
          const missingPatch = {}
          for (const key of SYNCED_SETTINGS_KEYS) {
            if (readLeaf(val, key) === undefined) missingPatch[key] = currentSynced[key]
          }
          lastSyncedSettings = currentSynced
          window.clearTimeout(settingsReplayTimer)
          settingsReplayTimer = window.setTimeout(() => {
            settingsReplayTimer = 0
            if (generation === settingsSyncGeneration && workspaceMutationVersion === fetchWorkspaceVersion) applySyncedWorkspaceView(val)
          }, 500)
          if (Object.keys(missingPatch).length) pushSettingsPatch(missingPatch)
        } else {
          const current = loadSettings()
          const initialPatch = getSyncedSettings(current)
          lastSyncedSettings = initialPatch
          hostSettingsRevision = 0
          pushSettingsPatch(initialPatch, 0)
        }
      } catch {}
    }

    function syncCurrentSettings(settings = loadSettings()) {
      const currentSynced = getSyncedSettings(settings)
      if (!lastSyncedSettings) {
        lastSyncedSettings = currentSynced
        return
      }
      const patch = {}
      for (const key of SYNCED_SETTINGS_KEYS) {
        if (lastSyncedSettings[key] !== currentSynced[key]) patch[key] = currentSynced[key]
      }
      if (Object.keys(patch).length) {
        lastSyncedSettings = currentSynced
        pushSettingsPatch(patch)
      }
    }

    function saveSettings(next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event(CHANGE))
      syncCurrentSettings(next)
    }

    function shortcutFromEvent(event) {
      if (["Control", "Shift", "Alt", "Meta"].includes(event.key)) return ""
      let key = event.key === " " ? "Space" : event.key
      if (!key || key === "Dead" || key === "Unidentified") return ""
      if (key.length === 1) key = key.toUpperCase()
      return [event.ctrlKey && "Ctrl", event.altKey && "Alt", event.shiftKey && "Shift", event.metaKey && "Meta", key].filter(Boolean).join("+")
    }

    function shortcutTargetIsEditable(target) {
      return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"]'))
    }

    const HOST_ARIA = {
      command: ["命令", "Command", "Commands"],
      newSession: ["新建会话", "New session"],
      expandSidebar: ["打开侧边栏", "Open sidebar", "展开侧边栏", "Expand sidebar"],
      collapseSidebar: ["收起侧边栏", "Collapse sidebar", "关闭侧边栏", "Close sidebar", "折叠侧边栏", "Fold sidebar"],
    }
    const slotNode = (name) => document.querySelector(`[data-slot="${name}"]`)
    const sidebarColumnNode = () => slotNode("sidebar")?.parentElement || null
    const sidebarBrowserNode = () => slotNode("sidebar.workspaces") || null
    const sidebarTreeNode = () => sidebarBrowserNode()?.querySelector('[role="tree"]') || null
    const isSessionRow = (node) => node instanceof Element && node.matches('[role="treeitem"][aria-selected]')
    const sessionRowsIn = (root) => root?.querySelectorAll ? [...root.querySelectorAll('[role="treeitem"][aria-selected]')] : []
    const workspaceRowsIn = (root) => root?.querySelectorAll ? [...root.querySelectorAll('[role="treeitem"][aria-expanded]')].filter((row) => !row.hasAttribute("aria-selected")) : []
    const directChildWithin = (node, root) => {
      let current = node
      while (current?.parentElement && current.parentElement !== root) current = current.parentElement
      return current?.parentElement === root ? current : null
    }
    const buttonByLabel = (root, labels) => [...(root || document).querySelectorAll("button")].find((button) => {
      const label = button.getAttribute("aria-label")?.trim()
      const text = button.textContent?.trim()
      return labels.includes(label) || labels.includes(text)
    }) || null
    const nativeSessionButton = (row) => [...row.querySelectorAll('button[aria-label]')].find((button) => {
      if (button.classList.contains("dsh-inline-act")) return false
      return button.closest('[role="treeitem"]') === row
    }) || null
    const composerBarNode = () => slotNode("conversation.composer.bar")
    const conversationHeaderNode = () => slotNode("conversation.session.header")?.querySelector("header") || null
    const composerTextareaNode = () => {
      const textareas = composerBarNode()?.querySelectorAll("textarea")
      return textareas?.[textareas.length - 1] || null
    }
    const composerCommandButton = () => composerBarNode()?.querySelector('button[aria-haspopup="listbox"]') || buttonByLabel(composerBarNode(), HOST_ARIA.command)

    function markHostSemantics() {
      const sidebar = sidebarColumnNode()
      const frame = sidebar?.parentElement || null
      const center = slotNode("conversation")?.parentElement || null
      const details = slotNode("details")?.parentElement || null
      if (sidebar) sidebar.dataset.dshBuxSidebarCol = "1"
      if (center) center.dataset.dshBuxCenterCol = "1"
      if (details) details.dataset.dshBuxDetailsCol = "1"
      const header = conversationHeaderNode()
      for (const marked of document.querySelectorAll("[data-dsh-bux-session-header]")) {
        if (marked !== header) delete marked.dataset.dshBuxSessionHeader
      }
      if (header) header.dataset.dshBuxSessionHeader = "1"
      const modelSeat = slotNode("conversation.input.model")
      if (modelSeat) {
        modelSeat.dataset.dshBuxModelSeat = "1"
        if (modelSeat.parentElement) modelSeat.parentElement.dataset.dshBuxComposerTrailing = "1"
      }
      const accessButton = [...(composerBarNode()?.querySelectorAll('button[aria-label]') || [])].find((button) => /^(访问模式|Access mode)/i.test(button.getAttribute("aria-label") || ""))
      if (accessButton?.parentElement) accessButton.parentElement.dataset.dshBuxAccessRoot = "1"
      for (const marked of document.querySelectorAll("[data-dsh-bux-details-toggle], [data-dsh-bux-details-panel]")) {
        delete marked.dataset.dshBuxDetailsToggle
        delete marked.dataset.dshBuxDetailsPanel
      }
      const sidePanelHost = document.querySelector("[data-dsh-panel-host]")
      const sidePanelToggle = buttonByLabel(sidePanelHost, [...HOST_ARIA.expandSidebar, ...HOST_ARIA.collapseSidebar])
      if (sidePanelHost) sidePanelHost.dataset.dshBuxDetailsPanel = "1"
      if (sidePanelToggle?.parentElement) sidePanelToggle.parentElement.dataset.dshBuxDetailsToggle = "1"
      const section = slotNode("settings.section")
      const panel = section?.closest('[role="dialog"]')
      for (const marked of document.querySelectorAll("[data-dsh-bux-settings-layer]")) {
        if (marked !== panel?.parentElement) delete marked.dataset.dshBuxSettingsLayer
      }
      if (panel) {
        panel.dataset.dshBuxSettingsPanel = "1"
        if (panel.parentElement) panel.parentElement.dataset.dshBuxSettingsLayer = "1"
        const nav = panel.firstElementChild
        if (nav) nav.dataset.dshBuxSettingsNav = "1"
        const navTitle = slotNode("settings.header")?.parentElement
        if (navTitle) navTitle.dataset.dshBuxSettingsNavTitle = "1"
        const cells = nav ? [...nav.querySelectorAll("button")] : []
        const navList = cells[0]?.parentElement
        if (navList) navList.dataset.dshBuxSettingsNavList = "1"
        for (const cell of cells) cell.dataset.dshBuxSettingsCell = "1"
        const options = section.parentElement
        const content = options?.parentElement
        if (content) content.dataset.dshBuxSettingsContent = "1"
        if (options) options.dataset.dshBuxSettingsOptions = "1"
        const headerRow = content?.firstElementChild
        if (headerRow) headerRow.dataset.dshBuxSettingsHeader = "1"
        const close = slotNode("settings.close")?.closest("button")
        if (close) close.dataset.dshBuxSettingsClose = "1"
      }
      return { frame, sidebar, center, details }
    }

    const SESSION_CSS = `
@media (min-width:1024px){[data-dsh-bux-session-row].dsh-inline-menu-redundant [data-dsh-bux-native-menu]{display:none!important}}
.dsh-inline-acts{display:inline-flex;align-items:center;gap:8px}
.dsh-inline-act{position:relative;width:16px;height:16px;padding:0;border:none;border-radius:4px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex:none}
.dsh-inline-act:hover{color:var(--dsw-alias-label-primary)}
.dsh-inline-act svg{width:16px;height:16px;display:block}
.dsh-inline-act[data-tip-on="1"]:hover::after{content:attr(data-tip);position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);z-index:2000;padding:4px 8px;border-radius:6px;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);color:var(--dsw-alias-label-primary);font-size:12px;line-height:16px;white-space:nowrap;pointer-events:none;box-shadow:var(--dsw-shadow-lv3)}
`
    const VISION_ICON = encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="black" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
    )
    const VISION_MASK = `background:currentColor;-webkit-mask:url("data:image/svg+xml,${VISION_ICON}") center/contain no-repeat;mask:url("data:image/svg+xml,${VISION_ICON}") center/contain no-repeat`
    const PICKER_CSS = `
.mpo-root{position:fixed;inset:0;z-index:4000;display:flex;align-items:center;justify-content:center;padding:24px}
.mpo-dim{position:absolute;inset:0;background:rgba(0,0,0,.46)}
.mpo-panel{position:relative;z-index:1;width:min(880px,calc(100vw - 48px));max-height:min(720px,calc(100vh - 48px));display:flex;flex-direction:column;border-radius:16px;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3);overflow:hidden}
.mpo-head{display:flex;align-items:center;gap:12px;padding:16px 18px 12px}
.mpo-title{margin:0;color:var(--dsw-alias-label-primary);font-size:16px;font-weight:600;line-height:22px}
.mpo-search{flex:1;min-width:0;height:34px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:10px;padding:0 12px;font-size:13px}
.mpo-search:focus{outline:none;border-color:var(--dsw-alias-label-tertiary)}
.mpo-close{width:28px;height:28px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:18px;line-height:28px}
.mpo-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.mpo-providers-wrap{position:relative;min-width:0}
.mpo-providers-wrap:before,.mpo-providers-wrap:after{content:"";position:absolute;top:0;bottom:12px;width:8px;z-index:2;pointer-events:none;opacity:0;transition:opacity .16s var(--ds-ease-in-out)}
.mpo-providers-wrap:before{left:0;background:linear-gradient(90deg,var(--dsw-specific-menu),transparent)}
.mpo-providers-wrap:after{right:0;background:linear-gradient(270deg,var(--dsw-specific-menu),transparent)}
.mpo-providers-wrap[data-overflow-left="1"]:before,.mpo-providers-wrap[data-overflow-right="1"]:after{opacity:1}
.mpo-providers{display:flex;flex-wrap:nowrap;gap:8px;padding:0 18px 12px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
.mpo-providers::-webkit-scrollbar{display:none}
.mpo-chip{height:28px;flex:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:999px;padding:0 12px;font-size:12px;cursor:pointer}
.mpo-chip[data-on="1"]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);border-color:transparent}
.mpo-grid{flex:1;min-height:0;overflow:auto;padding:4px 18px 12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
.mpo-card{text-align:left;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:inherit;border-radius:12px;padding:0;cursor:pointer;min-height:74px;display:flex;flex-direction:row;align-items:stretch;overflow:hidden}
.mpo-card:hover{background:var(--dsw-alias-interactive-bg-hover)}
.mpo-card[data-on="1"]{border-color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-interactive-bg-hover)}
.mpo-card-main{flex:1;min-width:0;padding:12px 14px;display:flex;flex-direction:column;gap:4px}
.mpo-card-name{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:600;line-height:18px}
.mpo-card-meta{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:16px}
.mpo-card-vision{position:relative;flex:none;width:52px;align-self:stretch;border:none;border-left:1px solid var(--dsw-alias-border-l2);border-radius:0;background:transparent;cursor:pointer}
.mpo-card-vision::after{content:"";position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;${VISION_MASK};opacity:.55}
.mpo-card:hover:has(.mpo-card-vision:hover){background:var(--dsw-alias-bg-layer-1)}
.mpo-card[data-on="1"]:hover:has(.mpo-card-vision:hover){border-color:var(--dsw-alias-border-l2)}
.mpo-card-vision:hover,.mpo-card-vision[data-on="1"]{background:var(--dsw-alias-interactive-bg-hover)}
.mpo-card-vision:hover::after,.mpo-card-vision[data-on="1"]::after{opacity:1}
.mpo-empty{grid-column:1/-1;color:var(--dsw-alias-label-tertiary);padding:24px 8px;font-size:13px}
.mpo-foot{border-top:1px solid var(--dsw-alias-border-l1);padding:12px 18px 16px}
.mpo-foot-label{color:var(--dsw-alias-label-secondary);font-size:12px;margin-bottom:8px}
.mpo-efforts{display:flex;flex-wrap:wrap;gap:8px}
.mpo-effort{height:30px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:8px;padding:0 12px;font-size:12px;cursor:pointer}
.mpo-effort[data-on="1"]{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base);border-color:transparent}
.mpo-effort:disabled{opacity:.4;cursor:default}
.dsh-bux-model-root{min-width:0;position:relative;display:flex}
.dsh-bux-model-trigger{min-width:0;max-width:220px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:transparent;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}
.dsh-bux-model-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dsh-bux-model-trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}
.dsh-bux-model-trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}
.dsh-bux-model-label{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}
.dsh-bux-model-effort{color:var(--dsw-alias-label-caption);flex:none;max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-bux-model-chevron{color:var(--dsw-alias-label-caption);flex:none;display:block;transition:transform .12s}
.dsh-bux-model-root[data-open="1"] .dsh-bux-model-chevron{transform:rotate(180deg)}
`

    const WAND_ICON = encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>',
    )
    const WAND_MASK = `background:currentColor;-webkit-mask:url("data:image/svg+xml,${WAND_ICON}") center/contain no-repeat;mask:url("data:image/svg+xml,${WAND_ICON}") center/contain no-repeat`
    const SETTINGS_CSS = `
[data-dsh-bux-nav="1"]>:first-child{display:none}
[data-dsh-bux-nav="1"]::before{content:"";width:16px;height:16px;flex:none;${WAND_MASK}}
.bux-page{display:flex;flex-direction:column;max-width:720px;padding:0 2px 24px}
.bux-lead{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;margin:0 0 8px}
.bux-cat{padding:18px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}
.bux-cat:last-child{border-bottom:0}
.bux-cat-head{display:flex;align-items:center;gap:10px;min-height:30px;margin-bottom:12px}
.bux-cat-title{flex:1;min-width:0;margin:0;color:var(--dsw-alias-label-primary);font-size:16px;font-weight:600;line-height:22px}
.bux-fold{box-sizing:border-box;width:28px;height:28px;flex:none;padding:0;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.bux-fold:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.bux-fold svg{width:16px;height:16px;display:block;transition:transform .16s var(--ds-ease-in-out)}
.bux-fold[aria-expanded="false"] svg{transform:rotate(-90deg)}
.bux-switch{appearance:none;box-sizing:border-box;width:38px;height:22px;flex:none;margin:0;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-bg-layer-1);position:relative;cursor:pointer;transition:background .16s var(--ds-ease-in-out),border-color .16s var(--ds-ease-in-out)}
.bux-switch:checked{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary)}
.bux-switch:after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-label-tertiary);transition:left .16s var(--ds-ease-in-out),background .16s var(--ds-ease-in-out)}
.bux-switch:checked:after{left:18px;background:var(--dsw-alias-bg-base)}
.bux-switch:focus-visible,.bux-check:focus-visible{outline:2px solid var(--dsw-alias-label-secondary);outline-offset:2px}
.bux-body{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.bux-option{box-sizing:border-box;min-height:44px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);cursor:pointer;display:flex;align-items:center;gap:10px;transition:background .16s var(--ds-ease-in-out),border-color .16s var(--ds-ease-in-out),color .16s var(--ds-ease-in-out)}
.bux-option:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.bux-option[data-checked="1"]{border-color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.bux-option-label{min-width:0;font-size:13px;line-height:18px}
.bux-check{appearance:none;box-sizing:border-box;width:18px;height:18px;flex:none;margin:0;border:1px solid var(--dsw-alias-border-l2);border-radius:5px;background:var(--dsw-alias-bg-base);position:relative;cursor:pointer}
.bux-check:checked{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary)}
.bux-check:checked:after{content:"";position:absolute;left:4px;top:4px;width:7px;height:4px;border-left:2px solid var(--dsw-alias-bg-base);border-bottom:2px solid var(--dsw-alias-bg-base);transform:rotate(-45deg)}
.bux-scale-row{box-sizing:border-box;min-height:44px;padding:7px 10px 7px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);display:flex;align-items:center;justify-content:space-between;gap:12px}
.bux-scale-label{min-width:0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:18px}
.bux-stepper{display:flex;align-items:center;gap:4px;flex:none}
.bux-stepper button{box-sizing:border-box;width:28px;height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);font-size:18px;line-height:24px;cursor:pointer}
.bux-stepper button:hover{background:var(--dsw-alias-interactive-bg-hover)}
.bux-scale-input{box-sizing:border-box;width:56px;height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);text-align:center;font-size:13px}
.bux-scale-input:focus{outline:none;border-color:var(--dsw-alias-label-tertiary)}
.bux-scale-unit{color:var(--dsw-alias-label-tertiary);font-size:13px;margin-left:-2px}
@media (max-width:640px){.bux-body{grid-template-columns:minmax(0,1fr)}}
`


    const SUMMARY_CSS = `
.dsh-summary-panel{position:fixed;z-index:75;box-sizing:border-box;max-height:min(52vh,520px);overflow:auto;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-specific-menu);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-shadow-lv3);animation:dsh-summary-in .18s var(--ds-ease-in-out);overscroll-behavior:contain}
.dsh-summary-head{position:sticky;top:0;z-index:1;display:flex;align-items:center;gap:8px;min-height:38px;padding:0 10px;background:var(--dsw-specific-menu);border-bottom:1px solid var(--dsw-alias-border-l1)}
.dsh-summary-head-icon{display:flex;color:var(--dsw-alias-label-secondary)}
.dsh-summary-title{flex:none;min-width:0;margin:0 auto 0 0;font-size:13px;font-weight:600;line-height:18px}
.dsh-summary-body-status{padding:9px 0 0;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;white-space:pre-wrap;overflow-wrap:anywhere}
.dsh-summary-icon-btn{box-sizing:border-box;width:28px;height:28px;flex:none;padding:0;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.dsh-summary-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-summary-tooltip{position:fixed;z-index:90;box-sizing:border-box;max-width:220px;padding:5px 7px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-specific-menu);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-shadow-lv2);font-size:11px;line-height:15px;white-space:nowrap;pointer-events:none;transform:translateX(-50%);animation:dsh-summary-tooltip-in .08s linear}
.dsh-summary-icon-btn:focus-visible,.dsh-summary-ball:focus-visible{outline:2px solid var(--dsw-alias-label-secondary);outline-offset:2px}
.dsh-summary-icon-btn:disabled{opacity:.45;cursor:default}
.dsh-summary-icon-btn[data-loading="1"] svg{animation:dsh-summary-spin .8s linear infinite}
.dsh-summary-collapse-mark{position:relative;box-sizing:border-box;width:16px;height:16px;display:block;transition:transform .16s var(--ds-ease-in-out)}
.dsh-summary-collapse-mark[data-collapsed="1"]{transform:rotate(180deg)}
.dsh-summary-collapse-mark svg{position:absolute;left:1px;top:1px;transform:rotate(90deg)}
.dsh-summary-collapse-mark[data-line="1"]::after{content:"";position:absolute;left:3px;right:3px;bottom:0;height:1.5px;border-radius:1px;background:currentColor}
.dsh-summary-body{padding:2px 12px 10px}
.dsh-summary-section{padding:10px 0}
.dsh-summary-section+.dsh-summary-section{border-top:1px solid var(--dsw-alias-border-l1)}
.dsh-summary-section-head{display:flex;align-items:center;gap:2px;min-height:22px;margin:0 0 5px}
.dsh-summary-section h3{margin:0;color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:700;line-height:16px}
.dsh-summary-section-fold{width:22px;height:22px;border-radius:5px}
.dsh-summary-section p{margin:0;color:var(--dsw-alias-label-primary);font-size:12px;line-height:19px;white-space:pre-wrap;overflow-wrap:anywhere}
.dsh-summary-overall p{max-height:76px;overflow-y:auto;overscroll-behavior:contain}
.dsh-summary-empty{padding:16px 4px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;text-align:center}
.dsh-summary-ball{position:fixed;z-index:76;box-sizing:border-box;width:44px;height:44px;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:50%;background:var(--dsw-specific-menu);color:var(--dsw-alias-label-secondary);box-shadow:var(--dsw-shadow-lv2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .16s var(--ds-ease-in-out),background .16s var(--ds-ease-in-out),color .16s var(--ds-ease-in-out)}
.dsh-summary-ball:hover,.dsh-summary-ball[aria-expanded="true"]{transform:scale(1.06);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-summary-lock-icon{position:relative;box-sizing:border-box;width:14px;height:11px;margin-top:5px;border:2px solid currentColor;border-radius:2px}
.dsh-summary-lock-icon::before{content:"";position:absolute;box-sizing:border-box;width:8px;height:7px;left:1px;top:-8px;border:2px solid currentColor;border-bottom:0;border-radius:6px 6px 0 0}
.dsh-summary-panel[data-mode="ball-expanded"]{transform-origin:top left;animation:dsh-summary-pop .2s var(--ds-ease-in-out)}
.dsh-summary-panel[data-closing="1"]{pointer-events:none;animation:dsh-summary-out .16s var(--ds-ease-in-out) both}
.bux-mode-row{grid-column:1/-1;display:flex;flex-direction:column;gap:7px;padding:9px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1)}
.bux-mode-label{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:16px}
.bux-segments{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px;padding:2px;border-radius:8px;background:var(--dsw-alias-bg-base)}
.bux-segment{min-width:0;min-height:30px;padding:5px 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:16px;cursor:pointer;overflow-wrap:anywhere}
.bux-segment[aria-checked="true"]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.bux-segment:focus-visible{outline:2px solid var(--dsw-alias-label-secondary);outline-offset:1px}
.bux-shortcut-row{grid-column:1/-1;box-sizing:border-box;min-height:48px;padding:8px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);display:flex;align-items:center;gap:12px}
.bux-shortcut-label{min-width:0;flex:1;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:16px}
.bux-shortcut-controls{display:flex;align-items:center;gap:6px;flex:none}
.bux-shortcut-key{box-sizing:border-box;width:150px;min-height:30px;padding:5px 9px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px;cursor:pointer;white-space:normal;overflow-wrap:anywhere}
.bux-shortcut-key[data-recording="1"]{border-color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}
.bux-shortcut-clear{box-sizing:border-box;width:30px;height:30px;padding:0;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:20px;line-height:30px;cursor:pointer}
.bux-shortcut-clear:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.bux-shortcut-clear:disabled{opacity:.35;cursor:default}
.bux-shortcut-key:focus-visible,.bux-shortcut-clear:focus-visible{outline:2px solid var(--dsw-alias-label-secondary);outline-offset:1px}
.bux-summary-prompt{grid-column:1/-1;display:flex;flex-direction:column;gap:7px;padding:9px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1)}
.dsh-summary-select-wrap{position:relative;min-width:0}
.dsh-summary-model{box-sizing:border-box;width:100%;min-width:0;height:34px;appearance:none;padding:0 30px 0 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:12px}
.dsh-summary-select-arrow{position:absolute;right:9px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--dsw-alias-label-tertiary)}
.dsh-summary-select-wrap:has(select:disabled) .dsh-summary-select-arrow{opacity:.45}
.dsh-summary-model-row{padding:10px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dsh-summary-model-row,.bux-summary-model{display:grid;grid-template-columns:minmax(0,1fr) 104px;gap:8px;align-items:end}
.dsh-summary-model-row[data-has-reasoning="0"] .dsh-summary-model-main,.bux-summary-model[data-has-reasoning="0"] .dsh-summary-model-main{grid-column:1/-1}
.dsh-summary-model-main,.dsh-summary-reasoning{min-width:0}
.bux-summary-model{grid-column:1/-1;padding:9px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1)}
.dsh-summary-model-label{display:block;margin-bottom:5px;color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600;line-height:16px}
.bux-summary-prompt-head{display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:16px}
.bux-summary-prompt-count{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.bux-summary-prompt textarea{box-sizing:border-box;width:100%;min-height:74px;resize:vertical;padding:8px 9px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px}
.bux-summary-prompt textarea:focus{outline:none;border-color:var(--dsw-alias-label-tertiary)}
@keyframes dsh-summary-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
@keyframes dsh-summary-pop{from{opacity:0;transform:scale(.72)}to{opacity:1;transform:scale(1)}}
@keyframes dsh-summary-out{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.88)}}
@keyframes dsh-summary-spin{to{transform:rotate(360deg)}}
@keyframes dsh-summary-tooltip-in{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.dsh-summary-collapse-mark{transition:none}.dsh-summary-tooltip{animation:none}}
@media (max-width:640px){.dsh-summary-panel{max-height:min(58vh,460px)}.bux-segments{grid-template-columns:minmax(0,1fr)}.dsh-summary-section p{font-size:13px;line-height:20px}.dsh-summary-overall p{max-height:80px}}
`

    const MOBILE_CSS = `
@media (max-width:1023px){
html.dsh-no-pinch-zoom,html.dsh-no-pinch-zoom body{touch-action:pan-x pan-y}
.dsh-mobile-frame{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:100%!important}
.dsh-mobile-frame>[data-dsh-bux-sidebar-col]{display:none!important}
.dsh-mobile-frame>[data-dsh-bux-sidebar-col]:has([data-dsh-bux-settings-panel]){display:block!important;position:fixed;inset:0;width:100%!important;height:100%!important;z-index:80}
.dsh-mobile-frame>[data-dsh-bux-center-col]{grid-column:1;grid-row:1;box-sizing:border-box;width:100%;height:100%;min-width:0;padding-top:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top))!important}
.dsh-mobile-frame>[data-dsh-bux-details-col]{display:none!important}
.dsh-mobile-frame.dsh-mobile-sidebar-compat [data-dsh-bux-details-toggle]{top:4px!important;z-index:55!important}
.dsh-mobile-frame.dsh-mobile-sidebar-compat [data-dsh-bux-details-panel]{top:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top))!important}
body.dsh-mobile-active.dsh-mobile-sidebar-compat [data-dsh-bux-details-toggle]{top:4px!important;z-index:55!important}
body.dsh-mobile-active.dsh-mobile-flat [data-dsh-bux-center-col]{padding-top:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top))!important}
body.dsh-mobile-active.dsh-mobile-sidebar-compat [data-dsh-bux-details-panel]{top:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top))!important}
body.dsh-mobile-active.dsh-mobile-flat.dsh-mobile-sidebar-compat [data-dsh-bux-details-toggle]{top:4px!important}
body.dsh-mobile-active.dsh-mobile-flat.dsh-mobile-sidebar-compat [data-dsh-bux-details-panel]{top:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top))!important}
.dsh-mobile-shell{position:fixed;inset:0 0 auto;box-sizing:border-box;height:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top));padding-top:env(safe-area-inset-top);z-index:60;display:grid;grid-template-rows:48px var(--dsh-mobile-session-row-height,33.8px) var(--dsh-mobile-session-row-height,33.8px);background:var(--dsw-specific-sidebar-fill);border-bottom:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary);font-size:13px;isolation:isolate;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.dsh-mobile-scroll-wrap{position:relative;min-width:0;overflow:hidden}
.dsh-mobile-scroll-wrap:before,.dsh-mobile-scroll-wrap:after{content:"";position:absolute;top:0;bottom:0;width:8px;z-index:5;pointer-events:none;opacity:0;transition:opacity .16s var(--ds-ease-in-out)}
.dsh-mobile-scroll-wrap:before{left:0;background:linear-gradient(90deg,var(--dsw-specific-sidebar-fill),transparent)}
.dsh-mobile-scroll-wrap:after{right:0;background:linear-gradient(270deg,var(--dsw-specific-sidebar-fill),transparent)}
.dsh-mobile-scroll-wrap[data-overflow-enabled="1"][data-overflow-left="1"]:before,.dsh-mobile-scroll-wrap[data-overflow-enabled="1"][data-overflow-right="1"]:after{opacity:1}
.dsh-mobile-controls{display:flex;align-items:center;gap:4px;min-width:0;padding:0 10px}
.dsh-mobile-actions{display:flex;align-items:center;gap:6px;flex:none;margin-left:auto}
.dsh-mobile-action{box-sizing:border-box;width:32px;height:32px;min-width:32px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.dsh-mobile-logo{box-sizing:border-box;width:40px;height:40px;display:flex;align-items:center;justify-content:flex-start;overflow:hidden;flex:none;color:var(--dsw-alias-label-primary)}
.dsh-mobile-logo svg{width:34px!important;height:34px!important;max-width:none;flex:none}
.dsh-mobile-action svg{width:18px!important;height:18px!important;display:block}
.dsh-mobile-chrome-toggle{margin-left:2px}
.dsh-mobile-chrome-toggle svg{transition:transform .24s var(--ds-ease-in-out)}
.dsh-mobile-chrome-toggle[aria-expanded="false"] svg{transform:rotate(180deg)}
body.dsh-mobile-active [data-dsh-bux-session-header]{box-sizing:border-box;overflow:hidden;max-height:var(--dsh-conversation-header-height,96px);opacity:1;transform:translateY(0);transition:max-height .24s var(--ds-ease-in-out),padding .24s var(--ds-ease-in-out),opacity .16s var(--ds-ease-in-out),transform .24s var(--ds-ease-in-out)}
body.dsh-mobile-active.dsh-conversation-header-collapsed [data-dsh-bux-session-header]{max-height:0!important;padding-top:0!important;padding-bottom:0!important;border-bottom-width:0!important;opacity:0;transform:translateY(-8px);pointer-events:none}
.dsh-mobile-image-upload{position:relative}
.dsh-image-upload-icon{display:block;width:16px;height:16px;${VISION_MASK}}
.dsh-mobile-item-more{box-sizing:border-box;flex:none;width:24px;height:24px;margin-left:6px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:15px;line-height:20px;text-align:center;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.dsh-mobile-item-more svg{width:16px!important;height:16px!important;display:block}
.dsh-mobile-item-more:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-mobile-search-popover{position:fixed;top:calc(48px + env(safe-area-inset-top));left:10px;right:10px;z-index:75;display:flex;align-items:center;gap:6px;padding:6px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3,var(--dsw-shadow-lv3));color:var(--dsw-alias-label-primary)}
.dsh-mobile-search-input{box-sizing:border-box;width:100%;height:32px;min-width:0;border:0;border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);padding:0 9px;font-size:13px;outline:none}
.dsh-mobile-search-close{box-sizing:border-box;width:28px;height:28px;flex:none;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:18px;cursor:pointer}
.dsh-mobile-search-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}


.dsh-mobile-scroll{position:relative;z-index:1;box-sizing:border-box;width:100%;height:100%;display:flex;align-items:stretch;gap:4px;padding:0 10px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;touch-action:pan-x}
.dsh-mobile-scroll::-webkit-scrollbar{display:none}
.dsh-mobile-workspaces,.dsh-mobile-sessions{height:var(--dsh-mobile-session-row-height,33.8px)}
.dsh-mobile-workspaces .dsh-mobile-scroll,.dsh-mobile-sessions .dsh-mobile-scroll{height:calc(2.6em + 6px);align-items:flex-start}
.dsh-mobile-shell[data-flat="1"]{height:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top));grid-template-rows:48px 0 var(--dsh-mobile-session-row-height,33.8px)}
.dsh-mobile-shell[data-flat="1"] .dsh-mobile-workspaces{display:none}
.dsh-mobile-shell[data-flat="1"] .dsh-mobile-sessions{grid-row:3}

.dsh-mobile-item{box-sizing:border-box;position:relative;flex:none;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;text-align:left;display:flex;align-items:center;gap:8px;padding:0 10px;min-width:112px;height:48px;margin:6px 0;touch-action:pan-x}
.dsh-mobile-item:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-mobile-item[data-selected="1"]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-mobile-item[data-drag-active="1"]{opacity:.62}
.dsh-mobile-sort-capsule{position:fixed;z-index:70;display:flex;align-items:center;gap:2px;padding:4px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3)}
.dsh-mobile-sort-capsule button{width:34px;height:34px;border:0;border-radius:999px;background:transparent;color:var(--dsw-alias-label-primary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.dsh-mobile-sort-capsule button:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-mobile-sort-capsule button:disabled{opacity:.35;cursor:default;background:transparent}
.dsh-mobile-sort-capsule svg{width:16px;height:16px;display:block}
.dsh-mobile-workspace-item{width:max-content;min-width:0;max-width:260px;height:2.6em;margin:0 0 6px;padding:0 8px;gap:6px;font-size:inherit}
.dsh-mobile-workspace-item .dsh-mobile-item-title{flex:1;min-width:0}
.dsh-mobile-session-item{width:max-content;min-width:0;max-width:none;height:2.6em;margin:0 0 6px;padding:0 8px;gap:6px;font-size:inherit}
.dsh-mobile-session-status{position:relative;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;flex:none}
.dsh-mobile-session-status[data-state="warning"]:empty::before,.dsh-mobile-session-status[data-state="done"]:empty::before{content:"";width:8px;height:8px;border-radius:50%}
.dsh-mobile-session-status[data-state="warning"]:empty::before{background:#f2b84b}
.dsh-mobile-session-status[data-state="done"]:empty::before{background:#35c878}
.dsh-mobile-session-status[data-state="ongoing"]:empty::before{content:"";box-sizing:border-box;width:10px;height:10px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%}
.dsh-mobile-session-status svg{width:12px!important;height:12px!important;display:block;flex:none}
.dsh-mobile-item svg{width:16px;height:16px;display:block;flex:none}
.dsh-mobile-item-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:18px}
.dsh-mobile-session-item .dsh-mobile-item-title{width:auto;max-width:24ch;flex:0 1 auto}
.dsh-mobile-item-meta{max-width:100%;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:none}
.dsh-mobile-workspace-item .dsh-mobile-item-more,.dsh-mobile-session-item .dsh-mobile-item-more{margin-left:0}
.dsh-mobile-empty{height:2.6em;margin:0 0 6px;padding:0 10px;display:flex;align-items:center;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.dsh-mobile-view-menu{position:fixed;top:calc(44px + env(safe-area-inset-top));right:10px;z-index:75;width:190px;padding:6px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-specific-menu);box-shadow:var(--ds-shadow-lv3,var(--dsw-shadow-lv3));color:var(--dsw-alias-label-primary)}
.dsh-mobile-view-label{padding:6px 8px;color:var(--dsw-alias-label-tertiary);font-size:11px}
.dsh-mobile-view-option{width:100%;height:32px;border:0;border-radius:6px;background:transparent;color:inherit;text-align:left;padding:0 8px;cursor:pointer}
.dsh-mobile-view-option:hover,.dsh-mobile-view-option[data-selected="1"]{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-mobile-view-option:before{content:"";display:inline-block;width:14px;color:var(--dsw-alias-label-primary)}
.dsh-mobile-view-option[data-selected="1"]:before{content:"✓"}

[data-dsh-bux-settings-layer]{position:fixed!important;box-sizing:border-box!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;padding:max(12px,env(safe-area-inset-top)) 12px max(12px,env(safe-area-inset-bottom))!important;overflow:hidden!important;overscroll-behavior:contain}
[data-dsh-bux-settings-panel]{position:relative!important;width:100%!important;max-width:none!important;height:100%!important;max-height:100%!important;flex-direction:column!important}
[data-dsh-bux-settings-nav]{box-sizing:border-box;width:100%!important;height:120px!important;min-height:120px!important;flex:0 0 120px!important;overflow:hidden!important}
[data-dsh-bux-settings-nav-title]{box-sizing:border-box;width:100%!important;height:32px!important;min-height:32px!important;flex:0 0 32px!important;padding:0 12px!important;display:flex!important;align-items:center!important}
[data-dsh-bux-settings-nav-list]{box-sizing:border-box;width:100%!important;height:44px!important;min-height:44px!important;flex:0 0 44px!important;display:flex!important;flex-direction:row!important;align-items:center!important;gap:4px!important;padding:0 8px!important;overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:none}
[data-dsh-bux-settings-nav-list]::-webkit-scrollbar{display:none}
[data-dsh-bux-settings-cell]{box-sizing:border-box;flex:0 0 32px!important;width:32px!important;height:32px!important}
[data-dsh-bux-settings-content]{box-sizing:border-box;width:100%!important;min-width:0!important;flex:1 1 auto!important;overflow:hidden!important}
[data-dsh-bux-settings-header]{position:static!important;width:100%!important;min-width:0!important;height:0!important;min-height:0!important;flex:0 0 0!important;overflow:visible!important}
[data-dsh-bux-settings-close]{position:absolute!important;top:18px!important;right:12px!important;z-index:5!important}
[data-dsh-bux-settings-header]>button:first-child{position:absolute!important;top:18px!important;right:52px!important;z-index:5!important}
[data-dsh-bux-settings-options]{box-sizing:border-box;width:100%!important;min-width:0!important;overflow:auto!important;padding:0 14px 24px!important}
[data-dsh-bux-composer-trailing]{min-width:0!important;max-width:100%!important;flex:1 1 auto!important}
[data-dsh-bux-model-seat]{box-sizing:border-box;min-width:0!important;max-width:44vw!important;flex:0 1 44vw!important;overflow:hidden!important;display:flex!important}
[data-dsh-bux-model-seat]>*{box-sizing:border-box;min-width:0!important;max-width:100%!important;overflow:hidden!important}
[data-dsh-bux-model-seat] button{min-width:0!important;max-width:100%!important;overflow:hidden!important;white-space:nowrap!important}
[data-dsh-bux-model-seat] button>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
[data-dsh-bux-model-seat] .dsh-bux-model-effort{max-width:34%}
[data-dsh-bux-access-root]{overflow:hidden!important}
[data-dsh-bux-access-root]>button{max-width:100%!important;overflow:hidden!important}
}
`

    const ICONS = {
      rename: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9.2 3.2l3.6 3.6M3 13l.7-3.6L11.4 1.7a1.2 1.2 0 0 1 1.7 0l1.2 1.2a1.2 1.2 0 0 1 0 1.7L6.6 12.3 3 13z"/></svg>',
      fork: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="4.5" cy="3.5" r="1.4"/><circle cx="4.5" cy="12.5" r="1.4"/><circle cx="11.5" cy="8" r="1.4"/><path d="M4.5 4.9v5.6M4.5 8h5.6"/></svg>',
      archive: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.5 5h11v8.2a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V5zM2 3.2h12v1.8H2zM6.2 8.2h3.6"/></svg>',
    }
    const BUTTONS = [
      ["rename", "tip.rename"],
      ["fork", "tip.fork"],
      ["archive", "tip.archive"],
    ]

    function fiberProps(row) {
      const key = Object.keys(row).find((name) => name.startsWith("__reactFiber$"))
      let fiber = key ? row[key] : null
      while (fiber) {
        const props = fiber.memoizedProps
        if (props && props.node && props.node.id && typeof props.onRename === "function") return props
        fiber = fiber.return
      }
      return null
    }

    function menuItems(button) {
      const key = Object.keys(button || {}).find((name) => name.startsWith("__reactFiber$"))
      let fiber = key ? button[key] : null
      while (fiber) {
        const props = fiber.memoizedProps
        if (Array.isArray(props?.items) && typeof props.onSelect === "function") return props.items
        fiber = fiber.return
      }
      return null
    }

    function startSessionRow() {
      const style = document.createElement("style")
      style.dataset.plugin = "dsh-better-ux-session"
      const syncCss = () => {
        style.textContent = SESSION_CSS
      }
      syncCss()
      document.head.appendChild(style)

      const clearNativeMenu = (row) => {
        row.classList.remove("dsh-inline-menu-redundant")
        for (const root of row.querySelectorAll("[data-dsh-bux-native-menu]")) delete root.dataset.dshBuxNativeMenu
      }

      const syncNativeMenu = (row, actions, settings) => {
        clearNativeMenu(row)
        const button = nativeSessionButton(row)
        if (!button) return
        const root = directChildWithin(button, actions)
        if (!root) return
        root.dataset.dshBuxNativeMenu = "1"
        const ids = menuItems(button)?.map((item) => item?.id)
        const allInline = BUTTONS.every(([id]) => settings[id] !== false)
        const nativeOnly = ids?.length === BUTTONS.length && BUTTONS.every(([id]) => ids.includes(id))
        row.classList.toggle("dsh-inline-menu-redundant", allInline && nativeOnly)
      }

      const enhance = (row) => {
        if (!isSessionRow(row)) return
        row.dataset.dshBuxSessionRow = "1"
        const settings = loadSettings().sessionRow
        const nativeButton = nativeSessionButton(row)
        const actions = nativeButton ? directChildWithin(nativeButton, row) : null
        const existing = row.querySelector(".dsh-inline-acts")
        if (!actions || !settings.enabled) {
          existing?.remove()
          clearNativeMenu(row)
          delete row.dataset.dshInlineActs
          return
        }
        if (existing) {
          for (const [id, tipKey] of BUTTONS) {
            const button = existing.querySelector(`[data-act="${id}"]`)
            if (button) {
              button.hidden = settings[id] === false
              button.dataset.tipOn = settings.tooltip ? "1" : "0"
              const tip = tt(tipKey)
              button.dataset.tip = tip
              button.setAttribute("aria-label", tip)
            }
          }
          syncNativeMenu(row, actions, settings)
          return
        }
        row.dataset.dshInlineActs = "1"
        const bar = document.createElement("span")
        bar.className = "dsh-inline-acts"
        for (const [id, tipKey] of BUTTONS) {
          const tip = tt(tipKey)
          const button = document.createElement("button")
          button.type = "button"
          button.className = "dsh-inline-act"
          button.dataset.act = id
          button.dataset.tip = tip
          button.dataset.tipOn = settings.tooltip ? "1" : "0"
          button.hidden = settings[id] === false
          button.setAttribute("aria-label", tip)
          button.innerHTML = ICONS[id]
          button.addEventListener("click", (event) => {
            event.preventDefault()
            event.stopPropagation()
            const props = fiberProps(row)
            if (!props) return
            if (id === "rename") props.onRename(props.node.id, props.node.title)
            if (id === "fork") props.onFork(props.node.id)
            if (id === "archive") props.onArchive(props.node.id)
          })
          bar.appendChild(button)
        }
        actions.appendChild(bar)
        syncNativeMenu(row, actions, settings)
      }

      const scan = (root) => {
        for (const row of sessionRowsIn(root)) enhance(row)
      }

      let watching = null
      const sidebarRoot = () => sidebarBrowserNode()
      const observer = new MutationObserver((records) => {
        if (watching && !watching.isConnected) {
          attachRowObserver()
          return
        }
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node.nodeType !== 1) continue
            if (isSessionRow(node)) enhance(node)
            const row = node.closest?.('[role="treeitem"][aria-selected]')
            if (row) enhance(row)
            scan(node)
          }
        }
      })
      const bootObserver = new MutationObserver(() => attachRowObserver())
      const attachRowObserver = () => {
        const target = sidebarRoot()
        if (target === watching) return
        observer.disconnect()
        watching = target
        if (target) {
          bootObserver.disconnect()
          observer.observe(target, { childList: true, subtree: true })
          scan(target)
        } else if (document.body) {
          bootObserver.observe(document.body, { childList: true, subtree: true })
        }
      }
      const startObserve = () => {
        attachRowObserver()
        if (!watching && document.body) bootObserver.observe(document.body, { childList: true, subtree: true })
      }
      if (document.body) startObserve()
      else document.addEventListener("DOMContentLoaded", startObserve, { once: true })
      const onPointerOver = (event) => {
        const row = event.target.closest?.('[role="treeitem"][aria-selected]')
        if (row) enhance(row)
      }
      const onChange = () => {
        syncCss()
        attachRowObserver()
        scan(document)
      }
      document.addEventListener("pointerover", onPointerOver, true)
      window.addEventListener(CHANGE, onChange)
      window.addEventListener(LOCALE_CHANGE, onChange)
      return () => {
        observer.disconnect()
        bootObserver.disconnect()
        document.removeEventListener("DOMContentLoaded", startObserve)
        document.removeEventListener("pointerover", onPointerOver, true)
        window.removeEventListener(CHANGE, onChange)
        window.removeEventListener(LOCALE_CHANGE, onChange)
        style.remove()
        for (const bar of document.querySelectorAll(".dsh-inline-acts")) bar.remove()
        for (const row of document.querySelectorAll("[data-dsh-inline-acts]")) {
          delete row.dataset.dshInlineActs
          clearNativeMenu(row)
        }
      }
    }

    const HOST_TEXT = {
      viewOptions: ["视图选项", "View options"],
      addWorkspace: ["添加工作区", "Add workspace"],
      itemMenu: ["操作", "actions"],
      viewWorkspace: ["按工作区", "WorkSpace"],
      viewFlat: ["单列表", "In one list"],
      orderManual: ["手动排序", "Manual"],
      orderUpdated: ["最近更新", "Last updated"],
    }
    const hostText = (key) => LOCALE.lang === "en" ? HOST_TEXT[key][1] : HOST_TEXT[key][0]
    const matchesHostText = (text, key) => HOST_TEXT[key].some((candidate) => candidate.toLowerCase() === String(text || "").trim().toLowerCase())
    const SEL_VIEW_OPTIONS = `button[aria-label="视图选项"], button[aria-label="View options"]`
    const SEL_ADD_WORKSPACE = `[aria-label="添加工作区"], [aria-label="Add workspace"]`
    const SEL_SEARCH = `button[aria-label="搜索会话"], button[aria-label="Search sessions"]`
    const SEL_ITEM_MENU = `button[aria-label*="操作"], button[aria-label*="actions" i]`
    const HOST_BUTTON_NEW_SESSION = "@new-session"
    const HOST_BUTTON_SETTINGS = "@settings"
    const HOST_BUTTON_BRAND = "@brand"

    function startMobileLayout(ctx) {
      const style = document.createElement("style")
      style.dataset.plugin = "dsh-better-ux-mobile"
      const syncCss = () => {
        style.textContent = loadSettings().mobileLayout.enabled ? MOBILE_CSS : ""
      }
      syncCss()
      document.head.appendChild(style)

      let shell = null
      let viewMenu = null
      let searchPopover = null
      let searchQuery = ""
      let raf = null
      let observer = null
      let sourceObserver = null
      let lastData = null
      let activeFrame = null
      let selectedGroupKey = null
      let lastNativeGroupKey = null
      let suppressClickUntil = 0
      const suppressClickItems = new Set()
      let sourceInitiallyCollapsed = null
      let sourceExpandAt = 0
      let sourceExpandTimer = null
      let lastMobileSettings = ""
      let imageButton = null
      let imageInput = null
      let imageTools = null
      let imageComposer = null
      let imageComposerObserver = null
      let sessionHeightObserver = null
      let conversationHeaderMeasureTimer = null
      let conversationHeaderExpanded = true
      let lastRenderAt = 0
      let suppressFocusUntil = 0
      let lastSessionId = null

      const mobileSettings = () => loadSettings().mobileLayout
      const mobileActive = () => mobileSettings().enabled && window.innerWidth <= 1023
      let pinchLocked = false
      let viewportMeta = null
      let viewportSaved = undefined
      let viewportCreated = false
      const pinchOpts = { capture: true, passive: false }
      const onPinchTouch = (event) => {
        if (event.touches.length > 1) event.preventDefault()
      }
      const onPinchGesture = (event) => event.preventDefault()
      const applyPinchLock = (on) => {
        if (on === pinchLocked) return
        pinchLocked = on
        document.documentElement.classList.toggle("dsh-no-pinch-zoom", on)
        if (on) {
          viewportMeta = document.querySelector('meta[name="viewport"]')
          if (viewportMeta) {
            viewportSaved = viewportMeta.getAttribute("content") || ""
            const kept = viewportSaved.split(",").map((part) => part.trim()).filter((part) => part && !/^(maximum-scale|minimum-scale|user-scalable)\s*=/i.test(part)).join(", ")
            viewportMeta.setAttribute("content", (kept ? kept + ", " : "") + "maximum-scale=1, user-scalable=no")
          } else {
            viewportMeta = document.createElement("meta")
            viewportMeta.setAttribute("name", "viewport")
            viewportMeta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no")
            document.head.appendChild(viewportMeta)
            viewportCreated = true
          }
          document.addEventListener("touchstart", onPinchTouch, pinchOpts)
          document.addEventListener("touchmove", onPinchTouch, pinchOpts)
          document.addEventListener("gesturestart", onPinchGesture, pinchOpts)
          document.addEventListener("gesturechange", onPinchGesture, pinchOpts)
          document.addEventListener("gestureend", onPinchGesture, pinchOpts)
        } else {
          if (viewportCreated) viewportMeta?.remove()
          else if (viewportMeta && viewportSaved !== undefined) viewportMeta.setAttribute("content", viewportSaved)
          viewportMeta = null
          viewportSaved = undefined
          viewportCreated = false
          document.removeEventListener("touchstart", onPinchTouch, pinchOpts)
          document.removeEventListener("touchmove", onPinchTouch, pinchOpts)
          document.removeEventListener("gesturestart", onPinchGesture, pinchOpts)
          document.removeEventListener("gesturechange", onPinchGesture, pinchOpts)
          document.removeEventListener("gestureend", onPinchGesture, pinchOpts)
        }
      }
      const fiberPropsFor = (node, predicate) => {
        const key = Object.keys(node || {}).find((name) => name.startsWith("__reactFiber$"))
        let fiber = key ? node[key] : null
        while (fiber) {
          const props = fiber.memoizedProps
          if (props && predicate(props)) return props
          fiber = fiber.return
        }
        return null
      }
      const sourceRoot = () => sidebarColumnNode()
      const sourceButton = (selector) => {
        if (selector === HOST_BUTTON_SETTINGS) return slotNode("settings.trigger")?.parentElement || null
        if (selector === HOST_BUTTON_NEW_SESSION || selector === HOST_BUTTON_BRAND) {
          const logoRow = slotNode("sidebar")?.firstElementChild?.firstElementChild
          const candidates = [...(sourceRoot()?.querySelectorAll("button") || [])].filter((button) => HOST_ARIA.newSession.includes(button.getAttribute("aria-label")?.trim()))
          return selector === HOST_BUTTON_BRAND
            ? candidates.find((button) => logoRow?.contains(button)) || null
            : candidates.find((button) => !logoRow?.contains(button)) || null
        }
        return sourceRoot()?.querySelector(selector) || document.querySelector(selector)
      }
      const sourceSvg = (selector) => sourceButton(selector)?.querySelector("svg")?.cloneNode(true) || null
      const nativeSearchInput = () => sidebarBrowserNode()?.querySelector("input") || null
      const sourceToggle = () => {
        const labelled = buttonByLabel(sourceRoot(), [...HOST_ARIA.expandSidebar, ...HOST_ARIA.collapseSidebar])
        if (labelled) return labelled
        const logoRow = slotNode("sidebar")?.firstElementChild?.firstElementChild
        return [...(logoRow?.querySelectorAll("button") || [])].find((button) => !HOST_ARIA.newSession.includes(button.getAttribute("aria-label")?.trim()) && !button.textContent?.trim()) || null
      }
      const sourceIsCollapsed = () => HOST_ARIA.expandSidebar.includes(sourceToggle()?.getAttribute("aria-label")?.trim())
      const stopSessionHeightObserver = () => {
        sessionHeightObserver?.disconnect()
        sessionHeightObserver = null
        document.body.style.removeProperty("--dsh-mobile-session-row-height")
        document.body.style.removeProperty("--dsh-conversation-header-height")
      }
      const observeSessionHeight = (target) => {
        stopSessionHeightObserver()
        sessionHeightObserver = new ResizeObserver(([entry]) => {
          document.body.style.setProperty("--dsh-mobile-session-row-height", `${Math.round(entry.contentRect.height * 100) / 100}px`)
        })
        sessionHeightObserver.observe(target)
      }
      const removeImageUpload = () => {
        imageComposerObserver?.disconnect()
        imageComposerObserver = null
        imageComposer = null
        imageButton?.remove()
        imageInput?.remove()
        imageButton = null
        imageInput = null
        imageTools = null
      }
      const syncImageUpload = () => {
        if (!mobileActive()) {
          removeImageUpload()
          return
        }
        const composer = composerBarNode()
        const plus = composerCommandButton()
        const tools = plus?.parentElement
        if (!composer || !tools || !plus) {
          removeImageUpload()
          return
        }
        if (composer !== imageComposer) {
          imageComposerObserver?.disconnect()
          imageComposer = composer
          imageComposerObserver = new MutationObserver(() => syncImageUpload())
          imageComposerObserver.observe(composer, { childList: true, subtree: true })
        }
        if (imageButton && imageTools === tools && tools.contains(imageButton)) {
          const attachLabel = tt("image.attach")
          imageButton.setAttribute("aria-label", attachLabel)
          imageButton.title = attachLabel
          return
        }
        imageButton?.remove()
        imageInput?.remove()
        const input = document.createElement("input")
        input.type = "file"
        input.accept = "image/*"
        input.multiple = true
        input.tabIndex = -1
        input.setAttribute("aria-hidden", "true")
        input.style.display = "none"
        const button = plus.cloneNode(false)
        button.type = "button"
        button.classList.add("dsh-mobile-image-upload")
        const attachLabel = tt("image.attach")
        button.setAttribute("aria-label", attachLabel)
        button.title = attachLabel
        const icon = document.createElement("span")
        icon.className = "dsh-image-upload-icon"
        button.appendChild(icon)
        button.addEventListener("click", () => input.click())
        input.addEventListener("change", () => {
          const files = [...input.files]
          const textarea = composer.querySelector("textarea")
          if (files.length && textarea) {
            const transfer = new DataTransfer()
            for (const file of files) transfer.items.add(file)
            const paste = new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: transfer })
            if (paste.clipboardData === null) Object.defineProperty(paste, "clipboardData", { value: transfer })
            textarea.dispatchEvent(paste)
          }
          input.value = ""
        })
        plus.insertAdjacentElement("afterend", button)
        tools.appendChild(input)
        imageButton = button
        imageInput = input
        imageTools = tools
      }
 const rowDrag = (row) => fiberPropsFor(row, (props) => props.drag && typeof props.drag.start === "function" && typeof props.drag.end === "function")?.drag || null
      const groupHandlers = (group) => fiberPropsFor(group, (props) => typeof props.onDragOver === "function" && typeof props.onDrop === "function")
      const projectKey = (project, index) => fiberPropsFor(project, (props) => props.group && typeof props.group.key === "string")?.group?.key || "index:" + index
      const sessionProps = (row) => fiberPropsFor(row, (props) => props.node?.id && typeof props.onOpen === "function")
      const textOf = (node) => node?.textContent?.trim() || ""
      const directTexts = (row) => [...row.children].map(textOf).filter(Boolean)
      const titleOfRow = (row, props = sessionProps(row)) => (props?.node?.blank ? directTexts(row)[0] : props?.node?.title) || directTexts(row)[0] || tt("fallback.session")
      const timeOfRow = (row, props = sessionProps(row)) => props?.node?.blank ? "" : (directTexts(row).find((text) => text !== titleOfRow(row, props)) || "")
      const selectedOfRow = (row) => row.getAttribute("aria-selected") === "true"
      const statusOfRow = (row) => row.firstElementChild?.firstElementChild?.cloneNode(true) || null

      const readNative = () => {
        const root = sourceRoot()
        const tree = sidebarTreeNode()
        const projects = workspaceRowsIn(tree)
        const groupOfProject = (project) => {
          let group = project
          while (group?.parentElement && group.parentElement !== tree) group = group.parentElement
          return group?.parentElement === tree ? group : null
        }
        const nativeGroups = projects.map((project) => ({ project, group: groupOfProject(project) })).filter((entry) => entry.group)
        if (!nativeGroups.length && !sessionRowsIn(tree).length && lastData?.groups?.length) return lastData
        const groups = nativeGroups.map(({ group, project }, index) => {
          const projectProps = project && fiberPropsFor(project, (props) => props.group && typeof props.group.key === "string")
          const key = projectKey(project, index)
          const sessions = sessionRowsIn(group).map((row) => {
            const props = sessionProps(row)
            return {
              id: props?.node?.id || "row:" + index + ":" + titleOfRow(row),
              title: titleOfRow(row, props),
              time: timeOfRow(row, props),
              selected: selectedOfRow(row),
              pendingInteraction: props?.node?.pendingInteraction,
              running: Boolean(props?.node?.running),
              runningSubagentCount: Number(props?.node?.runningSubagentCount || 0),
              completed: Boolean(props?.node?.completed),
              status: statusOfRow(row),
              source: row,
              drag: rowDrag(row),
              groupKey: key,
            }
          })
          return {
            key,
            title: projectProps?.group?.label || textOf(project) || tt("fallback.workspace"),
            source: group,
            project,
            projectProps,
            handlers: groupHandlers(group),
            sessions,
            nativeCurrent: Boolean(projectProps?.group?.containsCurrent || sessions.some((session) => session.selected)),
          }
        })
        if (!groups.length) {
          const rows = sessionRowsIn(tree)
          groups.push({
            key: "flat",
            title: tt("fallback.allSessions"),
            source: null,
            project: null,
            projectProps: null,
            handlers: null,
            nativeCurrent: true,
            sessions: rows.map((row, index) => {
              const props = sessionProps(row)
              return {
                id: props?.node?.id || "flat:" + index + ":" + titleOfRow(row),
                title: titleOfRow(row, props),
                time: timeOfRow(row, props),
                selected: selectedOfRow(row),
                pendingInteraction: props?.node?.pendingInteraction,
                running: Boolean(props?.node?.running),
                runningSubagentCount: Number(props?.node?.runningSubagentCount || 0),
                completed: Boolean(props?.node?.completed),
                status: statusOfRow(row),
                source: row,
                drag: rowDrag(row),
                groupKey: "flat",
              }
            }),
          })
        }
        const nativeCurrent = groups.find((group) => group.nativeCurrent)
        if (nativeCurrent && nativeCurrent.key !== lastNativeGroupKey) {
          selectedGroupKey = nativeCurrent.key
          lastNativeGroupKey = nativeCurrent.key
        }
        if (!selectedGroupKey || !groups.some((group) => group.key === selectedGroupKey)) selectedGroupKey = nativeCurrent?.key || groups[0]?.key || null
        const groupsByKey = new Map(groups.map((group) => [group.key, group]))
        const sessionsById = new Map()
        for (const group of groups) for (const session of group.sessions) sessionsById.set(session.id, session)
        const selectedGroup = groupsByKey.get(selectedGroupKey) || groups[0]
        const selectedSession = groups.flatMap((group) => group.sessions).find((session) => session.selected) || null
        return { root, groups, groupsByKey, sessionsById, selectedGroup, selectedSession }
      }

      const makeIcon = (svg, fallback) => {
        if (svg) return svg.cloneNode(true)
        const span = document.createElement("span")
        span.textContent = fallback
        return span
      }
      const makeAction = (action, label, selector, fallback) => {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "dsh-mobile-action"
        button.dataset.action = action
        button.setAttribute("aria-label", label)
        button.title = label
        button.appendChild(makeIcon(sourceSvg(selector), fallback))
        return button
      }
      const measureConversationHeader = () => {
        if (!conversationHeaderExpanded) return
        const header = conversationHeaderNode()
        const height = header?.scrollHeight || header?.getBoundingClientRect().height || 0
        if (height > 8) document.body.style.setProperty("--dsh-conversation-header-height", `${Math.round(height * 100) / 100}px`)
      }
      const scheduleConversationHeaderMeasure = () => {
        if (!conversationHeaderExpanded) return
        window.clearTimeout(conversationHeaderMeasureTimer)
        conversationHeaderMeasureTimer = window.setTimeout(() => {
          conversationHeaderMeasureTimer = null
          measureConversationHeader()
        }, 280)
      }
      const syncConversationHeaderToggle = () => {
        document.body.classList.toggle("dsh-conversation-header-collapsed", !conversationHeaderExpanded)
        scheduleConversationHeaderMeasure()
        const button = shell?.querySelector('[data-action="toggle-conversation-header"]')
        if (!button) return
        const label = conversationHeaderExpanded ? tt("header.collapse") : tt("header.expand")
        button.setAttribute("aria-expanded", conversationHeaderExpanded ? "true" : "false")
        button.setAttribute("aria-label", label)
        button.title = label
      }
      const makeConversationHeaderToggle = () => {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "dsh-mobile-action dsh-mobile-chrome-toggle"
        button.dataset.action = "toggle-conversation-header"
        button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>'
        return button
      }
      const fitSessionTitle = (text) => {
        const chars = Array.from(text)
        const units = (char) => char.codePointAt(0) <= 0x7f ? 1 : 2
        if (chars.reduce((total, char) => total + units(char), 0) <= 24) return text
        let width = 0
        let fitted = ""
        for (const char of chars) {
          const next = units(char)
          if (width + next > 21) break
          fitted += char
          width += next
        }
        return fitted + "..."
      }
      const sessionStatus = (entry) => {
        if (entry.pendingInteraction) {
          const keys = { approval: "status.approval", "plan-review": "status.planReview", question: "status.question" }
          return { state: "warning", label: tt(keys[entry.pendingInteraction] || "status.pending") }
        }
        if (entry.running || entry.runningSubagentCount > 0) return { state: "ongoing", label: tt("status.running") }
        if (entry.completed) return { state: "done", label: tt("status.completedUnread") }
        return null
      }
      const makeItem = (entry, kind) => {
        const item = document.createElement("div")
        item.setAttribute("role", "button")
        item.tabIndex = 0
        item.className = "dsh-mobile-item dsh-mobile-" + kind + "-item"
        item.dataset.action = kind
        if (kind === "workspace") item.dataset.key = entry.key
        else item.dataset.id = entry.id
        item.dataset.selected = kind === "workspace" ? (entry.key === selectedGroupKey ? "1" : "0") : (entry.selected ? "1" : "0")
        const icon = entry.project ? entry.project.querySelector("svg")?.cloneNode(true) : null
        if (kind === "workspace") {
          if (icon) item.appendChild(icon)
          const title = document.createElement("span")
          title.className = "dsh-mobile-item-title"
          title.textContent = entry.title
          item.appendChild(title)
        } else {
          const status = sessionStatus(entry)
          if (status) {
            const dot = document.createElement("span")
            dot.className = "dsh-mobile-session-status"
            dot.dataset.state = status.state
            dot.setAttribute("aria-label", status.label)
            if (entry.status) dot.appendChild(entry.status.cloneNode(true))
            item.appendChild(dot)
          }
          const title = document.createElement("span")
          title.className = "dsh-mobile-item-title"
          title.textContent = fitSessionTitle(entry.title)
          if (title.textContent !== entry.title) title.title = entry.title
          item.appendChild(title)
          if (entry.time) {
            const time = document.createElement("span")
            time.className = "dsh-mobile-item-meta"
            time.textContent = entry.time
            item.appendChild(time)
          }
        }
        const more = document.createElement("button")
        more.type = "button"
        more.className = "dsh-mobile-item-more"
        more.dataset.action = "item-menu"
        more.dataset.kind = kind
        if (kind === "workspace") more.dataset.key = entry.key
        else more.dataset.id = entry.id
        more.setAttribute("aria-label", tt("item.more.aria", { name: entry.title }))
        const source = kind === "workspace" ? entry.project : entry.source
        const moreIcon = source?.querySelector(SEL_ITEM_MENU)?.querySelector("svg")?.cloneNode(true)
        if (moreIcon) more.appendChild(moreIcon)
        else more.textContent = "…"
        item.appendChild(more)
        return item
      }
      const makeScrollRow = (className) => {
        const wrap = document.createElement("div")
        wrap.className = "dsh-mobile-scroll-wrap " + className
        const scroll = document.createElement("div")
        scroll.className = "dsh-mobile-scroll"
        wrap.appendChild(scroll)
        return { wrap, scroll }
      }
      const updateOverflow = (wrap, scroll) => {
        if (Date.now() - lastRenderAt > 150) closeSortCapsule()
        const max = Math.max(0, scroll.scrollWidth - scroll.clientWidth)
        wrap.dataset.overflowLeft = scroll.scrollLeft > 2 ? "1" : "0"
        wrap.dataset.overflowRight = max - scroll.scrollLeft > 2 ? "1" : "0"
        wrap.dataset.overflowEnabled = mobileSettings().overflowHint ? "1" : "0"
      }
      const currentView = () => {
        try {
          const state = JSON.parse(localStorage.getItem(WORKSPACE_VIEW_KEY) || "{}")
          return { groupBy: state.groupBy || "workspace", orderBy: state.orderBy || "updated" }
        } catch {
          return { groupBy: "workspace", orderBy: "updated" }
        }
      }
      const closeViewMenu = () => {
        viewMenu?.remove()
        viewMenu = null
      }
      const fallbackViewChange = (groupBy, orderBy) => {
        workspaceMutationVersion += 1
        try {
          const state = JSON.parse(localStorage.getItem(WORKSPACE_VIEW_KEY) || "{}")
          if (groupBy) state.groupBy = groupBy
          if (orderBy) state.orderBy = orderBy
          const next = JSON.stringify(state)
          localStorage.setItem(WORKSPACE_VIEW_KEY, next)
          window.dispatchEvent(new StorageEvent("storage", { key: WORKSPACE_VIEW_KEY, newValue: next }))
          syncCurrentSettings()
        } catch {}
      }
      const chooseNativeView = (textKey, groupBy, orderBy) => {
        closeViewMenu()
        const trigger = sourceButton(SEL_VIEW_OPTIONS)
        if (!trigger) {
          fallbackViewChange(groupBy, orderBy)
          schedule()
          return
        }
        trigger.click()
        window.setTimeout(() => {
          const item = [...document.querySelectorAll('[role="menuitem"]')].find((node) => matchesHostText(node.textContent, textKey))
          if (item) item.click()
          fallbackViewChange(groupBy, orderBy)
          schedule()
        }, 0)
      }
      const applyViewAction = (viewAction) => {
        if (viewAction === "group-workspace") chooseNativeView("viewWorkspace", "workspace", null)
        if (viewAction === "group-flat") chooseNativeView("viewFlat", "flat", null)
        if (viewAction === "order-manual") chooseNativeView("orderManual", null, "manual")
        if (viewAction === "order-updated") chooseNativeView("orderUpdated", null, "updated")
      }
      const openViewMenu = () => {
        closeViewMenu()
        const state = currentView()
        viewMenu = document.createElement("div")
        viewMenu.className = "dsh-mobile-view-menu"
        viewMenu.setAttribute("role", "menu")
        const addLabel = (text) => {
          const label = document.createElement("div")
          label.className = "dsh-mobile-view-label"
          label.textContent = text
          viewMenu.appendChild(label)
        }
        const addOption = (text, action, selected) => {
          const option = document.createElement("button")
          option.type = "button"
          option.className = "dsh-mobile-view-option"
          option.dataset.action = "view-option"
          option.dataset.viewAction = action
          option.dataset.selected = selected ? "1" : "0"
          option.textContent = text
          viewMenu.appendChild(option)
        }
        addLabel(tt("view.groupBy"))
        addOption(hostText("viewWorkspace"), "group-workspace", state.groupBy === "workspace")
        addOption(hostText("viewFlat"), "group-flat", state.groupBy !== "workspace")
        addLabel(tt("view.orderBy"))
        addOption(hostText("orderManual"), "order-manual", state.orderBy === "manual")
        addOption(hostText("orderUpdated"), "order-updated", state.orderBy !== "manual")
        viewMenu.addEventListener("click", (event) => {
          const option = event.target.closest?.("[data-view-action]")
          if (option) applyViewAction(option.dataset.viewAction)
        })
        document.body.appendChild(viewMenu)
      }
      const nativeClick = (selector) => sourceButton(selector)?.click()
      const setNativeSearch = (value) => {
        searchQuery = value
        const input = nativeSearchInput()
        if (!input) return
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
        setter?.call(input, value)
        input.dispatchEvent(new Event("input", { bubbles: true }))
        input.dispatchEvent(new Event("change", { bubbles: true }))
        schedule()
      }
      const closeSearch = (clear = true) => {
        searchPopover?.remove()
        searchPopover = null
        if (clear) setNativeSearch("")
        else searchQuery = ""
      }
      const openSearch = () => {
        if (searchPopover) return closeSearch()
        nativeClick(SEL_SEARCH)
        searchPopover = document.createElement("div")
        searchPopover.className = "dsh-mobile-search-popover"
        const input = document.createElement("input")
        input.className = "dsh-mobile-search-input"
        input.type = "search"
        input.placeholder = tt("search.placeholder")
        input.value = nativeSearchInput()?.value || ""
        input.addEventListener("input", () => setNativeSearch(input.value))
        const close = document.createElement("button")
        close.type = "button"
        close.className = "dsh-mobile-search-close"
        close.setAttribute("aria-label", tt("search.close"))
        close.textContent = "×"
        close.addEventListener("click", closeSearch)
        searchPopover.append(input, close)
        document.body.appendChild(searchPopover)
        input.focus()
      }
      const openNativeItemMenu = (item, entry, kind) => {
        const source = kind === "workspace" ? entry.project : entry.source
        const action = source?.querySelector(SEL_ITEM_MENU)
        if (!action) return
        action.click()
        window.setTimeout(() => {
          const menu = [...document.querySelectorAll('[role="menu"]')].find((node) => !node.classList.contains("dsh-mobile-view-menu"))
          if (!menu) return
          const rect = item.getBoundingClientRect()
          menu.style.position = "fixed"
          menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - menu.getBoundingClientRect().width - 8)) + "px"
          menu.style.top = Math.min(rect.bottom + 4, window.innerHeight - menu.getBoundingClientRect().height - 8) + "px"
          menu.style.zIndex = "76"
        }, 0)
      }
      const chevronSvg = (left) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${left ? '<path d="m15 18-6-6 6-6"/>' : '<path d="m9 18 6-6-6-6"/>'}</svg>`
      let sortCapsule = null
      let sortTarget = null
      let pressTimer = null

      const closeSortCapsule = () => {
        sortCapsule?.remove()
        sortCapsule = null
        sortTarget = null
      }

      const sessionListFor = (data) => (currentView().groupBy !== "workspace" ? (data.groups || []).flatMap((group) => group.sessions) : data.selectedGroup?.sessions || [])

      const workspaceDraggable = (group) => Boolean(group.project && fiberPropsFor(group.project, (props) => props.drag && typeof props.drag.start === "function"))

      const nextFrame = () => new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)))

      let moving = false

      const moveEntry = async (kind, entry, dir) => {
        if (moving) return
        const data = lastData
        if (!data) return
        moving = true
        try {
          if (kind === "workspace") {
            const groups = data.groups || []
            const index = groups.indexOf(entry)
            const neighbor = groups[index + dir]
            if (!neighbor || !workspaceDraggable(neighbor)) return
            const section = neighbor.source
            if (!section) return
            const startDrag = entry.project ? fiberPropsFor(entry.project, (props) => props.drag && typeof props.drag.start === "function")?.drag : null
            startDrag?.start?.()
            await nextFrame()
            if (!section.isConnected) return
            const fresh = fiberPropsFor(section, (props) => typeof props.onDrop === "function")
            if (!fresh) return
            fresh.onDrop({
              clientY: dir < 0 ? -1 : Number.MAX_SAFE_INTEGER,
              preventDefault() {},
              dataTransfer: { dropEffect: "move" },
              currentTarget: section,
            })
          } else {
            const list = sessionListFor(data)
            const index = list.indexOf(entry)
            const neighbor = list[index + dir]
            if (!neighbor || neighbor.groupKey !== entry.groupKey) return
            const half = dir < 0 ? "before" : "after"
            entry.drag?.start?.()
            await nextFrame()
            const node = neighbor.source
            if (!node || !node.isConnected) return
            const fresh = fiberPropsFor(node, (props) => props.node?.id && typeof props.onOpen === "function")?.drag
            fresh?.drop?.(half)
          }
        } finally {
          moving = false
        }
        schedule()
      }

      const anchorSortCapsule = () => {
        if (!sortCapsule || !sortTarget) return
        const data = lastData
        if (!data) return closeSortCapsule()
        const selector = sortTarget.kind === "workspace" ? `.dsh-mobile-workspace-item[data-key="${sortTarget.key}"]` : `.dsh-mobile-session-item[data-id="${sortTarget.id}"]`
        const item = document.querySelector(selector)
        if (!item) return closeSortCapsule()
        const rect = item.getBoundingClientRect()
        sortCapsule.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - sortCapsule.offsetWidth - 8)) + "px"
        sortCapsule.style.top = Math.min(rect.bottom + 6, window.innerHeight - sortCapsule.offsetHeight - 8) + "px"
        let prevOk = false
        let nextOk = false
        if (sortTarget.kind === "workspace") {
          const groups = data.groups || []
          const index = groups.findIndex((group) => group.key === sortTarget.key)
          prevOk = index > 0 && workspaceDraggable(groups[index - 1])
          nextOk = index >= 0 && index < groups.length - 1 && workspaceDraggable(groups[index + 1])
        } else {
          const list = sessionListFor(data)
          const index = list.findIndex((session) => session.id === sortTarget.id)
          const entry = list[index]
          prevOk = index > 0 && list[index - 1].groupKey === entry?.groupKey && Boolean(list[index - 1].drag)
          nextOk = index >= 0 && index < list.length - 1 && list[index + 1].groupKey === entry?.groupKey && Boolean(list[index + 1].drag)
        }
        const buttons = sortCapsule.querySelectorAll("button")
        buttons[0].disabled = !prevOk
        buttons[1].disabled = !nextOk
      }

      const openSortCapsule = (item, entry, kind) => {
        closeSortCapsule()
        sortTarget = kind === "workspace" ? { kind, key: entry.key } : { kind, id: entry.id }
        sortCapsule = document.createElement("div")
        sortCapsule.className = "dsh-mobile-sort-capsule"
        sortCapsule.setAttribute("role", "toolbar")
        sortCapsule.setAttribute("aria-label", tt("sort.aria"))
        const makeButton = (dir, label) => {
          const button = document.createElement("button")
          button.type = "button"
          button.innerHTML = chevronSvg(dir < 0)
          button.setAttribute("aria-label", label)
          button.addEventListener("click", (event) => {
            event.preventDefault()
            event.stopPropagation()
            const data = lastData
            if (!data || !sortTarget) return
            const current = sortTarget.kind === "workspace" ? data.groupsByKey.get(sortTarget.key) : data.sessionsById.get(sortTarget.id)
            if (current) moveEntry(sortTarget.kind, current, dir)
          })
          return button
        }
        sortCapsule.append(makeButton(-1, tt("sort.prev")), makeButton(1, tt("sort.next")))
        document.body.appendChild(sortCapsule)
        suppressClickUntil = Date.now() + 700
        suppressClickItems.add(item)
        window.setTimeout(() => suppressClickItems.delete(item), 900)
        anchorSortCapsule()
      }

      const bindLongPress = (item, entry, kind) => {
        let startX = 0
        let startY = 0
        let active = false
        item.addEventListener("pointerdown", (event) => {
          if (!mobileActive() || !mobileSettings().longPressDrag) return
          if (event.pointerType !== "touch" && event.button !== 0) return
          startX = event.clientX
          startY = event.clientY
          active = true
          window.clearTimeout(pressTimer)
          pressTimer = window.setTimeout(() => {
            if (!active || !mobileActive()) return
            active = false
            openSortCapsule(item, entry, kind)
          }, 420)
        })
        item.addEventListener("pointermove", (event) => {
          if (!active) return
          if (Math.hypot(event.clientX - startX, event.clientY - startY) > 10) {
            active = false
            window.clearTimeout(pressTimer)
          }
        })
        const stop = () => {
          active = false
          window.clearTimeout(pressTimer)
        }
        item.addEventListener("pointerup", stop)
        item.addEventListener("pointercancel", stop)
      }
      const syncActionIcons = () => {
        if (!shell) return
        const sources = [
          ["new-session", HOST_BUTTON_NEW_SESSION, "action.newSession"],
          ["new-workspace", SEL_ADD_WORKSPACE, "action.addWorkspace"],
          ["search", SEL_SEARCH, "action.search"],
          ["view", SEL_VIEW_OPTIONS, "action.viewOptions"],
          ["settings", HOST_BUTTON_SETTINGS, "action.settings"],
        ]
        for (const [action, selector, textKey] of sources) {
          const target = shell.querySelector(`.dsh-mobile-action[data-action="${action}"]`)
          if (!target) continue
          const svg = sourceSvg(selector)
          if (svg) target.replaceChildren(svg)
          const liveLabel = sourceButton(selector)?.getAttribute("aria-label")
          const label = liveLabel || tt(textKey)
          target.setAttribute("aria-label", label)
          target.title = label
        }
      }
      const render = () => {
        if (!shell) return
        lastRenderAt = Date.now()
        shell.setAttribute("aria-label", tt("shell.aria"))
        syncConversationHeaderToggle()
        syncImageUpload()
        if (searchPopover) {
          searchPopover.querySelector(".dsh-mobile-search-input").placeholder = tt("search.placeholder")
          searchPopover.querySelector(".dsh-mobile-search-close").setAttribute("aria-label", tt("search.close"))
        }
        if (sortCapsule) {
          sortCapsule.setAttribute("aria-label", tt("sort.aria"))
          const buttons = sortCapsule.querySelectorAll("button")
          buttons[0]?.setAttribute("aria-label", tt("sort.prev"))
          buttons[1]?.setAttribute("aria-label", tt("sort.next"))
        }
        const currentId = ctx?.sessions?.list?.getSnapshot?.()?.current ?? null
        if (lastSessionId !== null && currentId !== lastSessionId) suppressFocusUntil = Math.max(suppressFocusUntil, Date.now() + 900)
        lastSessionId = currentId
        const logo = shell.querySelector('.dsh-mobile-logo')
        const logoSvg = sourceSvg(HOST_BUTTON_BRAND)
        if (logo && logoSvg) {
          logoSvg.setAttribute("viewBox", "0 0 24 24")
          logoSvg.setAttribute("width", "24")
          logoSvg.setAttribute("height", "24")
          logo.replaceChildren(logoSvg)
        }
        syncActionIcons()
        const data = readNative()
        lastData = data
        const flat = currentView().groupBy !== "workspace"
        shell.dataset.flat = flat ? "1" : "0"
        document.body.classList.toggle("dsh-mobile-flat", flat)
        workspaceWrap.hidden = flat
        workspaceScroll.replaceChildren()
        if (!flat) for (const entry of data.groups) {
          const item = makeItem(entry, "workspace")
          workspaceScroll.appendChild(item)
          bindLongPress(item, entry, "workspace")
        }
        sessionScroll.replaceChildren()
        const query = searchQuery.trim().toLowerCase()
        const sessionEntries = (flat ? data.groups.flatMap((entry) => entry.sessions) : data.selectedGroup?.sessions || []).filter((entry) => !query || (entry.title + " " + entry.time).toLowerCase().includes(query))
        if (sessionEntries.length) {
          for (const entry of sessionEntries) {
            const item = makeItem(entry, "session")
            sessionScroll.appendChild(item)
            bindLongPress(item, entry, "session")
          }
        } else {
          const empty = document.createElement("span")
          empty.className = "dsh-mobile-empty"
          empty.textContent = tt("empty.sessions")
          sessionScroll.appendChild(empty)
        }
        onWorkspaceScroll?.()
        onSessionScroll?.()
        anchorSortCapsule()
        window.dispatchEvent(new Event("dsh-mobile-shell-rendered"))
      }
      const buildShell = () => {
        shell = document.createElement("div")
        shell.className = "dsh-mobile-shell"
        shell.setAttribute("role", "region")
        shell.setAttribute("aria-label", tt("shell.aria"))
        const controls = document.createElement("div")
        controls.className = "dsh-mobile-controls"
        const logo = document.createElement("span")
        logo.className = "dsh-mobile-logo"
        const logoSvg = sourceSvg(HOST_BUTTON_BRAND)
        if (logoSvg) {
          logoSvg.setAttribute("viewBox", "0 0 24 24")
          logoSvg.setAttribute("width", "24")
          logoSvg.setAttribute("height", "24")
          logo.appendChild(logoSvg)
        } else {
          logo.textContent = "◉"
        }
        const headerToggle = makeConversationHeaderToggle()
        controls.append(logo, headerToggle)
        const actions = document.createElement("div")
        actions.className = "dsh-mobile-actions"
        actions.append(
          makeAction("new-session", tt("action.newSession"), HOST_BUTTON_NEW_SESSION, "+"),
          makeAction("new-workspace", tt("action.addWorkspace"), SEL_ADD_WORKSPACE, "+"),
          makeAction("search", tt("action.search"), SEL_SEARCH, "⌕"),
          makeAction("view", tt("action.viewOptions"), SEL_VIEW_OPTIONS, "☷"),
          makeAction("settings", tt("action.settings"), HOST_BUTTON_SETTINGS, "⚙"),
        )
        controls.appendChild(actions)
        shell.appendChild(controls)
        syncConversationHeaderToggle()
        const workspaceRow = makeScrollRow("dsh-mobile-workspaces")
        const sessionRow = makeScrollRow("dsh-mobile-sessions")
        workspaceWrap = workspaceRow.wrap
        workspaceScroll = workspaceRow.scroll
        sessionWrap = sessionRow.wrap
        sessionScroll = sessionRow.scroll
        onWorkspaceScroll = () => updateOverflow(workspaceWrap, workspaceScroll)
        onSessionScroll = () => updateOverflow(sessionWrap, sessionScroll)
        workspaceScroll.addEventListener("scroll", onWorkspaceScroll, { passive: true })
        sessionScroll.addEventListener("scroll", onSessionScroll, { passive: true })
        shell.append(workspaceWrap, sessionWrap)
        shell.addEventListener("click", onShellClick)
        shell.addEventListener("pointerdown", (event) => {
          const item = event.target.closest?.(".dsh-mobile-item")
          if (!item) return
          if (suppressClickUntil > Date.now() && suppressClickItems.has(item)) {
            event.preventDefault()
            event.stopPropagation()
            suppressClickUntil = 0
            suppressClickItems.clear()
          }
        }, true)
        document.body.appendChild(shell)
        observeSessionHeight(sessionScroll)
      }
      let workspaceWrap = null
      let workspaceScroll = null
      let sessionWrap = null
      let sessionScroll = null
      let onWorkspaceScroll = null
      let onSessionScroll = null
      const onShellClick = (event) => {
        const action = event.target.closest?.("[data-action]")
        if (!action) return
        if (suppressClickUntil > Date.now() && suppressClickItems.has(action)) {
          event.preventDefault()
          event.stopPropagation()
          suppressClickUntil = 0
          suppressClickItems.clear()
          return
        }
        const name = action.dataset.action
        if (name === "toggle-conversation-header") {
          conversationHeaderExpanded = !conversationHeaderExpanded
          const all = loadSettings()
          saveSettings({ ...all, mobileLayout: { ...all.mobileLayout, headerExpanded: conversationHeaderExpanded } })
          syncConversationHeaderToggle()
          return
        }
        if (name === "item-menu") {
          event.preventDefault()
          event.stopPropagation()
          const kind = action.dataset.kind
          const entry = kind === "workspace" ? lastData?.groupsByKey.get(action.dataset.key) : lastData?.sessionsById.get(action.dataset.id)
          if (entry) openNativeItemMenu(action.closest(".dsh-mobile-item"), entry, kind)
          return
        }
        if (name === "workspace") {
          selectedGroupKey = action.dataset.key
          const group = lastData?.groupsByKey.get(selectedGroupKey)
          if (group?.projectProps?.group?.expanded === false) group.projectProps.onToggle?.()
          render()
          return
        }
        if (name === "session") {
          const entry = lastData?.sessionsById.get(action.dataset.id)
          entry?.source?.click()
          return
        }
        if (name === "new-session") nativeClick(HOST_BUTTON_NEW_SESSION)
        if (name === "new-workspace") nativeClick(SEL_ADD_WORKSPACE)
        if (name === "search") openSearch()
        if (name === "settings") nativeClick(HOST_BUTTON_SETTINGS)
        if (name === "view") {
          if (viewMenu) closeViewMenu()
          else openViewMenu()
        }
        if (name === "view-option") applyViewAction(action.dataset.viewAction)
      }
      const ensureSourceExpanded = (root) => {
        if (!root || !sourceIsCollapsed()) {
          sourceExpandAt = 0
          window.clearTimeout(sourceExpandTimer)
          sourceExpandTimer = null
          return
        }
        if (Date.now() - sourceExpandAt > 900) {
          sourceExpandAt = Date.now()
          sourceToggle()?.click()
        }
        window.clearTimeout(sourceExpandTimer)
        sourceExpandTimer = window.setTimeout(schedule, 900)
      }
      const sync = () => {
        const settings = mobileSettings()
        conversationHeaderExpanded = settings.headerExpanded !== false
        lastMobileSettings = JSON.stringify(settings)
        const active = settings.enabled && window.innerWidth <= 1023
        applyPinchLock(active && settings.noPinchZoom)
        const root = sourceRoot()
        const frame = markHostSemantics().frame
        if (active) {
          if (sourceInitiallyCollapsed === null && root) sourceInitiallyCollapsed = sourceIsCollapsed()
          ensureSourceExpanded(root)
          if (!shell) buildShell()
          if (activeFrame && activeFrame !== frame) activeFrame.classList.remove("dsh-mobile-frame", "dsh-mobile-sidebar-compat")
          activeFrame = frame
          frame?.classList.add("dsh-mobile-frame")
          frame?.classList.toggle("dsh-mobile-sidebar-compat", settings.sidebarCompat)
          document.body.classList.add("dsh-mobile-active")
          document.body.classList.toggle("dsh-mobile-sidebar-compat", settings.sidebarCompat)
          render()
          syncImageUpload()
        } else {
          if (sourceInitiallyCollapsed && root && !sourceIsCollapsed()) sourceToggle()?.click()
          sourceInitiallyCollapsed = null
          window.clearTimeout(sourceExpandTimer)
          sourceExpandTimer = null
          activeFrame?.classList.remove("dsh-mobile-frame", "dsh-mobile-sidebar-compat")
          activeFrame = null
          document.body.classList.remove("dsh-mobile-active", "dsh-mobile-sidebar-compat", "dsh-mobile-flat", "dsh-conversation-header-collapsed")
          closeViewMenu()
          closeSearch(false)
          closeSortCapsule()
          removeImageUpload()
          if (workspaceScroll && onWorkspaceScroll) workspaceScroll.removeEventListener("scroll", onWorkspaceScroll)
          if (sessionScroll && onSessionScroll) sessionScroll.removeEventListener("scroll", onSessionScroll)
          onWorkspaceScroll = null
          onSessionScroll = null
          stopSessionHeightObserver()
          shell?.remove()
          shell = null
        }
      }
      const schedule = () => {
        if (raf !== null) return
        raf = window.requestAnimationFrame(() => {
          raf = null
          sync()
        })
      }
      let watchedSource = null
      const observeSource = () => {
        const column = sidebarColumnNode()
        if (column === watchedSource) return
        sourceObserver?.disconnect()
        watchedSource = column
        if (column) sourceObserver?.observe(column, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-selected", "aria-expanded", "aria-label"] })
      }
      let watchingFrame = null
      const bootObserver = new MutationObserver(() => attachFrameObserver())
      const attachFrameObserver = () => {
        if (!observer) return
        const frame = markHostSemantics().frame
        if (frame === watchingFrame) return
        observer.disconnect()
        watchingFrame = frame
        if (frame) {
          observer.observe(frame, { childList: true, subtree: true })
          observeSource()
          schedule()
        } else if (document.body) {
          bootObserver.observe(document.body, { childList: true })
        }
      }
      observer = new MutationObserver((records) => {
        if (watchingFrame && !watchingFrame.isConnected) {
          attachFrameObserver()
          return
        }
        markHostSemantics()
        if (sidebarColumnNode() !== watchedSource) observeSource()
        if (composerBarNode() !== imageComposer) syncImageUpload()
        schedule()
      })
      sourceObserver = new MutationObserver(() => schedule())
      attachFrameObserver()
      if (document.body) bootObserver.observe(document.body, { childList: true })
      const stopSessions = ctx.sessions.list.subscribe(() => schedule())
      const onDocumentClick = (event) => {
        const menuItem = event.target.closest?.('[role="menuitem"]')
        if (menuItem && ['viewWorkspace', 'viewFlat', 'orderManual', 'orderUpdated'].some((key) => matchesHostText(menuItem.textContent, key))) {
          workspaceMutationVersion += 1
          window.setTimeout(syncCurrentSettings, 0)
        }
        if (viewMenu && !viewMenu.contains(event.target) && !event.target.closest?.('[data-action="view"]')) closeViewMenu()
        if (searchPopover && !searchPopover.contains(event.target) && !event.target.closest?.('[data-action="search"]')) closeSearch()
        if (sortCapsule && !sortCapsule.contains(event.target) && !event.target.closest?.(".dsh-mobile-item")) closeSortCapsule()
      }
      const onChange = () => {
        const next = JSON.stringify(mobileSettings())
        if (next === lastMobileSettings) return
        lastMobileSettings = next
        syncCss()
        schedule()
      }
      const onLocaleChange = () => {
        if (viewMenu) openViewMenu()
        schedule()
      }
      const onContextMenu = (event) => {
        if (event.target.closest?.(".dsh-mobile-item")) event.preventDefault()
      }
      const onPointerDownArm = (event) => {
        if (!mobileActive()) return
        if (event.target.closest?.('.dsh-mobile-item[data-action="session"], [role="treeitem"][aria-selected]')) suppressFocusUntil = Date.now() + 1500
      }
      const onFocusIn = (event) => {
        if (!mobileActive() || !mobileSettings().noAutoFocus) return
        if (Date.now() > suppressFocusUntil) return
        const target = event.target
        if ((target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) && composerBarNode()?.contains(target)) target.blur()
      }
      document.addEventListener("click", onDocumentClick, true)
      document.addEventListener("contextmenu", onContextMenu)
      document.addEventListener("pointerdown", onPointerDownArm, true)
      document.addEventListener("focusin", onFocusIn, true)
      window.addEventListener(CHANGE, onChange)
      window.addEventListener(LOCALE_CHANGE, onLocaleChange)
      window.addEventListener("resize", schedule)
      sync()
      return () => {
        window.clearTimeout(pressTimer)
        closeSortCapsule()
        observer.disconnect()
        bootObserver.disconnect()
        sourceObserver?.disconnect()
        stopSessions()
        document.removeEventListener("click", onDocumentClick, true)
        document.removeEventListener("contextmenu", onContextMenu)
        document.removeEventListener("pointerdown", onPointerDownArm, true)
        document.removeEventListener("focusin", onFocusIn, true)
        window.removeEventListener(CHANGE, onChange)
        window.removeEventListener(LOCALE_CHANGE, onLocaleChange)
        window.removeEventListener("resize", schedule)
        window.clearTimeout(sourceExpandTimer)
        window.clearTimeout(conversationHeaderMeasureTimer)
        if (raf !== null) window.cancelAnimationFrame(raf)
        if (sourceInitiallyCollapsed) {
          const root = sourceRoot()
          if (root && !sourceIsCollapsed()) sourceToggle()?.click()
        }
        activeFrame?.classList.remove("dsh-mobile-frame", "dsh-mobile-sidebar-compat")
        document.body.classList.remove("dsh-mobile-active", "dsh-mobile-sidebar-compat", "dsh-mobile-flat", "dsh-conversation-header-collapsed")
        closeViewMenu()
        closeSearch(false)
        removeImageUpload()
        stopSessionHeightObserver()
        if (workspaceScroll && onWorkspaceScroll) workspaceScroll.removeEventListener("scroll", onWorkspaceScroll)
        if (sessionScroll && onSessionScroll) sessionScroll.removeEventListener("scroll", onSessionScroll)
        onWorkspaceScroll = null
        onSessionScroll = null
        shell?.remove()
        shell = null
        applyPinchLock(false)
        style.remove()
      }
    }


    function startFontScale() {
      const original = new Map()
      const pendingNodes = new Set()
      let mutationRaf = null
      let applying = false
      let appliedRatio = 100
      const clamp = (value) => Math.min(200, Math.max(10, Math.round(Number(value) || 100)))
      const currentScale = () => {
        const settings = loadSettings().fontScale
        if (!settings.enabled) return 100
        if (window.innerWidth <= 1023) return clamp(settings.mobile)
        return clamp(settings.desktop)
      }
      const restore = () => {
        for (const [element, state] of original) {
          if (!element.isConnected) continue
          for (const [property, value] of Object.entries(state.inline)) {
            if (value.value) element.style.setProperty(property, value.value, value.priority)
            else element.style.removeProperty(property)
          }
        }
        original.clear()
        appliedRatio = 100
      }
      const collect = (roots) => {
        const elements = new Set()
        for (const root of roots) {
          if (!root || root.nodeType !== 1) continue
          if (!root.matches("script,style,svg,br")) elements.add(root)
          for (const element of root.querySelectorAll("*:not(script):not(style):not(svg):not(br)")) elements.add(element)
        }
        return [...elements].map((element) => {
          const computed = getComputedStyle(element)
          return {
            element,
            fontSize: parseFloat(computed.fontSize),
            lineHeight: computed.lineHeight === "normal" ? 0 : parseFloat(computed.lineHeight),
            padding: [computed.paddingTop, computed.paddingRight, computed.paddingBottom, computed.paddingLeft].map(parseFloat),
          }
        })
      }
      const applyElements = (elements, ratio, added = false) => {
        const paddingNames = ["padding-top", "padding-right", "padding-bottom", "padding-left"]
        for (const { element, fontSize, lineHeight, padding } of elements) {
          let state = original.get(element)
          if (!state) {
            if (!Number.isFinite(fontSize) || fontSize <= 0) continue
            const parent = element.parentElement
            const parentFontSize = parent ? parseFloat(getComputedStyle(parent).fontSize) : 0
            const inheritedFont = added && !element.style.getPropertyValue("font-size") && Math.abs(parentFontSize - fontSize) < 0.01
            state = {
              inline: {
                "font-size": { value: element.style.getPropertyValue("font-size"), priority: element.style.getPropertyPriority("font-size") },
              },
              base: {
                fontSize: added ? (inheritedFont ? fontSize * 100 / appliedRatio : fontSize) : fontSize * 100 / appliedRatio,
                lineHeight: Number.isFinite(lineHeight) && lineHeight > 0 ? (added && !inheritedFont ? lineHeight : lineHeight * 100 / appliedRatio) : 0,
                padding: padding.map((value) => Number.isFinite(value) ? (added ? value : value * 100 / appliedRatio) : 0),
              },
            }
            original.set(element, state)
          }
          element.style.setProperty("font-size", `${Math.max(1, Math.round(state.base.fontSize * ratio) / 100)}px`)
          if (state.base.lineHeight > 0) {
            if (!state.inline["line-height"]) state.inline["line-height"] = { value: element.style.getPropertyValue("line-height"), priority: element.style.getPropertyPriority("line-height") }
            element.style.setProperty("line-height", `${Math.max(1, Math.round(state.base.lineHeight * ratio) / 100)}px`)
          }
          if (state.base.padding.some((value) => value > 0)) {
            for (let index = 0; index < paddingNames.length; index += 1) {
              const property = paddingNames[index]
              if (!state.inline[property]) state.inline[property] = { value: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property) }
              element.style.setProperty(property, `${Math.max(0, Math.round(state.base.padding[index] * ratio) / 100)}px`)
            }
          }
        }
      }
      const apply = () => {
        if (applying || !document.body) return
        applying = true
        const ratio = currentScale()
        if (ratio === appliedRatio) {
          applying = false
          return
        }
        if (ratio === 100) {
          restore()
          applying = false
          return
        }
        const elements = collect([document.body])
        const live = new Set(elements.map(({ element }) => element))
        for (const element of original.keys()) if (!live.has(element)) original.delete(element)
        applyElements(elements, ratio)
        appliedRatio = ratio
        applying = false
      }
      const flushAdded = () => {
        mutationRaf = null
        if (applying || appliedRatio === 100 || pendingNodes.size === 0) {
          pendingNodes.clear()
          return
        }
        const nodes = [...pendingNodes]
        pendingNodes.clear()
        applying = true
        applyElements(collect(nodes), appliedRatio, true)
        applying = false
      }
      const refreshShell = () => {
        if (applying || appliedRatio === 100) return
        const shell = document.querySelector('.dsh-mobile-shell')
        if (!shell) return
        applying = true
        applyElements(collect([shell]), appliedRatio, true)
        applying = false
      }
      const observer = new MutationObserver((records) => {
        if (applying || appliedRatio === 100) return
        for (const record of records) for (const node of record.addedNodes) {
          if (node.nodeType === 1 && !node.closest?.('.dsh-mobile-shell')) pendingNodes.add(node)
        }
        if (pendingNodes.size && mutationRaf === null) mutationRaf = window.requestAnimationFrame(flushAdded)
      })
      if (document.body) observer.observe(document.body, { childList: true, subtree: true })
      window.addEventListener(CHANGE, apply)
      window.addEventListener("resize", apply)
      window.addEventListener("dsh-mobile-shell-rendered", refreshShell)
      apply()
      return () => {
        observer.disconnect()
        window.removeEventListener(CHANGE, apply)
        window.removeEventListener("resize", apply)
        window.removeEventListener("dsh-mobile-shell-rendered", refreshShell)
        if (mutationRaf !== null) window.cancelAnimationFrame(mutationRaf)
        pendingNodes.clear()
        restore()
      }
    }

    function isTwinId(id) {
      return id === "deepseek-vision" || (typeof id === "string" && id.endsWith("-vision"))
    }
    function twinOf(id) {
      if (id === "deepseek-official") return "deepseek-vision"
      if (isTwinId(id) || id === "vision-http" || id === "vision-chain") return null
      return `${id}-vision`
    }
    function nestGroups(groups) {
      const byId = new Map(groups.map((group) => [group.id, group]))
      const out = []
      for (const group of groups) {
        if (isTwinId(group.id) || group.id === "vision-http" || group.id === "vision-chain") continue
        const twin = byId.get(twinOf(group.id))
        const twinIds = new Set((twin?.models || []).map((model) => model.id))
        out.push({
          ...group,
          models: group.models.map((model) => ({
            ...model,
            visionProvider: twin && twinIds.has(model.id) ? twin.id : null,
          })),
        })
      }
      return out
    }

    function useModelPickerSettings() {
      const [picker, setPicker] = React.useState(() => loadSettings().modelPicker)
      React.useEffect(() => {
        const sync = () => setPicker(loadSettings().modelPicker)
        window.addEventListener(CHANGE, sync)
        window.addEventListener(LOCALE_CHANGE, sync)
        return () => {
          window.removeEventListener(CHANGE, sync)
          window.removeEventListener(LOCALE_CHANGE, sync)
        }
      }, [])
      return picker
    }

    function ModelPickerPanel({ t, settings, groups, selected, current, status, onClose, onPick, query, setQuery, provider, setProvider }) {
      const searchRef = React.useRef(null)
      const providersRef = React.useRef(null)
      const [overflow, setOverflow] = React.useState({ left: false, right: false })
      React.useEffect(() => {
        searchRef.current?.focus()
      }, [])
      const updateOverflow = React.useCallback(() => {
        const el = providersRef.current
        if (!el) return
        const max = Math.max(0, el.scrollWidth - el.clientWidth)
        setOverflow({
          left: el.scrollLeft > 2,
          right: max - el.scrollLeft > 2,
        })
      }, [])
      React.useEffect(() => {
        updateOverflow()
        const el = providersRef.current
        if (!el) return
        const ro = new ResizeObserver(updateOverflow)
        ro.observe(el)
        const onProviderWheel = (event) => {
          const max = Math.max(0, el.scrollWidth - el.clientWidth)
          if (max === 0) return
          const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
          const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientWidth : 1
          const next = Math.max(0, Math.min(max, el.scrollLeft + raw * unit))
          if (next === el.scrollLeft) return
          event.preventDefault()
          el.scrollLeft = next
          updateOverflow()
        }
        el.addEventListener("wheel", onProviderWheel, { passive: false })
        window.addEventListener("resize", updateOverflow)
        return () => {
          ro.disconnect()
          el.removeEventListener("wheel", onProviderWheel)
          window.removeEventListener("resize", updateOverflow)
        }
      }, [updateOverflow, groups, settings.providers])
      const q = query.trim().toLowerCase()
      const visible = groups
        .filter((group) => provider === "all" || group.id === provider)
        .map((group) => ({
          ...group,
          models: group.models.filter((model) => {
            if (!q) return true
            return `${group.name} ${model.name} ${model.id}`.toLowerCase().includes(q)
          }),
        }))
        .filter((group) => group.models.length)
      let selectedModel = null
      for (const group of groups) {
        for (const model of group.models) {
          const route = selected && (selected.provider === group.id || selected.provider === model.visionProvider)
          if (route && model.id === selected.model) selectedModel = { group, model }
        }
      }
      const efforts = selectedModel?.model.reasoning?.efforts || []
      const currentEffort = current && selected && current.provider === selected.provider && current.model === selected.model
        ? current.reasoningEffort || selectedModel?.model.reasoning?.defaultEffort
        : selectedModel?.model.reasoning?.defaultEffort
      return h("div", { className: "mpo-root" },
        h("div", { className: "mpo-dim", onClick: onClose }),
        h("div", { className: "mpo-panel", role: "dialog", "aria-label": t("picker.title") },
          h("div", { className: "mpo-head" },
            h("h2", { className: "mpo-title" }, t("picker.title")),
            h("input", {
              ref: searchRef,
              className: "mpo-search",
              type: "search",
              hidden: !settings.search,
              placeholder: t("picker.searchPlaceholder"),
              value: query,
              onChange: (event) => setQuery(event.target.value),
            }),
            h("button", { type: "button", className: "mpo-close", "aria-label": t("picker.close"), onClick: onClose }, "×"),
          ),
          h("div", {
            className: "mpo-providers-wrap",
            hidden: !settings.providers,
            "data-overflow-left": overflow.left ? "1" : "0",
            "data-overflow-right": overflow.right ? "1" : "0",
          },
            h("div", { ref: providersRef, className: "mpo-providers", onScroll: updateOverflow },
              h("button", { type: "button", className: "mpo-chip", "data-on": provider === "all" ? "1" : "0", onClick: () => setProvider("all") }, t("picker.all")),
              groups.map((group) => h("button", {
                key: group.id,
                type: "button",
                className: "mpo-chip",
                "data-on": provider === group.id ? "1" : "0",
                onClick: () => setProvider(group.id),
              }, group.name)),
            ),
          ),
          h("div", { className: "mpo-grid" },
            visible.length
              ? visible.flatMap((group) => group.models.map((model) => {
                const on = selected && selected.provider === group.id && selected.model === model.id
                const visionOn = Boolean(model.visionProvider && selected && selected.provider === model.visionProvider && selected.model === model.id)
                return h("button", {
                  key: group.id + ":" + model.id,
                  type: "button",
                  className: "mpo-card",
                  "data-on": on ? "1" : "0",
                  onClick: () => {
                    const effort = model.reasoning?.defaultEffort
                    onPick({
                      provider: group.id,
                      model: model.id,
                      ...effort ? { reasoningEffort: effort } : {},
                    })
                  },
                },
                  h("span", { className: "mpo-card-main" },
                    h("span", { className: "mpo-card-name" }, model.name),
                    h("span", { className: "mpo-card-meta" }, group.name),
                  ),
                  model.visionProvider
                    ? h("span", {
                      className: "mpo-card-vision",
                      role: "button",
                      "data-on": visionOn ? "1" : "0",
                      "aria-label": t("picker.vision"),
                      onClick: (event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        onPick({ provider: model.visionProvider, model: model.id })
                      },
                    })
                    : null,
                )
              }))
              : h("div", { className: "mpo-empty" }, t(status === "loading" ? "picker.loading" : "picker.noMatch")),
          ),
          h("div", { className: "mpo-foot", hidden: !settings.efforts },
            h("div", { className: "mpo-foot-label" }, t("picker.effortLabel")),
            h("div", { className: "mpo-efforts" },
              !selectedModel || efforts.length === 0
                ? h("button", { type: "button", className: "mpo-effort", disabled: true }, t("picker.noEffort"))
                : efforts.map((effort) => h("button", {
                  key: effort.id,
                  type: "button",
                  className: "mpo-effort",
                  "data-on": currentEffort === effort.id ? "1" : "0",
                  onClick: () => {
                    if (!selected) return
                    onPick({
                      provider: selected.provider,
                      model: selected.model,
                      reasoningEffort: effort.id,
                    })
                  },
                }, effort.name || effort.id)),
            ),
          ),
        ),
      )
    }

    function ModelPickerSeat({ locked, available, directory, load, select, t }) {
      const settings = useModelPickerSettings()
      const state = React.useSyncExternalStore(
        (fn) => directory.subscribe(fn),
        () => directory.getSnapshot(),
      )
      const [open, setOpen] = React.useState(false)
      const [query, setQuery] = React.useState("")
      const [provider, setProvider] = React.useState("all")
      const [preview, setPreview] = React.useState(null)
      const close = () => {
        setOpen(false)
        setQuery("")
        setProvider("all")
        setPreview(null)
      }
      React.useEffect(() => {
        if (available) load()
      }, [available, load])
      React.useEffect(() => {
        if (!open) return
        const onKey = (event) => {
          if (event.key === "Escape") close()
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
      }, [open])
      if (!available) return null
      const groups = nestGroups(state.groups || [])
      const current = state.current
      const selected = preview || (current && { provider: current.provider, model: current.model, reasoningEffort: current.reasoningEffort })
      let currentChoice = null
      for (const group of state.groups || []) {
        for (const model of group.models || []) {
          if (current?.provider === group.id && current.model === model.id) currentChoice = { group, model }
        }
      }
      const modelLabel = currentChoice?.model.name ?? t("picker.title")
      const reasoning = currentChoice?.model.reasoning
      const effectiveEffort = current?.reasoningEffort ?? reasoning?.defaultEffort
      const effortLabel = reasoning === void 0 ? void 0 : (reasoning.efforts.find((level) => level.id === effectiveEffort)?.name ?? effectiveEffort)
      const triggerLabel = effortLabel === void 0 ? modelLabel : `${modelLabel} · ${effortLabel}`
      const pick = async (selection) => {
        setPreview({ provider: selection.provider, model: selection.model, reasoningEffort: selection.reasoningEffort })
        await select(selection)
        if (loadSettings().modelPicker.closeOnPick) close()
      }
      return h("div", { className: "dsh-bux-model-root", "data-open": open ? "1" : "0" },
        h("button", {
          type: "button",
          className: "dsh-bux-model-trigger",
          disabled: locked,
          "aria-haspopup": "dialog",
          "aria-expanded": open,
          "aria-label": t("picker.title"),
          title: triggerLabel,
          onClick: () => {
            if (open) {
              close()
              return
            }
            load()
            setPreview(current && { provider: current.provider, model: current.model, reasoningEffort: current.reasoningEffort })
            setOpen(true)
          },
        },
          h("span", { className: "dsh-bux-model-label" }, modelLabel),
          effortLabel !== void 0 ? h("span", { className: "dsh-bux-model-effort" }, effortLabel) : null,
          h("svg", { className: "dsh-bux-model-chevron", viewBox: "0 0 14 14", width: 14, height: 14, fill: "none", stroke: "currentColor", strokeWidth: 1.5, "aria-hidden": true },
            h("path", { d: "m3 5 4 4 4-4" }),
          ),
        ),
        open ? ReactDOM.createPortal(h(ModelPickerPanel, {
          t,
          settings,
          groups,
          selected,
          current,
          status: state.status,
          onClose: close,
          onPick: pick,
          query,
          setQuery,
          provider,
          setProvider,
        }), document.body) : null,
      )
    }

    function startModelPicker(ctx) {
      const style = document.createElement("style")
      style.dataset.plugin = "dsh-better-ux-picker"
      style.textContent = PICKER_CSS
      document.head.appendChild(style)
      let stopInject = null
      const sync = () => {
        const on = loadSettings().modelPicker.enabled
        if (on && !stopInject) {
          stopInject = ctx.slots.inject("conversation.input.model", () => ctx.slots.register({
            name: "conversation.input.model",
            priority: -1,
            locale: NS,
            inject: (sessionId) => {
              const directory = ctx.modelDirectories.directoryFor(sessionId)
              const available = ctx.sessions.subagentAddress(sessionId) === void 0
              return {
                available,
                directory: directory.store,
                load: () => {
                  if (available) directory.load().catch(() => {})
                },
                select: (selection) => available ? directory.select(selection).then(() => true, () => false) : Promise.resolve(false),
              }
            },
          }, ModelPickerSeat))
        } else if (!on && stopInject) {
          stopInject()
          stopInject = null
        }
      }
      window.addEventListener(CHANGE, sync)
      sync()
      return () => {
        window.removeEventListener(CHANGE, sync)
        stopInject?.()
        stopInject = null
        style.remove()
      }
    }

    const LEGACY_SUMMARY_CACHE_PREFIX = "dsh-better-ux:summary:v1:"
    const SUMMARY_CACHE_PREFIX = "dsh-better-ux:summary:v2:"
    const DEFAULT_OVERALL_INSTRUCTION = "400个字以内简明扼要总结当前session干了什么"
    const DEFAULT_RECENT_INSTRUCTION = "100个字以内简明扼要总结这轮对话干了什么"
    const SUMMARY_MODELS_CHANGE = "dsh-better-ux-summary-models"
    let SUMMARY_MODEL_CATALOG = { groups: [], status: "idle" }
    let summaryBallLocked = false

    function publishSummaryModels(state) {
      SUMMARY_MODEL_CATALOG = { groups: state.groups || [], status: state.status || "idle" }
      window.dispatchEvent(new Event(SUMMARY_MODELS_CHANGE))
    }

    function useSummaryModelCatalog() {
      const [catalog, setCatalog] = React.useState(SUMMARY_MODEL_CATALOG)
      React.useEffect(() => {
        const sync = () => setCatalog(SUMMARY_MODEL_CATALOG)
        window.addEventListener(SUMMARY_MODELS_CHANGE, sync)
        sync()
        return () => window.removeEventListener(SUMMARY_MODELS_CHANGE, sync)
      }, [])
      return catalog
    }
    const EMPTY_SUMMARY = { overall: "", recent: "", seq: -1, overallSeq: -1, revision: 0, serverRevision: 0, syncOverall: false, syncRecent: false, status: "idle", error: "", usage: null }

    function normalizeSummary(value) {
      return String(value || "").trim().replaceAll("\\n", "\n")
    }

    function normalizeSummaryUsage(value) {
      if (!value || typeof value !== "object") return null
      return {
        inputTokens: Number(value.inputTokens) || 0,
        outputTokens: Number(value.outputTokens) || 0,
        cacheReadTokens: Number(value.cacheReadTokens) || 0,
        cacheWriteTokens: Number(value.cacheWriteTokens) || 0,
      }
    }

    function normalizedSummaryValue(value) {
      return {
        overall: normalizeSummary(value?.overall),
        recent: normalizeSummary(value?.recent),
        seq: Number.isSafeInteger(value?.seq) ? value.seq : -1,
        overallSeq: Number.isSafeInteger(value?.overallSeq) ? value.overallSeq : -1,
        usage: normalizeSummaryUsage(value?.usage),
      }
    }

    function mergeSummaryValues(local, server, fields) {
      const takeLocalOverall = fields.overall && local.overallSeq >= server.overallSeq
      const takeLocalRecent = fields.recent && local.seq >= server.seq
      return {
        value: {
          overall: takeLocalOverall ? local.overall : server.overall,
          overallSeq: takeLocalOverall ? local.overallSeq : server.overallSeq,
          recent: takeLocalRecent ? local.recent : server.recent,
          seq: takeLocalRecent ? local.seq : server.seq,
          usage: takeLocalOverall || takeLocalRecent ? local.usage : server.usage,
        },
        localFields: { overall: takeLocalOverall, recent: takeLocalRecent },
      }
    }

    function resolveSummaryCache(current, value, serverRevision, clearedFields) {
      if (serverRevision < current.serverRevision) return current
      const server = normalizedSummaryValue(value)
      const keepOverall = current.syncOverall && (current.overallSeq > server.overallSeq || (current.overallSeq === server.overallSeq && current.overall !== server.overall))
      const keepRecent = current.syncRecent && (current.seq > server.seq || (current.seq === server.seq && current.recent !== server.recent))
      const resolved = mergeSummaryValues(current, server, { overall: keepOverall, recent: keepRecent }).value
      const changed = current.overall !== resolved.overall || current.recent !== resolved.recent || current.seq !== resolved.seq || current.overallSeq !== resolved.overallSeq
      return {
        ...current,
        ...resolved,
        revision: current.revision + (changed ? 1 : 0),
        serverRevision,
        syncOverall: keepOverall || (current.syncOverall && !clearedFields.overall),
        syncRecent: keepRecent || (current.syncRecent && !clearedFields.recent),
        status: "idle",
        error: "",
      }
    }

    function formatSummaryTokens(value) {
      return value < 1000 ? String(value) : (value / 1000).toFixed(value < 10000 ? 1 : 0) + "K"
    }

    function summaryCacheKey(sessionId) {
      return SUMMARY_CACHE_PREFIX + encodeURIComponent(String(sessionId))
    }

    const summaryDeleteTokens = new Map()

    async function deleteSummaryFromHost(sessionId, knownRevision, token) {
      const stillArchived = () => summaryDeleteTokens.get(sessionId) === token
      let baseRevision = Number.isSafeInteger(knownRevision) && knownRevision > 0 ? knownRevision : null
      try {
        while (stillArchived()) {
          if (baseRevision === null) {
            const stateRes = await fetch(STATE_ROUTE + "?sessionId=" + encodeURIComponent(sessionId))
            if (!stillArchived()) return true
            if (!stateRes.ok) return retryableStatus(stateRes.status) ? false : true
            const state = await stateRes.json().catch(() => ({}))
            if (!state.summary) return true
            baseRevision = state.summary.revision
          }
          if (!stillArchived()) return true
          const res = await fetch(STATE_ROUTE + "?sessionId=" + encodeURIComponent(sessionId) + "&baseRevision=" + baseRevision, { method: "DELETE" })
          if (!stillArchived()) return true
          if (res.ok) return true
          if (res.status !== 409) return retryableStatus(res.status) ? false : true
          const data = await res.json().catch(() => ({}))
          if (!data.current || data.current.deleted) return true
          if (!Number.isSafeInteger(data.current.revision)) return false
          baseRevision = data.current.revision
        }
        return true
      } catch {
        return false
      }
    }

    function clearSummary(sessionId) {
      const key = String(sessionId || "")
      const cached = key ? loadSummary(key) : null
      try { localStorage.removeItem(summaryCacheKey(sessionId)) } catch {}
      if (key && !summaryDeleteTokens.has(key)) {
        const token = {}
        summaryDeleteTokens.set(key, token)
        const runDelete = async (delay = 1000) => {
          const deleted = await deleteSummaryFromHost(key, cached?.serverRevision, token)
          if (!deleted && summaryDeleteTokens.get(key) === token) {
            window.setTimeout(() => {
              if (summaryDeleteTokens.get(key) === token) runDelete(Math.min(30000, delay * 2))
            }, delay)
          }
        }
        runDelete()
      }
    }

    function startSummaryArchiveCleanup(ctx) {
      try {
        for (let index = localStorage.length - 1; index >= 0; index -= 1) {
          const key = localStorage.key(index)
          if (key?.startsWith(LEGACY_SUMMARY_CACHE_PREFIX)) localStorage.removeItem(key)
        }
      } catch {}
      const clearArchived = () => {
        const archived = new Set(ctx.workspaces.list.getSnapshot()?.archivedSessionIds || [])
        for (const sessionId of summaryDeleteTokens.keys()) {
          if (!archived.has(sessionId)) summaryDeleteTokens.delete(sessionId)
        }
        for (const sessionId of archived) clearSummary(sessionId)
      }
      clearArchived()
      const unsubscribe = ctx.workspaces.list.subscribe(clearArchived)
      return () => {
        unsubscribe()
        summaryDeleteTokens.clear()
      }
    }

    function loadSummary(sessionId) {
      try {
        const value = JSON.parse(localStorage.getItem(summaryCacheKey(sessionId)) || "{}")
        return {
          overall: normalizeSummary(value.overall),
          recent: normalizeSummary(value.recent),
          seq: Number.isSafeInteger(value.seq) ? value.seq : -1,
          overallSeq: Number.isSafeInteger(value.overallSeq) ? value.overallSeq : Number.isSafeInteger(value.seq) ? value.seq : -1,
          revision: Number.isSafeInteger(value.revision) && value.revision >= 0 ? value.revision : 0,
          serverRevision: Number.isSafeInteger(value.serverRevision) && value.serverRevision >= 0 ? value.serverRevision : 0,
          syncOverall: value.syncOverall === true,
          syncRecent: value.syncRecent === true,
          status: "idle",
          error: "",
          usage: normalizeSummaryUsage(value.usage),
        }
      } catch {
        return { ...EMPTY_SUMMARY }
      }
    }

    function storeSummary(sessionId, value) {
      try {
        localStorage.setItem(summaryCacheKey(sessionId), JSON.stringify({
          overall: normalizeSummary(value.overall),
          recent: normalizeSummary(value.recent),
          seq: Number.isSafeInteger(value.seq) ? value.seq : -1,
          overallSeq: Number.isSafeInteger(value.overallSeq) ? value.overallSeq : -1,
          revision: Number.isSafeInteger(value.revision) && value.revision >= 0 ? value.revision : 0,
          serverRevision: Number.isSafeInteger(value.serverRevision) && value.serverRevision >= 0 ? value.serverRevision : 0,
          syncOverall: value.syncOverall === true,
          syncRecent: value.syncRecent === true,
          usage: normalizeSummaryUsage(value.usage),
        }))
      } catch {}
    }

    async function migrateCachedSummariesToHostUnlocked() {
      const sessionIds = []
      try {
        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index)
          if (!key?.startsWith(SUMMARY_CACHE_PREFIX)) continue
          try { sessionIds.push(decodeURIComponent(key.slice(SUMMARY_CACHE_PREFIX.length))) } catch {}
        }
      } catch {}
      for (const sessionId of sessionIds) {
        const local = loadSummary(sessionId)
        if (!local.overall && !local.recent) continue
        const saveResolved = (value, serverRevision, clearedFields = { overall: true, recent: true }) => {
          storeSummary(sessionId, resolveSummaryCache(loadSummary(sessionId), value, serverRevision, clearedFields))
        }
        try {
          const stateRes = await fetch(STATE_ROUTE + "?sessionId=" + encodeURIComponent(sessionId))
          if (!stateRes.ok) continue
          const state = await stateRes.json().catch(() => ({}))
          let baseRevision = state.summary?.revision ?? (Number.isSafeInteger(state.summaryRevision) ? state.summaryRevision : 0)
          let fields = { overall: true, recent: true }
          let candidate = normalizedSummaryValue(local)
          if (state.summary?.value) {
            const server = normalizedSummaryValue(state.summary.value)
            fields = {
              overall: local.syncOverall || local.overallSeq > server.overallSeq,
              recent: local.syncRecent || local.seq > server.seq,
            }
            if (!fields.overall && !fields.recent) {
              saveResolved(server, baseRevision)
              continue
            }
            const merged = mergeSummaryValues(local, server, fields)
            candidate = merged.value
            fields = merged.localFields
          } else {
            const dirty = local.syncOverall || local.syncRecent
            if (baseRevision > local.serverRevision) {
              try { localStorage.removeItem(summaryCacheKey(sessionId)) } catch {}
              continue
            }
            fields = baseRevision === 0
              ? { overall: true, recent: true }
              : { overall: local.syncOverall, recent: local.syncRecent }
            candidate = mergeSummaryValues(local, normalizedSummaryValue(null), fields).value
          }
          const requestedFields = { ...fields }
          while (true) {
            const patchRes = await fetch(STATE_ROUTE, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ kind: "summary", sessionId, baseRevision, value: candidate }),
            })
            const data = await patchRes.json().catch(() => ({}))
            if (patchRes.ok) {
              const record = data.summary || data
              saveResolved(candidate, Number.isSafeInteger(record?.revision) ? record.revision : baseRevision + 1, requestedFields)
              break
            }
            if (patchRes.status !== 409) break
            const currentRecord = data.current || data.summary || data
            if (!currentRecord || !Number.isSafeInteger(currentRecord.revision)) break
            if (currentRecord.deleted && currentRecord.revision > local.serverRevision) {
              try { localStorage.removeItem(summaryCacheKey(sessionId)) } catch {}
              break
            }
            const server = normalizedSummaryValue(currentRecord.value)
            const merged = mergeSummaryValues(loadSummary(sessionId), server, fields)
            candidate = merged.value
            fields = merged.localFields
            baseRevision = currentRecord.revision
            if (candidate.overall === server.overall && candidate.recent === server.recent && candidate.seq === server.seq && candidate.overallSeq === server.overallSeq) {
              saveResolved(server, baseRevision, requestedFields)
              break
            }
          }
        } catch {}
      }
    }

    async function migrateCachedSummariesToHost() {
      if (navigator.locks?.request) return navigator.locks.request("dsh-better-ux:summary-migration", migrateCachedSummariesToHostUnlocked)
      return migrateCachedSummariesToHostUnlocked()
    }

    function useConversationSummarySettings() {
      const [settings, setSettings] = React.useState(() => loadSettings().conversationSummary)
      React.useEffect(() => {
        const sync = () => setSettings(loadSettings().conversationSummary)
        window.addEventListener(CHANGE, sync)
        window.addEventListener(LOCALE_CHANGE, sync)
        return () => {
          window.removeEventListener(CHANGE, sync)
          window.removeEventListener(LOCALE_CHANGE, sync)
        }
      }, [])
      return settings
    }

    function useSummaryGeometry() {
      const stableBodyRect = React.useRef(null)
      const [geometry, setGeometry] = React.useState(() => ({
        top: 64,
        bodyLeft: 16,
        bodyWidth: Math.max(280, window.innerWidth - 32),
        contentLeft: 16,
        contentWidth: Math.max(280, window.innerWidth - 32),
        centerLeft: 0,
        leftWidth: 0,
        viewportBottom: (window.visualViewport?.offsetTop || 0) + (window.visualViewport?.height || window.innerHeight),
        mobile: window.innerWidth < 768,
      }))
      React.useLayoutEffect(() => {
        let frame = 0
        const measure = () => {
          frame = 0
          const center = slotNode("conversation")?.parentElement
          const composer = composerTextareaNode()
          const header = slotNode("conversation.session.header")?.querySelector("header")
          const mobileShell = document.querySelector(".dsh-mobile-shell")
          const centerRect = center?.getBoundingClientRect()
          const composerRect = composer?.getBoundingClientRect()
          const headerRect = header?.getBoundingClientRect()
          const shellRect = mobileShell?.getBoundingClientRect()
          const mobile = window.innerWidth < 768
          const viewportBottom = Math.round((window.visualViewport?.offsetTop || 0) + (window.visualViewport?.height || window.innerHeight))
          const centerLeft = Math.max(0, centerRect?.left || 0)
          const centerWidth = Math.max(280, centerRect?.width || window.innerWidth)
          const fallbackInset = mobile ? 12 : Math.max(24, Math.round(centerWidth * .16))
          const centerStyle = center ? getComputedStyle(center) : null
          const composerClearance = parseFloat(centerStyle?.getPropertyValue("--dsh-composer-side-clearance")) || 0
          const contentRect = document.querySelector("[data-chat-flow]")?.getBoundingClientRect()
          const availableWidth = Math.max(0, centerWidth - Math.max(mobile ? 24 : 32, composerClearance * 2))
          const contentGutter = Math.max(0, composerClearance - 1)
          const measuredBody = composerRect?.width
            ? { left: composerRect.left, width: composerRect.width }
            : contentRect?.width
              ? { left: contentRect.left - contentGutter, width: contentRect.width + contentGutter * 2 }
              : null
          if (measuredBody) stableBodyRect.current = measuredBody
          const fallbackWidth = stableBodyRect.current?.width || centerWidth - fallbackInset * 2
          const bodyWidth = Math.max(0, Math.round(Math.min(measuredBody?.width || fallbackWidth, availableWidth)))
          const bodyLeft = Math.round(measuredBody?.left ?? centerLeft + (centerWidth - bodyWidth) / 2)
          const contentWidth = Math.max(0, Math.round(contentRect?.width || bodyWidth))
          const contentLeft = Math.round(contentRect?.left ?? bodyLeft)
          const visibleHeaderBottom = shellRect?.height ? shellRect.bottom : headerRect?.bottom
          const top = Math.max(8, Math.round((visibleHeaderBottom || 56) + 8))
          const leftWidth = Math.max(0, Math.floor(bodyLeft - centerLeft - 16))
          const next = { top, bodyLeft, bodyWidth, contentLeft, contentWidth, centerLeft, leftWidth, viewportBottom, mobile }
          setGeometry((current) => Object.keys(next).every((key) => current[key] === next[key]) ? current : next)
        }
        const schedule = () => {
          if (frame) return
          frame = requestAnimationFrame(measure)
        }
        const observer = new ResizeObserver(schedule)
        let observedComposer = composerTextareaNode()
        let observedFlow = document.querySelector("[data-chat-flow]")
        const targets = [
          slotNode("conversation")?.parentElement,
          observedComposer,
          observedFlow,
          slotNode("conversation.session.header")?.querySelector("header"),
          document.querySelector(".dsh-mobile-shell"),
        ].filter(Boolean)
        for (const target of targets) observer.observe(target)
        const geometryObserver = new MutationObserver(() => {
          const nextComposer = composerTextareaNode()
          if (nextComposer !== observedComposer) {
            if (observedComposer) observer.unobserve(observedComposer)
            observedComposer = nextComposer
            if (observedComposer) observer.observe(observedComposer)
          }
          const nextFlow = document.querySelector("[data-chat-flow]")
          if (nextFlow !== observedFlow) {
            if (observedFlow) observer.unobserve(observedFlow)
            observedFlow = nextFlow
            if (observedFlow) observer.observe(observedFlow)
          }
          schedule()
        })
        const geometryRoots = new Set([slotNode("conversation")?.parentElement, composerBarNode()?.parentElement || composerBarNode()].filter(Boolean))
        for (const root of geometryRoots) geometryObserver.observe(root, { childList: true, subtree: true })
        window.addEventListener("resize", schedule)
        window.visualViewport?.addEventListener("resize", schedule)
        measure()
        return () => {
          if (frame) cancelAnimationFrame(frame)
          observer.disconnect()
          geometryObserver.disconnect()
          window.removeEventListener("resize", schedule)
          window.visualViewport?.removeEventListener("resize", schedule)
        }
      }, [])
      return geometry
    }

    function SummaryCollapseIcon({ collapsed, line = false }) {
      return h("span", {
        className: "dsh-summary-collapse-mark",
        "data-collapsed": collapsed ? "1" : "0",
        "data-line": line ? "1" : "0",
        "aria-hidden": true,
      }, h(Icons.IconTriangleRightFill14, { size: 14 }))
    }

    function SummaryFoldButton({ tooltip, className = "", children, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }) {
      const [position, setPosition] = React.useState(null)
      const showTooltip = (event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setPosition({ top: rect.bottom + 5, left: Math.max(80, Math.min(window.innerWidth - 80, rect.left + rect.width / 2)) })
      }
      const hideTooltip = () => setPosition(null)
      return h(React.Fragment, null,
        h("button", {
          ...props,
          className: "dsh-summary-icon-btn dsh-summary-fold-btn" + (className ? " " + className : ""),
          onMouseEnter: (event) => { showTooltip(event); onMouseEnter?.(event) },
          onMouseLeave: (event) => { hideTooltip(); onMouseLeave?.(event) },
          onFocus: (event) => { showTooltip(event); onFocus?.(event) },
          onBlur: (event) => { hideTooltip(); onBlur?.(event) },
        }, children),
        position ? ReactDOM.createPortal(h("div", { className: "dsh-summary-tooltip", role: "tooltip", style: position }, tooltip), document.body) : null,
      )
    }

    function SummaryPanel({ summary, settings, mode, style, hasConversation, running, modelControl, modelCollapsed = false, contentCollapsed = false, fieldCollapsed = { overall: false, recent: false }, canGenerate = true, closing = false, onRefresh, onClose, onToggleModel, onToggleContent, onToggleField, onMouseEnter, onMouseLeave }) {
      const loading = summary.status === "loading"
      const collapsible = mode === "left" || mode === "top" || mode === "ball-expanded"
      const [elapsed, setElapsed] = React.useState(0)
      const [contentHovered, setContentHovered] = React.useState(false)
      const suppressContentHover = React.useRef(false)
      React.useEffect(() => {
        if (!loading) {
          setElapsed(0)
          return
        }
        const startedAt = summary.startedAt || Date.now()
        const update = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)))
        update()
        const timer = setInterval(update, 1000)
        return () => clearInterval(timer)
      }, [loading, summary.startedAt])
      const usageInput = summary.usage ? summary.usage.inputTokens + summary.usage.cacheReadTokens + summary.usage.cacheWriteTokens : 0
      const usageStatus = summary.usage ? tt("summary.usage", { input: formatSummaryTokens(usageInput), output: formatSummaryTokens(summary.usage.outputTokens) }) : ""
      const status = loading
        ? tt("summary.progress", { model: settings.modelLabel || settings.model || tt("summary.selectModel"), seconds: elapsed })
        : summary.status === "error"
          ? summary.error || tt("summary.failed")
          : !hasConversation
            ? tt("summary.waiting")
            : usageStatus
      const hasContent = (settings.overall && summary.overall) || (settings.recent && summary.recent)
      const showModel = !collapsible || !modelCollapsed
      const showContent = !collapsible || !contentCollapsed || contentHovered
      const handleMouseEnter = (event) => {
        if (collapsible && contentCollapsed && !suppressContentHover.current) setContentHovered(true)
        onMouseEnter?.(event)
      }
      const handleMouseLeave = (event) => {
        setContentHovered(false)
        suppressContentHover.current = false
        onMouseLeave?.(event)
      }
      const toggleContent = () => {
        if (contentCollapsed) {
          onToggleContent?.()
          setContentHovered(false)
          suppressContentHover.current = false
        } else {
          onToggleContent?.()
          setContentHovered(false)
          suppressContentHover.current = true
        }
      }
      return h("aside", {
        className: "dsh-summary-panel",
        "data-mode": mode,
        "data-closing": closing ? "1" : "0",
        "data-content-collapsed": contentCollapsed ? "1" : "0",
        style,
        role: "complementary",
        "aria-label": tt("summary.title"),
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      },
        h("div", { className: "dsh-summary-head" },
          h("span", { className: "dsh-summary-head-icon", "aria-hidden": true }, h(Icons.IconListPenOutline16, { size: 16 })),
          h("h2", { className: "dsh-summary-title" }, tt("summary.title")),
          collapsible ? h(React.Fragment, null,
            h(SummaryFoldButton, {
              type: "button",
              tooltip: tt(modelCollapsed ? "summary.expandModel" : "summary.collapseModel"),
              "aria-label": tt(modelCollapsed ? "summary.expandModel" : "summary.collapseModel"),
              "aria-expanded": !modelCollapsed,
              onClick: onToggleModel,
            }, h(SummaryCollapseIcon, { collapsed: modelCollapsed })),
            h(SummaryFoldButton, {
              type: "button",
              tooltip: tt(contentCollapsed ? "summary.expandBody" : "summary.collapseBody"),
              "aria-label": tt(contentCollapsed ? "summary.expandBody" : "summary.collapseBody"),
              "aria-expanded": !contentCollapsed,
              onClick: toggleContent,
            }, h(SummaryCollapseIcon, { collapsed: contentCollapsed, line: true })),
          ) : null,
          h("button", {
            type: "button",
            className: "dsh-summary-icon-btn",
            "data-loading": loading ? "1" : "0",
            disabled: loading || running || !hasConversation || !settings.provider || !settings.model || !canGenerate,
            title: tt("summary.refresh"),
            "aria-label": tt("summary.refresh"),
            onClick: onRefresh,
          }, h(Icons.IconRefreshOutline16, { size: 16 })),
          onClose ? h("button", {
            type: "button",
            className: "dsh-summary-icon-btn",
            title: tt("summary.close"),
            "aria-label": tt("summary.close"),
            onClick: onClose,
          }, h(Icons.IconCloseOutline16, { size: 16 })) : null,
        ),
        showModel || showContent ? h("div", { className: "dsh-summary-body" },
          showModel ? modelControl : null,
          showContent ? h(React.Fragment, null,
            status ? h("div", { className: "dsh-summary-body-status", "data-state": summary.status, "aria-live": "polite", title: summary.error || status }, status) : null,
            settings.overall ? h("section", { className: "dsh-summary-section dsh-summary-overall", "data-collapsed": fieldCollapsed.overall ? "1" : "0" },
              h("div", { className: "dsh-summary-section-head" },
                h("h3", null, tt("summary.overallTitle")),
                h(SummaryFoldButton, {
                  type: "button",
                  className: "dsh-summary-section-fold",
                  tooltip: tt(fieldCollapsed.overall ? "summary.expandSection" : "summary.collapseSection", { section: tt("summary.overallTitle") }),
                  "aria-label": tt(fieldCollapsed.overall ? "summary.expandSection" : "summary.collapseSection", { section: tt("summary.overallTitle") }),
                  "aria-expanded": !fieldCollapsed.overall,
                  onClick: () => onToggleField?.("overall"),
                }, h(SummaryCollapseIcon, { collapsed: fieldCollapsed.overall })),
              ),
              !fieldCollapsed.overall && summary.overall ? h("p", null, summary.overall) : null,
            ) : null,
            settings.recent ? h("section", { className: "dsh-summary-section", "data-collapsed": fieldCollapsed.recent ? "1" : "0" },
              h("div", { className: "dsh-summary-section-head" },
                h("h3", null, tt("summary.recentTitle")),
                h(SummaryFoldButton, {
                  type: "button",
                  className: "dsh-summary-section-fold",
                  tooltip: tt(fieldCollapsed.recent ? "summary.expandSection" : "summary.collapseSection", { section: tt("summary.recentTitle") }),
                  "aria-label": tt(fieldCollapsed.recent ? "summary.expandSection" : "summary.collapseSection", { section: tt("summary.recentTitle") }),
                  "aria-expanded": !fieldCollapsed.recent,
                  onClick: () => onToggleField?.("recent"),
                }, h(SummaryCollapseIcon, { collapsed: fieldCollapsed.recent })),
              ),
              !fieldCollapsed.recent && summary.recent ? h("p", null, summary.recent) : null,
            ) : null,
            !hasContent && !status && ((!fieldCollapsed.overall && settings.overall) || (!fieldCollapsed.recent && settings.recent)) ? h("div", { className: "dsh-summary-empty" }, tt("summary.empty")) : null,
          ) : null,
        ) : null,
      )
    }

    function lowestSummaryEffort(model) {
      const efforts = model?.reasoning?.efforts || []
      if (!efforts.length) return ""
      const order = ["none", "off", "disabled", "low", "minimal", "medium", "high"]
      return [...efforts].sort((a, b) => {
        const left = order.indexOf(a.id)
        const right = order.indexOf(b.id)
        return (left < 0 ? order.length : left) - (right < 0 ? order.length : right)
      })[0]?.id || ""
    }

    function SummarySelect({ children, ...props }) {
      return h("div", { className: "dsh-summary-select-wrap" },
        h("select", props, children),
        h(Icons.IconChevronDownOutline14, { className: "dsh-summary-select-arrow", size: 14 }),
      )
    }

    function SummaryModelSelect({ state, settings, onChange, id = "dsh-summary-model", className = "dsh-summary-model-row" }) {
      const groups = nestGroups(state.groups || [])
      const value = settings.provider && settings.model ? JSON.stringify([settings.provider, settings.model]) : ""
      const selectedModel = groups.find((group) => group.id === settings.provider)?.models?.find((model) => model.id === settings.model)
      const known = Boolean(selectedModel)
      const efforts = selectedModel?.reasoning?.efforts || []
      const effortId = id + "-reasoning"
      return h("div", { className, "data-has-reasoning": value ? "1" : "0" },
        h("div", { className: "dsh-summary-model-main" },
          h("label", { className: "dsh-summary-model-label", htmlFor: id }, tt("summary.model")),
          h(SummarySelect, {
            id,
            className: "dsh-summary-model",
            value,
            disabled: state.status === "loading" || state.status === "selecting",
            onChange: (event) => {
              if (!event.target.value) return onChange({ provider: "", model: "", modelLabel: "", reasoningEffort: "", reasoningManual: false })
              const [provider, modelId] = JSON.parse(event.target.value)
              const model = groups.find((group) => group.id === provider)?.models?.find((item) => item.id === modelId)
              onChange({ provider, model: modelId, modelLabel: model?.label || modelId, reasoningEffort: lowestSummaryEffort(model), reasoningManual: false })
            },
          },
            h("option", { value: "" }, state.status === "loading" ? tt("summary.loading") : tt("summary.selectModel")),
            !known && value ? h("option", { value }, settings.provider + " / " + settings.model) : null,
            groups.map((group) => h("optgroup", { key: group.id, label: group.label || group.id },
              (group.models || []).map((model) => h("option", { key: model.id, value: JSON.stringify([group.id, model.id]) }, model.label || model.id)),
            )),
          ),
        ),
        value ? h("div", { className: "dsh-summary-reasoning" },
          h("label", { className: "dsh-summary-model-label", htmlFor: effortId }, tt("summary.reasoning")),
          h(SummarySelect, {
            id: effortId,
            className: "dsh-summary-model",
            value: efforts.some((effort) => effort.id === settings.reasoningEffort) ? settings.reasoningEffort : "",
            disabled: efforts.length === 0,
            onChange: (event) => onChange({ reasoningEffort: event.target.value, reasoningManual: true }),
          },
            efforts.length
              ? efforts.map((effort) => h("option", { key: effort.id, value: effort.id }, effort.name || effort.id))
              : h("option", { value: "" }, tt("summary.noReasoning")),
          ),
        ) : null,
      )
    }

    function ConversationSummary({ sessionId, useSession, summaryDirectory }) {
      const settings = useConversationSummarySettings()
      const running = useSession((snapshot) => snapshot.running)
      const openState = useSession((snapshot) => snapshot.openState)
      const hasConversation = useSession((snapshot) => snapshot.nodes.some((node) => node.kind === "user" || node.kind === "assistant"))
      const modelState = React.useSyncExternalStore(
        (notify) => summaryDirectory.store.subscribe(notify),
        () => summaryDirectory.store.getSnapshot(),
      )
      const geometry = useSummaryGeometry()
      const [summary, setSummary] = React.useState(() => loadSummary(sessionId))
      const [hoverOpen, setHoverOpen] = React.useState(false)
      const [clickOpen, setClickOpen] = React.useState(summaryBallLocked)
      const fieldCollapsed = React.useMemo(() => ({ overall: settings.overallCollapsed, recent: settings.recentCollapsed }), [settings.overallCollapsed, settings.recentCollapsed])
      const expanded = hoverOpen || clickOpen
      const [panelMounted, setPanelMounted] = React.useState(false)
      const [panelClosing, setPanelClosing] = React.useState(false)
      const summaryRef = React.useRef(summary)
      const settingsRef = React.useRef(settings)
      const fieldCollapsedRef = React.useRef(fieldCollapsed)
      const requestRef = React.useRef(null)
      const hoverTimer = React.useRef(0)
      const suppressHover = React.useRef(false)
      const panelExitTimer = React.useRef(0)
      const panelMountedRef = React.useRef(false)
      const wasRunning = React.useRef(running)
      const runningRef = React.useRef(running)
      const sessionRef = React.useRef(sessionId)
      const activeRef = React.useRef(true)
      const pendingSummaryWrites = React.useRef(new Map())

      React.useEffect(() => {
        summaryDirectory.load().catch(() => {})
      }, [summaryDirectory])
      React.useEffect(() => {
        publishSummaryModels(modelState)
        if (!settings.provider || !settings.model) return
        const group = nestGroups(modelState.groups || []).find((item) => item.id === settings.provider)
        const model = group?.models?.find((item) => item.id === settings.model)
        if (!model) return
        const efforts = model.reasoning?.efforts || []
        const manualIsValid = settings.reasoningManual && efforts.some((effort) => effort.id === settings.reasoningEffort)
        if (manualIsValid) return
        const reasoningEffort = lowestSummaryEffort(model)
        if (!settings.reasoningManual && reasoningEffort === settings.reasoningEffort) return
        const all = loadSettings()
        saveSettings({ ...all, conversationSummary: { ...all.conversationSummary, reasoningEffort, reasoningManual: false } })
      }, [modelState.groups, modelState.status, settings.provider, settings.model, settings.reasoningEffort, settings.reasoningManual])
      React.useEffect(() => {
        clearTimeout(panelExitTimer.current)
        if (expanded) {
          panelMountedRef.current = true
          setPanelMounted(true)
          setPanelClosing(false)
        } else if (panelMountedRef.current) {
          setPanelClosing(true)
          panelExitTimer.current = setTimeout(() => {
            panelMountedRef.current = false
            setPanelMounted(false)
            setPanelClosing(false)
          }, 160)
        }
        return () => clearTimeout(panelExitTimer.current)
      }, [expanded])
      const fetchSessionSummary = async (targetSessionId) => {
        if (!targetSessionId) return
        try {
          const res = await fetch(`${STATE_ROUTE}?sessionId=${encodeURIComponent(String(targetSessionId))}`)
          if (!res.ok) return
          if (sessionRef.current !== targetSessionId || !activeRef.current) return
          const data = await res.json().catch(() => ({}))
          const serverSummaryRecord = data.summary
          const local = loadSummary(targetSessionId)
          if (serverSummaryRecord && typeof serverSummaryRecord === "object" && serverSummaryRecord.value) {
            const serverRevision = Number.isSafeInteger(serverSummaryRecord.revision) ? serverSummaryRecord.revision : 0
            if (serverRevision < local.serverRevision || pendingSummaryWrites.current.has(String(targetSessionId))) return
            const server = normalizedSummaryValue(serverSummaryRecord.value)
            const localFields = {
              overall: local.syncOverall || local.overallSeq > server.overallSeq,
              recent: local.syncRecent || local.seq > server.seq,
            }
            if (localFields.overall || localFields.recent) {
              const merged = mergeSummaryValues(local, server, localFields)
              await patchSessionSummaryToHost(targetSessionId, { ...local, ...merged.value }, serverRevision, merged.localFields)
              return
            }
            const changed = serverRevision !== local.serverRevision || local.overall !== server.overall || local.recent !== server.recent || local.seq !== server.seq || local.overallSeq !== server.overallSeq
            const updated = {
              ...local,
              ...server,
              revision: local.revision + (changed ? 1 : 0),
              serverRevision,
              syncOverall: false,
              syncRecent: false,
              status: "idle",
              error: "",
            }
            storeSummary(targetSessionId, updated)
            if (sessionRef.current === targetSessionId && activeRef.current) {
              summaryRef.current = updated
              setSummary(updated)
            }
          } else if (!pendingSummaryWrites.current.has(String(targetSessionId))) {
            const baseRevision = Number.isSafeInteger(data.summaryRevision) ? data.summaryRevision : 0
            const dirty = local.syncOverall || local.syncRecent
            if (baseRevision > local.serverRevision) {
              const cleared = { ...EMPTY_SUMMARY, revision: local.revision + 1, serverRevision: baseRevision }
              storeSummary(targetSessionId, cleared)
              if (sessionRef.current === targetSessionId && activeRef.current) {
                summaryRef.current = cleared
                setSummary(cleared)
              }
            } else if ((local.overall || local.recent) && (baseRevision === 0 || dirty)) {
              const fields = { overall: local.syncOverall || baseRevision === 0, recent: local.syncRecent || baseRevision === 0 }
              const candidate = mergeSummaryValues(local, normalizedSummaryValue(null), fields).value
              await patchSessionSummaryToHost(targetSessionId, { ...local, ...candidate }, baseRevision, fields)
            }
          }
        } catch {}
      }

      const patchSessionSummaryToHost = async (targetSessionId, summaryData, explicitBaseRev, changedFields = { overall: true, recent: true }) => {
        if (!targetSessionId) return
        const key = String(targetSessionId)
        const requestedFields = { overall: changedFields.overall === true, recent: changedFields.recent === true }
        const pending = pendingSummaryWrites.current.get(key) || { count: 0, overall: false, recent: false }
        pendingSummaryWrites.current.set(key, {
          count: pending.count + 1,
          overall: pending.overall || requestedFields.overall,
          recent: pending.recent || requestedFields.recent,
        })
        const applyTombstone = (serverRevision) => {
          const current = loadSummary(targetSessionId)
          const cleared = { ...EMPTY_SUMMARY, revision: current.revision + 1, serverRevision }
          storeSummary(targetSessionId, cleared)
          if (sessionRef.current === targetSessionId && activeRef.current) {
            summaryRef.current = cleared
            setSummary(cleared)
          }
        }
        const applyRecord = (value, serverRevision) => {
          const updated = resolveSummaryCache(loadSummary(targetSessionId), value, serverRevision, requestedFields)
          storeSummary(targetSessionId, updated)
          if (sessionRef.current === targetSessionId && activeRef.current) {
            summaryRef.current = updated
            setSummary(updated)
          }
        }
        try {
          let baseRevision = explicitBaseRev !== undefined ? explicitBaseRev : (summaryData.serverRevision || 0)
          let candidate = normalizedSummaryValue(summaryData)
          let fields = requestedFields
          while (true) {
            const res = await fetch(STATE_ROUTE, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ kind: "summary", sessionId: key, baseRevision, value: candidate }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
              const record = data.summary || data
              const serverRevision = Number.isSafeInteger(record?.revision) ? record.revision : baseRevision + 1
              applyRecord(candidate, serverRevision)
              return
            }
            if (res.status !== 409) return
            const currentRecord = data.current || data.summary || data
            if (!currentRecord || !Number.isSafeInteger(currentRecord.revision)) return
            if (currentRecord.deleted && currentRecord.revision > (summaryData.serverRevision || 0)) {
              applyTombstone(currentRecord.revision)
              return
            }
            const server = normalizedSummaryValue(currentRecord.value)
            const merged = mergeSummaryValues(loadSummary(targetSessionId), server, fields)
            candidate = merged.value
            fields = merged.localFields
            baseRevision = currentRecord.revision
            const matchesServer = candidate.overall === server.overall
              && candidate.recent === server.recent
              && candidate.seq === server.seq
              && candidate.overallSeq === server.overallSeq
            if (matchesServer) {
              applyRecord(server, baseRevision)
              return
            }
          }
        } catch {
        } finally {
          const current = pendingSummaryWrites.current.get(key)
          if (current?.count <= 1) pendingSummaryWrites.current.delete(key)
          else pendingSummaryWrites.current.set(key, { ...current, count: current.count - 1 })
        }
      }

      React.useEffect(() => {
        sessionRef.current = sessionId
        requestRef.current?.abort()
        requestRef.current = null
        const next = loadSummary(sessionId)
        summaryRef.current = next
        setSummary(next)
        setHoverOpen(false)
        wasRunning.current = running
        fetchSessionSummary(sessionId)
      }, [sessionId])
      React.useEffect(() => {
        const onVisible = () => {
          if (document.visibilityState === "visible" && sessionId) {
            fetchSessionSummary(sessionId)
          }
        }
        document.addEventListener("visibilitychange", onVisible)
        return () => document.removeEventListener("visibilitychange", onVisible)
      }, [sessionId])
      React.useEffect(() => {
        summaryRef.current = summary
      }, [summary])
      React.useEffect(() => {
        runningRef.current = running
      }, [running])
      React.useEffect(() => {
        const sync = (event) => {
          if (event.key !== summaryCacheKey(sessionId)) return
          const next = loadSummary(sessionId)
          if (event.newValue !== null && next.revision <= summaryRef.current.revision) return
          requestRef.current?.abort()
          requestRef.current = null
          summaryRef.current = next
          setSummary(next)
        }
        window.addEventListener("storage", sync)
        return () => window.removeEventListener("storage", sync)
      }, [sessionId])
      React.useEffect(() => {
        settingsRef.current = settings
      }, [settings])
      React.useEffect(() => {
        fieldCollapsedRef.current = fieldCollapsed
      }, [fieldCollapsed])
      React.useEffect(() => {
        activeRef.current = true
        return () => {
          activeRef.current = false
          const controller = requestRef.current
          requestRef.current = null
          controller?.abort()
          clearTimeout(hoverTimer.current)
        }
      }, [])

      const refresh = React.useCallback(async (force = false) => {
        const startedRevision = summaryRef.current.revision
        const run = async () => {
          if (!activeRef.current || sessionRef.current !== sessionId) return
          await fetchSessionSummary(sessionId)
          if (!activeRef.current || sessionRef.current !== sessionId) return
          const cached = loadSummary(sessionId)
          if (cached.revision > startedRevision && (cached.overall || cached.recent)) {
            if (cached.revision > summaryRef.current.revision) {
              summaryRef.current = cached
              setSummary(cached)
            }
            return
          }
          const currentSettings = loadSettings().conversationSummary
          const activeFields = {
            overall: currentSettings.overall && !currentSettings.overallCollapsed,
            recent: currentSettings.recent && !currentSettings.recentCollapsed,
          }
          if (runningRef.current || !currentSettings.enabled || !currentSettings.provider || !currentSettings.model || (!activeFields.overall && !activeFields.recent)) return
          requestRef.current?.abort()
          const controller = new AbortController()
          requestRef.current = controller
          const previous = cached
          const loading = { ...previous, status: "loading", error: "", startedAt: Date.now() }
          summaryRef.current = loading
          setSummary(loading)
          try {
            const response = await fetch("/api/dsh-better-ux/summary-v2", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                sessionId: String(sessionId),
                sinceSeq: activeFields.overall ? (!previous.overall ? -1 : previous.overallSeq) : previous.seq,
                refresh: force,
                previous: {
                  overall: activeFields.overall ? previous.overall : "",
                  recent: activeFields.recent ? previous.recent : "",
                },
                fields: activeFields,
                instructions: {
                  overall: activeFields.overall ? currentSettings.overallPrompt : "",
                  recent: activeFields.recent ? currentSettings.recentPrompt : "",
                },
                route: { provider: currentSettings.provider, model: currentSettings.model, reasoningEffort: currentSettings.reasoningEffort || undefined },
              }),
              signal: controller.signal,
            })
            const value = await response.json().catch(() => ({}))
            if (response.status === 404) throw new Error(tt("summary.hostRestart"))
            if (!response.ok) throw new Error(value.error || tt("summary.failed"))
            if (requestRef.current !== controller) return
            const nextSeq = Number.isSafeInteger(value.seq) ? value.seq : previous.seq
            const next = {
              overall: !currentSettings.overall ? "" : activeFields.overall ? normalizeSummary(value.overall) : previous.overall,
              recent: !currentSettings.recent ? "" : activeFields.recent ? normalizeSummary(value.recent) : previous.recent,
              seq: activeFields.recent ? nextSeq : previous.seq,
              overallSeq: activeFields.overall ? nextSeq : previous.overallSeq,
              revision: previous.revision + 1,
              serverRevision: previous.serverRevision || 0,
              syncOverall: previous.syncOverall || activeFields.overall,
              syncRecent: previous.syncRecent || activeFields.recent,
              status: "idle",
              error: "",
              usage: normalizeSummaryUsage(value.usage),
            }
            summaryRef.current = next
            storeSummary(sessionId, next)
            setSummary(next)
            await patchSessionSummaryToHost(sessionId, next, undefined, activeFields)
          } catch (error) {
            if (requestRef.current !== controller) return
            if (error?.name === "AbortError") {
              const next = { ...summaryRef.current, status: "idle", error: "" }
              summaryRef.current = next
              setSummary(next)
              return
            }
            const next = { ...summaryRef.current, status: "error", error: error?.message || tt("summary.failed") }
            summaryRef.current = next
            setSummary(next)
          } finally {
            if (requestRef.current === controller) requestRef.current = null
          }
        }
        if (navigator.locks?.request) return navigator.locks.request("dsh-better-ux:summary:" + String(sessionId), run)
        return run()
      }, [sessionId])

      React.useEffect(() => {
        const missingActive = (settings.overall && !fieldCollapsed.overall && !summaryRef.current.overall)
          || (settings.recent && !fieldCollapsed.recent && !summaryRef.current.recent)
        if (!clickOpen || running || !missingActive || !settings.provider || !settings.model) return
        const timer = setTimeout(() => refresh(true), 0)
        return () => clearTimeout(timer)
      }, [clickOpen, running, settings.overall, settings.recent, settings.provider, settings.model, fieldCollapsed, refresh])

      React.useEffect(() => {
        const ended = wasRunning.current === true && running === false
        wasRunning.current = running
        if (running) requestRef.current?.abort()
        const activeOverall = settings.overall && !fieldCollapsed.overall
        const activeRecent = settings.recent && !fieldCollapsed.recent
        if (!ended || !settings.enabled || openState !== "open" || !hasConversation || (!activeOverall && !activeRecent)) return
        const current = summaryRef.current
        const needsFull = activeOverall && !current.overall
        const timer = setTimeout(() => refresh(needsFull), 350)
        return () => clearTimeout(timer)
      }, [running, settings.enabled, settings.overall, settings.recent, fieldCollapsed, openState, hasConversation, refresh])

      if (!settings.enabled || (!settings.overall && !settings.recent)) return null
      const canGenerate = (settings.overall && !fieldCollapsed.overall) || (settings.recent && !fieldCollapsed.recent)
      const toggleSummaryCollapse = (key) => {
        const all = loadSettings()
        saveSettings({ ...all, conversationSummary: { ...all.conversationSummary, [key]: !all.conversationSummary[key] } })
      }
      const toggleField = (field) => {
        const next = { ...fieldCollapsedRef.current, [field]: !fieldCollapsedRef.current[field] }
        fieldCollapsedRef.current = next
        toggleSummaryCollapse(field + "Collapsed")
      }
      const panelFieldProps = {
        modelCollapsed: settings.modelCollapsed,
        contentCollapsed: settings.contentCollapsed,
        fieldCollapsed,
        canGenerate,
        onToggleModel: () => toggleSummaryCollapse("modelCollapsed"),
        onToggleContent: () => toggleSummaryCollapse("contentCollapsed"),
        onToggleField: toggleField,
      }
      const selectSummaryModel = (route) => {
        const all = loadSettings()
        saveSettings({ ...all, conversationSummary: { ...all.conversationSummary, ...route } })
      }
      const modelControl = h(SummaryModelSelect, { state: modelState, settings, onChange: selectSummaryModel })
      const panelBase = { top: geometry.top }
      const topLeft = Math.max(0, geometry.contentLeft - 12)
      const topRight = Math.min(window.innerWidth, geometry.contentLeft + geometry.contentWidth + 12)
      const topStyle = { ...panelBase, left: topLeft, width: Math.max(0, topRight - topLeft) }
      const leftStyle = { ...panelBase, left: geometry.centerLeft + 8, width: geometry.leftWidth, maxHeight: Math.max(0, geometry.viewportBottom - geometry.top - 8) }
      if (settings.mode === "top") {
        return ReactDOM.createPortal(h(SummaryPanel, {
          summary,
          settings,
          mode: "top",
          style: topStyle,
          hasConversation,
          running,
          modelControl,
          ...panelFieldProps,
          onRefresh: () => refresh(true),
        }), document.body)
      }
      const hasLeftRoom = !geometry.mobile && geometry.leftWidth >= 260
      if (settings.mode === "left" && hasLeftRoom) {
        return ReactDOM.createPortal(h(SummaryPanel, {
          summary,
          settings,
          mode: "left",
          style: leftStyle,
          hasConversation,
          running,
          modelControl,
          ...panelFieldProps,
          onRefresh: () => refresh(true),
        }), document.body)
      }

      const ballStyle = { top: geometry.top, left: geometry.centerLeft + 8 }
      const panelTop = geometry.mobile ? geometry.top + 52 : geometry.top
      const panelBottomGap = geometry.mobile ? 12 : 8
      const panelWidth = geometry.mobile ? Math.max(0, window.innerWidth - 24) : Math.max(280, Math.min(380, geometry.bodyWidth - 16))
      const panelLeft = geometry.mobile ? 12 : Math.max(8, Math.min(window.innerWidth - panelWidth - 8, ballStyle.left + 52))
      const panelStyle = {
        top: panelTop,
        left: panelLeft,
        width: panelWidth,
        maxHeight: Math.max(0, geometry.viewportBottom - panelTop - panelBottomGap),
      }
      const cancelHoverClose = () => clearTimeout(hoverTimer.current)
      const closeHoverSoon = () => {
        clearTimeout(hoverTimer.current)
        hoverTimer.current = setTimeout(() => setHoverOpen(false), 220)
      }
      const toggleClickLock = () => {
        suppressHover.current = clickOpen
        summaryBallLocked = !clickOpen
        setHoverOpen(false)
        setClickOpen(summaryBallLocked)
      }
      return ReactDOM.createPortal(h(React.Fragment, null,
        h("button", {
          type: "button",
          className: "dsh-summary-ball",
          style: ballStyle,
          "data-running": running ? "1" : "0",
          "data-locked": clickOpen ? "1" : "0",
          "aria-expanded": expanded,
          "aria-label": tt(clickOpen ? "summary.unlock" : "summary.lock"),
          title: tt(clickOpen ? "summary.unlock" : "summary.lock"),
          onMouseEnter: settings.hover ? () => { cancelHoverClose(); if (!clickOpen && !suppressHover.current) setHoverOpen(true) } : undefined,
          onMouseLeave: settings.hover ? () => { suppressHover.current = false; closeHoverSoon() } : undefined,
          onFocus: settings.hover ? () => { if (!clickOpen && !suppressHover.current) setHoverOpen(true) } : undefined,
          onBlur: settings.hover ? () => { suppressHover.current = false; closeHoverSoon() } : undefined,
          onClick: settings.click ? toggleClickLock : undefined,
        },
          clickOpen
            ? h("span", { className: "dsh-summary-lock-icon", "aria-hidden": true })
            : h(Icons.IconListPenOutline16, { size: 20 }),
        ),
        panelMounted ? h(SummaryPanel, {
          summary,
          settings,
          mode: "ball-expanded",
          style: panelStyle,
          hasConversation,
          running,
          modelControl,
          ...panelFieldProps,
          closing: panelClosing,
          onRefresh: () => refresh(true),
          onClose: () => { summaryBallLocked = false; setHoverOpen(false); setClickOpen(false) },
          onMouseEnter: cancelHoverClose,
          onMouseLeave: settings.hover ? closeHoverSoon : undefined,
        }) : null,
      ), document.body)
    }

    function startConversationSummary(ctx) {
      const onShortcut = (event) => {
        if (event.defaultPrevented || event.repeat || event.isComposing || shortcutTargetIsEditable(event.target)) return
        const shortcut = loadSettings().conversationSummary.contentShortcut
        if (!shortcut || shortcutFromEvent(event) !== shortcut || !document.querySelector(".dsh-summary-panel")) return
        event.preventDefault()
        event.stopPropagation()
        const all = loadSettings()
        saveSettings({ ...all, conversationSummary: { ...all.conversationSummary, contentCollapsed: !all.conversationSummary.contentCollapsed } })
      }
      document.addEventListener("keydown", onShortcut, true)
      const style = document.createElement("style")
      style.dataset.plugin = "dsh-better-ux-summary"
      style.textContent = SUMMARY_CSS
      document.head.appendChild(style)
      let stopInject = null
      const sync = () => {
        const enabled = loadSettings().conversationSummary.enabled
        if (enabled && !stopInject) {
          stopInject = ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
            name: "conversation.session.header.utilities",
            id: "dsh-better-ux-summary",
            order: 20,
            locale: NS,
            inject: (sessionId) => ({ summaryDirectory: ctx.modelDirectories.directoryFor(sessionId) }),
          }, ConversationSummary))
        } else if (!enabled && stopInject) {
          summaryBallLocked = false
          stopInject()
          stopInject = null
        }
      }
      window.addEventListener(CHANGE, sync)
      sync()
      return () => {
        window.removeEventListener(CHANGE, sync)
        document.removeEventListener("keydown", onShortcut, true)
        stopInject?.()
        stopInject = null
        style.remove()
      }
    }

    function Toggle({ checked, onChange, label }) {
      return h("input", { type: "checkbox", className: "bux-switch", checked, "aria-label": label, onChange: (event) => onChange(event.target.checked) })
    }

    function ScaleOption({ label, value, onChange }) {
      const change = (next) => {
        const number = Number(next)
        if (Number.isFinite(number)) onChange(Math.min(200, Math.max(10, Math.round(number))))
      }
      return h("div", { className: "bux-scale-row" },
        h("span", { className: "bux-scale-label" }, label),
        h("div", { className: "bux-stepper" },
          h("button", { type: "button", "aria-label": tt("scale.decrease", { label }), onClick: () => change(value - 5) }, "−"),
          h("input", { className: "bux-scale-input", type: "number", min: 10, max: 200, step: 1, value, "aria-label": tt("scale.ratio", { label }), onChange: (event) => change(event.target.value), onBlur: (event) => change(event.target.value) }),
          h("span", { className: "bux-scale-unit" }, "%"),
          h("button", { type: "button", "aria-label": tt("scale.increase", { label }), onClick: () => change(value + 5) }, "+"),
        ),
      )
    }

    function SettingsPage() {
      const [settings, setSettings] = React.useState(loadSettings)
      const summaryModels = useSummaryModelCatalog()
      React.useEffect(() => {
        const sync = () => setSettings(loadSettings())
        window.addEventListener(CHANGE, sync)
        return () => window.removeEventListener(CHANGE, sync)
      }, [])
      const update = (next) => {
        setSettings(next)
        saveSettings(next)
      }
      return h("div", { className: "bux-page" },
        h("p", { className: "bux-lead" }, tt("lead")),
        h(Category, {
          title: tt("cat.sessionRow"),
          open: settings.sessionRow.open,
          enabled: settings.sessionRow.enabled,
          onFold: (open) => update({ ...settings, sessionRow: { ...settings.sessionRow, open } }),
          onEnabled: (enabled) => update({ ...settings, sessionRow: { ...settings.sessionRow, enabled } }),
          children: [
            h(Option, { key: "rename", label: tt("sessionRow.rename"), checked: settings.sessionRow.rename, onChange: (rename) => update({ ...settings, sessionRow: { ...settings.sessionRow, rename } }) }),
            h(Option, { key: "fork", label: tt("sessionRow.fork"), checked: settings.sessionRow.fork, onChange: (fork) => update({ ...settings, sessionRow: { ...settings.sessionRow, fork } }) }),
            h(Option, { key: "archive", label: tt("sessionRow.archive"), checked: settings.sessionRow.archive, onChange: (archive) => update({ ...settings, sessionRow: { ...settings.sessionRow, archive } }) }),
            h(Option, { key: "tooltip", label: tt("sessionRow.tooltip"), checked: settings.sessionRow.tooltip, onChange: (tooltip) => update({ ...settings, sessionRow: { ...settings.sessionRow, tooltip } }) }),
          ],
        }),
        h(Category, {
          title: tt("cat.modelPicker"),
          open: settings.modelPicker.open,
          enabled: settings.modelPicker.enabled,
          onFold: (open) => update({ ...settings, modelPicker: { ...settings.modelPicker, open } }),
          onEnabled: (enabled) => update({ ...settings, modelPicker: { ...settings.modelPicker, enabled } }),
          children: [
            h(Option, { key: "search", label: tt("pickerOpt.search"), checked: settings.modelPicker.search, onChange: (search) => update({ ...settings, modelPicker: { ...settings.modelPicker, search } }) }),
            h(Option, { key: "providers", label: tt("pickerOpt.providers"), checked: settings.modelPicker.providers, onChange: (providers) => update({ ...settings, modelPicker: { ...settings.modelPicker, providers } }) }),
            h(Option, { key: "efforts", label: tt("pickerOpt.efforts"), checked: settings.modelPicker.efforts, onChange: (efforts) => update({ ...settings, modelPicker: { ...settings.modelPicker, efforts } }) }),
            h(Option, { key: "closeOnPick", label: tt("pickerOpt.closeOnPick"), checked: settings.modelPicker.closeOnPick, onChange: (closeOnPick) => update({ ...settings, modelPicker: { ...settings.modelPicker, closeOnPick } }) }),
          ],
        }),
        h(Category, {
          title: tt("cat.mobile"),
          open: settings.mobileLayout.open,
          enabled: settings.mobileLayout.enabled,
          onFold: (open) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, open } }),
          onEnabled: (enabled) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, enabled } }),
          children: [
            h(Option, { key: "longPressDrag", label: tt("mobile.longPressDrag"), checked: settings.mobileLayout.longPressDrag, onChange: (longPressDrag) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, longPressDrag } }) }),
            h(Option, { key: "overflowHint", label: tt("mobile.overflowHint"), checked: settings.mobileLayout.overflowHint, onChange: (overflowHint) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, overflowHint } }) }),
            h(Option, { key: "sidebarCompat", label: tt("mobile.sidebarCompat"), checked: settings.mobileLayout.sidebarCompat, onChange: (sidebarCompat) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, sidebarCompat } }) }),
            h(Option, { key: "noPinchZoom", label: tt("mobile.noPinchZoom"), checked: settings.mobileLayout.noPinchZoom, onChange: (noPinchZoom) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, noPinchZoom } }) }),
            h(Option, { key: "noAutoFocus", label: tt("mobile.noAutoFocus"), checked: settings.mobileLayout.noAutoFocus, onChange: (noAutoFocus) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, noAutoFocus } }) }),
          ],
        }),
        h(Category, {
          title: tt("cat.fontScale"),
          open: settings.fontScale.open,
          enabled: settings.fontScale.enabled,
          onFold: (open) => update({ ...settings, fontScale: { ...settings.fontScale, open } }),
          onEnabled: (enabled) => update({ ...settings, fontScale: { ...settings.fontScale, enabled } }),
          children: [
            h(ScaleOption, { key: "mobile", label: tt("fontScale.mobile"), value: settings.fontScale.mobile, onChange: (mobile) => update({ ...settings, fontScale: { ...settings.fontScale, mobile } }) }),
            h(ScaleOption, { key: "desktop", label: tt("fontScale.desktop"), value: settings.fontScale.desktop, onChange: (desktop) => update({ ...settings, fontScale: { ...settings.fontScale, desktop } }) }),
          ],
        }),
        h(Category, {
          title: tt("cat.summary"),
          open: settings.conversationSummary.open,
          enabled: settings.conversationSummary.enabled,
          onFold: (open) => update({ ...settings, conversationSummary: { ...settings.conversationSummary, open } }),
          onEnabled: (enabled) => update({ ...settings, conversationSummary: { ...settings.conversationSummary, enabled } }),
          children: [
            h(Option, { key: "overall", label: tt("summary.overall"), checked: settings.conversationSummary.overall, onChange: (overall) => update({ ...settings, conversationSummary: { ...settings.conversationSummary, overall } }) }),
            h(Option, { key: "recent", label: tt("summary.recent"), checked: settings.conversationSummary.recent, onChange: (recent) => update({ ...settings, conversationSummary: { ...settings.conversationSummary, recent } }) }),
            h(SummaryModelSelect, { key: "model", id: "dsh-summary-model-settings", className: "bux-summary-model", state: summaryModels, settings: settings.conversationSummary, onChange: (route) => update({ ...settings, conversationSummary: { ...settings.conversationSummary, ...route } }) }),
            h(ModePicker, { key: "mode", value: settings.conversationSummary.mode, onChange: (mode) => update({ ...settings, conversationSummary: { ...settings.conversationSummary, mode } }) }),
            h(ShortcutOption, { key: "contentShortcut", value: settings.conversationSummary.contentShortcut, onChange: (contentShortcut) => update({ ...settings, conversationSummary: { ...settings.conversationSummary, contentShortcut } }) }),
            h(SummaryPromptOption, { key: "overallPrompt", label: tt("summary.overallPrompt"), value: settings.conversationSummary.overallPrompt, placeholder: DEFAULT_OVERALL_INSTRUCTION, onChange: (overallPrompt) => update({ ...settings, conversationSummary: { ...settings.conversationSummary, overallPrompt } }) }),
            h(SummaryPromptOption, { key: "recentPrompt", label: tt("summary.recentPrompt"), value: settings.conversationSummary.recentPrompt, placeholder: DEFAULT_RECENT_INSTRUCTION, onChange: (recentPrompt) => update({ ...settings, conversationSummary: { ...settings.conversationSummary, recentPrompt } }) }),
            h(Option, { key: "hover", label: tt("summary.hover"), checked: settings.conversationSummary.hover, onChange: (hover) => update({ ...settings, conversationSummary: { ...settings.conversationSummary, hover } }) }),
            h(Option, { key: "click", label: tt("summary.click"), checked: settings.conversationSummary.click, onChange: (click) => update({ ...settings, conversationSummary: { ...settings.conversationSummary, click } }) }),
          ],
        }),
      )
    }

    function SummaryPromptOption({ label, value, placeholder, onChange }) {
      const length = Array.from(value).length
      return h("label", { className: "bux-summary-prompt" },
        h("span", { className: "bux-summary-prompt-head" },
          h("span", null, label),
          h("span", { className: "bux-summary-prompt-count" }, length + "/2000"),
        ),
        h("textarea", {
          value,
          maxLength: 2000,
          rows: 3,
          placeholder,
          onChange: (event) => onChange(Array.from(event.target.value).slice(0, 2000).join("")),
        }),
      )
    }

    function ModePicker({ value, onChange }) {
      const modes = ["top", "left", "ball"]
      return h("div", { className: "bux-mode-row" },
        h("span", { className: "bux-mode-label" }, tt("summary.mode")),
        h("div", { className: "bux-segments", role: "radiogroup", "aria-label": tt("summary.mode") },
          modes.map((mode) => h("button", {
            key: mode,
            type: "button",
            className: "bux-segment",
            role: "radio",
            "aria-checked": value === mode,
            onClick: () => onChange(mode),
          }, tt("summary.mode." + mode))),
        ),
      )
    }

    function ShortcutOption({ value, onChange }) {
      const [recording, setRecording] = React.useState(false)
      const record = (event) => {
        event.preventDefault()
        event.stopPropagation()
        const shortcut = shortcutFromEvent(event)
        if (!shortcut) return
        onChange(shortcut)
        setRecording(false)
        event.currentTarget.blur()
      }
      return h("div", { className: "bux-shortcut-row" },
        h("span", { className: "bux-shortcut-label" }, tt("summary.contentShortcut")),
        h("div", { className: "bux-shortcut-controls" },
          h("button", {
            type: "button",
            className: "bux-shortcut-key",
            "data-recording": recording ? "1" : "0",
            "aria-label": recording ? tt("summary.shortcutRecord") : tt("summary.contentShortcut") + ": " + (value || tt("summary.shortcutUnset")),
            "aria-pressed": recording,
            onClick: () => setRecording(true),
            onKeyDownCapture: recording ? record : undefined,
            onBlur: () => setRecording(false),
          }, recording ? tt("summary.shortcutRecord") : value || tt("summary.shortcutUnset")),
          h("button", {
            type: "button",
            className: "bux-shortcut-clear",
            disabled: !value,
            title: tt("summary.shortcutClear"),
            "aria-label": tt("summary.shortcutClear"),
            onClick: () => onChange(""),
          }, "×"),
        ),
      )
    }

    function Category({ title, open, enabled, onFold, onEnabled, children }) {
      return h("section", { className: "bux-cat", "data-enabled": enabled ? "1" : "0" },
        h("div", { className: "bux-cat-head" },
          h("h2", { className: "bux-cat-title" }, title),
          h(Toggle, { checked: enabled, onChange: onEnabled, label: tt("toggle.aria", { title }) }),
          h("button", { type: "button", className: "bux-fold", onClick: () => onFold(!open), "aria-expanded": open, "aria-label": tt(open ? "fold.collapse" : "fold.expand", { title }) },
            h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
              h("path", { d: "m6 9 6 6 6-6" }),
            ),
          ),
        ),
        open ? h("div", { className: "bux-body" }, children) : null,
      )
    }

    function Option({ label, checked, onChange }) {
      return h("label", { className: "bux-option", "data-checked": checked ? "1" : "0" },
        h("input", { type: "checkbox", className: "bux-check", checked, onChange: (event) => onChange(event.target.checked) }),
        h("span", { className: "bux-option-label" }, label),
      )
    }

    function startSettingsIcon() {
      let scheduled = false
      const mark = () => {
        scheduled = false
        markHostSemantics()
        for (const button of document.querySelectorAll("[data-dsh-bux-settings-cell]")) {
          if (button.textContent.trim() === tt("section.label")) button.dataset.dshBuxNav = "1"
          else delete button.dataset.dshBuxNav
        }
      }
      const schedule = () => {
        if (scheduled) return
        scheduled = true
        queueMicrotask(mark)
      }
      const observer = new MutationObserver(schedule)
      const root = slotNode("sidebar.settings") || document.body
      observer.observe(root, { childList: true, subtree: true, characterData: true })
      mark()
      return () => {
        observer.disconnect()
        for (const button of document.querySelectorAll("[data-dsh-bux-nav]")) delete button.dataset.dshBuxNav
      }
    }

    function apply(ctx) {
      const syncGeneration = ++settingsSyncGeneration
      settingsRetryPatch = loadSettingsPendingPatch()
      ctx.effect(() => ctx.locale.register(NS, DICT), "dsh-better-ux: dictionaries")
      LOCALE.t = ctx.locale.bind(NS)
      const syncLocale = () => {
        const next = ctx.locale.getSnapshot().active
        if (LOCALE.lang === next) return
        LOCALE.lang = next
        window.dispatchEvent(new Event(LOCALE_CHANGE))
      }
      syncLocale()
      const syncStorage = (event) => {
        if (event.key === STORAGE_KEY || event.key === null) window.dispatchEvent(new Event(CHANGE))
        if (event.key?.startsWith(SETTINGS_PENDING_PREFIX)) {
          settingsRetryPatch = loadSettingsPendingPatch()
          if (Object.keys(settingsRetryPatch).length) pushSettingsPatch({ ...settingsRetryPatch })
        }
      }
      window.addEventListener("storage", syncStorage)
      ctx.effect(() => {
        const off = ctx.locale.subscribe(syncLocale)
        return () => {
          off()
          LOCALE.t = null
          LOCALE.lang = "zh"
        }
      }, "dsh-better-ux: locale changes")

      const onVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          fetchHostSettings()
        }
      }
      document.addEventListener("visibilitychange", onVisibilityChange)
      lastSyncedSettings = getSyncedSettings(loadSettings())
      if (Object.keys(settingsRetryPatch).length) pushSettingsPatch({ ...settingsRetryPatch })
      fetchHostSettings()
      const style = document.createElement("style")
      style.dataset.plugin = "dsh-better-ux"
      style.textContent = SETTINGS_CSS
      document.head.appendChild(style)
      const stopSession = startSessionRow()
      const stopPicker = startModelPicker(ctx)
      const stopMobile = startMobileLayout(ctx)
      const stopFontScale = startFontScale()
      const stopSummary = startConversationSummary(ctx)
      const stopSummaryArchiveCleanup = startSummaryArchiveCleanup(ctx)
      migrateCachedSummariesToHost()
      const stopSettingsIcon = startSettingsIcon()
      ctx.slots.inject("settings.section", () => ctx.slots.register(
        { name: "settings.section", id: "dsh-better-ux", order: 35, label: () => tt("section.label"), locale: NS },
        () => h(SettingsPage, null),
      ))
      ctx.effect(() => () => {
        stopSession()
        stopPicker()
        stopMobile()
        stopFontScale()
        stopSummary()
        stopSummaryArchiveCleanup()
        stopSettingsIcon()
        window.removeEventListener("storage", syncStorage)
        document.removeEventListener("visibilitychange", onVisibilityChange)
        window.clearTimeout(settingsRetryTimer)
        window.clearTimeout(settingsReplayTimer)
        settingsRetryTimer = 0
        settingsReplayTimer = 0
        if (settingsSyncGeneration === syncGeneration) settingsSyncGeneration += 1
        style.remove()
      }, "dsh-better-ux")
    }

    exports.apply = apply
    exports.inject = ["slots", "sessions", "workspaces", "modelDirectories", "locale"]
    return module.exports
  },
})
