# Existing Function And Performance Baseline

## Environment

- GUI: `http://127.0.0.1:3080/`
- DSH frontend package: `@deepseek-ai/dsh-web-frontend 0.1.0-rc.6`
- Better UX baseline: HEAD `9946e71` plus the pre-existing six-hunk `lib/client.js` working-tree change recorded in `spec.md`.
- Inline baseline: HEAD `97bf66a`, clean.
- Automated browser: Chromium mobile viewport 390x844 and desktop viewport 1440x900.
- WebKit: unavailable because Playwright expects `~/Library/Caches/ms-playwright/webkit-2342/pw_run.sh`, which is not installed. No installation was performed without approval.

## Settings Surface

| Module | Code defaults | Current profile at baseline |
| --- | --- | --- |
| Session row | enabled; rename/fork/archive/tooltip enabled | enabled |
| Model picker | enabled; search/providers/efforts enabled; closeOnPick disabled | enabled |
| Mobile layout | enabled; long press/overflow/sidebar compatibility/pinch lock/no autofocus/header expanded enabled | enabled; header collapsed persisted in the tested profile |
| Font scale | enabled; mobile 80%; desktop 100% | disabled; mobile 80%; desktop 100% |
| Conversation summary | disabled; overall/recent enabled; top mode; hover/click enabled; Tab shortcut | enabled; left mode with responsive ball fallback; Tab shortcut |
| Workspace view | workspace grouping; updated order | flat grouping; updated order |

Persistent keys and lifecycle:

- `dsh-better-ux:v1`: local immediate settings.
- `dsh.workspace.view.v5`: native workspace grouping/order.
- `dsh-better-ux:settings-pending:v1:<key>`: retryable leaf changes.
- `dsh-better-ux:settings-rejected:v1:<key>`: permanent client-side rejection diagnostics.
- `dsh-better-ux:summary:v2:<sessionId>`: current summary cache.
- `dsh-better-ux:summary:v1:<sessionId>`: legacy cache removed during migration.

## Better UX Functional Matrix

| Area | Existing behavior | Preserved invariants | Baseline evidence |
| --- | --- | --- | --- |
| Session rows | Injects rename/fork/archive controls into every native tree row; tooltip; hides native menu only when exactly redundant | Direct Fiber callbacks; never hide a menu with extra items; total-switch cleanup | Desktop: 334 marked rows and 334 three-button bars; disable produced 0 bars/0 suppressed menus; restore returned 334 |
| Model picker | Slot-injected trigger; portal panel; search; provider chips; cards; vision twins; effort control; closeOnPick; ESC/backdrop | Directory subscription; native picker restoration; twin grouping | Opened successfully: 10 provider filters, 19 cards, 19 vision controls, six efforts; `deepseek` search reduced cards to 5; Escape closed |
| Mobile shell | Two/three row fixed shell; workspace/session strips; status; search; view/order menu; native item menu; header toggle | Native sidebar silently expanded and restored; exact current session source; no page horizontal overflow | 333 session items; search opened; four view choices; header 0px -> 75px -> original collapsed state; document 390/390 with `scrollX=0` |
| Mobile gestures | Horizontal native scrolling; 420ms long press; previous/next sorting capsule; post-drag click suppression | Native Fiber drag/drop; no accidental session navigation | Synthetic pointer hold at 480ms opened one sort capsule; no reorder action was invoked against real data |
| Mobile image input | Adds an image button next to native commands and dispatches a DataTransfer-backed paste event to the textarea | Native upload/preprocess pipeline; multi-file behavior | Button was present and correctly disabled in the tested read-only completed session; no real file was selected |
| Pinch/focus/sidebar compatibility | Viewport pinch lock, multi-touch prevention, 1500ms focus suppression, semantic panel/toggle relocation | Restore original viewport and sidebar collapse state | Mobile module disable removed shell/body/frame/image state; restore recreated shell and image button |
| Font scale | Separate 10%-200% mobile/desktop scaling of font, line height, and padding; dynamic-node support; exact restore | Original inline values and priorities; excluded script/style/svg/br | 20/30px + 10/20/30/40px fixture became 16/24px + 8/16/24/32px at 80%; restore reproduced original `!important` cssText exactly |
| Conversation summaries | Top/left/ball; responsive fallback; hover/click lock; four collapse dimensions; shortcut; model/effort; auto refresh; token usage | No session-event side effect; immutable sentence formatting; recent is last completed pair only; editable targets bypass shortcut | Ball opened one populated panel with overall/recent content and usage; relocked; temporary state/settings restored |
| Host synchronization | Shared settings/workspace view/summaries in JSON KV; serialized writes; revisions/CAS; retry and conflicts | Field-level merge; pending queue; tombstone revisions; archive cleanup; recreation from tombstone revision | Existing Host tests cover GET/PATCH/DELETE, 409, serialized writes, tombstone and recreation; 7/7 suite passed |
| Locale | Chinese/English dictionaries and live locale subscription | Dictionary fallback and immediate rerender | Chinese labels observed across mobile controls, summary and picker; static inventory confirms paired dictionaries |
| Disable/unload | Per-module and global cleanup | Original DSH controls become active again; observers/listeners/DOM removed | Session row, model picker, mobile layout and summary visible states were toggled with direct temporary local settings and restored exactly |

