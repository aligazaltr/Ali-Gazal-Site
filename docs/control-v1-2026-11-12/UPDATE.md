# Project 02 — publication and review

This branch is a preview, not a production release. Base: V6.1 `29d99b30dd2d519dd58542909c8db1ef1602c01d`.

- `site-data.js`: only approved public identity, purpose, dates and general method. No raw diary, personal incidents, device/location details, mood records, unapproved statistics or final outcomes were imported.
- Project order: Machiavelli → Kontrol Bende mi? → Jules Payot. Payot's research remains intact; its ordinal is third.
- The sixty strokes mean time, never successful days. Dates never automatically complete the experiment.
- `experiment.state` supports preparing/testing/reviewing/production/published. Published requires the existing real-video gate. To update copy, run `node scripts/sync-site.js`, `node scripts/build-archive.js`, `node scripts/sync-seo.js`, then all checks.
- To publish a video later: first obtain the real HTTPS YouTube URL, confirmed title, date, duration and approved final thumbnail. Update the central record and regenerate static HTML. Native links use the existing `video-links.js`; there is no app-forcing scheme or blank player.
- Results require an explicitly approved public summary. Keep `result.published: false`, empty summary and no evidence entries until that approval. Never paste private records into Git, even tests or PR text.
- Thumbnail A and C are review drafts at 1280×720, not video artwork. A explicitly reserves a real-portrait area. No face was generated or borrowed. SVG layouts and a reproducible Python/Pillow exporter are retained under `scripts/control-review/graphics.py`. There is no Python runtime dependency in the site.
- `kontrol-bende-mi-share.png` is a neutral project graphic, not a final video thumbnail. Regenerate its status copy if publication changes.
- Product `.assetsignore` allows only the primary page, scene assets and neutral sharing image. Docs, graphics drafts, alternative HTML and QA code are excluded.
- `node scripts/control-review/build.js [output]` creates an isolated review tree outside the product checkout. It retains both compositions; never merge its expanded QA manifest into main.

No additional tracking, cookies, accounts, API keys, framework, CMS or backend were added. Existing CSP is unchanged.
