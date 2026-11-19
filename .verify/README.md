# .verify — print / PDF harness

Verifies the real export path (browser print → PDF) instead of trusting the
on-screen preview. It drives headless Chrome over CDP on port 9333, seeds
documents straight into `localStorage`, prints with `Page.printToPDF`, and
inspects the resulting PDF with pdf.js.

```bash
bun install                    # @napi-rs/canvas + pdfjs-dist
node print-check.mjs           # all variants → .verify/result.json
ONLY=a4-long-entry node print-check.mjs
NO_BG=1 node print-check.mjs   # print with backgrounds off
node render-pdf.mjs out/a4-multipage.pdf out/render 1.15   # PDF pages → PNG
```

Requires the dev server on `http://127.0.0.1:5173` and Chrome at the default
Windows install path. Variants: `a4-multipage`, `letter-footers` (A4 / US
Letter, footers), `a4-long-entry` (one entry longer than a page), `a4-stress`
(dense 12.5pt / 1.5 line height).

What it asserts per variant: preview page count equals PDF page count, PDF page
box matches the format, every fixture marker appears exactly once, no text
outside the page box, no empty pages, footer text on every page, no orphaned
section heading or entry head, and no content: auto block taller than the page.
