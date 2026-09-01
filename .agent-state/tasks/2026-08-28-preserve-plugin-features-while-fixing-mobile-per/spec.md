# Preserve Plugin Features While Fixing Mobile Performance

## Problem And Outcome

The current local DSH Web profile loads `dsh-better-ux` and `dsh-vision-router-inline`. On mobile, unrelated conversation DOM updates trigger complete mobile session-list rebuilds, font scaling retains detached DOM, summary geometry forces repeated layout reads, cached-summary migration performs one Host request per cached session, and inline scans the complete document/menu set from a body-wide observer and pointer handler.

The outcome is to retain every current user-visible enhancement and every synchronization invariant while reducing plugin overhead to near the same-page DSH baseline with the plugins' expensive paths disabled.

## Baseline

### Revisions And Ownership

- Primary repository: `dsh-better-ux`, baseline HEAD `9946e71`.
- User-owned dirty state at task start: `lib/client.js` modified by 10 lines and untracked `pnpm-lock.yaml`. The edits improve late portal/sidebar semantic detection and must be preserved.
- Secondary repository: `dsh-vision-router-inline`, clean at task start.
- Task bookkeeping lives under ignored `.agent-state/`; workspace-wide progress remains in `../STATUS.md`.

### Existing Function Contract

`dsh-better-ux` must preserve:

1. Desktop session-row rename/fork/archive controls, tooltip behavior, and safe restoration of the native overflow menu.
2. Enhanced model picker search, provider filters, model cards, vision twins, reasoning effort, close-on-pick, Escape/backdrop close, and live directory synchronization.
3. Mobile shell, workspace/session navigation, status display, native menus, search, view mode/order controls, 420 ms long-press sorting, click suppression, header persistence, image upload through the native paste pipeline, pinch lock, no-auto-focus, sidebar compatibility, and exact desktop restoration.
4. Independent mobile/desktop font scaling from 10%-200% and exact restoration of original inline values and priorities.
5. Conversation summaries in top/left/ball modes, responsive fallback, hover/click locking, model/content/overall/recent folding, editable shortcut, model selection, automatic post-run refresh, incremental timeline extraction, token usage, and immutable formatting instruction.
6. Host/profile settings and workspace-view synchronization, local immediate behavior, serialized CAS writes, field-level summary merge, pending/rejected settings queues, revision conflict retry, tombstones, archive cleanup, v1 cleanup, and v2 cache migration.
7. Chinese/English live locale updates.
8. Every feature total switch restoring the original DSH UI without active hidden controls, duplicate DOM, stale listeners, or stale observers.

`dsh-vision-router-inline` must preserve:

1. Provider filtering/order and parent/twin mapping, including the special `deepseek-official` / `deepseek-vision` mapping.
2. Dynamic session-directory subscription and cleanup.
3. Hiding standalone vision groups while adding twin state to matching native model rows.
4. Exact 34 px/chevron-relative hit geometry, separate hover treatment, native text-row click pass-through, capture-phase twin click interception, and selection through `modelDirectories.directoryFor(sessionId).select`.
5. Coexistence with Better UX by ignoring `.mpo-root`, missing-peer idle behavior, and complete unload cleanup.

### Automated Baseline

- Better UX: `npm test` passes 7/7; `npm run check` passes.
- Inline: `node --check index.js && node --check lib/client.js` passes; no automated test suite exists.

### Browser Functional Baseline

Measured against the existing GUI at `http://127.0.0.1:3080/`, Chromium, 390x844:

- Mobile shell and image button are injected; page horizontal overflow is absent (`scrollX=0`, document width 390/390).
- Current flat view renders 333 mobile session items with a 69,027 px horizontal strip.
- Search opens and filters; view menu exposes workspace/flat and manual/updated choices.
- 420 ms long press opens the sorting capsule.
- Header changes from collapsed 0 px to expanded 75 px and restores to the original persisted state.
- Summary ball opens a populated panel and relocks without persisting the transient lock.
- Enhanced picker opens with 10 provider filters, 19 model cards, 19 vision controls, six reasoning-effort choices, search filtering, and Escape close.
- Desktop has 334 enhanced session rows; disabling the module removes all 334 action bars and native-menu suppression, then restoring recreates them.
- Disabling mobile layout removes shell/body/frame/image enhancements; restoring recreates them. Disabling summaries removes visible summary UI; restoring recreates it.
- With Better UX picker temporarily disabled, inline decorates 19 of 38 native radio rows, hides 9 of 18 standalone vision groups, and maps the first twin to `deepseek-vision/deepseek-v4-flash`.
- All temporary local settings were restored exactly.

### Browser Performance Baseline

