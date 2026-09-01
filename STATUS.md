# 进度

## 契约

- 目标：记录 dsh-better-ux 与 dsh-vision-router-inline 当前功能基线，在不删除或降级现有行为的前提下修复移动端性能回归。
- 非目标：改变功能语义、同步冲突语义或 DSH Host 边界。
- 验收：Chromium/WebKit 功能回归通过；交互长任务低于 50ms；无关 DOM 更新不重建列表；启动请求常数级；detached DOM 不持续增长。

## 现在

- `.agent-state/CURRENT.json`：`2026-08-28-preserve-plugin-features-while-fixing-mobile-per`。
- 阶段：done；T01-T09（含最终 T06）全部验收，`.agent-state/CURRENT.json` 状态为 completed。
- 收尾增量：`lib/client.js` 新增 `reconcileListRow`，`render` 用 per-item signature 做 keyed diff 复用节点与长按绑定（`bindLongPress` 改收 record；语言变更或 shell 重建/卸载时清缓存）；`markHostSemantics` 用 `markedSessionHeader/DetailsToggle/DetailsPanel/SettingsLayer/SettingsCells` 跟踪引用替换三处 `document.querySelectorAll` 陈旧标记扫描，`mark()` 改用跟踪的 settings cells，teardown 的全局扫描保留。测试 25/25（新增 2 条）。最终加固覆盖 archive ABA、late tombstone dirty 重建、同字段 retry ownership、generation request ownership、adjacent pending key 与 old-Host failed-ID selective retry；Better UX 23/23、inline 19/19，隔离只读复审为 No Findings。

## 卡着

- 外部重启后的 live Host、151-cache startup、Chromium、实际 Safari 26.5 和已授权安装的 Playwright WebKit 26.5/iPhone 15 功能/性能矩阵均通过。最终两浏览器 hard gates 为 0 unrelated rebuild/scan/geometry，Chromium touch drag 355px 无长任务，WebKit 40 步 scroll 360px/rAF 最大 19ms，三轮 WebKit WeakRef 与 Chromium Nodes GC 均释放。当前任务无剩余 blocker。

## 下一步

- [x] 建立可重复功能和性能基线并写入 spec。
- [x] 将 spec 拆为 6 张可独立验证的实施/验收票据。
- [x] 实施并验收 T01：移动端失效边界、渲染守卫与桌面 action bar 收窄。
- [x] 实施并验收 T05：inline observer 与 pointer 路径有界化，复审修复后 19 项自动化通过。
- [x] 实施并验收 T02：字体缩放断连节点连续两轮强制 GC 均零增长，视觉与还原契约不变。
- [x] 实施并验收 T03：20 轮无关 mutation 的几何读取由 195 降为 0，动态 target 替换仍重算。
- [x] 实施并验收 T04：135 cache 为 1 manifest / 0 detail / 0 PATCH，异版、畸形与 tombstone 分支通过。
- [x] 实施并验收 T08/T09：side-panel plain stream 的 semantic/settings 全局扫描由 200 降为 0，真实 owner 仍刷新。
- [x] T07 已验收：50 次同集合 0 cache IO；new Host fixture 0 archive GET/DELETE；legacy 131 项最大并发 1；live 151-cache 启动为 1 settings GET + 1 manifest GET、0 detail/0 write。
- [x] T06 已验收：完整 Chromium、实际 Safari 与 Playwright WebKit/iPhone 15 矩阵、Host、两仓测试、served hash 和独立复审全部完成。
