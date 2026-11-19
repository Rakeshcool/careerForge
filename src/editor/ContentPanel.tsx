import { useRef, useState } from 'react';
import type { Entry, Item, Section } from '../types';
import { useActiveResume, useStore } from '../store/store';
import { LEVELS, SECTION_CATALOG, createEntry, createItem, metaFor } from '../data/sections';
import { newId } from '../lib/id';
import { Button, Field, Modal, Segmented, Select, TextArea, TextInput, Toggle } from '../components/ui';

export function SectionRail({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const resume = useActiveResume();
  const moveSection = useStore((state) => state.moveSection);
  const removeSection = useStore((state) => state.removeSection);
  const addSection = useStore((state) => state.addSection);
  const patchActive = useStore((state) => state.patchActive);
  const [addOpen, setAddOpen] = useState(false);

  if (!resume) return null;

  return (
    <nav className="flex w-[236px] flex-none flex-col border-r border-line bg-white">
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Content</p>
        <button
          type="button"
          onClick={() => onSelect('personal')}
          className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] ${
            selected === 'personal' ? 'bg-brand-soft font-medium text-brand-ink' : 'hover:bg-surface'
          }`}
        >
          <span className="truncate">{resume.personal.fullName.trim() || 'Personal details'}</span>
        </button>

        {resume.sections.map((section, index) => {
          const active = selected === section.id;
          const count =
            section.entries.filter((entry) => entry.title.trim()).length ||
            section.items.filter((item) => item.name.trim()).length;
          return (
            <div
              key={section.id}
              className={`group mb-1 flex items-center gap-1 rounded-lg pr-1 ${
                active ? 'bg-brand-soft text-brand-ink' : 'hover:bg-surface'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                className={`min-w-0 flex-1 truncate px-2.5 py-2 text-left text-[13px] ${
                  active ? 'font-medium' : ''
                } ${section.visible ? '' : 'text-muted line-through'}`}
              >
                {section.heading}
                {count ? <span className="ml-1.5 text-[11px] text-muted">{count}</span> : null}
              </button>
              <div className="flex items-center opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
                <button
                  type="button"
                  aria-label={`${section.visible ? 'Hide' : 'Show'} ${section.heading}`}
                  title={section.visible ? 'Hide section' : 'Show section'}
                  onClick={() =>
                    patchActive((draft) => {
                      const target = draft.sections.find((item) => item.id === section.id);
                      if (target) target.visible = !target.visible;
                    })
                  }
                  className="rounded p-1 text-muted hover:text-ink"
                >
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {section.visible ? (
                      <>
                        <path d="M2.5 10S5.5 5.5 10 5.5 17.5 10 17.5 10 14.5 14.5 10 14.5 2.5 10 2.5 10z" />
                        <circle cx="10" cy="10" r="2" />
                      </>
                    ) : (
                      <path d="M3 3l14 14M8.2 5.8A8.7 8.7 0 0110 5.5c4.5 0 7.5 4.5 7.5 4.5a15 15 0 01-2.6 3M5.4 6.9A14.7 14.7 0 002.5 10S5.5 14.5 10 14.5c.9 0 1.7-.2 2.4-.5" />
                    )}
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label={`Move ${section.heading} up`}
                  disabled={index === 0}
                  onClick={() => moveSection(section.id, -1)}
                  className="rounded p-1 text-muted hover:text-ink disabled:opacity-30"
                >
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 12l4-4 4 4" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label={`Move ${section.heading} down`}
                  disabled={index === resume.sections.length - 1}
                  onClick={() => moveSection(section.id, 1)}
                  className="rounded p-1 text-muted hover:text-ink disabled:opacity-30"
                >
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 8l4 4 4-4" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${section.heading}`}
                  onClick={() => {
                    removeSection(section.id);
                    onSelect('personal');
                  }}
                  className="rounded p-1 text-muted hover:text-red-600"
                >
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 6h10M8 6V4.5h4V6M6.5 6l.7 9h5.6l.7-9" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-line p-2">
        <Button variant="secondary" className="w-full" onClick={() => setAddOpen(true)}>
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 4.5v11M4.5 10h11" />
          </svg>
          Add content
        </Button>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add content" wide>
        <p className="mb-3 text-[12px] text-muted">
          Sections are added empty and appear in the preview as soon as they have content.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SECTION_CATALOG.map((meta) => (
            <button
              key={meta.kind}
              type="button"
              onClick={() => {
                const id = addSection(meta.kind);
                setAddOpen(false);
                if (id) onSelect(id);
              }}
              className="rounded-lg border border-line bg-white p-3 text-left transition hover:border-brand/50 hover:bg-surface"
            >
              <span className="block text-[13px] font-medium">{meta.label}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted">{meta.description}</span>
            </button>
          ))}
        </div>
      </Modal>
    </nav>
  );
}

