/**
 * Renders every page of a PDF to PNG so the actual printed output can be
 * inspected visually. Usage: node render-pdf.mjs <file.pdf> <outDir> [scale]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';

const [file, outDir = '.verify/out', scaleArg = '1.4'] = process.argv.slice(2);
if (!file) throw new Error('usage: node render-pdf.mjs <file.pdf> [outDir] [scale]');

const scale = Number(scaleArg);
const data = new Uint8Array(await fs.readFile(file));
const doc = await pdfjs.getDocument({ data, isEvalSupported: false, verbosity: 0 }).promise;
await fs.mkdir(outDir, { recursive: true });

const base = path.basename(file, '.pdf');
for (let number = 1; number <= doc.numPages; number += 1) {
  const page = await doc.getPage(number);
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport, canvas }).promise;
  const out = path.join(outDir, `${base}-pdfp${number}.png`);
  await fs.writeFile(out, canvas.toBuffer('image/png'));
  console.log(`${out} ${canvas.width}x${canvas.height}`);
}

console.log(`pages: ${doc.numPages}`);
