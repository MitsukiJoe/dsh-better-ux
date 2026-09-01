# Preserve plugin features while fixing mobile performance

Task ID: `2026-08-28-preserve-plugin-features-while-fixing-mobile-per`

## Task started — 2026-08-28T03:20:06.123Z

任务已建立。

Phase: grilling

Next: 完成 grilling，明确目标、边界与验收标准。

## Checkpoint — 2026-08-28T03:31:24.328Z

范围确定：记录两个插件完整现有功能基线；保持所有用户可见增强、设置、同步结果与冲突语义；同时以 WebKit/Chromium 移动端为目标，允许非紧急同步空闲执行；性能硬门槛为交互长任务低于 50ms、无关会话更新不重建移动列表、启动请求常数级、detached DOM 不持续增长。

Phase: grilling

Status: active

Next: 建立可重复的功能与性能基线并写入 durable spec

Blockers: none

## Checkpoint — 2026-08-28T03:50:22.939Z

Recorded the complete two-plugin functional baseline, measured Chromium regressions, compatibility constraints, and performance acceptance gates.

Phase: spec

Status: active

Next: Decompose the approved spec with to-tickets

Blockers: none

## Checkpoint — 2026-08-28T03:52:03.420Z

Decomposed the frozen spec into six independently verifiable implementation and acceptance tickets.

Phase: tickets

Status: active

Next: Implement T01 with implement-resumable

Blockers: none

## Checkpoint — 2026-08-28T04:10:10.203Z

T01 and T05 verified: unrelated mobile mutations cause zero list work, desktop actions suspend/restore by viewport, inline has bounded menu/pointer work, and 7+15 tests pass.

Phase: implement

Status: active

Next: Implement T02 detached font-scale DOM release

Blockers: none

## Checkpoint — 2026-08-28T04:16:37.493Z

T02 verified: detached font-scaled subtrees release immediately, two forced-GC rounds retain zero nodes, moved nodes are not double-scaled, and exact inline styles restore.

Phase: implement

Status: active

Next: Implement T03 summary geometry observer narrowing

Blockers: none

## Checkpoint — 2026-08-28T04:26:23.414Z

T03 verified at zero unrelated geometry reads with target replacement preserved; T04 Host metadata manifest and compatibility tests are implemented and verified.

Phase: implement

Status: active

Next: Implement and verify the T04 client idle manifest migration

Blockers: none

## Checkpoint — 2026-08-28T04:42:35.545Z

T04 verified: metadata Host API passes compatibility tests; 135 clean caches use one manifest with zero detail/PATCH, changed and malformed paths are bounded, and tombstone clean/delete versus dirty/recreate semantics pass.

Phase: implement

Status: active

Next: Implement T08 semantic mutation filtering, then T07 manifest-driven archive cleanup

Blockers: none

## Checkpoint — 2026-08-28T05:11:24.721Z

T01-T05, T08, and T09 verified. T04 uses one manifest for 135 clean caches. Inline review regressions fixed with 19/19 tests. Side-panel semantic/settings scans fell from 200 to zero; true owner and settings-slot insertion still mark. T07 red baseline is 131 archived candidates, 133 session GETs, and 3275 cache reads during emissions.

Phase: implement

Status: active

Next: Complete and verify T07 owned archive epochs, manifest reconciliation, and async summary-write guards, then run T06 full acceptance

Blockers: none

## Checkpoint — 2026-08-28T06:27:05.477Z

T01-T05 and T07-T09 are implemented and internally accepted. Final Better UX 10/10 and inline 19/19 suites, syntax/diff checks, served hashes, Chromium mobile/desktop matrix, zero detached-node growth, zero plain semantic/geometry scans, and isolated mobile/inline reviews pass. Data review findings for terminal-manifest fresh archive, Unicode IDs, and stale component GET/PATCH ownership were fixed with red-green tests.

Phase: review

Status: active

Next: After the user restarts dsh web externally, verify the live summaries manifest and constant request count; then run approved Playwright WebKit or record iPhone Safari acceptance before completing T06.

Blockers: Current 3080 Host still serves the legacy no-summaries envelope; Playwright WebKit is not installed and neither installation approval nor an iPhone Safari result was received.

## Checkpoint — 2026-08-28T06:35:23.179Z

Final isolated summary-owner review confirmed five defects in the current worktree: absent Host records are not tombstoned before archive completion; retry timer ownership can overlap; per-record migration transient failures do not propagate retry; live summary PATCH failure has no retry/error outcome; queued Web Locks do not use the mount signal. T07 is reopened and prior 10/10 results are pre-fix evidence only.

Phase: review

Status: active

Next: Add focused failing client tests for all five review findings and confirm each fails for the intended reason before implementation.

Blockers: Current 3080 Host still serves the legacy no-summaries envelope; Playwright WebKit is not installed and neither installation approval nor an iPhone Safari result was received.; After internal fixes, current 3080 Host still requires an external user restart and WebKit installation approval or an iPhone Safari result.

