# Cinematic Opening V2 — 4K preview integration

27 November 2026 (Istanbul). Continues preparation commit 968325803b502e6eae9a43bf38cf3f5a0496017b.
No new generation, subscription, main merge or production promotion.

## Existing result verified
- Original Genjutsu job: 8caa7a82-da1b-4be0-a7d4-5be228ab830d.
- Existing ByteDance Standard upscale job: c1b50b35-3fce-4f5e-bb94-b1a5b82e992f.
- Source master: 3840×2160 H.264 / yuv420p; 24 FPS; 241 frames; video duration 10.041667 s; MP4 container duration 10.042 s.
- Source bytes: 26855351; SHA-256: b88d3470ec9b669c87c28b0695332be8951019306d8438b00cd2faccf624f4cb.
- Web derivative: same resolution, 24 FPS, 241 frames and video duration. H.264 CRF 20, fast preset, faststart; no interpolation or new AI processing.
- Web bytes: 21637294; SHA-256: e3c779fbf817986bc1e995cf62c8ec7c472f254f3ae50984df6599c6f1cd8284.
- Confirmed web upload ID: a198dd73-2faf-4c6c-8b55-4d131761d5e4.
- Web URL: https://d2ol7oe51mr4n9.cloudfront.net/user_3Jn7h2Ol7BOSeAjF9ToYAnGUJnF/a198dd73-2faf-4c6c-8b55-4d131761d5e4.mp4

## Visual comparison
Matched-time detail crops inspected at 0, 4.8 and 8.5 seconds. Stone joins, shelving and foliage are visibly clearer, and the selected composition and camera path remain recognizable. This is AI-upscaled footage, not native 4K generation or a recovered exact 3D model. Original AI texture instability may remain.

## Integration
The isolated /cinematic-opening preview requests the confirmed 4K web derivative. The preserved local cinematic-film.mp4 remains the network/decoder fallback. Sources are fully buffered as before to retain reverse seeking on preview hosts without byte-range support. The 4.8 s automatic handoff, scroll mapping, typography, CSS, poster and original 480p assets remain unchanged.

CSP connect-src adds exactly the confirmed media file URL, not an entire external host or wildcard. Local scripts, frame protection, media blob policy and every other directive remain intact. The protected fixture changes only the reviewed _headers hash.

## Validation
Static data/archive/SEO/site checks passed. 112/112 Node tests passed, including HD success, network failure recovery, decoder recovery, and explicit failure handling.
Actual deployed-browser verification is the remaining delivery check; no physical Android verification is claimed.

## Scope
Only this first ten-second journey is completed for high-resolution review. The rest of the homepage narrative remains future work. Water still stops when scroll-controlled footage pauses. No visual redesign, new paid generation, subscription, or production publication.
