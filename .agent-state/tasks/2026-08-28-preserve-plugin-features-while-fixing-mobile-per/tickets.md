# Implementation Tickets

- [x] T01 — Stop unrelated conversation updates from rebuilding the mobile navigation
  - Depends on: none
  - Scope: In `dsh-better-ux/lib/client.js`, narrow `startMobileLayout` frame invalidation, preserve late semantic/sidebar/composer discovery, add a stable data/render signature before list replacement, coalesce overflow-hint work, and suspend desktop-only session-row injection below 1024 px with exact restoration on desktop.
  - Acceptance: Twenty unrelated conversation add/remove cycles emit zero `dsh-mobile-shell-rendered` events and zero session-list child mutations; true session/workspace/view/search/locale/settings changes still render; 420 ms sorting, click suppression, sidebar restoration, header toggle, image button, search, view menu, and native item menus remain unchanged.
  - Test seam: Existing Node suite/check plus the real-browser event counter, MutationObserver counter, session/workspace change checks, 40-step touch drag, and desktop/mobile module disable/restore matrix.
  - Completion evidence: Diff inspection proving the existing portal/ARIA semantic fixes remain; Better UX tests/check pass; before/after browser metrics and functional results are recorded.

- [x] T02 — Release detached font-scale DOM without changing visual output
  - Depends on: T01
  - Scope: In `startFontScale`, preserve the measured inherited-font compensation order, observe removed roots, restore and discard states for roots that remain disconnected, remove them from pending work, and preserve the iterable restore path for connected nodes and exact inline property priorities.
  - Acceptance: Enabled 80% output matches the baseline; moved/reinserted nodes are not double-scaled; 100% and disabled states restore original inline values; repeated transient-node probes do not retain mobile-list generations or grow heap/nodes monotonically.
  - Test seam: Focused DOM lifecycle coverage where practical, existing check/tests, and the same forced-GC browser probe used for the 169,600-node baseline.
  - Completion evidence: Two consecutive probes stay within a bounded detached-node/heap delta without disabling scaling, followed by exact settings and style restoration.

- [x] T03 — Make summary geometry react only to geometry ownership changes
  - Depends on: T01
  - Scope: In `useSummaryGeometry`, retain ResizeObserver/window/visualViewport behavior but filter MutationObserver records and rebind only when the tracked composer, chat flow, session header, or mobile shell changes or disconnects.
  - Acceptance: Message/stream child mutations do not schedule geometry measurement; composer/header/mobile-shell replacement still rebinds; top/left/ball positioning, small-card fallback, available-height behavior, and summary interactions match the baseline.
  - Test seam: Browser geometry/mutation counters across active and completed sessions, all three modes where non-destructive, viewport resize, summary ball lock/unlock, and shortcut input-focus protection.
  - Completion evidence: No unrelated geometry/layout work in the synthetic stream benchmark and unchanged measured summary placement/interaction.

- [x] T04 — Replace per-cache startup reads with one backward-compatible Host bulk read
  - Depends on: T02, T03
  - Scope: Add `GET /api/dsh-better-ux/state-v1?summaries=1` to `dsh-better-ux/index.js` as a compact `revision`/`deleted` manifest; update migration in `lib/client.js` to run in idle time, skip matching clean revisions, detail-fetch only changed revisions, PATCH only dirty/newer local fields with the existing CAS path, and fall back to deferred legacy reads when an old running Host omits the bulk field.
  - Acceptance: Existing no-query and `sessionId` response contracts remain compatible; serialized writes, revisions, 409 merge/retry, pending summary flags, archive deletion, tombstones, and recreation stay unchanged; 135 synchronized caches require one read after Host restart.
  - Test seam: Extend `test/host-endpoint.test.mjs` for old and bulk response shapes, tombstones, and CAS isolation; exercise old-Host fallback in the currently running GUI; after user external restart, count live startup requests and validate real stored state.
  - Completion evidence: Host tests prove additive compatibility and CAS/tombstone preservation; browser network trace proves legacy fallback before restart and constant reads after restart. Within one old-Host retry lifecycle, only transiently failed session IDs are retried (`a,b,b`, not `a,b,a,b`) and the retry round does not rescan localStorage keys.

- [x] T05 — Localize inline menu discovery and pointer work
  - Depends on: none
  - Scope: In `dsh-vision-router-inline/lib/client.js`, process only menus affected by MutationRecords, reserve full open-menu scans for session/directory changes, track a single hovered twin instead of querying all hover state on every move, and retain the body portal-discovery observer, `.mpo-root` bypass, exact hit geometry, capture click behavior, and cleanup. Add minimal package test/check scripts and focused client/host tests.
  - Acceptance: Existing 18/9 group behavior, 19 twin rows, mapping/order, selection path, native text click pass-through, missing-peer idle behavior, and unload restoration remain unchanged; unrelated conversation mutations do not scan every menu; pointer moves outside a native menu perform constant early-return work.
  - Test seam: Node client loader and Host provider-order/cleanup tests plus native-menu browser inspection, right-edge hit/hover check, enhanced-picker coexistence, and unload/disabled behavior.
  - Completion evidence: Inline tests/check pass and a browser/source inspection confirms bounded mutation/pointer work with unchanged native menu decoration.