Destructive actions deliberately not executed against real user sessions: rename, fork, archive, reorder, model/effort selection, message/image send, and summary regeneration. Their callback/API contracts were inspected and existing Host summary tests were run; post-change acceptance must continue using non-destructive interaction unless a disposable fixture exists.

## Inline Functional Matrix

| Area | Existing behavior | Baseline evidence |
| --- | --- | --- |
| Host providers | Maps base providers to vision twins, handles `deepseek-official -> deepseek-vision`, filters helper providers, orders parents and twins, restores host function on unload | Static code inventory; syntax check passed |
| Native model menu | Hides standalone vision groups and marks matching base rows with twin provider/model datasets | Better picker was temporarily disabled: 38 radio rows, 18 groups, 9 hidden groups, 19 twin rows |
| Hit behavior | 26px button, 4px gap, 34px hit width, chevron-relative branch; capture click only in twin area | Exact constants/branches inspected; no real selection invoked |
| Selection | Uses current session directory `select({ provider, model })` | Code path inspected; current model left unchanged |
| Coexistence | Ignores Better UX `.mpo-root`; stays idle without required directories | Enhanced picker operated with all 19 vision controls; native decoration appeared only after temporarily disabling it |
| Lifecycle | Re-subscribes on session changes and removes observer/listeners/style/subscription on unload | Static cleanup contract recorded; automated coverage absent at baseline |

## Automated Baseline

### Better UX

- `npm test`: 7 tests, 7 passed, exit 0.
- `npm run check`: exit 0.
- Existing tests cover official client module loading, isolated summary endpoint behavior, serialized state/CAS/tombstone behavior, incremental timeline extraction, compacted surface messages, latest completed turn purity, and lossless chunking.

### Inline

- `node --check index.js && node --check lib/client.js`: exit 0.
- No test files or test script existed at baseline.

## Performance Baseline

### Cold Navigation

| Page | Window | All requests | Better state requests | Vision requests | DOM elements |
| --- | ---: | ---: | ---: | ---: | ---: |
| Active/long session | about 8.05s | 236 | 135 | 5 | 13,967 |
| Completed session | about 8.06s | 233 | 133 | 2 | 14,530 |

The local profile contained 135 v2 summary cache keys. The state reads therefore scale linearly with cached summaries.

### Controlled Plugin Attribution

| Configuration | Window | TaskDuration | ScriptDuration | Max event-loop lag | Requests |
| --- | ---: | ---: | ---: | ---: | ---: |
| Better UX + inline active | 8s | about 559ms | about 216ms | about 96ms | 371 total / 270 Better state |
| Both plugins blocked | 8s | about 91ms | about 13ms | about 21ms | 106 |
| Better UX only | 6s | about 314ms | not separately recorded | not separately recorded | Nodes +6,802; heap +8MB |
| Inline only | 6s | about 131ms | not separately recorded | about 12ms | Nodes -85 |

Temporary request routes were removed after measurement.

### Mobile List Regression

- Current flat strip: 333 items, 390px client width, 69,027px scroll width.
- Twenty unrelated conversation add/remove cycles:
  - 20 `dsh-mobile-shell-rendered` events.
  - 6,660 session children added and 6,660 removed.
  - TaskDuration +665ms; ScriptDuration +376ms; layout +76ms; style recalculation +101ms.
  - Long tasks: 78ms, 96ms, 88ms.
- Thirty stream-like cycles while inserting 21 characters:
  - 39 mobile renders.
  - TaskDuration +1.193s; ScriptDuration +702ms; layout +143ms; style recalculation +201ms.
  - Automation-side insert latency averaged 10.6ms and peaked at 25ms on this Mac; the plugin main-thread amplification remains the mobile-phone risk.
- Forty-step CDP touch drag with no conversation mutations:
  - Scroll moved 341px.
  - TaskDuration +212ms across the full gesture.
  - No individual long task >=50ms.

This isolates the regression to erroneous render invalidation during normal conversation updates, not the native horizontal gesture alone.