- Cold navigation with 135 local summary caches performs 135 `/api/dsh-better-ux/state-v1?sessionId=...` requests.
- Twenty unrelated add/remove cycles inside the conversation produce 20 mobile-shell renders, 6,660 session nodes removed and 6,660 added, 665 ms main-thread task time, and 78/96/88 ms long tasks.
- Thirty synthetic conversation cycles while inserting 21 characters produce 39 mobile renders and 1.193 s main-thread task time.
- A real 40-step touch drag of the 69,027 px strip works, but consumes 212 ms task time while no conversation updates occur; the severe stalls occur when updates and drag overlap.
- Enabling 80% font scaling and adding/removing 50 temporary roots with 10 children each leaves 169,600 extra nodes and about 32.5 MB heap after forced GC, with 2.79 s task time. Disabling scaling finally releases them. The multiplication is caused by detached list rebuilds retained in the font-scale Map.

## Scope

### In Scope

- `dsh-better-ux/lib/client.js`: session-row lifecycle, mobile invalidation/render scheduling, scroll hint scheduling, font-scale lifecycle, summary geometry lifecycle, and summary migration scheduling.
- `dsh-better-ux/index.js`: additive bulk summary-read support plus CAS-consistent tombstone revision fencing; endpoint shapes and intended delete/recreate outcomes remain unchanged.
- Better UX tests needed to lock Host compatibility and high-risk source/runtime behavior.
- `dsh-vision-router-inline/lib/client.js`: incremental menu discovery/decoration and constant-work pointer hover state.
- Inline package scripts and focused tests for module loading, provider behavior, cleanup contracts, and stable pure mapping logic where practical.
- Chromium browser comparisons and a WebKit/iPhone validation record.

### Non-Goals

- Removing, disabling by default, or visually simplifying any enhancement.
- Changing model/provider selection semantics, summary prompts, generated content, cache format, intended CAS/tombstone outcomes, or pending/rejected queues. Internal revision fencing may be corrected where required to preserve those outcomes under stale concurrent writes.
- Changing DSH itself or unrelated third-party plugins.
- Virtualizing the mobile session list unless the narrower invalidation and containment changes fail the performance gates. Drag-only baseline has no >50 ms long task, so virtualization is not initially justified.
- Sharing data between different DSH Host installations.

## Technical Approach

### Mobile Invalidation And Rendering

- Restore the pre-regression boundary: the application-frame observer may discover/rebind the sidebar, composer, panel host, and semantic markers, but it first filters MutationRecords for relevant disconnected/added/removed controls. Unrelated conversation or side-panel text mutations must not call `markHostSemantics()`, `syncImageUpload()`, or mobile `schedule()`.
- Keep the narrow sidebar observer and `ctx.sessions.list` subscription as the authoritative render invalidators.
- Add a stable mobile-data/render signature. If view mode, locale, query, current session, workspace/session IDs, titles, times, statuses, and relevant settings have not changed, skip `replaceChildren()`.
- Suspend desktop session-row enhancement while under 1024 px and remove existing desktop-only action bars; reattach and rescan when returning to desktop.
- Coalesce overflow-hint reads/writes to one animation frame during scrolling.
- Preserve all current gestures and click-suppression state. Do not introduce virtualization in the first implementation.

### Font Scaling

- Preserve the current final computed font-size, line-height, padding, original inline values, priorities, and 100%/disabled restoration.
- Preserve the current inherited-font compensation order and the measured 80% visual result. The existing element read pass stays batched, but parent-size reads must not be reordered if doing so changes descendant scaling.
- Process removed MutationObserver roots. For roots still disconnected at callback time, restore their original inline values while detached, remove every descendant from `original` and `pendingNodes`, and allow GC. Moved/reconnected roots are not discarded.
- Ensure a later reinsertion is treated as a fresh element and is not scaled twice.

### Summary Geometry

- Continue using ResizeObserver, window resize, and visualViewport resize for actual geometry changes.
- MutationObserver only checks whether the tracked composer, chat flow, header, or mobile shell was replaced/disconnected. It rebinds and schedules only when a tracked reference changes.
- Unrelated message/stream nodes must not trigger `getBoundingClientRect()` or `getComputedStyle()`.

### Summary Migration And Host Compatibility

- Add an additive `GET /api/dsh-better-ux/state-v1?summaries=1` response containing a compact per-session manifest (`revision` and `deleted`), not every summary body. Existing no-query and `sessionId` responses remain byte-shape compatible.
- Migration performs one manifest read. Matching clean revisions require no detail read; only changed revisions use the existing per-session GET before field-level merge, and only local dirty/newer fields reach the existing CAS PATCH. Necessary detail reads/writes may remain proportional to changed/dirty records, but ordinary startup reads are constant and payload size stays bounded by metadata.
- Start migration with `requestIdleCallback` when available and a bounded timeout fallback. Local cached summary display and local settings remain immediate.
- If the running Host does not yet expose `summaries`, fall back to the existing per-session path in the background so refreshing the client before an external Host restart cannot lose or overwrite data.
- `startSummaryArchiveCleanup` tracks archived-set deltas instead of rescanning every archived ID on every workspace-store emission. Initial reconciliation reuses the same manifest: known tombstones require no request, live archived summaries keep the existing CAS DELETE path, and an old Host retains deferred per-session compatibility.
- Local archived caches are cleared exactly once after the workspace snapshot reaches `phase: ready`; hydration is baseline, while later unarchive/rearchive creates a fresh archive epoch that still confirms missing/tombstone state.
- Archive tokens guard every local summary store and Host PATCH retry, so an in-flight fetch/generation/migration cannot recreate a live summary after archive. Newer tokens own their timers/callbacks and cannot be cleared by an older apply cleanup.
- Retryable manifest failures retry only the one manifest request with backoff; malformed/permanent failures stop safely without N detail reads. Newly archived sessions still cancel/retry deletion as before, and cleanup prevents stale async work from mutating an unloaded client.

