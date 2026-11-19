import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Resume } from '../types';
import { DocumentProvider } from '../document/DocumentRuntime';
import { useStore } from '../store/store';
import { SectionRail, ContentPanel } from './ContentPanel';
import { DesignPanel } from './DesignPanel';
import { PreviewPane, PrintRoot } from './PreviewPane';
import { Button, Modal, Segmented } from '../components/ui';
import { pageSize } from '../lib/page';
import { LogoMark } from '../pages/Landing';

function TitleInput({ resume }: { resume: Resume }) {
  const renameResume = useStore((state) => state.renameResume);
  const [draft, setDraft] = useState(resume.title);

  useEffect(() => {
    setDraft(resume.title);
  }, [resume.title]);

  const commit = () => {
    if (draft.trim() && draft !== resume.title) renameResume(resume.id, draft);
    else setDraft(resume.title);
  };

  return (
    <input
      value={draft}
      aria-label="Resume title"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
        if (event.key === 'Escape') {
          setDraft(resume.title);
          event.currentTarget.blur();
        }
      }}
      className="min-w-0 max-w-[220px] truncate rounded-md border border-transparent px-2 py-1 text-[14px] font-medium hover:border-line focus:border-brand focus:bg-white focus:outline-none"
    />
  );
}

export function EditorPage() {
  const { id = '', tab = 'content' } = useParams();
  const resume = useStore((state) => state.resumes.find((item) => item.id === id) ?? null);
  const activeId = useStore((state) => state.activeId);
  const setActive = useStore((state) => state.setActive);
  const patchActive = useStore((state) => state.patchActive);
  const saveState = useStore((state) => state.saveState);
  const canUndo = useStore((state) => state.past.length > 0);
  const canRedo = useStore((state) => state.future.length > 0);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);

  const [sectionId, setSectionId] = useState('personal');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const [downloadOpen, setDownloadOpen] = useState(false);

  useEffect(() => {
    if (id && activeId !== id) setActive(id);
  }, [id, activeId, setActive]);

  useEffect(() => {
    setSectionId('personal');
  }, [id]);

  if (!resume) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <LogoMark className="h-10 w-10" />
        <h1 className="text-xl font-semibold">That resume is not in this browser</h1>
        <p className="max-w-sm text-sm text-muted">
          Drafts are stored locally, so a link from another device or a cleared browser will not open.
        </p>
        <Link
          to="/resumes"
          className="inline-flex h-10 items-center rounded-lg bg-brand px-5 text-sm font-medium text-white hover:bg-brand-ink"
        >
          Back to my resumes
        </Link>
      </div>
    );
  }

  const isDesign = tab === 'customize';

  return (
    <DocumentProvider resume={resume}>
      <div className="app-shell flex h-screen flex-col bg-surface">
        <header className="flex-none border-b border-line bg-white">
          <div className="flex h-14 items-center gap-2 px-3">
            <Link
              to="/resumes"
              aria-label="Back to my resumes"
              className="rounded-md p-2 text-muted transition hover:bg-surface hover:text-ink"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 5l-5 5 5 5" />
              </svg>
            </Link>
            <LogoMark className="hidden h-6 w-6 sm:block" />
            <TitleInput resume={resume} />
            <span className="hidden items-center gap-1.5 text-[11px] text-muted sm:flex" aria-live="polite">
              <span
                className={`h-1.5 w-1.5 rounded-full ${saveState === 'saving' ? 'bg-amber-500' : 'bg-brand'}`}
              />
              {saveState === 'saving' ? 'Saving…' : 'Saved'}
            </span>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                aria-label="Undo"
                title="Undo"
                disabled={!canUndo}
                onClick={undo}
                className="rounded-md p-2 text-muted transition hover:bg-surface hover:text-ink disabled:opacity-30"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M7 8H4V5M4.5 8a6 6 0 11-1 6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Redo"
                title="Redo"
                disabled={!canRedo}
                onClick={redo}
                className="rounded-md p-2 text-muted transition hover:bg-surface hover:text-ink disabled:opacity-30"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M13 8h3V5M15.5 8a6 6 0 101 6" />
                </svg>
              </button>
              <Button size="sm" onClick={() => setDownloadOpen(true)}>
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M10 3v9m0 0l-3.2-3.2M10 12l3.2-3.2M4 15.5h12" />
                </svg>
                Download
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-1 px-3 pb-2">
            <Link
              to={`/resume/${resume.id}/content`}
              className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition ${
                !isDesign ? 'bg-brand-soft text-brand-ink' : 'text-muted hover:text-ink'
              }`}
            >
              Content
            </Link>
            <Link
              to={`/resume/${resume.id}/customize`}
              className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition ${
                isDesign ? 'bg-brand-soft text-brand-ink' : 'text-muted hover:text-ink'
              }`}
            >
              Customise
            </Link>
            <div className="ml-auto w-[168px] lg:hidden">
              <Segmented
                value={mobileView}
                options={[
                  { value: 'edit', label: 'Edit' },
                  { value: 'preview', label: 'Preview' },
                ]}
                onChange={setMobileView}
              />
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {!isDesign ? (
            <div className={`${mobileView === 'preview' ? 'hidden' : 'hidden md:flex'} min-h-0`}>
              <SectionRail selected={sectionId} onSelect={setSectionId} />
            </div>
          ) : null}

          <main
            className={`min-w-0 flex-1 overflow-y-auto ${
              mobileView === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            {isDesign ? <DesignPanel /> : <ContentPanel sectionId={sectionId} />}
          </main>

          <PreviewPane
            resume={resume}
            onDownload={() => setDownloadOpen(true)}
            className={`w-full lg:w-[46%] lg:min-w-[420px] lg:max-w-[620px] lg:flex-none ${
              mobileView === 'preview' ? 'flex' : 'hidden lg:flex'
            }`}
          />
        </div>
      </div>

      <PrintRoot resume={resume} />

      <Modal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        title="Download PDF"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDownloadOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDownloadOpen(false);
                // Pagination is measured with the real web fonts, so print only
                // after they are ready; otherwise the dialog can lay the document
                // out with fallback metrics and break lines differently.
                const openDialog = () => window.setTimeout(() => window.print(), 150);
                if (document.fonts?.ready) void document.fonts.ready.then(openDialog);
                else openDialog();
              }}
            >
              Open print dialog
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Segmented
            label="Page format"
            value={resume.design.pageFormat}
            options={[
              { value: 'A4', label: 'A4 · 210 × 297 mm' },
              { value: 'Letter', label: 'US Letter · 8.5 × 11 in' },
            ]}
            onChange={(value) =>
              patchActive((draft) => {
                draft.design.pageFormat = value;
              }, 'design.pageFormat')
            }
          />
          <div className="rounded-lg bg-surface p-3 text-[12px] leading-relaxed text-muted">
            <p className="font-medium text-ink">
              {pageSize(resume.design.pageFormat).label} · {resume.design.marginHMm} mm side margins
            </p>
            <p className="mt-1">
              Choose <strong className="text-ink">Save as PDF</strong> as the destination and set margins
              to <strong className="text-ink">None</strong> — the document supplies its own margins. Text
              stays selectable and page breaks come from the preview.
            </p>
          </div>
        </div>
      </Modal>
    </DocumentProvider>
  );
}
