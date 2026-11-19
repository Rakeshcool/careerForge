import { createPortal } from 'react-dom';
import { useState } from 'react';
import type { Resume } from '../types';
import { DocPage, PageFormatNotice, useDocumentRuntime } from '../document/DocumentRuntime';
import { Segmented } from '../components/ui';
import { pageSize } from '../lib/page';

export function PreviewPane({
  resume,
  className = '',
  onDownload,
}: {
  resume: Resume;
  className?: string;
  onDownload: () => void;
}) {
  const { pages, pageCount, overflows } = useDocumentRuntime();
  const [zoom, setZoom] = useState<number>(0.75);
  const { w, h } = pageSize(resume.design.pageFormat);

  return (
    <aside className={`flex min-h-0 flex-col bg-[#eceded] ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-white px-4 py-2.5">
        <div className="flex items-center gap-3 text-[12px] text-muted">
          <span className="rounded-full bg-surface px-2 py-0.5 font-medium text-ink">
            {pageCount} page{pageCount === 1 ? '' : 's'}
          </span>
          <span>{pageSize(resume.design.pageFormat).label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[150px]">
            <Segmented
              value={zoom}
              options={[
                { value: 0.5, label: '50%' },
                { value: 0.75, label: '75%' },
                { value: 1, label: '100%' },
              ]}
              onChange={setZoom}
            />
          </div>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12px] font-medium text-ink transition hover:bg-surface"
          >
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M10 3v9m0 0l-3.2-3.2M10 12l3.2-3.2M4 15.5h12" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      {overflows ? (
        <p className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-[11px] text-amber-800">
          One block is taller than a page, so it will be cut off in print. Split it into shorter
          paragraphs or bullets.
        </p>
      ) : null}

      <div className="pages-scroll flex-1 overflow-auto p-6">
        <div className="doc-shell mx-auto flex w-fit flex-col items-center gap-6">
          {pages.map((groups, index) => (
            <div
              key={index}
              style={{ width: `${w * zoom}mm`, height: `${h * zoom}mm` }}
              className="relative"
            >
              <div
                style={{
                  width: `${w}mm`,
                  height: `${h}mm`,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                }}
              >
                <DocPage
                  design={resume.design}
                  groups={groups}
                  index={index}
                  total={pages.length}
                  personal={resume.personal}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function PrintRoot({ resume }: { resume: Resume }) {
  const { pages } = useDocumentRuntime();
  return createPortal(
    <div className="print-root">
      <PageFormatNotice format={resume.design.pageFormat} />
      {pages.map((groups, index) => (
        <DocPage
          key={index}
          design={resume.design}
          groups={groups}
          index={index}
          total={pages.length}
          personal={resume.personal}
        />
      ))}
    </div>,
    document.body,
  );
}