### Settings Marker Lifecycle

- `startSettingsIcon` performs one initial mark, uses a filtered body observer only to discover/replace the settings owner, and binds character/content observation to that owner. Chat and side-panel mutations never schedule settings marking.
- Queued settings work is disposal-safe; settings mount, locale rerender, replacement, and unload keep the current icon/dataset behavior.

### Inline Client

- Keep a body observer because native menus are portals, but inspect only added/changed menu roots from MutationRecords. Directory/session changes may request one scan of currently open native menus.
- Track the single currently hovered twin element instead of querying every hovered element on every pointermove.
- Early-return outside native menus and preserve `.mpo-root` exclusion, exact geometry, capture click interception, and text-row pass-through.

## Compatibility, Errors, And Rollback

- No new dependency is required.
- DSH Host rc.6 and current hashed/semantic selectors remain supported.
- Host endpoint changes are additive and same-origin protected. Existing clients remain compatible.
- Client handles an old Host response without the bulk field and preserves the old migration behavior in deferred work.
- Product changes remain behind existing feature switches; disabling a module is the immediate runtime rollback.
- Git rollback is limited to new internal implementation changes; user-owned baseline edits must not be reverted.
- Host changes cannot be loaded by this GUI agent. Final live bulk-request validation requires the user to restart the existing `dsh web` process externally.

## Acceptance Criteria

### Functional

- Every browser baseline action above passes after implementation with original settings restored.
- Better UX 7 existing tests continue to pass; new tests pass.
- Inline gains and passes an automated test/check baseline.
- Settings, workspace view, summary values, CAS conflicts, pending/rejected retry, field-level merge, tombstone deletion/recreation, archive cleanup, and old-Host fallback retain current semantics.
- Each feature switch and plugin cleanup restores original UI behavior without visible or active residue.

### Performance

- Twenty unrelated conversation add/remove cycles cause zero mobile list renders and zero session-list child replacements.
- Conversation-update plus typing benchmark produces no plugin long task >=50 ms and no session-list rebuilds unless session/workspace data actually changes.
- Detached-node probe under active 80% font scaling returns to within a small bounded delta after forced GC without toggling scaling off; no monotonic Map/heap growth across repeated runs.
- Ordinary migration of 135 already-synchronized local caches uses one bulk state read after the Host is restarted; startup reads do not scale with cache count.
- Unchanged workspace snapshots cause zero archive-cache reads/Host calls, and initial archive reconciliation adds no per-archived GETs when the manifest already reports tombstones.
- Plain-text subagent-panel streaming causes zero semantic or settings-marker global scans and zero mobile renders; actual semantic-control/settings-owner insertion still refreshes markers.
- Inline mutation and pointer handling performs work proportional to affected/open menus, not all document menus or all previously hovered nodes.
- Drag remains functional and produces no plugin long task >=50 ms in the Chromium touch benchmark.

## Verification Strategy

1. Run Better UX `npm test`, `npm run check`, `node --check`, and `git diff --check`.
2. Run inline `npm test`/`npm run check` after adding scripts, plus `git diff --check`.
3. Verify source hashes match files served from `/plugins/<name>/client.js` after refresh.
4. Repeat the exact Chromium functional matrix and performance probes from this spec on active and completed sessions.
5. Verify an old running Host gracefully falls back before restart.
6. Ask the user to restart the existing DSH Host externally, then verify the bulk endpoint, one-request migration, stored settings, real summaries, CAS conflict, and tombstone behavior.
7. WebKit is not installed in the current Playwright environment. Final WebKit acceptance requires either explicit approval to install Playwright WebKit or an iPhone Safari run by the user; this is a remaining environment constraint, not permission to weaken the implementation.
8. Run an isolated read-only Web frontend review after implementation and personally re-run the critical tests.

## Resolved Decisions And Blockers

- Default targets: mobile Chromium and WebKit/iPhone Safari.
- Non-urgent migration/synchronization may run during idle time; local behavior stays immediate and eventual convergence stays unchanged.
- The 50 ms long-task, zero unrelated list rebuild, constant startup-read, and bounded detached-DOM gates are mandatory.
- No product blocker exists for implementation. Live Host and WebKit final checks require external action or approval as described above.
