import { Link } from 'react-router-dom';
import { BASE_DESIGN, TEMPLATES, applyTemplate } from '../data/templates';
import { TemplatePreview } from '../components/TemplatePreview';

export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#2f6f5e" />
      <path d="M9 10.5h14M9 16h9M9 21.5h12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

const STEPS = [
  {
    title: 'Choose a starting design',
    body: 'Eight original templates with different typographic voices. Every one is a set of tokens you can keep adjusting — never a fixed picture.',
  },
  {
    title: 'Write in sections, not in boxes',
    body: 'Experience, education, projects and skills are structured entries with real fields, so the document can reflow and repaginate as you type.',
  },
  {
    title: 'Export the page you see',
    body: 'Preview and PDF share one render tree. Print to PDF and the text stays selectable, the dimensions stay exact, and nothing is dropped to force a page count.',
  },
];

export function Landing() {
  const featured = TEMPLATES.slice(0, 4).map((template) => ({
    template,
    design: applyTemplate({ ...BASE_DESIGN }, template),
  }));

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-tight">CareerForge</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted sm:flex">
            <a href="#how" className="hover:text-ink">
              How it works
            </a>
            <a href="#templates" className="hover:text-ink">
              Templates
            </a>
            <Link to="/resumes" className="hover:text-ink">
              My resumes
            </Link>
          </nav>
          <Link
            to="/templates"
            className="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white transition hover:bg-brand-ink"
          >
            Start building
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[12px] font-medium text-muted">
              Resume builder
              <span className="h-1 w-1 rounded-full bg-brand" />
              Structured content, typographic design
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              A resume that looks composed,
              <span className="text-brand"> not crammed.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
              Write your experience once as structured sections, then shape the page: fonts, accent
              colour, spacing, margins and page breaks. The preview you approve is the PDF you get.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/templates"
                className="inline-flex h-11 items-center rounded-lg bg-brand px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-ink"
              >
                Start building — free
              </Link>
              <a
                href="#templates"
                className="inline-flex h-11 items-center rounded-lg border border-line bg-white px-5 text-sm font-medium transition hover:bg-surface"
              >
                See the templates
              </a>
            </div>
            <p className="mt-4 text-[12px] text-muted">
              No account required for this build. Drafts are saved in your browser.
            </p>
          </div>

          <div className="relative mx-auto hidden w-full max-w-[420px] sm:block">
            <div className="absolute -left-10 top-8 rotate-[-6deg] opacity-70">
              <div className="rounded-sm bg-white p-2 shadow-xl">
                <TemplatePreview design={applyTemplate({ ...BASE_DESIGN }, TEMPLATES[1])} zoom={0.3} />
              </div>
            </div>
            <div className="relative ml-16 rounded-sm bg-white p-2 shadow-2xl">
              <TemplatePreview design={applyTemplate({ ...BASE_DESIGN }, TEMPLATES[0])} zoom={0.4} />
            </div>
          </div>
        </section>

        <section id="templates" className="border-y border-line bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Eight starting points</h2>
                <p className="mt-2 max-w-xl text-sm text-muted">
                  Different voices for different industries — then adjust type size, spacing and colour
                  until it is yours.
                </p>
              </div>
              <Link to="/templates" className="text-sm font-medium text-brand hover:underline">
                Browse all templates →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {featured.map(({ template, design }) => (
                <Link
                  key={template.id}
                  to={`/templates?template=${template.id}`}
                  className="group block"
                >
                  <div className="overflow-hidden rounded-lg border border-line bg-surface p-3 transition group-hover:border-brand/40">
                    <TemplatePreview design={design} zoom={0.27} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[13px] font-medium">{template.name}</span>
                    <span className="text-[11px] uppercase tracking-wide text-muted">
                      {template.category}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-line bg-white p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-[13px] font-semibold text-brand-ink">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-[15px] font-semibold">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Built for the printed page</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                Long resumes paginate by measuring actual blocks, not by slicing a screenshot. Section
                headings stay with their first entry, and a section can be forced onto a new page when
                you want a clean break.
              </p>
              <ul className="mt-6 space-y-2.5 text-[13px]">
                {[
                  'A4 and US Letter, with exact page geometry',
                  'Selectable text and embedded font stacks',
                  'Page numbers, email and name footers',
                  'Warnings when a single block cannot fit a page',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 flex-none text-brand" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 8.5l3.2 3L13 4.5" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-6">
              <p className="text-[12px] font-medium uppercase tracking-wide text-muted">
                Exporting a PDF
              </p>
              <ol className="mt-4 space-y-4 text-[13px]">
                <li>
                  <span className="font-medium">1. Open a resume</span>
                  <p className="text-muted">
                    Content and design live in one document, so the preview updates as you type.
                  </p>
                </li>
                <li>
                  <span className="font-medium">2. Press Download</span>
                  <p className="text-muted">
                    The browser print dialog opens with the page already sized to A4 or US Letter.
                  </p>
                </li>
                <li>
                  <span className="font-medium">3. Choose “Save as PDF”</span>
                  <p className="text-muted">
                    Margins are handled by the document itself — set the dialog margins to none for an
                    exact match.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Your next draft starts with structure.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
            Pick a template, fill in what you actually did, and adjust the page until it reads the way you
            want it to.
          </p>
          <Link
            to="/templates"
            className="mt-7 inline-flex h-11 items-center rounded-lg bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-ink"
          >
            Choose a template
          </Link>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="h-5 w-5" />
            <span>CareerForge — an original resume builder.</span>
          </div>
          <span>Built with React, TypeScript and print CSS. Drafts stay on this device.</span>
        </div>
      </footer>
    </div>
  );
}
