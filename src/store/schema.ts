import { z } from 'zod';
import type { Design, Personal, Resume, Section } from '../types';
import { SCHEMA_VERSION } from '../types';
import { BASE_DESIGN } from '../data/templates';
import { metaFor } from '../data/sections';
import { newId } from '../lib/id';

const entrySchema = z.object({
  id: z.string().default(() => newId()),
  title: z.string().default(''),
  subtitle: z.string().default(''),
  location: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  current: z.boolean().default(false),
  url: z.string().default(''),
  description: z.string().default(''),
});

const itemSchema = z.object({
  id: z.string().default(() => newId()),
  name: z.string().default(''),
  level: z.string().default(''),
});

const sectionSchema = z.object({
  id: z.string().default(() => newId()),
  kind: z.enum([
    'summary',
    'experience',
    'education',
    'skills',
    'languages',
    'certificates',
    'interests',
    'projects',
    'courses',
    'awards',
    'organisations',
    'publications',
    'references',
    'declaration',
    'custom',
  ]),
  heading: z.string().optional(),
  visible: z.boolean().default(true),
  newPage: z.boolean().default(false),
  columns: z.union([z.literal(1), z.literal(2)]).default(1),
  text: z.string().default(''),
  entries: z.array(entrySchema).default([]),
  items: z.array(itemSchema).default([]),
});

const personalSchema = z.object({
  fullName: z.string().default(''),
  jobTitle: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  address: z.string().default(''),
  website: z.string().default(''),
  linkedin: z.string().default(''),
  photo: z.string().default(''),
});

export const resumeSchema = z.object({
  id: z.string().default(() => newId()),
  title: z.string().default('Untitled resume'),
  schemaVersion: z.number().default(SCHEMA_VERSION),
  templateId: z.string().default('meridian'),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
  personal: personalSchema.optional(),
  sections: z.array(sectionSchema).default([]),
  design: z.record(z.string(), z.unknown()).default({}),
});

export const resumeListSchema = z.array(resumeSchema).default([]);

export function normalizeDesign(raw: unknown): Design {
  const value = (raw ?? {}) as Partial<Design>;
  const targets = (value.accentTargets ?? {}) as Partial<Design['accentTargets']>;
  const footer = (value.footer ?? {}) as Partial<Design['footer']>;
  return {
    ...BASE_DESIGN,
    ...value,
    accentTargets: { ...BASE_DESIGN.accentTargets, ...targets },
    footer: { ...BASE_DESIGN.footer, ...footer },
  };
}

export function normalizeSections(raw: Section[]): Section[] {
  return raw.map((section) => ({
    ...section,
    heading: section.heading?.trim() ? section.heading : metaFor(section.kind).heading,
  }));
}

export function normalizeResume(input: unknown): Resume {
  const parsed = resumeSchema.parse(input);
  return {
    ...parsed,
    schemaVersion: SCHEMA_VERSION,
    personal: personalSchema.parse(parsed.personal ?? {}) as Personal,
    sections: normalizeSections(parsed.sections as Section[]),
    design: normalizeDesign(parsed.design),
  };
}