- [x] T07 — Bound archive cleanup and reuse the summary manifest
  - Depends on: T04
  - Scope: Wait for the authoritative ready workspace snapshot, make `startSummaryArchiveCleanup` react to archive epochs/deltas, clear local caches once, use the already-read Host manifest to delete only initially archived summaries that are still live, confirm fresh archives, guard all async local/Host summary writes with owned tokens, and retain deferred bounded fallback only for old Hosts.
  - Acceptance: Repeated unchanged workspace snapshots perform zero summary-cache reads and zero Host calls; hydration is not treated as user archive; a new/re-archived session clears local cache and confirms/writes/retries the correct tombstone; in-flight GET/generation/migration cannot recreate it; new-Host startup adds no per-archived GETs, while old-Host compatibility remains deferred, bounded, and cancellable.
  - Test seam: Passive localStorage/fetch stack counters during real agent streaming, manifest/tombstone unit coverage, controlled archive-set transition where non-destructive, and live request count after external Host restart.
  - Completion evidence: Internal fixtures reduce the 2-second 3,275-read baseline to zero for unchanged snapshots, Host CAS/tombstone tests remain green, ordinary startup state reads are constant, and isolated function seams report No Findings. After external restart, a browser context seeded with all 151 Host records performs one settings GET plus one manifest GET, zero per-session detail GETs, and zero writes; 133 tombstone caches are removed and 18 live caches remain.

- [x] T08 — Filter semantic discovery before global scans
  - Depends on: T01
  - Scope: In the mobile frame observer, inspect MutationRecords and tracked-node connectivity before calling `sidebarColumnNode`, `markHostSemantics`, `syncImageUpload`, or `schedule`; retain deep portal/ARIA discovery only for subtrees that can contain sidebar/composer/header/settings/panel controls.
  - Acceptance: Twenty plain-text mutations in the subagent side panel cause zero `markHostSemantics` selector scans and zero mobile renders; actual composer/sidebar/ARIA control replacement still rebinds and preserves the existing user-owned deep-selector compatibility.
  - Test seam: Stack-counted `querySelectorAll` browser probe on `.wxwsGW_subagentBody`, controlled fake semantic-control insertion/removal, existing mobile replacement/disable/resize checks, and syntax/tests.
  - Completion evidence: The 200-selector-scan baseline becomes zero without losing semantic markers or image/mobile-shell restoration.

- [x] T09 — Stop the settings icon from observing the whole chat body
  - Depends on: T08
  - Scope: Replace `startSettingsIcon`'s unfiltered `document.body` fallback with a filtered discovery observer plus a local observer bound to the actual settings slot; make queued work disposal-safe and preserve nav-icon relabeling on settings mount, rerender, locale change, replacement, and cleanup.
  - Acceptance: Twenty plain side-panel mutations, ordinary conversation buttons, and ordinary panel buttons cause zero `startSettingsIcon` global scans; an actual settings-slot insertion/replacement still binds, marks the Better UX navigation cell, and cleans all datasets/observers on unload.
  - Test seam: Caller-attributed browser QSA stacks, temporary semantic/settings-root insertion, settings-page navigation/locale check, module disable/restore, and existing tests/check.
  - Completion evidence: The remaining 200-selector-scan baseline at served line 4604 becomes zero on chat while settings icon visuals and cleanup remain unchanged.

- [x] T06 — Run full functional preservation and performance acceptance
  - Depends on: T01, T02, T03, T04, T05, T07, T08, T09
  - Scope: Rebuild/refresh only the existing 3080 GUI artifacts as required; do not start or replace `dsh web`. Run both repositories' automated checks, inspect final diffs against the task baseline, verify served client hashes, execute the complete Chromium matrix, obtain Host restart evidence from the user, and complete an isolated read-only code review.
  - Acceptance: Every functional and performance criterion in `spec.md` passes; all temporary settings/routes/input values are restored; no unrelated user changes are reverted; no background jobs remain; WebKit/iPhone result is either recorded from an approved Playwright WebKit installation or explicitly completed by the user on iPhone Safari.
  - Test seam: Exact baseline scripts and metrics from `spec.md`, automated suites, syntax/diff checks, network counts, heap/node probes, and review findings.
  - Completion evidence: Better UX 23/23 and Inline 19/19 pass with syntax/diff checks; final source/served hashes are `eed9d7a0ad827931e5abfec027bd6ad9b1d422d6` and `59b888d17e9f64a1659a506213d2e65266ee8761`. Chromium Chrome 151, actual Safari 26.5, and approved Playwright WebKit 26.5/iPhone 15 matrices preserve all functional baselines and record zero unrelated list/geometry/semantic work. Chromium touch drag moves 355px without a >=50ms long task; WebKit scroll moves 360px with rAF max 19ms; Chromium Nodes are `0/0/0` and three active-scale WebKit WeakRefs are collected after requested GC. The restarted Host remains version 1 with 151 metadata records and constant startup reads. All temporary settings, routes, input/file values, Host state, browser sessions, and jobs are restored or closed.
