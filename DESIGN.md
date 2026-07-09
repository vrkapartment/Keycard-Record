---
name: Keycard Record
description: The Concierge Vault — a keycard lifecycle system for dorm operations, styled like a boutique property's front desk with a vault out back.
colors:
  bg: "#FFFFFF"
  surface: "#F5F8F6"
  surface-sunken: "#F0F5F2"
  border: "#DBDFDC"
  border-strong: "#BFC6C2"
  ink: "#101814"
  muted: "#595F5C"
  primary: "#003F23"
  primary-hover: "#002F15"
  accent: "#CDA448"
  status-active: "#319047"
  status-active-bg: "#DEF1E0"
  status-active-text: "#004010"
  status-pending: "#C9690C"
  status-pending-bg: "#FFE3CC"
  status-pending-text: "#732700"
  status-inactive: "#BA2B2E"
  status-inactive-bg: "#FFE4E1"
  status-inactive-text: "#8A0314"
typography:
  title:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  metric:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "6px"
  pill: "9999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-sunken}"
  button-destructive:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.status-inactive-text}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-destructive-hover:
    backgroundColor: "{colors.status-inactive-bg}"
  status-badge:
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.bg}"
    rounded: "{rounded.sm}"
    padding: "16px"
---

# Design System: Keycard Record

## 1. Overview

**Creative North Star: "The Concierge Vault"**

Keycard Record should feel like the front desk of a well-run boutique property with a vault quietly humming in the back office: unmistakably premium in its restraint, precise in its record-keeping, and calm under the weight of responsibility. Bottle-green ink and brass accents carry that feeling; everything else — the paper-white surfaces, the plain sans body text, the flat tables — stays out of the way so the record itself reads as trustworthy.