## Checkpoint — 2026-08-28T06:51:18.159Z

All five confirmed final-review defects have focused red-green coverage and are fixed in the current worktree. Better UX now has 15/15 passing tests: absent Host records are tombstoned; archive retries own one timer; per-record migration failures propagate retry; live summary PATCH classifies outcomes and schedules one lifecycle-owned exponential retry; queued Web Locks abort with the mount signal. Parent inspection, syntax, and diff checks pass.

Phase: review

Status: active

Next: Finish the replacement isolated review, fix any confirmed finding, then rerun both full suites and the browser acceptance matrix if Playwright Chromium can be relaunched.

Blockers: Fresh Playwright Chromium sessions now crash at launch; current 3080 Host still needs an external restart, and WebKit needs installation approval or an iPhone Safari result.

## Checkpoint — 2026-08-28T07:58:56.139Z

Internal implementation and review are green: Better UX 23/23, inline 19/19, both syntax and diff checks pass, source equals served client (Better UX 246c2a8e; inline 59b888d1), and isolated read-only review found no current code defects. Reviewer-confirmed archive ABA, late tombstone recreation, same-field retry ownership, generation request ownership, and adjacent pending-key races have focused red-green coverage.

Phase: review

Status: active

Next: After the user externally restarts dsh web, verify the live summary manifest and restarted-Host archive request counts; then complete Chromium/WebKit/iPhone acceptance when those browsers are available.

Blockers: Fresh Playwright Chromium sessions now crash at launch; current 3080 Host still needs an external restart, and WebKit needs installation approval or an iPhone Safari result.; The running 3080 Host still serves the legacy state envelope and must be restarted externally; fresh Playwright Chromium crashes at launch, Playwright WebKit is unavailable, and no iPhone Safari result is available.

## Checkpoint — 2026-08-28T07:59:09.897Z

Internal implementation and review are green: Better UX 23/23, inline 19/19, both syntax and diff checks pass, source equals served client (Better UX 246c2a8e; inline 59b888d1), and isolated read-only review found no current code defects. Reviewer-confirmed archive ABA, late tombstone recreation, same-field retry ownership, generation request ownership, and adjacent pending-key races have focused red-green coverage.

Phase: review

Status: active

Next: After the user externally restarts dsh web, verify the live summary manifest and restarted-Host archive request counts; then complete Chromium/WebKit/iPhone acceptance when those browsers are available.

Blockers: The running 3080 Host still serves the legacy state envelope and must be restarted externally; fresh Playwright Chromium crashes at launch, Playwright WebKit is unavailable, and no iPhone Safari result is available.

## Checkpoint — 2026-08-28T08:17:21.500Z

Internal implementation and review are green: Better UX 23/23 and inline 19/19 pass. Selective old-Host migration retry now carries only transiently failed session IDs, so a transient b failure produces Host calls a,b,b instead of a,b,a,b and retry localStorage key enumeration stays 2 to 2. Manifest-level retries preserve the failed-ID filter; archive epoch, abort, and newer dirty-write seams remain safe. Source equals served client (Better UX eed9d7a0; inline 59b888d1), and isolated read-only review reports No Findings.

Phase: review

Status: active

Next: After the user externally restarts dsh web, verify the live summary manifest and restarted-Host archive request counts; then complete Chromium/WebKit/iPhone acceptance when those browsers are available.

Blockers: The running 3080 Host still serves the legacy state envelope and must be restarted externally; fresh Playwright Chromium crashes at launch, Playwright WebKit is unavailable, and no iPhone Safari result is available.

## Checkpoint — 2026-08-28T08:23:50.083Z

Internal implementation remains green at Better UX 23/23 and inline 19/19 with No Findings on source hashes eed9d7a0 and 59b888d1. Goal round 1 rechecked the external matrix: the running 3080 Host still returns the legacy envelope; a fresh npx @playwright/cli mobile Chrome launch still crashes with Target crashed / Assertion error; the Playwright WebKit executable is still absent.

Phase: review

Status: active

Next: Have the user externally restart dsh web, then verify the live manifest/request counts; obtain approval to install Playwright WebKit or an iPhone Safari acceptance result.

Blockers: The running 3080 Host still needs an external restart; current mobile Chrome automation crashes at launch; Playwright WebKit is unavailable and no iPhone Safari result is available.

## Checkpoint — 2026-08-28T10:07:41.777Z

Internal suites remain green (Better UX 23/23, inline 19/19). The user externally restarted dsh web and the new Host is live: metadata manifest returns version 1 with 151 records; final client hashes are served; the reusable acceptance record passed recreate revision 5, stale DELETE 409, DELETE revision 6, repeated DELETE revision 7, stale PATCH 409, final tombstone manifest, invalid selector 400, cross-origin 403, and settings preservation. The restart-time inactive-context presenter errors were transient tool-result presentation failures; subsequent tools and the GUI shell respond normally.

Phase: review

