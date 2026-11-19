import type { Design, FontKey } from '../types';

export const FONTS: Record<FontKey, { label: string; stack: string }> = {
  inter: { label: 'Inter', stack: "'Inter', system-ui, -apple-system, sans-serif" },
  lato: { label: 'Lato', stack: "'Lato', system-ui, sans-serif" },
  sourceSerif: {
    label: 'Source Serif',
    stack: "'Source Serif 4', Georgia, 'Times New Roman', serif",
  },
  merriweather: {
    label: 'Merriweather',
    stack: "'Merriweather', Georgia, serif",
  },
  playfair: {
    label: 'Playfair Display',
    stack: "'Playfair Display', Georgia, serif",
  },
  plex: {
    label: 'IBM Plex Sans',
    stack: "'IBM Plex Sans', system-ui, sans-serif",
  },
  alegreya: { label: 'Alegreya', stack: "'Alegreya', Georgia, serif" },
};

export const BASE_DESIGN: Design = {
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
  accentColor: '#2f6f5e',
  textColor: '#1b1d22',
  colorArea: 'none',
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

export type TemplateCategory = 'simple' | 'modern' | 'creative';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  tagline: string;
  design: Partial<Design>;
}

/**
 * Original template presets. A template is a set of design tokens only — resume
 * content is never stored inside a template, so switching templates never
 * mutates the user's content.
 */
export const TEMPLATES: Template[] = [
  {
    id: 'meridian',
    name: 'Meridian',
    category: 'simple',
    tagline: 'Quiet sans-serif with hairline section rules.',
    design: {
      bodyFont: 'inter',
      accentColor: '#2f6f5e',
      headingStyle: 'rule',
      headingCase: 'uppercase',
      headerAlign: 'left',
      nameSizeDeltaPt: 11,
      marginHMm: 22,
      marginVMm: 14,
      spacingFactor: 3,
    },
  },
  {
    id: 'foundry',
    name: 'Foundry',
    category: 'modern',
    tagline: 'Full-width colour band header, bar-marked sections.',
    design: {
      bodyFont: 'sourceSerif',
      accentColor: '#1f3b5c',
      colorArea: 'header',
      headingStyle: 'bar',
      headingCase: 'uppercase',
      headerAlign: 'left',
      nameSizeDeltaPt: 13,
      marginHMm: 20,
      marginVMm: 12,
      spacingFactor: 3,
    },
  },
  {
    id: 'ledger',
    name: 'Ledger',
    category: 'simple',
    tagline: 'Classic serif with a centred masthead.',
    design: {
      bodyFont: 'merriweather',
      accentColor: '#22303f',
      headingStyle: 'rule',
      headingCase: 'capitalize',
      headerAlign: 'center',
      nameSizeDeltaPt: 10,
      baseSizePt: 10,
      lineHeight: 1.3,
      marginHMm: 24,
      marginVMm: 16,
      spacingFactor: 3,
    },
  },
  {
    id: 'quarry',
    name: 'Quarry',
    category: 'modern',
    tagline: 'Compact, dense, dates pinned right.',
    design: {
      bodyFont: 'plex',
      accentColor: '#b0691f',
      headingStyle: 'plain',
      headingCase: 'uppercase',
      headerAlign: 'left',
      baseSizePt: 10,
      lineHeight: 1.2,
      spacingFactor: 2,
      marginHMm: 18,
      marginVMm: 12,
      entryDatePosition: 'right',
    },
  },
  {
    id: 'halcyon',
    name: 'Halcyon',
    category: 'creative',
    tagline: 'Editorial display name with a split header.',
    design: {
      bodyFont: 'lato',
      nameFont: 'playfair',
      accentColor: '#7b4b6b',
      headingStyle: 'plain',
      headingCase: 'capitalize',
      headerAlign: 'left',
      headerLayout: 'split',
      nameSizeDeltaPt: 14,
      baseSizePt: 10.5,
      lineHeight: 1.25,
      marginHMm: 24,
      marginVMm: 18,
      spacingFactor: 4,
    },
  },
  {
    id: 'basalt',
    name: 'Basalt',
    category: 'simple',
    tagline: 'Monochrome and unfussy, tight margins.',
    design: {
      bodyFont: 'lato',
      accentColor: '#3f4652',
      headingStyle: 'plain',
      headingCase: 'capitalize',
      headerAlign: 'left',
      baseSizePt: 10,
      lineHeight: 1.25,
      spacingFactor: 2,
      marginHMm: 18,
      marginVMm: 12,
      accentTargets: { ...BASE_DESIGN.accentTargets, headings: false, jobTitle: false },
    },
  },
  {
    id: 'tessera',
    name: 'Tessera',
    category: 'modern',
    tagline: 'Tinted heading blocks and inline subtitles.',
    design: {
      bodyFont: 'inter',
      accentColor: '#0f766e',
      headingStyle: 'boxed',
      headingCase: 'uppercase',
      headerAlign: 'left',
      entrySubtitle: 'same-line',
      baseSizePt: 10.5,
      spacingFactor: 3,
      marginHMm: 20,
      marginVMm: 14,
    },
  },
  {
    id: 'aurelia',
    name: 'Aurelia',
    category: 'creative',
    tagline: 'Wide margins, letterspaced headings, warm serif.',
    design: {
      bodyFont: 'alegreya',
      accentColor: '#3d5a3d',
      headingStyle: 'rule',
      headingCase: 'uppercase',
      headerAlign: 'left',
      baseSizePt: 11,
      lineHeight: 1.2,
      marginHMm: 26,
      marginVMm: 18,
      spacingFactor: 4,
      colorArea: 'border',
    },
  },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

/** Applies a template's visual tokens while keeping page setup and content intact. */
export function applyTemplate(design: Design, template: Template): Design {
  return {
    ...design,
    ...template.design,
    pageFormat: design.pageFormat,
    dateFormat: design.dateFormat,
    language: design.language,
  };
}

export function fontStack(key: FontKey | 'same', design: Design): string {
  const resolved = key === 'same' ? design.bodyFont : key;
  return FONTS[resolved]?.stack ?? FONTS.inter.stack;
}
