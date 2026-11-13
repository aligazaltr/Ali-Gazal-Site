# Control V2.2 — visual correction

V2 (80d449b) supplied spatial travel through nine closed frames, but also unwanted centre/cross rays. V2.1 (8c21eaac) removed that geometry and left only a radial field; a project-wide flat background also hid the site's warm light and paper texture. Passing tests did not make those decisions visually successful.

V2.2 uses three receding open material corners at near/middle/far depths. Each has two visible sides, projected from the same moving zero centre. A continuous camera advances through these depths. Thin warm inner edges and filled material bands provide spatial movement; a radial wash only supports it. No closed gate rings, central target, rays or horizon return. The geometry fades as the unchanged question opens.

The first prototype resembled heavy doors; a thinner variant still put too much structure outside the small aperture. Both were rejected during browser review. The final staggered corners show depth through the zero earlier, then expand toward the viewer. Browser captures at 20/30/40/50/60/70 percent were inspected before the complete technical test run. Comparison boards include actual V2, V2.1 and V2.2 renders at 30/50/70 percent.

The flat Control body override was removed. The sticky stage is transparent. The original styles.css body radial light, fine repeating texture and theme colours show through unchanged. At the final frame the depth world is transparent, leaving the actual page background shared with the dossier rather than a duplicate painted backdrop.

The V2.1 native clipPath and viewport-baked numeral paths remain. Camera, initial 60, question and final frame samples match the approved V2 at 1,005 sample/width combinations. Seventeen protected files (including global styles, thumbnails, Machiavelli, central data, headers and deployment allowlist) and the dossier tail are hash-checked unchanged.

## Evidence and limits

- 88/88 Node tests; sync-site, build-archive, sync-seo and check-site passed.
- Cloud Chrome browser: 360,390,430,1024,1440 CSS-pixel layouts, both themes; 110 forward progress states plus reverse/critical coverage checks. No overflow, JS errors or CSP violations in these scenarios.
- Seven fallback cases: scripts sandbox-disabled, reduced-motion injected before scene initialization, no IntersectionObserver, enlarged text, short viewport, missing engine, delayed engine. These are controlled browser scenarios, not operating-system preference/device tests.
- Seventeen lifecycle observations: fast/reverse and slow scroll, short landscape and return, midpoint reload, test-only 12ms parent workload. Workload is not a CPU or low-end device benchmark.
- Keyboard-visible focus, four disclosure records and theme persistence checked.
- Actual browser screenshots saved; raw frame metadata and browser results accompany the comparison boards. Layouts are iframe-based browser emulation. Browser devicePixelRatio is not changed. Physical Android Chrome, mobile Firefox, high-DPR GPU tearing and continuous video recording are NOT verified. The user's original phone artifact must still be checked on that phone.
- Preview-only lab uses its own branch and expanded asset manifest; neither QA root files nor its deployment configuration are included in the product branch. Product release allowlist remains unchanged.

This is ready for the user's visual review, not a declaration of aesthetic approval. Main and production remain untouched. PR #19 remains stacked on PR #18.
