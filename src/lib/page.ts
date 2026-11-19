import type { PageFormat } from '../types';

export const PAGE_SIZES: Record<PageFormat, { w: number; h: number; label: string }> = {
  A4: { w: 210, h: 297, label: 'A4' },
  Letter: { w: 215.9, h: 279.4, label: 'US Letter' },
};

export function pageSize(format: PageFormat) {
  return PAGE_SIZES[format] ?? PAGE_SIZES.A4;
}
