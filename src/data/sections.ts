import type { Entry, Item, Section, SectionKind } from '../types';
import { newId } from '../lib/id';

export type SectionType = 'text' | 'entries' | 'items';

export interface SectionMeta {
  kind: SectionKind;
  label: string;
  description: string;
  heading: string;
  type: SectionType;
  entryLabels?: { title: string; subtitle: string; description: string };
  itemLabels?: { name: string; placeholder: string; withLevel?: boolean };
}

export const SECTION_CATALOG: SectionMeta[] = [
  {
    kind: 'summary',
    label: 'Summary',
    description: 'A short summary of your key strengths, experience, and goals.',
    heading: 'Summary',
    type: 'text',
  },
  {
    kind: 'education',
    label: 'Education',
    description: 'Degrees and schools, including focus, honours, or exchanges.',
    heading: 'Education',
    type: 'entries',
    entryLabels: { title: 'Degree', subtitle: 'School', description: 'Details' },
  },
  {
    kind: 'experience',
    label: 'Professional Experience',
    description: 'Professional roles and employer history, including internships.',
    heading: 'Professional Experience',
    type: 'entries',
    entryLabels: { title: 'Job Title', subtitle: 'Employer', description: 'Description' },
  },
  {
    kind: 'skills',
    label: 'Skills',
    description: 'Hard and soft skills that help you stand out.',
    heading: 'Skills',
    type: 'items',
    itemLabels: { name: 'Skill', placeholder: 'e.g. Data modelling' },
  },
  {
    kind: 'languages',
    label: 'Languages',
    description: 'Languages and proficiency level.',
    heading: 'Languages',
    type: 'items',
    itemLabels: { name: 'Language', placeholder: 'e.g. Spanish', withLevel: true },
  },
  {
    kind: 'certificates',
    label: 'Certificates',
    description: 'Industry certificates or licences, with issuer and date.',
    heading: 'Certificates',
    type: 'entries',
    entryLabels: { title: 'Certificate', subtitle: 'Issuer', description: 'Details' },
  },
  {
    kind: 'interests',
    label: 'Interests',
    description: 'Personal interests that support your career story.',
    heading: 'Interests',
    type: 'items',
    itemLabels: { name: 'Interest', placeholder: 'e.g. Trail running' },
  },
  {
    kind: 'projects',
    label: 'Projects',
    description: 'Key projects, your role, and the impact you had.',
    heading: 'Projects',
    type: 'entries',
    entryLabels: { title: 'Project', subtitle: 'Role or stack', description: 'Description' },
  },
  {
    kind: 'courses',
    label: 'Courses',
    description: 'Online or in-person courses and trainings you completed.',
    heading: 'Courses',
    type: 'entries',
    entryLabels: { title: 'Course', subtitle: 'Provider', description: 'Details' },
  },
  {
    kind: 'awards',
    label: 'Awards',
    description: 'Awards and recognitions from industry, competitions, or academia.',
    heading: 'Awards',
    type: 'entries',
    entryLabels: { title: 'Award', subtitle: 'Issuer', description: 'Details' },
  },
  {
    kind: 'organisations',
    label: 'Organisations',
    description: 'Memberships or volunteering, including your role.',
    heading: 'Organisations',
    type: 'entries',
    entryLabels: { title: 'Role', subtitle: 'Organisation', description: 'Details' },
  },
  {
    kind: 'publications',
    label: 'Publications',
    description: 'Publications, articles, or books you wrote or contributed to.',
    heading: 'Publications',
    type: 'entries',
    entryLabels: { title: 'Title', subtitle: 'Publication', description: 'Details' },
  },
  {
    kind: 'references',
    label: 'References',
    description: 'References from managers or coworkers, with contact details.',
    heading: 'References',
    type: 'entries',
    entryLabels: { title: 'Name', subtitle: 'Relationship', description: 'Contact details' },
  },
  {
    kind: 'declaration',
    label: 'Declaration',
    description: 'A closing statement, with an optional signature line.',
    heading: 'Declaration',
    type: 'text',
  },
  {
    kind: 'custom',
    label: 'Custom',
    description: 'A custom section for anything else.',
    heading: 'Custom Section',
    type: 'entries',
    entryLabels: { title: 'Title', subtitle: 'Subtitle', description: 'Description' },
  },
];

export function metaFor(kind: SectionKind): SectionMeta {
  return SECTION_CATALOG.find((m) => m.kind === kind) ?? SECTION_CATALOG[SECTION_CATALOG.length - 1];
}

export function createEntry(): Entry {
  return {
    id: newId(),
    title: '',
    subtitle: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    url: '',
    description: '',
  };
}

export function createItem(withLevel = false): Item {
  return { id: newId(), name: '', level: withLevel ? 'Fluent' : '' };
}

export function createSection(kind: SectionKind): Section {
  const meta = metaFor(kind);
  const section: Section = {
    id: newId(),
    kind,
    heading: meta.heading,
    visible: true,
    newPage: false,
    columns: 1,
    text: '',
    entries: [],
    items: [],
  };
  if (meta.type === 'entries') section.entries = [createEntry()];
  if (meta.type === 'items') section.items = [createItem(Boolean(meta.itemLabels?.withLevel))];
  return section;
}

export function isSectionEmpty(section: Section): boolean {
  if (section.text.trim()) return false;
  if (section.entries.some((e) => e.title.trim() || e.subtitle.trim() || e.description.trim())) {
    return false;
  }
  if (section.items.some((i) => i.name.trim())) return false;
  return true;
}

export const LANGUAGES = ['English', 'Other'];
export const LEVELS = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'];
