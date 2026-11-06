# Assessment B — detector and browser evidence

Stable source: `/tmp/ali-gazal-baseline-v5`, commit `af82ac9`. Targets: `hakkimda.html`, `rehberler.html`, `machiavelli.html`. Assessment A was neither read nor contacted. No product source was edited. Browser work used my own Chrome ID 1 tab **7**, with `b6tab` binding; root tab 4 was not used.

## Deterministic scan

Executed the exact requested source command (verified installed engine 0.1.18) with clean environment, no telemetry, no URL/CDP scan. Exit **2** = findings. Raw output is `/tmp/ag-v6-detector-before.json`.

Important count limitation: the explicitly requested command supplies the three named files **and `.`**. Thus it scans those pages twice and additionally scans the rest of the project. Raw output is **279 records**, including **112 target records**. Removing only the duplicate target pass yields **56 target element findings: 53 warnings and 3 advisories** (the advisories are `overused-font`). Counts below refer to one target pass. Exact JSON-record deduplication yields 34 target records, but that also merges separate same-snippet elements because the engine reports every finding at line 0; it is not a sound element count.

| Rule | About | Projects | Machiavelli | One-pass total |
|---|---:|---:|---:|---:|
| cramped-padding | 3 | 1 | 26 | 30 |
| italic-serif-display | 4 | 1 | 1 | 6 |
| undersized-ui-text | 3 | 0 | 2 | 5 |
| dark-glow | 1 | 1 | 2 | 4 |
| hero-eyebrow-chip | 1 | 1 | 1 | 3 |
| overused-font (advisory) | 1 | 1 | 1 | 3 |
| repeating-stripes-gradient | 1 | 1 | 1 | 3 |
| kicker-above-heading | 1 | 0 | 0 | 1 |
| border-accent-on-rounded | 0 | 0 | 1 | 1 |
| Total | 15 | 6 | 35 | 56 |

The `.` scan additionally warns it cannot read linked `_launch-qa.css` under both `scripts/launch-qa` and `scripts/v5-qa`; those are QA source filenames, not missing production stylesheets. Do not count them as product failures. All detector file line values are **0**; source locations below were resolved by inspection.

## What to act on, and what not to enforce blindly

**Primary useful detector signal:** undersized text. `editorial.css:17` sets `.chapter-label .eyebrow` to `.65rem` (10.4px): NEDEN BU PROJE?, ÇALIŞMA FELSEFESİ, ŞEFFAFLIK. `machiavelli-scene.css:6,52` sets `.mc-edition` to .6rem desktop / .48rem mobile: BİR KİTAPTAN, GERÇEK HAYATA. At 16px root this is 9.6px / 7.68px. Raising these to a readable floor preserves the visual identity and improves legibility. Also inspect `.mc-film figcaption`, `.mc-outcome .eyebrow`, `.mc-date`: desktop values .62/.6/.67rem are below 11px although the detector did not enumerate all of them. Mobile overrides already bring several to 11px.

**Do not treat every cramped-padding warning as an actual cramped layout.** About identity has 2rem left padding (`editorial.css:6`); chapter has 3–6rem block padding (`:14`). Mach article sections have 3.5–5.5rem block padding (`styles.css:1292`), phase panel has 1.3–2rem padding (`:1151`). Browser desktop screenshots show substantial space. These appear to be selector/cascade/logical-property or edge-detection limitations. Individual evidence rows still merit visual review, but adding padding to every flagged section would inflate the page and worsen reading length.

**Brand-specific false positives / intentional choices:** the serif emphasis is part of a literary creator identity; most h1s are bold sans with a short italic orange phrase, not an entirely italic headline. About live h1 computes `font-style:normal` and 81.78px at 1363px viewport. The detector labels it a 72px italic Georgia h1 from descendant style inference. Keep the hierarchy and literary emphasis unless A independently finds monotony. The chapter kickers convey document structure; do not delete solely because a SaaS heuristic dislikes them. `overused-font` is advisory: source declares Inter then system fallbacks, with no downloaded Inter font evidence in the observed resource list; it is not proof of a generic-brand failure. Thin graphite/orange rules, a tiny accent shadow, and subtle repeating texture can be intentional. Keep the AG rings and home words. No rule warrants removing the cinematic Mach opening, inventing media, or replacing the real cover/portrait.

## Browser observations

Inspected top-level preview About, Projects, Machiavelli at **1363×936**, dark theme. All three show a single h1, meaningful links, active navigation, preview context controls. Machiavelli loads real portrait and cover (`naturalWidth` 480 and 1280), with `.mc-scene.is-directed.is-scrolling`, stage height 860px; screenshot confirms the cinematic portrait/title opening. Projects' lazy cover was initially blank at the first immediate screenshot, then read as loaded `naturalWidth:1280`; do not report a persistent missing asset from that transient capture.

Used existing baseline QA UI in **my own tab**, not root's QA. Reproduced root-font 200% failures with UI check/select/click, then read frame geometry through documented read-only locator evaluation. No DOM injection.

| Target, 390px iframe | Client width | Document width | Verified owners |
|---|---:|---:|---|
| About, text 200% | 375 | 431 | Opening first child width 377.53px from x32; identity same width; chapter child 361.52px from x32; rings extend right to 415.94px |
| Projects, text 200% | 375 | 420 | `.project-card` width 311px, padding 36.8px; single grid track resolves to **350.375px**; cover/copy/link right edge **420.17px** |
| Machiavelli, text 200% | 375 | 511 | Phase state `Geçildi` right edge **511.23px**; `.article-main` right **470.47px**, intrinsic width **438.47px** |

