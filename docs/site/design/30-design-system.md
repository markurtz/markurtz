# 30 · Design system

Status: **Locked** (brand system 1.0 on 2026-11-20; 1.1 component decisions 2026-11-21; later
updates through 2026-11-23). The source files are [tokens/tokens.json](tokens/tokens.json)
(W3C Design Tokens 2025.10) and the generated [tokens/tokens.css](tokens/tokens.css). Edit the
JSON, never the CSS. The interactive brand system page is listed in [sources](../records/sources.md).

## 1. Idea

**Exploration**: curious, rigorous, hands-on. A quiet, modern page (slate neutrals, hairlines,
generous space) carrying hand-drawn marks: a chisel-marker monogram, marker icons and page art drawn live by the same marker over a field of rising teal lines.
Teal is the one accent, used for marks, links and the primary action, never for large fills.

## 2. Colour

Taken from Mark's lecture deck "What Survives Compression".

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--color-bg` | slate-50 #F8FAFC | navy-950 #0B1220 | Page |
| `--color-surface` | white | navy-900 #121B30 | Cards |
| `--color-surface-raised` | white | navy-700 #1A2742 | Menus, dialogs |
| `--color-surface-sunken` | slate-100 #EDEEF1 | navy-900 | Tinted bands, wells |
| `--color-line` | slate-200 #E2E8F0 | slate-800 #24314A | Hairlines |
| `--color-line-strong` | slate-500 #64748B | slate-400 #94A3B8 | Inputs, separators |
| `--color-ink` | navy-900 #121B30 | slate-100 #EDEEF1 | Text |
| `--color-ink-muted` | slate-500 #64748B | slate-400 #94A3B8 | Secondary text |
| `--color-link` | teal-600 #387A77 | teal-400 #50AFAA | Links (no underline; dark theme underlines links inside paragraphs) |
| `--color-mark` | teal-500 #489D99 | teal-500 | Marks, focus ring, active underline, card hover border |
| `--color-accent-fill` | teal-600 | teal-400 | Primary button |
| `--color-on-accent` | white | navy-950 | Text on primary |
| `--color-band` | navy-900 | navy-700 | Cinema band, viewer |
| `--color-success` / `warning` / `danger` | green-600 / amber-700 / red-600 | green-300 / amber-300 / red-300 | Status |
| `--color-data-1…4` | teal, orange #C7782A, blue #4F6FA6, slate | lighter variants | Charts |

Placeholders use the warning amber (`.tbd` dotted underline, `.tbd--ask` mono tag).

Contrast: body text ≥ 7:1, muted text ≥ 4.5:1, links ≥ 4.5:1 on both themes; checked in CI.

## 3. Typography

Three families, self-hosted WOFF2, subset, about 150 KB total (Locked). The mock loads them from
Google Fonts; production must self-host (E5).

| Role | Family | Weights | Where |
| --- | --- | --- | --- |
| Display and UI | **Inter Display** (Inter) | 400, 500, 600, 700, 800 | Titles, navigation, buttons, cards, ledes |
| Reading | **Source Serif 4** | 400, 400 italic, 600 | Body copy, post text, bios |
| Meta | **Geist Mono** | 400, 500 | Role lines, dates, counts, code, badges |

Fluid scale, 18 px base (`--text-body` 17 to 18 px), ratio about 1.2:

| Token | Range |
| --- | --- |
| `--text-small` | ~14 px |
| `--text-body` | 17 → 18 px |
| `--text-lead` | 20 → 24 px |
| `--text-h4` … `--text-h1` | 24 → 32, 29 → 43, 35 → 57, 42 → 76 px |
| `--text-display` | 51 → 101 px |
| Page header title (`.ph-title`) | `clamp(2.1rem, 1.3rem + 2.6vw, 3.6rem)`, weight 800, line-height 1.04, tracking −0.035em, balanced |

Body line-height 1.6, headings 1.1. Reading measure 68 ch. Use `font-display: swap` with
metric-matched fallbacks.

## 4. Space, layout and radius

- **Spacing**: 4 px base: 4, 8, 12, 16, 24, 32, 48, 64, 96 (`--space-1` … `--space-9`).
- **Frame**: 1200 px max (`--frame`), side padding `clamp(16px, 4vw, 32px)`.
- **Grid**: 12 columns at ≥ 1024 px, 8 at ≥ 640 px, 4 below (Mark's write-in).
- **Breakpoints in use**: 600 (viewer strip), 640 (2-across cards), 760 (header folds into menu),
  960 (4-across cards), 1024 (page-header art stacks below this).
- **Radius**: `--radius-sm` 4 px; `--radius-md` 8 px for controls, buttons and cards;
  `--radius-lg` 12 px for large media (photo cards, featured band, player); `--radius-full` for
  filter pills and badges only. **No pill buttons.**
- **Targets**: 44 px minimum for main controls (`--target`).
- **Elevation**: none on cards (hairline border instead); `--shadow-overlay` only for menus,
  dialogs and toasts.

## 5. Surfaces and states

| Element | Rest | Hover | Focus | Active / current |
| --- | --- | --- | --- | --- |
| Card | Surface, 1 px `--color-line` | Border `--color-mark`; photo zooms ~1.04; **no lift** | 2 px `--color-mark` ring, 2 px offset | — |
| Primary button | `--color-accent-fill`, on-accent text, 8 px radius | Darker fill | Ring | Pressed: slight inset |
| Secondary button | Surface, line border | Border ink | Ring | — |
| Header link | Muted ink | Ink | Ring | Ink, weight 600, 2 px teal underline on the bar |
| Segmented filter | Segments on a sunken track, mono counts | Ink | Ring | Selected: raised surface, ink text, soft shadow and hairline |
| Tinted band | `--color-surface-sunken` with a teal tint | | | |

## 6. Themes

System, Light and Dark. Dark is not an inversion: surfaces step up (navy-950 → 900 → 700), links
and the primary fill use teal-400, and paragraph links get an underline. Forced colours: borders
and focus rings use system colours; art and icons use `currentColor` so they follow.

## 7. Motion

| Token | Value |
| --- | --- |
| `--duration-fast` / `base` / `slow` | 150 / 200 / 300 ms |
| `--ease-out` | `cubic-bezier(.2,.7,.2,1)` |
| `--ease-in-out` | `cubic-bezier(.6,0,.2,1)` |

Interface motion is limited to opacity and transform. View transitions fade between pages. Art
motion has its own rules ([33](33-page-art-motion.md)). `prefers-reduced-motion: reduce` sets every
duration to 0 and art to stills.

## 8. Tokens pipeline

`design/tokens.json` (W3C DTCG) → `pnpm tokens` → `src/styles/tokens.css` (custom properties with
the OKLCH value in a comment). The same JSON feeds the page-art palette (`--plate-line`, `--mk`), so the art's teal matches the interface.
