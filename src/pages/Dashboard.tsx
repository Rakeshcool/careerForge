import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Resume } from '../types';
import { useStore } from '../store/store';
import { PAGE_SIZES } from '../lib/page';
import { relativeTime } from '../lib/date';
import { TemplatePreview } from '../components/TemplatePreview';
import { Button, EmptyState, Modal } from '../components/ui';
import { LogoMark } from './Landing';

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-md p-1.5 text-muted transition hover:bg-surface hover:text-ink"
    >
      {children}
    </button>
  );
}

export function Dashboard() {
  const resumes = useStore((state) => state.resumes);
  const duplicateResume = useStore((state) => state.duplicateResume);
  const renameResume = useStore((state) => state.renameResume);
  const deleteResume = useStore((state) => state.deleteResume);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Resume | null>(null);

  const filtered = resumes.filter((resume) =>
    resume.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const commitRename = () => {
    if (renamingId && draftTitle.trim()) renameResume(renamingId, draftTitle);
    setRenamingId(null);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-tight">CareerForge</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
            <Link to="/templates" className="hover:text-ink">
              Templates
            </Link>
            <Link to="/" className="hover:text-ink">
              Home
            </Link>
          </nav>
          <Link
            to="/templates"
            className="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white transition hover:bg-brand-ink"
          >
            New resume
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My resumes</h1>
            <p className="mt-1 text-[13px] text-muted">
              {resumes.length === 0
                ? 'Nothing here yet — start with a template.'
                : `${resumes.length} document${resumes.length === 1 ? '' : 's'}, saved in this browser.`}
            </p>
          </div>
          {resumes.length > 0 ? (
            <label className="relative w-full max-w-xs">
              <span className="sr-only">Search resumes</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search resumes"
                className="h-9 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm placeholder:text-muted/70 focus:border-brand focus:outline-none"
              />
              <svg
                viewBox="0 0 20 20"
                className="absolute left-3 top-2.5 h-4 w-4 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="8.5" cy="8.5" r="5" />
                <path d="M12.5 12.5L17 17" />
              </svg>
            </label>
          ) : null}
        </div>

        {resumes.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="No resumes yet"
              body="Pick one of the original templates and the editor will open with a blank, structured document ready to fill in."
              action={
                <Link
                  to="/templates"
                  className="inline-flex h-10 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-ink"
                >
                  Choose a template
                </Link>
              }
            />
          </div>
        ) : filtered.length === 0 ? (
          <p className="mt-10 rounded-xl border border-line bg-white p-6 text-sm text-muted">
            No resume matches “{query}”.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((resume) => (
              <article
                key={resume.id}
                className="rounded-2xl border border-line bg-white p-3 transition hover:shadow-md"
              >
                <Link
                  to={`/resume/${resume.id}/content`}
                  className="block overflow-hidden rounded-lg border border-line bg-surface p-2"
                >
                  <TemplatePreview design={resume.design} zoom={0.22} />
                </Link>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {renamingId === resume.id ? (
                      <input
                        autoFocus
                        value={draftTitle}
                        onChange={(event) => setDraftTitle(event.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') commitRename();
                          if (event.key === 'Escape') setRenamingId(null);
                        }}
                        aria-label="Resume title"
                        className="w-full rounded-md border border-brand px-2 py-1 text-[14px] font-medium focus:outline-none"
                      />
                    ) : (
                      <Link
                        to={`/resume/${resume.id}/content`}
                        className="block truncate text-[14px] font-medium hover:text-brand"
                      >
                        {resume.title}
                      </Link>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted">
                      edited {relativeTime(resume.updatedAt)} • {PAGE_SIZES[resume.design.pageFormat].label}
                    </p>
                  </div>
                  <div className="flex flex-none items-center">
                    <IconButton
                      label={`Duplicate ${resume.title}`}
                      onClick={() => {
                        const id = duplicateResume(resume.id);
                        if (id) navigate(`/resume/${id}/content`);
                      }}
                    >
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="7" y="7" width="9" height="9" rx="1.5" />
                        <path d="M13 7V5.5A1.5 1.5 0 0011.5 4h-7A1.5 1.5 0 003 5.5v7A1.5 1.5 0 004.5 14H6" />
                      </svg>
                    </IconButton>
                    <IconButton
                      label={`Rename ${resume.title}`}
                      onClick={() => {
                        setRenamingId(resume.id);
                        setDraftTitle(resume.title);
                      }}
                    >
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12.5 4.5l3 3L7 16H4v-3z" />
                      </svg>
                    </IconButton>
                    <IconButton label={`Delete ${resume.title}`} onClick={() => setPendingDelete(resume)}>
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10" />
                      </svg>
                    </IconButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete resume"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (pendingDelete) deleteResume(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          “{pendingDelete?.title}” and its saved content will be removed from this browser. This cannot be
          undone after you close the dialog.
        </p>
      </Modal>
    </div>
  );
}
