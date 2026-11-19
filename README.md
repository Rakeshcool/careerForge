# CareerForge

A resume builder recreated from observed FlowCV product behaviour, with original
code, branding, copy and template designs. Built as milestone M0–M3 of the
platform described in `../input_files/specs.md`.

## What works

- Landing page, template gallery (8 original templates, filterable), dashboard.
- Structured resume content: personal details, summary, 15 section types
  (experience, education, skills, languages, projects, courses, awards,
  organisations, publications, certificates, interests, references, declaration,
  custom), custom headings, per-section visibility, ordering and page breaks.
- Live document preview with measured pagination: blocks are measured offscreen
  and distributed across real A4 / US Letter pages, so headings are never
  orphaned and no content is silently dropped. An entry that fits on a page is
  kept whole; an entry taller than a page flows across pages at a bullet or
  paragraph boundary instead of being clipped.
- Design customisation stored per document: page format, date format, fonts,
  font-size scale, line height, element spacing, margins, accent colour (with
  per-target application), header layout, heading style, entry layout, contact
  separators, link styling, photo shape, page footers.
- Autosave to `localStorage` with a visible saving/saved state, coalesced
  undo/redo, duplicate, rename, archive-by-hide, delete.
- Print-accurate PDF export through the browser print dialog (the document is
  real text, not a screenshot; page size and margins come from the document).
  The printed pages are the same rendered pages shown in the preview, so page
  count, page breaks, footers and page size match what you see. Choose
  "Save as PDF" in the browser dialog; the header band and accent fills are
  forced with `print-color-adjust: exact`, so they print even when the browser
  option "Background graphics" is off.

## Commands

```bash
bun install
bun run dev        # http://127.0.0.1:5173
bun run typecheck  # tsc --noEmit
bun run build      # typecheck + vite build
```

## Structure

```
src/
  types.ts                 domain types (Resume, Section, Design)
  data/templates.ts        template presets, font registry, design defaults
  data/sections.ts         section taxonomy, labels, factories
  data/demo.ts             demo fixture (only used on request)
  store/store.ts           zustand store: CRUD, history, autosave
  store/schema.ts          zod validation + normalisation of stored documents
  document/DocBlocks.tsx   header / heading / entry / item renderers
  document/DocumentRuntime.tsx  measurement, pagination, page + print renderer
  document/document.css    page geometry, typography, print rules
  editor/                  editor shell, content forms, design panel, preview
  pages/                   landing, template gallery, dashboard
```

Content and design are separate: a template stores design tokens only, so
switching a template never mutates resume content.

## Print / PDF verification

`.verify/` holds a headless print harness used to check the export end to end:
it drives a real Chrome over CDP, seeds A4, US Letter and multi-page documents
(including one entry longer than a page), prints them with `Page.printToPDF`,
then checks page boxes, page count, every marker string, out-of-bounds text,
footer presence on each page and entry/heading orphans, and writes the PDFs to
`.verify/out/`.

```bash
cd .verify && bun install
node print-check.mjs              # prints 4 variants, writes .verify/result.json
ONLY=a4-long-entry node print-check.mjs
NO_BG=1 node print-check.mjs      # same run with backgrounds off
node render-pdf.mjs out/a4-multipage.pdf out/render 1.15   # PDF pages to PNG
```

Last verified: A4 4 pp (595×842 pt), US Letter 4 pp (612×792 pt), long-entry
4 pp, dense 9 pp; no missing or duplicated content, no text outside the page
box, no empty pages, footers on every page.

## Not implemented yet

- Authentication, backend API, database, server-side rendering of PDFs (M1/M4).
- AI providers, agents, proposals/audit (M4/M5) — the AI panel is intentionally
  absent rather than inert.
- Cover letters, job tracker, PDF/DOCX import, sharing (M6).

Drafts live in this browser only; clearing site data removes them.
