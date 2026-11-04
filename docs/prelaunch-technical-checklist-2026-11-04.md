# Ali Gazal — Launch readiness / technical operations checklist (2026-11-04)

**State:** Preparation only. Nothing here certifies the production site's security. Domain purchase, DNS/WAF/account settings, and end-to-end HTTP verification require authorized account access. Do not merge or deploy without reviewing a preview.

## Current verified repository facts

- Static HTML/CSS/vanilla JS, Cloudflare Workers static assets, no member login/database/payment system, build checks under `wrangler.jsonc`.
- GitHub `main` at baseline: `7b238f140a67c840b425933eba09bee33afb76a0` (Cinematic 4.2).
- `robots.txt`, `sitemap.xml`, canonical/OG/Twitter meta tags exist. They currently reference `ali-gazal-site.aliicerikmedya.workers.dev`.
- `site-data.js` intentionally has `projects.machiavelli.video.published=false`; do not mark as published until real YouTube URL and final metadata are verified.
- A draft `_headers` security baseline is proposed in this PR. Report-only CSP is **not protection/enforcement**; audit browser reports before considering enforcing it.

## Stage 1 — Before the first YouTube publication (no layout redesign)

1. Protect **GitHub and Cloudflare** accounts with a passkey or authenticator-based 2FA, unique passwords, and recovery codes stored offline/in a password manager. Review authorized apps/tokens, remove unused privileges. **Owner/account action.**
2. Decide and purchase a brand domain after checking availability, renewal rate, registrant identity, domain lock, and automatic renewal. E.g. `aligazal.com` only if actually available. **Owner/payment action.**
3. Add the domain to Cloudflare DNS as an active zone; connect to the existing `ali-gazal-site` Worker using **Custom Domain** (rather than replacing hosting). Confirm DNS/edge certificate and `https://` access. Configure one canonical host (apex or www) and redirects. **Owner/Cloudflare action.**
4. When the **chosen domain is active**, update every canonical/OG/Twitter URL, `site-data.js` canonicalOrigin, `robots.txt`, `sitemap.xml`, test expected URLs and share-context logic **together**. Do not guess the hostname now. Redirect legacy links if technically possible; retain functioning old links during transition. **Code + Cloudflare action.**
5. Test homepage, /machiavelli, /dusunce-arsivi, /hakkimda, /rehberler, /irade-terbiyesi on Android and desktop, dark and light themes; check real WhatsApp shares and thumbnails; inspect browser console/network and actual response headers. **Owner + developer.**
6. After video is public: update the real YouTube URL, title, publishedAt, duration and verified chapters; follow `README.txt` site handoff; run `sync-site`, `build-archive`, `check-site` and `node --test scripts/test-*.js`. Never publish an invented URL. **Developer after owner supplies publication facts.**

## Stage 2 — Security settings, after checking custom domain

- Confirm HTTPS works and enable **Always Use HTTPS** only after checking certificates/redirect loops.
- Enable/check Cloudflare **Free Managed Ruleset** for the domain; assess whether Bot Fight Mode is needed for a static site, and watch for search-engine/reader false positives rather than turning on every challenge.
- Enable **DNSSEC** with proper registrar/Cloudflare delegation and confirm active status; use registrar lock and automatic domain renewal.
- Keep build/deploy credentials least-privileged; never store Cloudflare API tokens or personal information in `site-data.js` or public assets. Restrict who can merge to main; review PR and test before deploy.
- `_headers` adds clickjacking/MIME/referrer/permission hardening for **static-asset responses only**. Its CSP is `Report-Only`; test and later choose an enforcing CSP that does not break legitimate interactions. Do not enable HSTS preload casually; consider HSTS only after the canonical domain and every necessary subdomain support HTTPS.
- Confirm no secrets or private archives are publicly available in uploaded assets. Verify `.assetsignore` and check actual deployment contents.
- Make an independent off-platform backup (repository export + imagery + recovery information), document recovery/rollback and domain expiry reminders.

## Stage 3 — Discoverability, trust, privacy and operations

- Verify the final domain in **Google Search Console** and optionally Bing Webmaster Tools; submit the final domain's `sitemap.xml`.
- Track uptime, build failures, new 404s and broken links. Review Cloudflare Security Events; don't buy monitoring or anti-hacker products without a concrete need.
- Audit third-party scripts, analytics, cookies and localStorage. Theme preference uses `localStorage`; adding nonessential analytics/marketing cookies may require informed consent and KVKK-compliant notice. Do not add an unnecessary cookie popup by default.
- Consider a simple truthful contact/privacy page if visitor data or contact methods are introduced. Do not invent an address, company, phone number or legal obligations.
- Keep current 4.2 design intact until after initial YouTube publication. Add authentic film stills/work samples later, only with authorization/licensing.

## Verification gates before merging the security-header PR

- Confirm Cloudflare recognizes the root `_headers` file with `.assetsignore` allowlisting; check live/previews with `curl -I` or browser devtools.
- Verify `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and `Content-Security-Policy-Report-Only` reach HTML responses.
- Run site tests; check theme, portrait scroll scene, archive discovery, outbound YouTube link and share buttons on a preview. A CSP error in report-only is an observation, not an enforced block. Tighten/evaluate before converting to enforced CSP.
- Confirm preview and domain changes do not unexpectedly modify production's canonical URLs.

**Non-goals:** No registration/payment, no Cloudflare account security setting changes, no production merge/deploy, no domain rewrites or YouTube publication until the needed owner data/actions are available.
