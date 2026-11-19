export const SCHEMA_VERSION = 1;

export type PageFormat = 'A4' | 'Letter';

export type DateFormat = 'MMM YYYY' | 'MM/YYYY' | 'DD/MM/YYYY' | 'MM/DD/YYYY';

export type FontKey =
  | 'inter'
  | 'lato'
  | 'sourceSerif'
  | 'merriweather'
  | 'playfair'
  | 'plex'
  | 'alegreya';

export type SectionKind =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'certificates'
  | 'interests'
  | 'projects'
  | 'courses'
  | 'awards'
  | 'organisations'
  | 'publications'
  | 'references'
  | 'declaration'
  | 'custom';

export interface Entry {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  url: string;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  level: string;
}

export interface Section {
  id: string;
  kind: SectionKind;
  heading: string;
  visible: boolean;
  newPage: boolean;
  columns: 1 | 2;
  text: string;
  entries: Entry[];
  items: Item[];
}

export interface Personal {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  linkedin: string;
  photo: string;
}

export interface AccentTargets {
  name: boolean;
  jobTitle: boolean;
  headings: boolean;
  headingRule: boolean;
  dates: boolean;
  entryTitle: boolean;
  entrySubtitle: boolean;
  icons: boolean;
}

export interface Design {
  pageFormat: PageFormat;
  dateFormat: DateFormat;
  language: string;
  baseSizePt: number;
  nameSizeDeltaPt: number;
  headingSizeDeltaPt: number;
  entrySizeDeltaPt: number;
  lineHeight: number;
  spacingFactor: number;
  marginHMm: number;
  marginVMm: number;
  bodyFont: FontKey;
  nameFont: FontKey | 'same';
  accentColor: string;
  textColor: string;
  colorArea: 'none' | 'header' | 'border';
  headerAlign: 'left' | 'center';
  headerLayout: 'stacked' | 'split';
  headingStyle: 'rule' | 'plain' | 'bar' | 'boxed';
  headingCase: 'capitalize' | 'uppercase';
  entryDatePosition: 'right' | 'left' | 'split';
  entrySubtitle: 'below' | 'same-line';
  detailsSeparator: 'icon' | 'bullet' | 'bar';
  accentTargets: AccentTargets;
  linkUnderline: boolean;
  linkBlue: boolean;
  footer: { pageNumbers: boolean; email: boolean; name: boolean };
  photoShape: 'none' | 'circle' | 'rounded' | 'square';
}

export interface Resume {
  id: string;
  title: string;
  schemaVersion: number;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  personal: Personal;
  sections: Section[];
  design: Design;
}