function PhotoField() {
  const resume = useActiveResume();
  const updatePersonal = useStore((state) => state.updatePersonal);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setError('Use a PNG, JPEG or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Images must be under 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updatePersonal({ photo: String(reader.result) }, 'personal.photo');
      setError(null);
    };
    reader.onerror = () => setError('That file could not be read.');
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <span className="mb-1 block text-[12px] font-medium text-muted">Photo (optional)</span>
      <div className="flex items-center gap-3">
        {resume?.personal.photo ? (
          <img
            src={resume.personal.photo}
            alt="Profile photo"
            className="h-12 w-12 rounded-full border border-line object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-line text-muted">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="7.5" r="2.8" />
              <path d="M4.5 16c.8-2.7 2.9-4 5.5-4s4.7 1.3 5.5 4" />
            </svg>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
            {resume?.personal.photo ? 'Replace' : 'Upload'}
          </Button>
          {resume?.personal.photo ? (
            <Button size="sm" variant="ghost" onClick={() => updatePersonal({ photo: '' }, 'personal.photo')}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <p className={`mt-1 text-[11px] ${error ? 'text-red-600' : 'text-muted'}`}>
        {error ?? 'PNG, JPEG or WebP, up to 2 MB. Stored with the document.'}
      </p>
    </div>
  );
}

function PersonalEditor() {
  const resume = useActiveResume();
  const updatePersonal = useStore((state) => state.updatePersonal);
  if (!resume) return null;

  const field = (key: keyof typeof resume.personal, label: string, placeholder: string, type = 'text') => (
    <Field label={label}>
      <TextInput
        type={type}
        value={resume.personal[key]}
        placeholder={placeholder}
        onChange={(event) => updatePersonal({ [key]: event.target.value }, `personal.${key}`)}
      />
    </Field>
  );

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-5">
        <h2 className="text-lg font-semibold">Personal details</h2>
        <p className="text-[12px] text-muted">
          These appear in the document header. Contact rows are hidden when empty.
        </p>
      </header>

      <div className="space-y-4 rounded-xl border border-line bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {field('fullName', 'Full name', 'Jordan Avery')}
          {field('jobTitle', 'Professional headline', 'Senior Product Designer')}
        </div>
        <PhotoField />
        <div className="grid gap-4 sm:grid-cols-2">
          {field('email', 'Email', 'name@example.com', 'email')}
          {field('phone', 'Phone', '+44 7700 900123', 'tel')}
        </div>
        {field('address', 'Location', 'Bristol, United Kingdom')}
        <div className="grid gap-4 sm:grid-cols-2">
          {field('website', 'Website', 'yourdomain.example')}
          {field('linkedin', 'LinkedIn or other profile', 'linkedin.com/in/you')}
        </div>
      </div>
    </div>
  );
}

function EntryEditor({ section, entry, index, total }: { section: Section; entry: Entry; index: number; total: number }) {
  const patchActive = useStore((state) => state.patchActive);
  const [open, setOpen] = useState(index === 0);
  const meta = metaFor(section.kind);
  const labels = meta.entryLabels ?? { title: 'Title', subtitle: 'Subtitle', description: 'Description' };

  const updateSection = (mutator: (target: Section) => void, key?: string) =>
    patchActive((draft) => {
      const target = draft.sections.find((item) => item.id === section.id);
      if (target) mutator(target);
    }, key);

  const setEntry = (patch: Partial<Entry>, key: string) =>
    updateSection((target) => {
      const found = target.entries.find((item) => item.id === entry.id);
      if (found) Object.assign(found, patch);
    }, `${section.id}.${entry.id}.${key}`);

  const summary = entry.title.trim() || entry.subtitle.trim() || 'Untitled entry';

  return (
    <div className="rounded-xl border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <svg
            viewBox="0 0 20 20"
            className={`h-3.5 w-3.5 flex-none text-muted transition ${open ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M7 5l6 5-6 5" />
          </svg>
          <span className="truncate text-[13px] font-medium">{summary}</span>
        </button>
        <div className="flex flex-none items-center">
          <button
            type="button"
            aria-label="Move entry up"
            disabled={index === 0}
            onClick={() =>
              updateSection((target) => {
                const from = target.entries.findIndex((item) => item.id === entry.id);
                if (from > 0) {
                  const [moved] = target.entries.splice(from, 1);
                  target.entries.splice(from - 1, 0, moved);
                }
              })
            }
            className="rounded p-1 text-muted hover:text-ink disabled:opacity-30"
          >
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 12l4-4 4 4" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Move entry down"
            disabled={index === total - 1}
            onClick={() =>
              updateSection((target) => {
                const from = target.entries.findIndex((item) => item.id === entry.id);
                if (from >= 0 && from < target.entries.length - 1) {
                  const [moved] = target.entries.splice(from, 1);
                  target.entries.splice(from + 1, 0, moved);
                }
              })
            }
            className="rounded p-1 text-muted hover:text-ink disabled:opacity-30"
          >
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 8l4 4 4-4" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Duplicate entry"
            onClick={() =>
              updateSection((target) => {
                const from = target.entries.findIndex((item) => item.id === entry.id);
                if (from >= 0) {
                  const copy = { ...structuredClone(target.entries[from]), id: newId() };
                  target.entries.splice(from + 1, 0, copy);
                }
              })
            }
            className="rounded p-1 text-muted hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="7" y="7" width="9" height="9" rx="1.5" />
              <path d="M13 7V5.5A1.5 1.5 0 0011.5 4h-7A1.5 1.5 0 003 5.5v7A1.5 1.5 0 004.5 14H6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Remove entry"
            onClick={() => updateSection((target) => {
              target.entries = target.entries.filter((item) => item.id !== entry.id);
            })}
            className="rounded p-1 text-muted hover:text-red-600"
          >
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 6h10M8 6V4.5h4V6M6.5 6l.7 9h5.6l.7-9" />
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div className="space-y-4 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={labels.title}>
              <TextInput value={entry.title} onChange={(event) => setEntry({ title: event.target.value }, 'title')} />
            </Field>
            <Field label={labels.subtitle}>
              <TextInput
                value={entry.subtitle}
                onChange={(event) => setEntry({ subtitle: event.target.value }, 'subtitle')}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <TextInput
                type="month"
                value={entry.startDate}
                onChange={(event) => setEntry({ startDate: event.target.value }, 'startDate')}
              />
            </Field>
            <Field label="End date">
              <TextInput
                type="month"
                value={entry.endDate}
                disabled={entry.current}
                onChange={(event) => setEntry({ endDate: event.target.value }, 'endDate')}
              />
            </Field>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted">
            <input
              type="checkbox"
              checked={entry.current}
              onChange={(event) => setEntry({ current: event.target.checked, endDate: '' }, 'current')}
            />
            I currently work here
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location">
              <TextInput
                value={entry.location}
                placeholder="Bristol, UK"
                onChange={(event) => setEntry({ location: event.target.value }, 'location')}
              />
            </Field>
            <Field label="Link (optional)">
              <TextInput
                value={entry.url}
                placeholder="example.com/project"
                onChange={(event) => setEntry({ url: event.target.value }, 'url')}
              />
            </Field>
          </div>
          <Field
            label={labels.description}
            hint="Formatting: **bold**, *italic*, [label](https://link). Start a line with - for a bullet."
          >
            <TextArea
              value={entry.description}
              rows={6}
              placeholder="Describe your role and achievements"
              onChange={(event) => setEntry({ description: event.target.value }, 'description')}
            />
          </Field>
        </div>
      ) : null}
    </div>
  );
}

function ItemsEditor({ section }: { section: Section }) {
  const patchActive = useStore((state) => state.patchActive);
  const meta = metaFor(section.kind);
  const withLevel = Boolean(meta.itemLabels?.withLevel);

  const update = (mutator: (target: Section) => void, key?: string) =>
    patchActive((draft) => {
      const target = draft.sections.find((item) => item.id === section.id);
      if (target) mutator(target);
    }, key);

  return (
    <div className="space-y-2">
      {section.items.map((item: Item) => (
        <div key={item.id} className="flex items-center gap-2">
          <TextInput
            value={item.name}
            placeholder={meta.itemLabels?.placeholder}
            aria-label={`${meta.label} item`}
            onChange={(event) =>
              update((target) => {
                const found = target.items.find((entry) => entry.id === item.id);
                if (found) found.name = event.target.value;
              }, `${section.id}.${item.id}.name`)
            }
          />
          {withLevel ? (
            <Select
              aria-label="Proficiency"
              className="w-40"
              value={item.level}
              onChange={(event) =>
                update((target) => {
                  const found = target.items.find((entry) => entry.id === item.id);
                  if (found) found.level = event.target.value;
                }, `${section.id}.${item.id}.level`)
              }
            >
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          ) : null}
          <button
            type="button"
            aria-label={`Remove ${item.name || 'item'}`}
            onClick={() => update((target) => {
              target.items = target.items.filter((entry) => entry.id !== item.id);
            })}
            className="rounded p-2 text-muted hover:text-red-600"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 6h10M8 6V4.5h4V6M6.5 6l.7 9h5.6l.7-9" />
            </svg>
          </button>
        </div>
      ))}
      <Button
        size="sm"
        variant="secondary"
        onClick={() => update((target) => {
          target.items.push(createItem(withLevel));
        })}
      >
        Add {meta.itemLabels?.name.toLowerCase() ?? 'item'}
      </Button>
    </div>
  );
}

function SectionEditor({ section }: { section: Section }) {
  const patchActive = useStore((state) => state.patchActive);
  const meta = metaFor(section.kind);

  const update = (mutator: (target: Section) => void, key?: string) =>
    patchActive((draft) => {
      const target = draft.sections.find((item) => item.id === section.id);
      if (target) mutator(target);
    }, key);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <input
            value={section.heading}
            aria-label="Section heading"
            onChange={(event) => update((target) => {
              target.heading = event.target.value;
            }, `${section.id}.heading`)}
            className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-lg font-semibold hover:border-line focus:border-brand focus:bg-white focus:outline-none"
          />
        </div>
        <p className="px-1 text-[12px] text-muted">{meta.description}</p>
      </header>

      <div className="space-y-4 rounded-xl border border-line bg-white p-5">
        {meta.type === 'text' ? (
          <Field label="Content" hint="Formatting: **bold**, *italic*, [label](https://link), and - for bullets.">
            <TextArea
              rows={8}
              value={section.text}
              placeholder={section.kind === 'declaration' ? 'I confirm the information above is accurate.' : 'Write two or three sentences that frame your experience.'}
              onChange={(event) => update((target) => {
                target.text = event.target.value;
              }, `${section.id}.text`)}
            />
          </Field>
        ) : null}

        {meta.type === 'items' ? (
          <>
            <ItemsEditor section={section} />
            <Segmented
              label="Item layout"
              value={section.columns}
              options={[
                { value: 1, label: 'One column' },
                { value: 2, label: 'Two columns' },
              ]}
              onChange={(value) => update((target) => {
                target.columns = value;
              })}
            />
          </>
        ) : null}

        {meta.type === 'entries' ? (
          <div className="space-y-3">
            {section.entries.map((entry, index) => (
              <EntryEditor
                key={entry.id}
                section={section}
                entry={entry}
                index={index}
                total={section.entries.length}
              />
            ))}
            <Button
              variant="secondary"
              onClick={() => update((target) => {
                target.entries.push(createEntry());
              })}
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 4.5v11M4.5 10h11" />
              </svg>
              Add entry
            </Button>
          </div>
        ) : null}

        <div className="border-t border-line pt-2">
          <Toggle
            label="Show this section"
            hint="Hidden sections keep their content but are left out of the document."
            checked={section.visible}
            onChange={(checked) => update((target) => {
              target.visible = checked;
            })}
          />
          <Toggle
            label="Start on a new page"
            hint="Forces a page break before this section in the preview and PDF."
            checked={section.newPage}
            onChange={(checked) => update((target) => {
              target.newPage = checked;
            })}
          />
        </div>
      </div>
    </div>
  );
}

export function ContentPanel({ sectionId }: { sectionId: string }) {
  const resume = useActiveResume();
  if (!resume) return null;
  if (sectionId === 'personal') return <PersonalEditor />;
  const section = resume.sections.find((item) => item.id === sectionId);
  if (!section) return <PersonalEditor />;
  return <SectionEditor key={section.id} section={section} />;
}
