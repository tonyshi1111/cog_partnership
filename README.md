# Cognition Partnership Strategy — One-Pager

A single-file static site pitching Tony Shi for a partnership leadership role at Cognition.

## Quick deploy

**Option 1: GitHub Pages**
1. Create a new repo, push `index.html` to the root.
2. Settings → Pages → Source: `main` branch, `/ (root)`.
3. Site is live at `https://<username>.github.io/<repo>/` in ~60 seconds.

**Option 2: Netlify / Vercel / Cloudflare Pages**
1. Drag the folder onto Netlify Drop, or connect the repo to Vercel/Cloudflare.
2. No build command. Output directory: `.` (root).

**Option 3: Local preview**
```bash
cd cognition-site
python3 -m http.server 8000
# open http://localhost:8000
```

## File structure

```
cognition-site/
├── index.html      # Everything: HTML, CSS, JS, SVG charts, content
└── README.md       # This file
```

Single-file deliberate. Zero dependencies, zero build step. Loads Google Fonts (Newsreader + Instrument Sans + JetBrains Mono) from CDN — that's the only external request.

## Access gate

The site is gated behind an email prompt. Visitors enter the email address the document was sent to; the SHA-256 hash of that email is compared against a stored hash in the JS bundle. On match, sessionStorage saves the unlock state for that tab session.

**This is speed-bump security, not real auth.** Anyone with DevTools can inspect the JS, find the stored hash, and potentially dictionary-attack common email formats. If true access control is needed, host behind Vercel password protection, Cloudflare Access, or similar server-side gating. The current gate exists to:
- Personalize the experience ("this was made for you")
- Discourage casual link-forwarding
- Track that the intended reader actually opened it (when paired with the URL share)

**To change the gated email:** compute SHA-256 of the new lowercase-trimmed email and replace the `VALID_HASH` constant in the gate script. Use `echo -n "email@example.com" | shasum -a 256` on macOS or any online SHA-256 tool.

## What's in it

1. **Section 1 — The wedge.** Static SVG of the competitive positioning chart (Cognition vs Cursor, Claude Code, Replit, Manus, Windsurf).
2. **Section 2 — The map.** Interactive 2x2 priority matrix of seven partnership archetypes. Hover any card for the rationale; click any card to drill into the archetype scatter plot.
3. **Archetype deep-dive.** Scatter plot of partnership prospects within an archetype, with bubble size = ARR opportunity. All seven archetypes fully modeled:
   - **Global SIs** — 9 prospects, axes are *strategic fit* (x) × *deal accessibility* (y).
   - **Workflow systems of record** — 6 prospects, axes are *strategic fit* × *deal accessibility (agent-tax exposure)*.
   - **Hyperscalers** — 4 prospects, axes are *strategic fit + marketplace openness* × *channel conflict*.
   - **Regulated verticals** — 7 prospects, axes are *deployment-moat depth* × *per-seat pricing unlock*.
   - **Alert-to-fix loop** — 6 prospects, axes are *detection-to-fix gap* × *partner openness*.
   - **IDE ecosystem** — 5 prospects, axes are *IDE strategic fit* × *partner openness*.
   - **Frontier model labs** — 4 prospects, axes are *fit as supplier* × *depth of relationship available*. ARR shown as $0 because dollars flow the other direction (supply, not revenue).
   - **Silicon / inference** — 4 prospects, axes are *inference fit* × *partner availability*.

   Each bubble has hover-tooltip rationale for its x/y position, and click reveals the full ARR-math + strategic detail.
4. **Section 3 — Why me.** Four-card pitch with credentials, honest pushback, and 90-day plan.

## How to extend

**Add a new archetype scatter:** in the `<script>` block, add a key to `scatterData` mirroring the structure used for `vertical` — each archetype carries its own data array PLUS axis labels (`xLabel`, `yLabel`, `xTickLabels`, `yTickLabels`), a `subtitle`, an `arrLegend` string, and an `ariaLabel`. Then in the `.archetype-toggle` HTML, remove the `locked` class from the corresponding button.

**Tweak copy:** all text content lives inline in the HTML — search for the phrase you want to change. Section IDs are `section-1`, `section-2`, `section-3`, `deepdive`.

**Change colors:** all colors are CSS variables at the top of the `<style>` block. Dark mode auto-handled via `@media (prefers-color-scheme: dark)`.

**Replace personal contact info:** search for `tonyshi@stanford.edu` and `linkedin.com/in/t-shi` — both in the final CTA block.

## Accessibility notes

- Right-side TOC nav is keyboard-tabable and uses `IntersectionObserver` to highlight the current section.
- Archetype cards are `<button>` elements with `aria-describedby` linking to tooltips.
- Scatter plot points are `tabindex="0"` with `role="button"` and respond to Enter/Space.
- SVGs have `role="img"` and `aria-label` for screen readers.
- Color is never the sole carrier of meaning — bubbles also have center dots and labels.

## Browser support

Modern evergreen browsers (Chrome, Safari, Firefox, Edge — last 2 versions). Uses CSS Grid, CSS custom properties, `IntersectionObserver`, and inline SVG — all baseline 2020+. No IE.

## License / use

Built for Tony Shi's outreach to Cognition. Reuse the design framework freely; the content is specific to this pitch.
