import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BASE_DESIGN, TEMPLATES, applyTemplate, type Template, type TemplateCategory } from '../data/templates';
import { TemplatePreview } from '../components/TemplatePreview';
import { Button, Modal } from '../components/ui';
import { useStore } from '../store/store';
import { LogoMark } from './Landing';

const FILTERS: { value: 'all' | TemplateCategory; label: string }[] = [
  { value: 'all', label: 'All templates' },
  { value: 'simple', label: 'Simple' },
  { value: 'modern', label: 'Modern' },
  { value: 'creative', label: 'Creative' },
];

export function Templates() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const createResume = useStore((state) => state.createResume);
  const [category, setCategory] = useState<'all' | TemplateCategory>('all');
  const [selected, setSelected] = useState<Template | null>(() => {
    const id = params.get('template');
    return TEMPLATES.find((template) => template.id === id) ?? null;
  });
  const [withDemo, setWithDemo] = useState(false);

  const visible = useMemo(
    () => (category === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.category === category)),
    [category],
  );

  const start = (template: Template, demo: boolean) => {
    const id = createResume({ templateId: template.id, demo });
    navigate(`/resume/${id}/content`);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-tight">CareerForge</span>
          </Link>
          <Link to="/resumes" className="text-sm font-medium text-muted hover:text-ink">
            My resumes
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Start building your resume</h1>
        <p className="mt-2 text-sm text-muted">Choose a design. You can customise it later.</p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={category === filter.value}
              onClick={() => setCategory(filter.value)}
              className={`h-8 rounded-full border px-3.5 text-[12px] font-medium transition ${
                category === filter.value
                  ? 'border-brand bg-brand text-white'
                  : 'border-line bg-white text-muted hover:text-ink'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((template) => {
            const design = applyTemplate({ ...BASE_DESIGN }, template);
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelected(template)}
                className="group text-left"
              >
                <div className="overflow-hidden rounded-xl border border-line bg-surface p-3 transition group-hover:border-brand/50 group-hover:shadow-md">
                  <TemplatePreview design={design} zoom={0.29} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium">{template.name}</span>
                  <span className="text-[11px] uppercase tracking-wide text-muted">{template.category}</span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-muted">{template.tagline}</p>
              </button>
            );
          })}
        </div>
      </main>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? selected.name : ''}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selected) return;
                start(selected, withDemo);
              }}
            >
              Use this template
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="grid gap-6 sm:grid-cols-[260px_1fr]">
            <div className="rounded-lg border border-line bg-surface p-3">
              <TemplatePreview design={applyTemplate({ ...BASE_DESIGN }, selected)} zoom={0.34} />
            </div>
            <div>
              <p className="text-sm text-muted">{selected.tagline}</p>
              <ul className="mt-4 space-y-2 text-[13px]">
                {[
                  'A4 or US Letter, exact page geometry',
                  'Editable text and structured sections',
                  'Fonts, spacing, colours and margins adjustable',
                  'Print-ready export with selectable text',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <label className="mt-5 flex cursor-pointer items-start gap-2.5 rounded-lg bg-surface p-3 text-[12px]">
                <input
                  type="checkbox"
                  checked={withDemo}
                  onChange={(event) => setWithDemo(event.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-medium">Use example content</span>
                  <span className="block text-muted">
                    Starts with fictional sample entries you can replace. Leave unchecked for a blank
                    resume.
                  </span>
                </span>
              </label>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