The 390px iframe has a 15px vertical scrollbar, so 375px client width is expected; failures are materially larger than that scrollbar. These observations match saved `text-28.json`, whose 14/28 failures include both themes and About at 768px. This is **root-font resize simulation, not native browser zoom or a WCAG pass**.

## Concrete source hypotheses and repair direction

### 1. Text 200% overflow — high confidence, reproduced

`editorial.css:49,56`, `styles.css:1806,1817,1903` replace constrained tracks with bare `1fr`. Bare 1fr retains min-content minimums. `.project-copy`, `.article-main`, About opening children lack `min-width:0`; at increased text sizes the grid becomes wider than its own 311px container. The Projects card is a direct measured demonstration (350.375px track inside 311px border box with 36.8px padding). Use `minmax(0,1fr)` and child `min-width:0`, allow long text/link labels to wrap, and provide non-destructive wrapping for long Turkish words. Keep ordinary-size typography/composition.

`styles.css:1979` uses mobile phase row `2rem 1fr auto`; at 200% the fixed marker, padding, gaps, unbreakable phase word and state label exceed available width. Use a constrained flexible track plus state placement/wrapping appropriate for narrow space. `.project-facts` also overflows its second column at 200%. The about mark is a fixed rem-sized decorative object in a `1fr auto` identity grid (`editorial.css:51`); constrain or relocate it at text-size stress while retaining rings. About h1's mobile minimum `2.75rem` becomes **88px** at 200%; that and long unbroken terms create intrinsic pressure. Fix wrapping/container minimums, not global text clipping or hidden overflow.

### 2. iframe scene fallback — clear trigger, underlying network cause not proven

Saved `published-layout-28-final.json`: 8/28 failures, all published Mach fixture; fallback records height740/reducedfalse/completetrue/naturalWidth0. Saved video behavior: 2/11 failures (controller not active, focus z-index condition dependent on directed state). Source `machiavelli-scene.js:33` explicitly falls back on `(image.complete && !image.naturalWidth)`. A broken or aborted image counts as complete; this does not mean it decoded successfully. `:57–58` listens for one load/error and `measure()` runs immediately. `fallback()` clears directed layout safely; it does not retry a terminal failed image request. Preserve safe static content.

`machiavelli.html:81` supplies eager portrait src/srcset. The QA iframe lifecycle (`scripts/v5-qa/qa.js:7–25`) replaces successive same-origin documents that share the same image URL; source comments document that removing a predecessor can abort a shared in-flight Chromium image request. Keeping previous alive until `load` and serializing buttons reduces the risk, but historic failures remain. The decode wait uses `Promise.allSettled` so image decode rejection is deliberately ignored before controller polling. The candidate failure is therefore image-request/decoding state in the embed lifecycle, not absence of the animation code or fabricated media.

**Current bounded recheck:** top-level preview directed scene succeeds. QA UI `_v5-published.html`, dark390×740 also succeeds on this run: scene true, portrait naturalWidth312, cover1280, no errors/violations, correct gated native link. This is intermittent/history-dependent; do not claim repaired or mark old 8 failures resolved from one successful sample. Next diagnostic should retain actual image error/decode reasons and resource response/abort timing per failed iframe load, distinguish fixture lifecycle from production, and verify real top-level loads. Product-level recovery should allow remeasurement on later successful decode/load and avoid a permanent false fallback; never force `is-directed` to make tests pass.

### 3. CLS .117759 — high-confidence suspects, attribution not collected

Saved `performance.json` reports identical CLS .11775915115445179 for baseline and candidate at 1363×936; LCP 188–568ms, no long tasks, no field INP. The prelude (`scripts/v5-qa/prelude.js:12–18`) accumulates values but **does not save layout-shift source nodes or timestamps**; a causal verdict is unavailable from that file.

Two concrete startup geometry mutations deserve attribution:

1. `site.js:86–102,108–113` constructs `.preview-notice` only at DOMContentLoaded and inserts it immediately after the header. It has no server-rendered reserved space and shifts all subsequent content by its roughly 64px desktop height. This exists on preview hosts, not necessarily production, so preview CLS must not be presented as production field CLS.
2. `machiavelli-scene.js:30–44` immediately switches the static fully flowed opening to absolute-positioned directed composition and adds computed scene height; the portrait load listener runs `measure` again. Static-to-directed layout can displace subsequent content and the title/portrait before first settled paint. Intrinsic img width/height already exist, so simplistic 'add image dimensions' is not an adequate fix. Reserve the intended enhanced geometry early while preserving no-JS/static flow, and measure under load conditions before changing the effect.

The startup theme button also changes `hidden` at DOMContentLoaded (`theme.js`) but its header has minimum height and is a secondary suspect. Source uses system fonts with Georgia, so a webfont swap is not supported by the observed resource evidence. Repeating the aggregate CLS without layout-shift attribution will not identify which of these dominates.

## Limits / run notes

- Browser inspection available and used; no headless browser scripts or engine URL/CDP scans.
- **Overlay skipped:** browser `evaluate` is documented read-only; mutable script/style injection is unavailable. No detector ran inside the page, no reliable user-visible overlay exists. Source scan and read-only geometry are the fallback evidence.
- **No local/live server started**, so no server cleanup required.
- No source edit, commit, PR, deploy, video publication, or production change.
- Root owns synthesis, persistence, questions, and the single computer-use completion summary. This sub-agent intentionally does not emit one.
- Detector output remains raw and bounded report is in `/tmp/ag-v6-assessment-b.md`. No Assessment A output consumed.
