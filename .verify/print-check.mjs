/**
 * Print/PDF verification harness.
 *
 * Drives the running dev server in headless Chrome over CDP, seeds resume
 * variants, switches the page into emulated print media (the real print
 * layout), measures the printed page boxes, and then prints a PDF with
 * Page.printToPDF (preferCSSPageSize). Rendered PNGs come from render-pdf.mjs,
 * which draws the PDF itself — DOM screenshots proved unreliable.
 *
 * Checks per variant:
 *   - print-root pages == preview pages == PDF pages (no blank page anywhere)
 *   - page box is exactly A4 (595.28 × 841.89 pt) or US Letter (612 × 792 pt)
 *   - no block's painted content overflows the page content box
 *   - every expected marker appears exactly once (nothing clipped or dropped)
 *   - no text outside the page box, no near-empty page
 *   - bullets never appear before their entry title
 *   - no page ends with an orphaned entry head or section heading
 *   - only an entry taller than a page flows across a page break
 *   - footers (email, name, page number) appear on every page
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const ORIGIN = 'http://127.0.0.1:5173';
const PORT = 9333;
const OUT = path.resolve('.verify/out');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pad = (n) => String(n).padStart(2, '0');

const DESIGN = {
  pageFormat: 'A4',
  dateFormat: 'MMM YYYY',
  language: 'English',
  baseSizePt: 10.5,
  nameSizeDeltaPt: 11,
  headingSizeDeltaPt: 3,
  entrySizeDeltaPt: 0,
  lineHeight: 1.15,
  spacingFactor: 3,
  marginHMm: 22,
  marginVMm: 12,
  bodyFont: 'inter',
  nameFont: 'same',
  accentColor: '#1f3b5c',
  textColor: '#1b1d22',
  colorArea: 'header',
  headerAlign: 'left',
  headerLayout: 'stacked',
  headingStyle: 'rule',
  headingCase: 'uppercase',
  entryDatePosition: 'right',
  entrySubtitle: 'below',
  detailsSeparator: 'bullet',
  accentTargets: {
    name: false,
    jobTitle: true,
    headings: true,
    headingRule: true,
    dates: false,
    entryTitle: false,
    entrySubtitle: false,
    icons: true,
  },
  linkUnderline: false,
  linkBlue: false,
  footer: { pageNumbers: false, email: false, name: false },
  photoShape: 'circle',
};

function entry(prefix, i, bullets = 4) {
  return {
    id: `${prefix}-entry-${i}`,
    title: `${prefix}-${pad(i)}`,
    subtitle: `Employer ${pad(i)}`,
    location: 'Bristol, UK',
    startDate: '2019-01',
    endDate: '2021-02',
    current: false,
    url: '',
    description: Array.from(
      { length: bullets },
      (_, b) =>
        `- BULLET-${prefix}-${pad(i)}-${b + 1} Delivered a measurable improvement to the programme with a long enough sentence to wrap across lines.`,
    ).join('\n'),
  };
}

function section(kind, heading, extra = {}) {
  return {
    id: `${kind}-section`,
    kind,
    heading,
    visible: true,
    newPage: false,
    columns: 1,
    text: '',
    entries: [],
    items: [],
    ...extra,
  };
}

function buildResume({ id, design, roles, bullets }) {
  return {
    id,
    title: `Print check ${id}`,
    schemaVersion: 1,
    templateId: 'foundry',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    personal: {
      fullName: 'PRINT TEST',
      jobTitle: 'Senior Product Designer',
      email: 'jordan.avery@example.com',
      phone: '+44 7700 900123',
      address: 'Bristol, United Kingdom',
      website: 'jordanavery.example',
      linkedin: 'linkedin.com/in/jordanavery',
      photo: '',
    },
    sections: [
      section('summary', 'Summary', {
        text: 'SUMMARY-MARKER Product designer who turns complex internal tools into interfaces people finish their work in.\n- SUMMARY-BULLET Shipped three design systems used across the group.',
      }),
      section('experience', 'Professional Experience', {
        entries: Array.from({ length: roles }, (_, i) => entry('ROLE', i + 1, bullets)),
      }),
      section('education', 'Education', {
        entries: [entry('EDU', 1, 2), entry('EDU', 2, 1)],
      }),
      section('skills', 'Skills', {
        columns: 2,
        items: Array.from({ length: 16 }, (_, i) => ({
          id: `skill-${i + 1}`,
          name: `SKILL-${pad(i + 1)}`,
          level: '',
        })),
      }),
      section('projects', 'Projects', {
        newPage: true,
        entries: [entry('PROJECT', 1, 2)],
      }),
      section('languages', 'Languages', {
        items: [
          { id: 'lang-1', name: 'LANG-01 English', level: 'Native' },
          { id: 'lang-2', name: 'LANG-02 Swedish', level: 'Intermediate' },
        ],
      }),
    ],
    design,
  };
}

const VARIANTS = [
  {
    name: 'a4-multipage',
    design: { ...DESIGN, pageFormat: 'A4' },
    roles: 8,
    bullets: 4,
    format: 'A4',
  },
  {
    name: 'letter-footers',
    design: {
      ...DESIGN,
      pageFormat: 'Letter',
      footer: { pageNumbers: true, email: true, name: true },
      colorArea: 'border',
    },
    roles: 8,
    bullets: 4,
    format: 'Letter',
  },
  {
    name: 'a4-long-entry',
    design: { ...DESIGN, pageFormat: 'A4' },
    roles: 1,
    bullets: 46,
    format: 'A4',
  },
  {
    name: 'a4-stress',
    design: {
      ...DESIGN,
      pageFormat: 'A4',
      baseSizePt: 12.5,
      lineHeight: 1.5,
      spacingFactor: 5,
      marginHMm: 26,
      marginVMm: 18,
      colorArea: 'none',
    },
    roles: 12,
    bullets: 6,
    format: 'A4',
  },
];

class Cdp {
  constructor(url) {
    this.url = url;
    this.id = 0;
    this.pending = new Map();
  }
  async connect() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = () => reject(new Error('websocket failed'));
    });
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolve(message.result);
      }
    };
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
}

async function waitForHttp(url, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch {
      // not up yet
    }
    await sleep(200);
  }
  throw new Error(`timed out waiting for ${url}`);
}

async function readPdf(file) {
  const data = new Uint8Array(await fs.readFile(file));
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false, verbosity: 0 }).promise;
  const pages = [];
  for (let number = 1; number <= doc.numPages; number += 1) {
    const page = await doc.getPage(number);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const items = content.items
      .filter((item) => typeof item.str === 'string' && item.str.trim() !== '')
      .map((item) => {
        const matrix = pdfjs.Util.transform(viewport.transform, item.transform);
        return { text: item.str, x: matrix[4], y: matrix[5] };
      })
      .sort((a, b) => a.y - b.y || a.x - b.x);
    pages.push({
      width: viewport.width,
      height: viewport.height,
      items,
      text: items.map((item) => item.text).join(' '),
    });
  }
  try {
    await doc.cleanup();
  } catch {
    // best effort
  }
  return pages;
}

const HEADINGS = ['SUMMARY', 'PROFESSIONAL EXPERIENCE', 'EDUCATION', 'SKILLS', 'PROJECTS', 'LANGUAGES'];
const OVERFLOW_TOLERANCE = 1.5;

const hasFooter = (variant) =>
  variant.design.footer.pageNumbers || variant.design.footer.email || variant.design.footer.name;

const chromeProfile = path.resolve('.verify/chrome-profile');
await fs.rm(chromeProfile, { recursive: true, force: true });
await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${chromeProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const results = [];
let cdp;
try {
  const version = await waitForHttp(`http://127.0.0.1:${PORT}/json/version`);
  cdp = new Cdp(version.webSocketDebuggerUrl);
  await cdp.connect();

  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId: sid } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Page.enable', {}, sid);
  await cdp.send('Runtime.enable', {}, sid);
  // The preview renders at desktop width; a narrow window hides it and every
  // measurement comes back zero.
  await cdp.send(
    'Emulation.setDeviceMetricsOverride',
    { width: 1400, height: 1200, deviceScaleFactor: 1, mobile: false },
    sid,
  );

  const evaluate = async (expression, attempt = 0) => {
    try {
      const result = await cdp.send(
        'Runtime.evaluate',
        { expression, returnByValue: true, awaitPromise: true },
        sid,
      );
      if (result.exceptionDetails) {
        throw new Error(
          `${result.exceptionDetails.text}: ${result.exceptionDetails.exception?.description ?? ''}`,
        );
      }
      return result.result.value;
    } catch (error) {
      if (/navigated or closed|Cannot find context/i.test(String(error)) && attempt < 20) {
        await sleep(200);
        return evaluate(expression, attempt + 1);
      }
      throw error;
    }
  };

  const waitFor = async (expression, timeout = 20000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await evaluate(expression)) return true;
      await sleep(150);
    }
    throw new Error(`timed out: ${expression}`);
  };

  await cdp.send('Page.navigate', { url: `${ORIGIN}/resumes` }, sid);
  await sleep(500);
  await waitFor(`document.readyState === 'complete'`);

  const variantsToRun = process.env.ONLY
    ? VARIANTS.filter((variant) => variant.name === process.env.ONLY)
    : VARIANTS;

  for (const variant of variantsToRun) {
    const resume = buildResume({
      id: variant.name,
      design: variant.design,
      roles: variant.roles,
      bullets: variant.bullets,
    });
    const payload = JSON.stringify({ state: { resumes: [resume] }, version: 0 });

    await evaluate(`localStorage.setItem('careerforge.v1', ${JSON.stringify(payload)}); true`);
    await cdp.send('Page.navigate', { url: `${ORIGIN}/resume/${variant.name}/content` }, sid);
    await sleep(500);
    await waitFor(`document.querySelectorAll('.doc-shell .doc-page').length > 0`);
    await evaluate(
      `new Promise((resolve) => document.fonts.ready.then(() => setTimeout(() => resolve(true), 800)))`,
    );

    const previewPages = await evaluate(`document.querySelectorAll('.doc-shell .doc-page').length`);

    // Switch to the actual print layout before measuring or printing.
    await cdp.send('Emulation.setEmulatedMedia', { media: 'print' }, sid);
    await sleep(350);

    const printLayout = JSON.parse(
      await evaluate(`(() => {
        const pages = [...document.querySelectorAll('.print-root .doc-page')];
        const appHidden = getComputedStyle(document.getElementById('root')).display === 'none';
        return JSON.stringify({
          pageCount: pages.length,
          appHidden,
          bodyHeight: Math.round(document.body.getBoundingClientRect().height),
          pages: pages.map((page) => {
            const inner = page.querySelector('.doc-page__inner');
            const innerStyle = getComputedStyle(inner);
            const innerBox = inner.getBoundingClientRect();
            const box = page.getBoundingClientRect();
            const groups = [...inner.children];
            const last = groups[groups.length - 1];
            let overflow = null;
            if (last) {
              const lastPad = parseFloat(getComputedStyle(last).paddingBottom) || 0;
              const contentBottom = last.getBoundingClientRect().bottom - lastPad;
              overflow = Math.round((contentBottom - (innerBox.bottom - parseFloat(innerStyle.paddingBottom))) * 100) / 100;
            }
            return {
              w: Math.round(box.width * 100) / 100,
              h: Math.round(box.height * 100) / 100,
              innerFont: innerStyle.fontSize,
              contentH: Math.round((innerBox.height - parseFloat(innerStyle.paddingTop) - parseFloat(innerStyle.paddingBottom)) * 100) / 100,
              groups: groups.length,
              overflow,
            };
          }),
          footerText: document.querySelector('.doc-footer')?.innerText?.replace(/\\s+/g, ' ').trim() ?? null,
          warning: document.body.innerText.includes('taller than a page'),
        });
      })()`),
    );

    // Print the way a user does: from the normal screen layout, letting the
    // browser apply print styles itself. Page.captureScreenshot with
    // captureBeyondViewport leaves a clipped layout behind that truncates a
    // following printToPDF, so captures happen afterwards (harness artifact, not
    // app behaviour).
    await cdp.send('Emulation.setEmulatedMedia', { media: '' }, sid);
    await sleep(350);

    const printOptions = {
      printBackground: !process.env.NO_BG,
      preferCSSPageSize: true,
      paperWidth: 8.27,
      paperHeight: 11.69,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      scale: 1,
    };
    let printed;
    try {
      printed = await cdp.send('Page.printToPDF', printOptions, sid);
    } catch (error) {
      // Headless print occasionally fails on a freshly re-laid-out page; reload
      // once and try again before treating it as a real failure.
      await cdp.send('Page.navigate', { url: `${ORIGIN}/resume/${variant.name}/content` }, sid);
      await sleep(900);
      await waitFor(`document.querySelectorAll('.doc-shell .doc-page').length > 0`);
      await evaluate(
        `new Promise((resolve) => document.fonts.ready.then(() => setTimeout(() => resolve(true), 800)))`,
      );
      printed = await cdp.send('Page.printToPDF', printOptions, sid);
    }

    const pdfPath = path.join(
      OUT,
      `${variant.name}${process.env.NO_BG ? '-nobg' : ''}.pdf`,
    );
    await fs.writeFile(pdfPath, Buffer.from(printed.data, 'base64'));

    let pages = await readPdf(pdfPath);
    let printRetried = false;
    if (pages.length !== printLayout.pageCount) {
      // Headless Chrome sometimes snapshots a half-laid-out page and prints a
      // truncated PDF. Reprint once from a settled reload before reporting it.
      await cdp.send('Page.navigate', { url: `${ORIGIN}/resume/${variant.name}/content` }, sid);
      await sleep(1200);
      await waitFor(`document.querySelectorAll('.doc-shell .doc-page').length > 0`);
      await evaluate(
        `new Promise((resolve) => document.fonts.ready.then(() => setTimeout(() => resolve(true), 900)))`,
      );
      const again = await cdp.send('Page.printToPDF', printOptions, sid);
      await fs.writeFile(pdfPath, Buffer.from(again.data, 'base64'));
      pages = await readPdf(pdfPath);
      printRetried = true;
    }
    await fs.writeFile(
      path.join(OUT, `${variant.name}.txt`),
      pages.map((page, index) => `--- page ${index + 1} ---\n${page.text}\n`).join('\n'),
    );

    const allText = ` ${pages.map((page) => page.text).join(' \n ')} `;
    const joined = ` ${pages.flatMap((page) => page.items.map((item) => item.text)).join(' ')} `;

    const markers = [
      'SUMMARY-MARKER',
      'SUMMARY-BULLET',
      ...Array.from({ length: variant.roles }, (_, i) => `ROLE-${pad(i + 1)}`),
      ...Array.from({ length: variant.roles }, (_, i) =>
        Array.from({ length: variant.bullets }, (_, b) => `BULLET-ROLE-${pad(i + 1)}-${b + 1}`),
      ).flat(),
      'EDU-01',
      'EDU-02',
      'BULLET-EDU-01-1',
      'BULLET-EDU-02-1',
      ...Array.from({ length: 16 }, (_, i) => `SKILL-${pad(i + 1)}`),
      'PROJECT-01',
      'BULLET-PROJECT-01-1',
      'LANG-01',
      'LANG-02',
    ];

    const count = (marker) => (joined.match(new RegExp(`(?:^|\\s)${marker}(?=\\s|$)`, 'g')) ?? []).length;
    const missingMarkers = markers.filter((marker) => count(marker) === 0);
    const duplicatedMarkers = markers.filter((marker) => count(marker) > 1);

    const outOfBounds = pages.flatMap((page, index) =>
      page.items
        .filter(
          (item) => item.x < -1 || item.x > page.width + 1 || item.y < -1 || item.y > page.height + 1,
        )
        .map((item) => ({ page: index + 1, text: item.text, x: item.x, y: item.y })),
    );

    const expectedSize =
      variant.format === 'A4' ? { width: 595.28, height: 841.89 } : { width: 612, height: 792 };
    const sizeMismatch = pages
      .map((page, index) => ({
        page: index + 1,
        width: Math.round(page.width * 100) / 100,
        height: Math.round(page.height * 100) / 100,
      }))
      .filter(
        (page) =>
          Math.abs(page.width - expectedSize.width) > 1.5 ||
          Math.abs(page.height - expectedSize.height) > 1.5,
      );

    const emptyPages = pages
      .map((page, index) => ({ page: index + 1, items: page.items.length }))
      .filter((page) => page.items < 5);

    const pageOf = (marker) => pages.findIndex((page) => page.text.includes(marker));
    const entrySpans = Array.from({ length: variant.roles }, (_, i) => {
      const title = `ROLE-${pad(i + 1)}`;
      const bulletPages = [
        ...new Set(
          Array.from({ length: variant.bullets }, (_, b) =>
            pageOf(`BULLET-ROLE-${pad(i + 1)}-${b + 1}`),
          ),
        ),
      ];
      return { entry: title, page: pageOf(title), bulletPages };
    });
    // Only entries longer than a page may legitimately continue on the next page.
    const splitEntries = entrySpans.filter((entry) => entry.bulletPages.length > 1);
    const bulletsBeforeTitle = entrySpans.filter((entry) =>
      entry.bulletPages.some((page) => page < entry.page),
    );
    // An entry heading must never be the last thing on a page (orphan head).
    const headOrphans = pages
      .map((page, index) => {
        const last = page.items[page.items.length - 1]?.text?.trim() ?? '';
        return /^ROLE-\d+$/.test(last) ? { page: index + 1, entry: last } : null;
      })
      .filter(Boolean);

    const orphanHeadings = pages
      .map((page, index) => {
        const last = page.items[page.items.length - 1]?.text ?? '';
        return HEADINGS.includes(last.trim()) ? { page: index + 1, heading: last } : null;
      })
      .filter(Boolean);

    const footerProblems = hasFooter(variant)
      ? pages
          .map((page, index) => ({
            page: index + 1,
            hasEmail: page.text.includes('jordan.avery@example.com'),
            hasNumber: page.text.includes(`${index + 1} / ${pages.length}`),
            hasName: page.text.includes('PRINT TEST'),
          }))
          .filter((page) => !page.hasEmail || !page.hasNumber || !page.hasName)
      : [];

    const overflowProblems = printLayout.pages
      .map((page, index) => ({ page: index + 1, overflow: page.overflow }))
      .filter((page) => page.overflow !== null && page.overflow > OVERFLOW_TOLERANCE);

    results.push({
      variant: variant.name,
      format: variant.format,
      previewPages,
      printRootPages: printLayout.pageCount,
      pdfPages: pages.length,
      printRetried,
      appHiddenInPrint: printLayout.appHidden,
      pageBox: printLayout.pages[0] ? [printLayout.pages[0].w, printLayout.pages[0].h] : null,
      pdfPageSize: pages[0] ? [Math.round(pages[0].width), Math.round(pages[0].height)] : null,
      sizeMismatch,
      emptyPages,
      missingMarkers,
      duplicatedMarkers,
      outOfBounds,
      entriesFlowingAcrossPages: splitEntries.map((entry) => entry.entry),
      bulletsBeforeTitle,
      headOrphans,
      orphanHeadings,
      overflowProblems,
      footer: hasFooter(variant)
        ? { dom: printLayout.footerText, problems: footerProblems }
        : 'disabled',
      warningsShown: printLayout.warning,
      roleOrderOk: (() => {
        const positions = Array.from({ length: variant.roles }, (_, i) =>
          allText.indexOf(`ROLE-${pad(i + 1)}`),
        );
        return positions.every(
          (value, index) => value >= 0 && (index === 0 || value > positions[index - 1]),
        );
      })(),
      pdfPath,
    });
  }
} finally {
  if (cdp?.ws) cdp.ws.close();
  chrome.kill();
}

console.log(JSON.stringify(results, null, 2));
