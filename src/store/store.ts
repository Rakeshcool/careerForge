import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Personal, Resume, Section } from '../types';
import { SCHEMA_VERSION } from '../types';
import { BASE_DESIGN, applyTemplate, getTemplate } from '../data/templates';
import { demoPersonal, demoSections } from '../data/demo';
import { createSection } from '../data/sections';
import { newId } from '../lib/id';
import { normalizeResume, resumeListSchema } from './schema';

export type SaveState = 'saved' | 'saving' | 'error';

const HISTORY_LIMIT = 60;
const COALESCE_MS = 900;

interface StoreState {
  resumes: Resume[];
  activeId: string | null;
  past: Resume[];
  future: Resume[];
  saveState: SaveState;
  lastKey: string | null;
  lastAt: number;

  createResume: (opts?: { templateId?: string; demo?: boolean; title?: string }) => string;
  duplicateResume: (id: string) => string | null;
  renameResume: (id: string, title: string) => void;
  deleteResume: (id: string) => void;
  setActive: (id: string | null) => void;

  patchActive: (mutator: (draft: Resume) => void, coalesceKey?: string) => void;
  setTemplate: (templateId: string) => void;
  addSection: (kind: Section['kind']) => string | null;
  removeSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: -1 | 1) => void;
  updatePersonal: (patch: Partial<Personal>, coalesceKey?: string) => void;

  undo: () => void;
  redo: () => void;
}

let savedTimer: ReturnType<typeof setTimeout> | null = null;

function markSaving() {
  if (savedTimer) clearTimeout(savedTimer);
  savedTimer = setTimeout(() => {
    useStore.setState({ saveState: 'saved' });
  }, 550);
}

function blankResume(templateId: string, title: string): Resume {
  const template = getTemplate(templateId);
  const now = new Date().toISOString();
  return {
    id: newId(),
    title,
    schemaVersion: SCHEMA_VERSION,
    templateId: template.id,
    createdAt: now,
    updatedAt: now,
    personal: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      linkedin: '',
      photo: '',
    },
    sections: [createSection('summary'), createSection('experience'), createSection('education')],
    design: applyTemplate({ ...BASE_DESIGN }, template),
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      resumes: [],
      activeId: null,
      past: [],
      future: [],
      saveState: 'saved',
      lastKey: null,
      lastAt: 0,

      createResume: ({ templateId = 'meridian', demo = false, title } = {}) => {
        const state = get();
        const resume = blankResume(templateId, title ?? `Resume ${state.resumes.length + 1}`);
        if (demo) {
          resume.personal = demoPersonal();
          resume.sections = demoSections();
        }
        resume.updatedAt = new Date().toISOString();
        set({
          resumes: [resume, ...state.resumes],
          activeId: resume.id,
          past: [],
          future: [],
          saveState: 'saving',
        });
        markSaving();
        return resume.id;
      },

      duplicateResume: (id) => {
        const state = get();
        const source = state.resumes.find((r) => r.id === id);
        if (!source) return null;
        const copy: Resume = structuredClone(source);
        copy.id = newId();
        copy.title = `${source.title} (copy)`;
        copy.createdAt = new Date().toISOString();
        copy.updatedAt = copy.createdAt;
        set({ resumes: [copy, ...state.resumes], saveState: 'saving' });
        markSaving();
        return copy.id;
      },

      renameResume: (id, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        const state = get();
        set({
          resumes: state.resumes.map((r) =>
            r.id === id ? { ...r, title: trimmed, updatedAt: new Date().toISOString() } : r,
          ),
          saveState: 'saving',
        });
        markSaving();
      },

      deleteResume: (id) => {
        const state = get();
        const resumes = state.resumes.filter((r) => r.id !== id);
        set({
          resumes,
          activeId: state.activeId === id ? null : state.activeId,
          past: [],
          future: [],
          saveState: 'saving',
        });
        markSaving();
      },

      setActive: (id) => set({ activeId: id, past: [], future: [], lastKey: null }),

      patchActive: (mutator, coalesceKey) => {
        const state = get();
        const index = state.resumes.findIndex((r) => r.id === state.activeId);
        if (index < 0) return;
        const current = state.resumes[index];
        const draft = structuredClone(current);
        mutator(draft);
        draft.updatedAt = new Date().toISOString();

        const now = Date.now();
        const coalesce =
          coalesceKey != null && state.lastKey === coalesceKey && now - state.lastAt < COALESCE_MS;
        const past = coalesce
          ? state.past
          : [...state.past, structuredClone(current)].slice(-HISTORY_LIMIT);

        const resumes = state.resumes.slice();
        resumes[index] = draft;
        set({
          resumes,
          past,
          future: [],
          lastKey: coalesceKey ?? null,
          lastAt: now,
          saveState: 'saving',
        });
        markSaving();
      },

      setTemplate: (templateId) => {
        const template = getTemplate(templateId);
        get().patchActive((draft) => {
          draft.templateId = template.id;
          draft.design = applyTemplate(draft.design, template);
        }, `template-${templateId}`);
      },

      addSection: (kind) => {
        const section = createSection(kind);
        get().patchActive((draft) => {
          draft.sections.push(section);
        });
        return section.id;
      },

      removeSection: (sectionId) => {
        get().patchActive((draft) => {
          draft.sections = draft.sections.filter((s) => s.id !== sectionId);
        });
      },

      moveSection: (sectionId, direction) => {
        get().patchActive((draft) => {
          const index = draft.sections.findIndex((s) => s.id === sectionId);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= draft.sections.length) return;
          const [section] = draft.sections.splice(index, 1);
          draft.sections.splice(target, 0, section);
        });
      },

      updatePersonal: (patch, coalesceKey) => {
        get().patchActive((draft) => {
          draft.personal = { ...draft.personal, ...patch };
        }, coalesceKey);
      },

      undo: () => {
        const state = get();
        const index = state.resumes.findIndex((r) => r.id === state.activeId);
        if (index < 0 || state.past.length === 0) return;
        const previous = state.past[state.past.length - 1];
        const current = state.resumes[index];
        const resumes = state.resumes.slice();
        resumes[index] = { ...previous, updatedAt: new Date().toISOString() };
        set({
          resumes,
          past: state.past.slice(0, -1),
          future: [current, ...state.future].slice(0, HISTORY_LIMIT),
          saveState: 'saving',
          lastKey: null,
        });
        markSaving();
      },

      redo: () => {
        const state = get();
        const index = state.resumes.findIndex((r) => r.id === state.activeId);
        if (index < 0 || state.future.length === 0) return;
        const next = state.future[0];
        const current = state.resumes[index];
        const resumes = state.resumes.slice();
        resumes[index] = { ...next, updatedAt: new Date().toISOString() };
        set({
          resumes,
          past: [...state.past, current].slice(-HISTORY_LIMIT),
          future: state.future.slice(1),
          saveState: 'saving',
          lastKey: null,
        });
        markSaving();
      },
    }),
    {
      name: 'careerforge.v1',
      partialize: (state) => ({ resumes: state.resumes }),
      merge: (persisted, current) => {
        const raw = (persisted as { resumes?: unknown } | undefined)?.resumes;
        const parsed = resumeListSchema.safeParse(raw ?? []);
        if (!parsed.success) return { ...current, resumes: [] };
        return { ...current, resumes: parsed.data.map(normalizeResume) };
      },
    },
  ),
);

export function useActiveResume(): Resume | null {
  return useStore((state) => state.resumes.find((r) => r.id === state.activeId) ?? null);
}
