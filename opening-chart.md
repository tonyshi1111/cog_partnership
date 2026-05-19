# Claude Code brief: Competitive wedge diagram (Astro component)

## Goal
Build a self-contained `.astro` component that renders an interactive 2x2 matrix showing where AI coding agents sit competitively. Drop-in for an Astro site. No external dependencies, no Tailwind required (but make it Tailwind-compatible — see styling notes). Should look at home on a VC/investor-style blog post.

## Where it lives
Create as `src/components/CompetitiveWedge.astro`. Usage: `<CompetitiveWedge />` inside an `.astro` page or MDX file.

## What it shows
A 2x2 matrix mapping AI coding agents by two axes:
- **Y-axis**: Sync inline (bottom) ↔ Async agentic (top)
- **X-axis**: Individual dev / prosumer (left) ↔ Enterprise / services buyer (right)

The thesis: Cognition occupies the upper-right quadrant alone. Cursor and Claude Code sit lower-left. Replit and Manus sit lower-left in a non-coder lane. Windsurf (acquired by Cognition) is in the lower-right, bridging Cognition into the sync quadrant.

## Companies and positioning

Each card needs: name, one-line description, 1-2 sub-bullets, italicized "wedge" tag.

**Upper-right (async + enterprise) — the empty quadrant Cognition owns:**
- **Cognition / Devin**
  - "Ticket in, PR out"
  - Customers: Goldman, Infosys, Dell, Cisco
  - Cognizant + Infosys services partnerships
  - *Wedge: async work + services channel*
  - Use a warm/coral fill — this is the hero card, make it slightly larger and more emphasized

**Lower-right (sync + enterprise) — Cognition's bridge play:**
- **Windsurf**
  - "IDE Cognition acquired"
  - Bridges Cognition into the sync side
  - *Wedge: buys distribution + ARR*
  - Use an amber/related-warm fill to signal it's part of Cognition's portfolio
  - Draw a dashed arrow from Windsurf up into the Cognition card with a small label "Bundle play"

**Lower-left (sync + individual dev):**
- **Cursor**
  - "Forked VS Code"
  - Bottoms-up viral
  - *Wedge: $20/mo prosumer*
  - Purple fill
- **Claude Code**
  - "Terminal native"
  - Model owner play (Anthropic)
  - *Wedge: hedge + wedge*
  - Teal fill

**Middle-left (sync but non-coder lane — slightly above Cursor/Claude Code to show they serve a different user):**
- **Replit**
  - "Zero-setup browser"
  - PMs, founders, students
  - *Wedge: non-devs*
  - Pink fill
- **Manus**
  - "Horizontal agent"
  - Not coding-first
  - *Wedge: knowledge worker*
  - Blue fill

## Layout notes
- ViewBox roughly 680 wide × 620 tall, but make it responsive (`width: 100%; max-width: 720px;` on the container).
- Faint gridlines dividing the quadrants (dashed, low opacity).
- Axis labels in the margin: "Async / agentic" top-left, "Sync / inline" bottom-left, "Individual dev / prosumer" bottom-center-left, "Enterprise / services buyer" bottom-center-right.
- Title at top: "Where each agent sits" with subtitle "Autonomy of work vs who writes the check".
- Caption below the chart: "Same pitch, different doors. The defensible wedge is the quadrant the others structurally can't reach."

## Interactivity (this is the fun part)
1. **Hover on any card**: card scales slightly (1.02x), gets a subtle shadow, and reveals an extended description tooltip/popover. Use the company's color ramp for the hover state.
2. **Click on a card**: opens an inline expandable panel below the chart showing more detail. Keep it stateful in vanilla JS — no framework needed. Only one card expanded at a time. Smooth height transition.
3. **The empty upper-left quadrant**: when nothing's hovered, draw faint diagonal hatching there with a tiny label "no major player" — this is the visual punchline (Cognition is alone in upper-right; upper-left is just empty).
4. **Optional**: a small "show my reasoning" toggle button that fades in faint annotation arrows explaining each axis decision.