Status: active

Next: With user approval, install Playwright-managed Chromium and WebKit runtimes, then run the final mobile/desktop browser matrix and capture live startup manifest/request counts.

Blockers: Playwright CLI is installed, but no managed Chromium/WebKit runtime is present; system Chrome 151 crashes under Playwright with Target crashed / Assertion error under Node 22 and 26. Browser runtime download approval or an iPhone Safari result is still required.

## Checkpoint — 2026-08-28T10:38:14.459Z

T07 and all Chromium/live-Host acceptance are complete. Stable Playwright 1.62.1 direct API runs system Chrome 151 on final source eed9d7a0: 336 items / 69,566px; unrelated, typing, drag, active-summary streaming, and side-panel streaming all have zero plugin long tasks and zero list rebuilds; typing is 1.24ms average / 4ms max; drag moves 355px; font forced-GC Nodes are 0/0/0. Functional matrix preserves search, views, long press, header 0-76-0, summary, enhanced picker, module disable/restore, image paste dispatch, desktop 335 action bars, and inline 38 rows / 18 groups / 9 hidden / 19 twins. A live 151-cache startup performs 1 settings GET + 1 manifest GET, 0 detail and 0 write. Fresh suites pass Better UX 23/23 and inline 19/19; hashes match served files.

Phase: review

Status: active

Next: Obtain user approval to install Playwright WebKit 26.5, then run the same non-destructive mobile functional/performance smoke matrix and complete T06/goal; alternatively record an iPhone Safari result.

Blockers: Only WebKit/iPhone acceptance remains: the Playwright WebKit 26.5 runtime is not installed and the user has not yet approved its download or supplied an iPhone Safari result.

## Checkpoint — 2026-08-28T10:56:26.635Z

Actual Safari 26.5 WebDriver acceptance now supplements the complete Chromium/live-Host matrix. At a true 390x792 DPR2 viewport, search, views, trusted 480ms long press, header 0-76-0, two-section summary, 10/19/19/6 picker, 38/18/9/19 Inline decoration, image paste, font lifecycle, feature rollback, and desktop rows 335-0-335 pass. Chat, side-panel, and 30-stream-plus-21-input probes produce zero renders/list mutations/geometry/semantic-settings scans; input is 0.14ms average / 1ms max and rAF max 19ms. Trusted horizontal wheel scroll moves 355px with zero rebuilds and rAF max 19ms. Desktop Safari does not convert WebDriver touch pointer movement to native scroll, but touch pointer long-press works. Settings, textarea, Host hash, Safari session, and safaridriver were restored/closed. No iOS Simulator runtime is installed.

Phase: review

Status: active

Next: Ask the user to choose whether actual Safari 26.5 WebDriver evidence satisfies the original WebKit gate, or whether to download Playwright WebKit / use an iPhone Safari result; then finalize T06 accordingly.

Blockers: Only an explicit acceptance-path decision remains: the original spec named approved Playwright WebKit or user iPhone Safari, while actual system Safari 26.5 has now passed an equivalent desktop-WebKit 390px matrix except native iOS touch scrolling.

## Checkpoint — 2026-08-28T11:11:08.400Z

Final review has no blocking findings on unchanged reviewed source hashes eed9d7a0 and 59b888d1. User-approved Playwright WebKit 26.5 v2336/iPhone 15 acceptance is complete in addition to Chrome 151 and actual Safari 26.5. WebKit functional counts match baseline; chat, side-panel, combined stream/input, and scroll each show zero plugin renders/list mutations/geometry/semantic-settings scans; input is 0.24ms average / 1ms max, scroll is 360px with rAF max 19ms, and three active-scale detached WeakRefs collect after requested GC. Fresh Better UX 23/23, Inline 19/19, syntax, diff, served hashes, Host manifest/settings, runtime, and cleanup checks pass. T06 and every dependency are checked.

Phase: review

Status: active

Next: Run the final post-document diff/checkpoint sanity gate, then complete the durable task and same-session goal.

Blockers: none

## Completed — 2026-08-28T11:11:42.724Z

Completed all preservation and performance acceptance tickets. Final source hashes eed9d7a0 (Better UX) and 59b888d1 (Inline) pass independent review, Better UX 23/23, Inline 19/19, syntax/diff checks, served-hash verification, restarted-Host manifest/CAS/tombstone and 151-cache constant startup. Chrome 151, actual Safari 26.5, and approved Playwright WebKit 26.5/iPhone 15 preserve search, views, gestures, header, summaries, model pickers, Inline mapping/order, image paste, feature rollback, settings, and desktop rows. Unrelated chat/panel/typing/scroll work produces zero plugin list rebuilds, geometry or semantic/settings scans; Chromium touch drag has no >=50ms long task; detached nodes are bounded and collected in both Chromium and WebKit. Temporary routes, settings, inputs, Host state, browser sessions, and jobs are restored or closed.

Phase: done

Status: completed

Next: none

Blockers: none

