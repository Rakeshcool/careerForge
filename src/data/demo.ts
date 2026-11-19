import type { Personal, Section } from '../types';
import { createEntry, createItem, createSection } from './sections';

/**
 * DEMO FIXTURE — fictional content, never used for a blank resume.
 * Only loaded when the user explicitly chooses "Use example content".
 */
export const DEMO_PERSONAL: Personal = {
  fullName: 'Jordan Avery',
  jobTitle: 'Senior Product Designer',
  email: 'jordan.avery@example.com',
  phone: '+44 7700 900123',
  address: 'Bristol, United Kingdom',
  website: 'jordanavery.example',
  linkedin: 'linkedin.com/in/jordanavery',
  photo: '',
};

export function demoPersonal(): Personal {
  return { ...DEMO_PERSONAL };
}

export function demoSections(): Section[] {
  const summary = createSection('summary');
  summary.text =
    'Product designer with eight years spent turning complex internal tools into interfaces people finish their work in. Comfortable owning research through delivery, and happiest when a design decision can be defended with evidence.';

  const experience = createSection('experience');
  experience.entries = [
    {
      ...createEntry(),
      title: 'Senior Product Designer',
      subtitle: 'Northwind Systems',
      location: 'Bristol, UK',
      startDate: '2022-03',
      endDate: '',
      current: true,
      description:
        '- Led the redesign of the scheduling console used by 1,400 dispatch staff, cutting average task time from 4m 10s to 2m 35s.\n- Built the first shared component library with two engineers; adoption reached 80% of product surfaces in two quarters.\n- Ran a fortnightly research panel that replaced ad-hoc usability testing.',
    },
    {
      ...createEntry(),
      title: 'Product Designer',
      subtitle: 'Harbour Analytics',
      location: 'Remote',
      startDate: '2019-01',
      endDate: '2022-02',
      description:
        '- Designed reporting flows for a self-serve analytics product with 12,000 monthly active users.\n- Shipped an onboarding rebuild that lifted week-one activation by 18%.',
    },
  ];

  const education = createSection('education');
  education.entries = [
    {
      ...createEntry(),
      title: 'BA (Hons) Interaction Design',
      subtitle: 'University of the West of England',
      location: 'Bristol, UK',
      startDate: '2014-09',
      endDate: '2017-06',
      description: 'First class honours. Dissertation on wayfinding in dense information systems.',
    },
  ];

  const skills = createSection('skills');
  skills.items = [
    'Product discovery',
    'Design systems',
    'Interaction design',
    'Usability research',
    'Figma',
    'Accessibility (WCAG 2.2)',
  ].map((name) => ({ ...createItem(), name }));

  const projects = createSection('projects');
  projects.entries = [
    {
      ...createEntry(),
      title: 'Field Notes',
      subtitle: 'Research repository, side project',
      startDate: '2023-05',
      url: 'fieldnotes.example',
      description:
        'A small, local-first tool for tagging interview clips; used by four design teams to keep findings searchable.',
    },
  ];

  const languages = createSection('languages');
  languages.items = [
    { ...createItem(true), name: 'English', level: 'Native' },
    { ...createItem(true), name: 'Swedish', level: 'Intermediate' },
  ];

  return [summary, experience, education, skills, projects, languages];
}