### Expanded panel content (when each card is clicked)
- **Cognition**: "Real wedge isn't autonomy (commoditizing). It's three things compounding: (1) enterprise distribution lead — Goldman, Infosys, Cognizant — that takes years to build; (2) async UX is harder than sync — auditing 6 hours of agent work is a different muscle than autocomplete; (3) services channel — embedding into Infosys/Cognizant means selling to CIOs at Fortune 500s, not engineers. Risk: if model layer commoditizes async reliability, premium collapses to relationships only."
- **Windsurf**: "Acquired by Cognition. They bought ARR and IDE distribution, not technology. Lets Cognition sell a bundle: sync (Windsurf) for the engineer's keyboard, async (Devin) for the engineer's backlog."
- **Cursor**: "Won the IDE wedge with VS Code fork + best-in-class inline UX. Bottoms-up motion: devs expense it, teams adopt it. Structurally hard to move up into enterprise async — wrong pricing model, wrong buyer."
- **Claude Code**: "Anthropic's reference implementation of agentic coding on their own model. Terminal-native, dev-friendly. The real strategic play: capture value at the model layer regardless of which UI wins (Cursor, Cognition, etc. all pay Anthropic for inference)."
- **Replit**: "Different user entirely. PMs, designers, founders, students who can't get a dev env running. Browser-only. Devin assumes you have a GitHub and a Jira; Replit assumes you have nothing."
- **Manus**: "Horizontal computer-use agent that happens to code. Closer to OpenAI Operator than Devin. Knowledge worker buyer, not engineer buyer."

## Styling
- **Typography**: System sans-serif stack (Inter if available via `@fontsource/inter`, otherwise system-ui). Two weights: 400 regular, 500 medium. Sentence case throughout.
- **Colors**: Define as CSS custom properties at the component scope so dark mode can override. Use these palettes (give each card a `--fill`, `--stroke`, `--text` that work in both light and dark):
  - Coral (Cognition): light `#FAECE7` fill, `#993C1D` text/stroke
  - Amber (Windsurf): light `#FAEEDA` fill, `#854F0B` text/stroke
  - Purple (Cursor): light `#EEEDFE` fill, `#3C3489` text/stroke
  - Teal (Claude Code): light `#E1F5EE` fill, `#0F6E56` text/stroke
  - Pink (Replit): light `#FBEAF0` fill, `#72243E` text/stroke
  - Blue (Manus): light `#E6F1FB` fill, `#0C447C` text/stroke
- **Dark mode**: Use `@media (prefers-color-scheme: dark)` to invert (darkest stop becomes fill, lightest stop becomes text). All text must remain readable in both modes.
- **No gradients, no drop shadows, no glow effects.** Flat surfaces only. Subtle border-radius (8-12px). Thin 0.5-1px strokes.
- **Rounded corners**: 8px for inner cards, 12px for the hero (Cognition) card.
- **Tailwind-compatible**: if the user has Tailwind, the component should still render correctly via scoped styles in the `<style>` block. Don't depend on Tailwind classes but don't conflict with them either.

## Tech requirements
- Pure Astro `.astro` component, no React or other framework imports.
- All interactivity in a `<script>` tag at the bottom of the component (vanilla JS, no `is:inline` unless necessary).
- Accessibility: SVG has `role="img"` with `<title>` and `<desc>`. Each clickable card is keyboard-focusable (`tabindex="0"`) and responds to Enter/Space. Expanded panel has `aria-expanded`.
- No external CDN dependencies. Everything self-contained.
- Mobile responsive: at <600px viewport, stack the quadrants vertically and hide the axis labels, replacing with a small legend.

## Deliverable
One file: `src/components/CompetitiveWedge.astro`. Plus usage example showing how to import and use it in a page. Plus a short note on any optional steps (e.g., "if you want Inter font, install @fontsource/inter").

## Style of output
Don't over-engineer. No unnecessary abstractions, no premature componentization (don't split into 5 sub-components). One file, readable top-to-bottom, with the markup, styles, and script in that order.