`primary` (Bottle Green) and `accent` (Brass) are live across the app: primary actions, the wordmark, content links, and focus rings run in Bottle Green; Brass marks the one "needs attention" moment on the dashboard (the Process Inactive count). The system explicitly rejects the generic all-gray admin-template look, playful consumer-app treatments, and cluttered enterprise-SaaS chrome (per PRODUCT.md's anti-references) — that look was the actual starting point this spec replaced.

**Key Characteristics:**
- One committed brand color (Bottle Green) carries primary actions and identity; Brass is reserved for rare, deliberate emphasis.
- Status (Active / Process Inactive / Inactive) has its own dedicated color family, kept visually distinct from Bottle Green and Brass so brand and system state never collide.
- Flat by default; a whisper-soft shadow appears only as a hover response on interactive rows and cards.
- Single sans family (Geist) for everything except keycard codes, which run in Geist Mono for scanability.

## 2. Colors

Paper-white surfaces throughout; the brand's richness lives entirely in two colors (Bottle Green, Brass) and in the dedicated status palette, never in the background.

### Primary
- **Bottle Green** (`#003F23` / `oklch(0.32 0.085 160)`): primary buttons, the active nav item, links, focus rings, the wordmark. Used deliberately, not decoratively — if it's green ink, it means "act here."
- **Bottle Green, Hover** (`#002F15` / `oklch(0.26 0.085 160)`): hover/pressed state for anything filled with Bottle Green.

### Secondary
- **Brass** (`#CDA448` / `oklch(0.74 0.12 85)`): reserved for rare premium emphasis — a highlighted stat, a "needs attention" accent, a selection ring. Never a primary action color. **Text on filled Brass must be Ink, not white** — white-on-Brass measures 2.33:1 (fails WCAG AA); Ink-on-Brass measures 7.74:1.

### Neutral
- **Paper** (`#FFFFFF`): page and card background. Pure white — the brand's warmth comes from Bottle Green and Brass, not from a tinted surface.
- **Surface** (`#F5F8F6`): card/panel fill when it needs to sit a half-step above the page.
- **Surface Sunken** (`#F0F5F2`): the page background behind cards and tables (replaces the current `bg-zinc-50`).
- **Border** (`#DBDFDC`): hairline dividers — table row separators, section rules.
- **Border, Strong** (`#BFC6C2`): input and card outlines, where the boundary needs to read more clearly than a hairline.
- **Ink** (`#101814`): primary text (18.1:1 on Paper).
- **Muted** (`#595F5C`): secondary/meta text — dates, helper copy, row counts (6.5:1 on Paper).

### Status (dedicated — do not reuse Primary or Accent here)
- **Active** (`#319047` text-on-tint / bg `#DEF1E0` / text `#004010`, 10.2:1): the card is in normal use.
- **Process Inactive** (bg `#FFE3CC` / text `#732700`, 8.5:1): pending deactivation — staff has been notified, the card hasn't been cut off yet.
- **Inactive** (bg `#FFE4E1` / text `#8A0314`, 8.3:1): fully deactivated.

### Named Rules
**The Two-Color Rule.** Bottle Green and Brass are the only two colors that carry brand meaning. If a third "brand" color shows up anywhere, it's a mistake — reach for a neutral or a status color instead.

**The Status Never Borrows Rule.** Status pills never use Bottle Green or Brass, even when a status color happens to look similar (Active's green is a different hue and a much lighter, more saturated tint than Bottle Green). This keeps "the system is telling me something" (status) visually separate from "this is the brand" (chrome).

### Dark Mode

Every color above is a CSS custom property (`--paper`, `--primary`, `--active-bg`, etc.), re-declared with dark-tuned values under `@media (prefers-color-scheme: dark)` and under explicit `[data-theme="dark"]` / `[data-theme="light"]` overrides — components never branch on theme, they just consume the same token classes (`bg-paper`, `text-primary`, ...) and the variable resolves to the right value. Users pick System / Light / Dark from Settings; the choice persists in `localStorage` and an inline script applies it before first paint to avoid a flash of the wrong theme.

- **Neutrals** invert in *role*, not just value: the page background (`surface-sunken`) is the darkest layer, and `paper` (card fill) is a step *lighter* than the page — cards still read as "lifted," exactly like in light mode, just at the other end of the scale (`surface-sunken #080C0A` → `surface #111613` → `paper #1E2320`).
- **Bottle Green inverts role.** In light mode Primary is a dark fill with white text on top. On a dark page a dark-on-dark fill would vanish, so dark mode's Primary is a bright mint-green (`#5BBB8C`) — bright enough to read as text/links directly on the dark page (6.8:1+), and used as a button fill with *dark* ink text on top (`--primary-ink`, a new token: white in light mode, near-black in dark mode — mirrors how `--accent-ink` already worked for Brass). Never write `text-paper` on a Primary-filled control for this reason; use `text-primary-ink`.
- **Brass stays fixed.** Accent (`#CDA448`) and its Ink text pairing are unchanged across themes — a light gold chip with dark text reads fine on either background, so it doesn't need a dark variant.
- **Status pills invert bg/text**, not just darken: light mode is a pale tint + dark saturated text; dark mode is a dark tint + bright saturated text (`active-text #73D083` on `active-bg #142A17`, etc.) — a pale pill floating on a near-black page reads as a lit-up hole in the surface, so the pairing flips the same way Linear/GitHub/Vercel badges do in their dark themes.
- All text/bg and ink-on-fill pairings were verified ≥4.5:1 (WCAG AA body text) using the same OKLab→sRGB + relative-luminance method as the light palette above.

## 3. Typography

**Body Font:** Geist Sans (with ui-sans-serif, system-ui fallback)
**Label/Mono Font:** Geist Mono (with ui-monospace, monospace fallback)

**Character:** One working sans for everything — headings, buttons, labels, body — per product-register convention; Geist's grotesk precision already reads as "engineered," which suits a records system. Geist Mono is reserved for the one place exactness matters most: the keycard code itself.

### Hierarchy
- **Title** (600, 1.25rem/20px, line-height 1.3): page headings ("ห้องทั้งหมด", "บัตรคีย์การ์ดทั้งหมด").
- **Metric** (600, 1.5rem/24px, line-height 1.2, tabular numerals): the dashboard's status-count numbers — the only place a number is the hero of its own container.
- **Body** (400, 0.875rem/14px, line-height 1.5): default UI text — table cells, form labels, button labels, nav.
- **Label** (500, 0.75rem/12px, line-height 1.4): table column headers, status-pill text, field captions.
- **Mono** (500, 0.875rem/14px, line-height 1.5): the 5-digit keycard code, everywhere it appears (table cells, detail page, form input).

### Named Rules
**The One Face Rule.** No second display typeface. If a heading needs more weight, it gets a heavier cut of Geist, not a different family — a records system doesn't need a marketing voice.

## 4. Elevation

Flat by default — cards and tables sit on Paper with a 1px Border, no shadow at rest, matching the existing codebase. **Whisper Lift** is the one motion-adjacent elevation rule: interactive rows and cards gain a soft, brand-tinted shadow only on hover, signaling "this responds to you" without ever looking heavy.

### Shadow Vocabulary
- **Whisper Lift** (`box-shadow: 0 2px 10px oklch(0.32 0.085 160 / 0.10)`): hover state for clickable table rows, room/card links, and any card-like container that leads somewhere on click. Never present at rest.

### Named Rules
**The Flat-at-Rest Rule.** If it isn't being hovered or focused, it has no shadow. Depth is earned by interaction, not decoration.

## 5. Components

Components should feel **tactile and reassuring**: clear click targets, confident borders, no cramped hit areas — the opposite of a bare-bones internal script.

### Buttons
- **Shape:** 6px corner radius (`rounded: 6px`), consistent across all variants.
- **Primary:** Bottle Green fill (`#003F23`), Paper text, 8px/16px padding. Hover darkens to `#002F15`. This is the only filled button style in the system — reserve it for the one primary action per view (save, update status).
- **Secondary:** Paper fill, Ink text, Border-Strong outline. Hover fills with Surface Sunken. Used for "edit," "cancel," and other non-destructive secondary actions.
- **Destructive:** Paper fill, Inactive-status-red text, Border-Strong outline. Hover fills with the Inactive status-bg tint. Reserved for delete actions (delete room, delete card) — never filled solid, so a destructive action never competes visually with the Primary button.

### Status Pills (signature component)
- **Style:** Pill shape (`rounded: 9999px`), Label typography, 2px/10px padding, tinted background + dark text from the dedicated status palette (never a solid saturated fill — this is a records system, not a marketing badge).
- **State:** One pill per card at all times; the pill is a direct render of `Keycard.status`, never a compound or multi-state chip.

### Cards / Containers
- **Corner Style:** 6px radius, matching buttons and inputs for a single consistent geometry across the system.
- **Background:** Paper, with Surface used when a container needs to sit visually apart from a Surface Sunken page background.
- **Shadow Strategy:** flat at rest; Whisper Lift on hover for clickable containers only (see Elevation).
- **Border:** 1px Border (hairline) for table containers and static cards; 1px Border-Strong where the edge needs to read more deliberately (dashboard stat tiles).
- **Internal Padding:** 16px (`spacing.lg`).

### Inputs / Fields
- **Style:** Paper background, Border-Strong outline, 6px radius, 8px/12px padding, Body typography.
- **Focus:** outline shifts to Bottle Green (2px ring), no glow or blur — a precise, legible focus state over a decorative one.
- **Error:** border and helper text switch to the Inactive status-text color; the existing red error banner pattern stays as the page-level error surface.

### Navigation
- **Style:** Paper header bar, 1px Border bottom rule, Body typography for links, Muted for inactive links.
- **Active/hover:** the active section link shifts to Ink (default) or Bottle Green when a stronger current-page indicator is wanted; hover always shifts Muted links to Ink, never to a brand color, keeping Bottle Green reserved for actions rather than wayfinding.

## 6. Do's and Don'ts

### Do:
- **Do** keep Paper (`#FFFFFF`) as the only background color at the page level — no cream, no sand, no warm-tinted neutral. Warmth comes from Bottle Green and Brass, never from the surface.
- **Do** use Ink-colored text on any Brass fill, never white (white-on-Brass fails contrast at 2.33:1; Ink-on-Brass reaches 7.74:1).
- **Do** keep status pills in their own dedicated hue family (`status-active` / `status-pending` / `status-inactive`), distinct from Bottle Green and Brass, so brand chrome and system state are never visually ambiguous.
- **Do** reserve the filled Bottle Green button for exactly one primary action per screen.
- **Do** run keycard codes in Geist Mono everywhere they appear, including inside form inputs.

### Don't:
- **Don't** introduce a third "brand" color. Two (Bottle Green, Brass) is the system.
- **Don't** add a shadow to anything at rest — Whisper Lift only appears on hover, per the Flat-at-Rest Rule.
- **Don't** fall back to the generic all-gray/zinc admin-template look this spec replaces — that's PRODUCT.md's explicit anti-reference.
- **Don't** use border-left or border-right as a colored accent stripe on cards, rows, or callouts.
- **Don't** fill a status pill with a solid saturated color; it stays a tinted-background pill with dark text, never a marketing-style badge.
- **Don't** reach for a second display typeface for emphasis — a heavier weight of Geist does the job (The One Face Rule).