### Detached DOM Regression

With font scaling temporarily enabled at 80%, 50 transient roots containing ten child spans each were added and removed one per animation frame:

- After forced GC while scaling stayed enabled: Nodes +169,600; heap +32.50MB; TaskDuration +2.791s.
- Disabling font scaling released 172,992 nodes and about 35.34MB.

The amplification combines each frame-triggered 333-row mobile rebuild with the iterable font-scale Map retaining every removed list generation.

## Verified Improvements

- T01 mobile invalidation: the final served client ran 20 unrelated add/remove cycles plus 21 input characters with 0 session-list additions/removals, 0 shell-chrome mutations, 0 >=50ms long tasks, 0.105s TaskDuration, and 1.02ms average / 3.1ms max synchronous input latency. A 40-step touch drag moved 305px with 0 list mutations, 0 >=50ms long tasks, and 0.082s TaskDuration. Native sidebar text-node updates schedule the cheap source render without global semantic scans; selection changes still rebuild and restore the 335-item list.
- T01 viewport lifecycle: mobile has 0 desktop action bars; switching to 1440px restored all 335 bars and redundant-menu markers; switching back removed all of them and retained document width 390/390. Overflow rAFs no longer read localStorage.
- T02 detached font state: after T01 isolated the remaining leak, 20 roots x 10 spans retained exactly 420 DOM nodes under the old font lifecycle. The final three forced-GC rounds each retained 0 nodes; incremental heap deltas converged from +18,460 bytes to +4,176 bytes to 0. The 80% visual contract (16/24px and 8/16/24/32px padding) and exact `!important` restore remained unchanged; connected DOM moves did not double-scale.
- T03 summary geometry: 20 unrelated conversation mutation cycles fell from 195 summary `getBoundingClientRect()` reads to 0. Replacing and restoring the tracked composer target still caused 10 reads each way, and the mobile ball returned exactly to x=8/y=96.
- T05 inline behavior: 19/19 automated checks pass after independent review caught and repaired root-cell remount, late store-hook, and queued-cleanup regressions. Live native menu remains 18 groups / 9 hidden / 19 twin rows; hover tracks one row; 20 unrelated mutations caused 0 full menu scans. Host provider ordering has no diff from baseline.
- T04 summary migration: the additive metadata-only manifest covers live records and tombstones without summary bodies; malformed selectors are rejected while old GET/CAS/delete/recreate behavior remains green. A 135-cache browser fixture used 1 manifest GET, 0 detail GET, and 0 PATCH; one changed revision added exactly 1 detail GET; malformed input preserved local state without fallback amplification; equal clean/dirty tombstones deleted/recreated correctly.
- T07 archive cleanup: the exact old-Host fixture used 135 state calls / 133 session GETs, including 131 archived candidates. The new manifest fixture uses 3 total state calls (settings, current session, manifest), with 0 archived GET/DELETE. Fifty unchanged ready snapshots perform 0 cache reads/removes; add and unarchive/rearchive each create one fresh confirmation epoch. Initial live entries DELETE directly at the manifest revision, missing/tombstone entries skip, 409 live retries the returned revision, and 409 tombstone stops. Legacy fallback still reaches all 131 entries with max archived concurrency 1. A 503 retries only the manifest after 1,002ms; malformed metadata stops after one bulk request. A fresh archive after terminal/malformed manifest now performs only its own bounded delete rather than reviving startup-wide fallback.
- T08/T09 semantic/settings filtering: 20 side-panel span add/remove cycles fell from 40 `markHostSemantics` calls / 200 selector scans to 0. Ordinary conversation and panel buttons also cause 0 scans; an actual layout owner and exact `aria-label="展开侧边栏"` still trigger mobile semantic work, and a dynamically mounted settings slot marks the exact `交互体验` cell. Final source-path text updates also produce 0 global semantic scans.
- Final review hardening: delayed component-owned summary GET/PATCH work carries a mount AbortSignal and rechecks owner identity; Host/client Unicode IDs count code points; terminal manifest failure cannot disable later fresh-archive deletion. Later red-green fixes add monotonic archive/unarchive epochs across GET/PATCH/migration/generation, entry-owned DELETE AbortSignals, dirty-summary recreation over late tombstones, same-field retry ownership after stale success, request-owned generation reset, repeated-tombstone revision fencing, adjacent pending-key snapshot cleanup, and failed-ID-only old-Host migration retries. A transient `b` failure now produces Host calls `a,b,b` instead of `a,b,a,b`, while retry key enumeration stays `2→2`; manifest-level retries retain the filter. Better UX passes 23/23 tests; inline passes 19/19. Isolated read-only review reran both Host queue orders and all reported race seams against source SHA-1 `eed9d7a0ad827931e5abfec027bd6ad9b1d422d6` and reported No Findings. Source and served Better UX client hashes match; inline source/served hashes are both `59b888d17e9f64a1659a506213d2e65266ee8761`.
- Post-restart final browser acceptance uses stable Playwright 1.62.1 direct API with system Chrome 151; the `@playwright/cli` 1.63 alpha path still asserts, but Chromium itself is usable. On final source `eed9d7a0ad`, a 336-item/69,566px flat list records zero renders, list replacements, summary geometry work, and long tasks for 20 unrelated cycles and 30 streaming cycles plus 21 input characters (1.24ms average, 4ms max); 40 touch steps move 355px with zero long tasks. Three forced-GC font rounds report Nodes `0/0/0`, exact `20px !important` restoration, and no list render. Active-summary streaming reports zero geometry work; side-panel plain streaming reports zero semantic/settings global scans while a real owner marker still refreshes. Functional checks preserve search, four view choices, 420ms long press without reorder, header `0→76→0`, two-section summary panel, 10/19/19/6 enhanced picker counts, 335 desktop action bars and all disable/restore paths, image DataTransfer paste dispatch, and inline 38/18/9/19 decoration with unchanged model/settings. A 151-cache live startup performs one settings GET plus one manifest GET, zero details and zero writes.
- Actual Safari 26.5 WebDriver acceptance runs at a true 390x792 CSS viewport with DPR 2. Search is `5→1→5`; all four view choices remain; the flat list has 336 items / 67,885px and body `scrollX=0`; a trusted touch pointer opens the 480ms capsule without reorder and selects the current session. Header, summary, picker, Inline, desktop rows, feature disable/restore, image DataTransfer paste, and font lifecycle match Chromium (`0→76→0`, 2 sections, 10/19/19/6, 38/18/9/19, `335→0→335`, `20px→16px`, detached `20px !important`). Chat, side-panel, and 30-stream-plus-21-input probes record zero renders, list mutations, geometry reads, and semantic/settings scans; input averages 0.14ms / max 1ms and rAF max is 19ms. Safari lacks the Long Tasks API. Desktop Safari does not translate WebDriver touch pointer movement into native scrolling, so a trusted horizontal wheel action verifies the real WebKit scroll path: 355px movement, zero rebuilds, rAF max 19ms. All temporary settings, textarea, file input, fetch wrappers, Host settings hash, Safari session, and safaridriver process are restored/closed.
- After explicit user approval, Playwright 1.62.1 WebKit 26.5 v2336 runs the iPhone 15 descriptor at 393x659/DPR3 with Mobile Safari UA. Search is `5→1→5`; the flat list is 336 items / 67,883px; 480ms long press, header, summary, picker, image paste, Inline, feature rollback, and `335→0→335` desktop rows match Chromium and actual Safari. Chat, side-panel, 30-stream-plus-21-input, and 40-step scroll phases each record zero renders, list mutations, geometry reads, and semantic/settings scans; input averages 0.24ms / max 1ms, scroll moves 360px, and all rAF maxima are 19ms. Mobile WebKit does not expose Long Tasks or trusted mouse-wheel injection, so programmatic 40-step container scroll is paired with the actual Safari trusted-wheel result and the mandatory Chromium touch long-task gate. Three detached font probes under still-active 80% scaling are all unreachable through WeakRef after `page.requestGC()`, while exact 20px/16px/move/detach/reinsert styling remains correct. Local settings, textarea, intercepted writes, and live Host settings are restored; WebKit contexts close cleanly.

## Regression Provenance

- The initial visible commit already contained passive scroll and animation-frame coalescing.
- Before conversation-summary commit `e5153dd`, the body observer filtered changed nodes and only scheduled when sidebar/source ownership changed.
- `e5153dd` introduced `attachFrameObserver`, a frame-wide `childList/subtree` observer, and summary geometry observation. The frame observer bypasses the older narrow invalidation boundary.
- Inline independently observes `document.body` and listens to document-level capture pointer movement/click; its measured cost is smaller but structurally unbounded.

## Acceptance Gates

- No unrelated conversation mutation may rebuild the mobile list.
- No plugin-attributable drag/input long task may reach 50ms in the repeatable Chromium probe.
- Ordinary startup summary reads must be constant rather than proportional to cache count.
- Detached nodes/heap must not grow monotonically while font scaling remains enabled.
- Every functional row above and all synchronization/CAS/tombstone invariants must remain intact.
- WebKit/iPhone Safari remains a required final environment check, not a reason to weaken these gates.
