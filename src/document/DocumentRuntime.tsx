import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Design, PageFormat, Personal, Resume } from '../types';
import { pageSize } from '../lib/page';
import { buildGroups, documentStyle, type Group } from './DocBlocks';

interface RuntimeValue {
  pages: Group[][];
  pageCount: number;
  remeasure: () => void;
  overflows: boolean;
}

const RuntimeContext = createContext<RuntimeValue>({
  pages: [],
  pageCount: 1,
  remeasure: () => {},
  overflows: false,
});

interface Measured {
  group: Group;
  height: number;
}

/** A page break may fall between segments, not inside one. */
interface Segment {
  items: Measured[];
  height: number;
}

/** An entry and its description fragments form one segment; a lone group does too. */
function segments(groups: Group[], heights: number[]): Segment[] {
  const list: Segment[] = [];
  for (let index = 0; index < groups.length; ) {
    const length = groups[index].indexInEntry === 0 ? groups[index].entryLength : 1;
    const items = groups
      .slice(index, index + length)
      .map((group, offset) => ({ group, height: heights[index + offset] ?? 0 }));
    list.push({ items, height: items.reduce((sum, item) => sum + item.height, 0) });
    index += length;
  }
  return list;
}

/**
 * Pages the document without dropping content. A segment that fits on a page is
 * kept whole, so entries stay intact; a segment taller than a page is split at
 * its fragments so a long entry flows onto the next page at a bullet boundary.
 */
function paginate(groups: Group[], heights: number[], available: number) {
  const pages: Group[][] = [];
  let current: Group[] = [];
  let used = 0;

  const nextPage = () => {
    if (!current.length) return;
    pages.push(current);
    current = [];
    used = 0;
  };

  for (const segment of segments(groups, heights)) {
    if (segment.items[0].group.newPage) nextPage();
    const pieces: Segment[] =
      segment.height <= available
        ? [segment]
        : segment.items.map((item) => ({ items: [item], height: item.height }));

    for (const piece of pieces) {
      if (used + piece.height > available) nextPage();
      current.push(...piece.items.map((item) => item.group));
      used += piece.height;
    }
  }

  nextPage();
  if (!pages.length) pages.push([]);
  return { pages, overflows: heights.some((height) => height > available) };
}

/** Measure clone and printed pages must wrap groups identically. */
function GroupList({ groups }: { groups: Group[] }) {
  return (
    <>
      {groups.map((group) => (
        <div
          className={group.tight ? 'doc-group doc-group--tight' : 'doc-group'}
          data-group
          key={group.key}
        >
          {group.el}
        </div>
      ))}
    </>
  );
}

export function DocumentProvider({ resume, children }: { resume: Resume; children: ReactNode }) {
  const groups = useMemo(() => buildGroups(resume), [resume]);
  const [pages, setPages] = useState<Group[][]>([groups]);
  const [overflows, setOverflows] = useState(false);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const probeRef = useRef<HTMLDivElement | null>(null);
  const { design } = resume;

  const remeasure = useCallback(() => {
    const container = measureRef.current;
    const probe = probeRef.current;
    if (!container || !probe) return;
    const pxPerMm = probe.getBoundingClientRect().height / 100 || 3.7795;
    const { h } = pageSize(design.pageFormat);
    const hasFooter = design.footer.pageNumbers || design.footer.email || design.footer.name;
    const available = Math.max(60, h - design.marginVMm * 2 - (hasFooter ? 8 : 0)) * pxPerMm;
    const nodes = Array.from(container.querySelectorAll<HTMLElement>('[data-group]'));
    const heights = nodes.map((node) => node.getBoundingClientRect().height);
    if (!nodes.length) {
      setPages([[]]);
      return;
    }
    const result = paginate(groups, heights, available);
    setPages(result.pages);
    setOverflows(result.overflows);
  }, [design, groups]);

  useLayoutEffect(() => {
    remeasure();
  }, [remeasure]);

  useEffect(() => {
    const onResize = () => remeasure();
    window.addEventListener('resize', onResize);
    if (document.fonts?.ready) void document.fonts.ready.then(remeasure);
    const timer = window.setTimeout(remeasure, 250);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(timer);
    };
  }, [remeasure]);

  const { w, h } = pageSize(design.pageFormat);
  const measureWidth = `${w - design.marginHMm * 2}mm`;

  const value = useMemo<RuntimeValue>(
    () => ({ pages, pageCount: pages.length, remeasure, overflows }),
    [pages, remeasure, overflows],
  );

  return (
    <RuntimeContext.Provider value={value}>
      <div
        className="doc-measure"
        aria-hidden="true"
        ref={measureRef}
        style={{ width: measureWidth, ...documentStyle(design) }}
      >
        <GroupList groups={groups} />
        <div ref={probeRef} style={{ height: '100mm' }} />
      </div>
      {children}
    </RuntimeContext.Provider>
  );
}

export function useDocumentRuntime() {
  return useContext(RuntimeContext);
}

export function DocPage({
  design,
  groups,
  index,
  total,
  personal,
}: {
  design: Design;
  groups: Group[];
  index: number;
  total: number;
  personal?: Personal;
}) {
  const { w, h } = pageSize(design.pageFormat);
  const showFooter = design.footer.pageNumbers || design.footer.email || design.footer.name;
  const footerBottom = Math.max(4, design.marginVMm / 2);

  return (
    <div
      className="doc-page"
      data-page={index + 1}
      style={
        {
          width: `${w}mm`,
          height: `${h}mm`,
          ...documentStyle(design),
        } as CSSProperties
      }
    >
      {design.colorArea === 'border' ? <div className="doc-page__border" /> : null}
      <div
        className="doc-page__inner"
        style={{ padding: `${design.marginVMm}mm ${design.marginHMm}mm` }}
      >
        <GroupList groups={groups} />
      </div>
      {showFooter ? (
        <div
          className="doc-footer"
          style={{
            left: `${design.marginHMm}mm`,
            right: `${design.marginHMm}mm`,
            bottom: `${footerBottom}mm`,
          }}
        >
          <span>{design.footer.email ? personal?.email ?? '' : ''}</span>
          <span>{design.footer.pageNumbers ? `${index + 1} / ${total}` : ''}</span>
          <span>{design.footer.name ? personal?.fullName ?? '' : ''}</span>
        </div>
      ) : null}
    </div>
  );
}

export function PageFormatNotice({ format }: { format: PageFormat }) {
  const { w, h } = pageSize(format);
  return (
    <style>{`@page { size: ${w}mm ${h}mm; margin: 0; }`}</style>
  );
}
