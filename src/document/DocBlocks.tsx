import type { CSSProperties, ReactNode } from 'react';
import type { Design, Entry, Item, Personal, Resume, Section } from '../types';
import { fontStack } from '../data/templates';
import { metaFor } from '../data/sections';
import { formatRange } from '../lib/date';
import { DescriptionBlockView, RichText, descriptionBlocks } from '../lib/richtext';

export interface Group {
  key: string;
  /** Position of this fragment inside its entry, and the entry's fragment count. */
  indexInEntry: number;
  entryLength: number;
  /** Fragments inside an entry take no block gap after them. */
  tight: boolean;
  newPage: boolean;
  el: ReactNode;
}

export function documentStyle(design: Design): CSSProperties {
  const spacing = [2, 3, 4, 5.5, 7, 9][Math.min(5, Math.max(0, design.spacingFactor - 1))] ?? 4;
  return {
    '--doc-font': fontStack(design.bodyFont, design),
    '--doc-name-font': fontStack(design.nameFont, design),
    '--doc-size': `${design.baseSizePt}pt`,
    '--doc-name-size': `${design.baseSizePt + design.nameSizeDeltaPt}pt`,
    '--doc-heading-size': `${design.baseSizePt + design.headingSizeDeltaPt}pt`,
    '--doc-entry-size': `${design.baseSizePt + design.entrySizeDeltaPt}pt`,
    '--doc-ink': design.textColor,
    '--doc-accent': design.accentColor,
    '--doc-line': String(design.lineHeight),
    '--doc-gap': `${spacing}mm`,
    '--doc-mh': `${design.marginHMm}mm`,
    '--doc-mt': `${design.marginVMm}mm`,
    '--doc-rule': design.accentTargets.headingRule
      ? design.accentColor
      : `color-mix(in srgb, ${design.textColor} 30%, white)`,
    '--doc-link-color': design.linkBlue ? '#1d4ed8' : 'inherit',
    '--doc-link-decoration': design.linkUnderline ? 'underline' : 'none',
  } as CSSProperties;
}

const ACCENT = 'var(--doc-accent)';

function DetailIcon({ kind }: { kind: 'mail' | 'phone' | 'pin' | 'globe' | 'link' }) {
  const paths: Record<typeof kind, ReactNode> = {
    mail: (
      <>
        <rect x="2" y="4" width="12" height="9" rx="1.5" />
        <path d="M2.5 5l5.5 4 5.5-4" />
      </>
    ),
    phone: (
      <path d="M4 3h2.5l1 3-1.7 1.2a8 8 0 004 4L11 9.5l3 1V13a1 1 0 01-1.1 1A10.5 10.5 0 013 4.1 1 1 0 014 3z" />
    ),
    pin: (
      <>
        <path d="M8 14s4.5-4.2 4.5-7a4.5 4.5 0 10-9 0C3.5 9.8 8 14 8 14z" />
        <circle cx="8" cy="7" r="1.6" />
      </>
    ),
    globe: (
      <>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M2.5 8h11M8 2.5c1.8 1.6 2.6 3.4 2.6 5.5S9.8 12.4 8 13.5c-1.8-1.1-2.6-3.4-2.6-5.5S6.2 4.1 8 2.5z" />
      </>
    ),
    link: (
      <>
        <path d="M6.2 9.8a2.6 2.6 0 010-3.7l1.4-1.4a2.6 2.6 0 013.7 3.7l-.7.7" />
        <path d="M9.8 6.2a2.6 2.6 0 010 3.7l-1.4 1.4a2.6 2.6 0 01-3.7-3.7l.7-.7" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
      {paths[kind]}
    </svg>
  );
}

function ContactDetail({
  icon,
  children,
}: {
  icon: 'mail' | 'phone' | 'pin' | 'globe' | 'link';
  children: ReactNode;
}) {
  return (
    <span className="doc-detail">
      <DetailIcon kind={icon} />
      <span>{children}</span>
    </span>
  );
}

function DocHeader({ personal, design }: { personal: Personal; design: Design }) {
  const { accentTargets: targets, accentColor } = design;
  const band = design.colorArea === 'header';
  const details: ReactNode[] = [];
  if (personal.email.trim())
    details.push(
      <ContactDetail key="mail" icon="mail">
        {personal.email}
      </ContactDetail>,
    );
  if (personal.phone.trim())
    details.push(
      <ContactDetail key="phone" icon="phone">
        {personal.phone}
      </ContactDetail>,
    );
  if (personal.address.trim())
    details.push(
      <ContactDetail key="pin" icon="pin">
        {personal.address}
      </ContactDetail>,
    );
  if (personal.website.trim())
    details.push(
      <ContactDetail key="web" icon="globe">
        {personal.website}
      </ContactDetail>,
    );
  if (personal.linkedin.trim())
    details.push(
      <ContactDetail key="in" icon="link">
        {personal.linkedin}
      </ContactDetail>,
    );

  const nameStyle: CSSProperties = targets.name ? { color: band ? undefined : accentColor } : {};
  const roleStyle: CSSProperties = targets.jobTitle ? { color: band ? undefined : accentColor } : {};

  const identity = (
    <div className="doc-identity">
      <div>
        <div className="doc-name" style={nameStyle}>
          {personal.fullName.trim() || 'Your name'}
        </div>
        {personal.jobTitle.trim() ? (
          <div className="doc-role" style={roleStyle}>
            {personal.jobTitle}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div
      className={`doc-header doc-header--${design.headerLayout} doc-header--align-${design.headerAlign}${band ? ' doc-header--band' : ''}`}
    >
      {personal.photo && design.photoShape !== 'none' ? (
        <img
          className={`doc-photo doc-photo--${design.photoShape}`}
          src={personal.photo}
          alt=""
          onLoad={() => window.dispatchEvent(new Event('resize'))}
        />
      ) : null}
      {design.headerLayout === 'split' ? (
        <>
          {identity}
          <div className="doc-contact doc-contact--column">{details}</div>
        </>
      ) : (
        <>
          {identity}
          <div className="doc-contact" data-separator={design.detailsSeparator}>
            {details}
          </div>
        </>
      )}
    </div>
  );
}

function SectionHeading({ section, design }: { section: Section; design: Design }) {
  const label = design.headingCase === 'uppercase' ? section.heading.toUpperCase() : section.heading;
  return (
    <div
      className={`doc-heading is-${design.headingStyle}`}
      style={{ color: design.accentTargets.headings ? ACCENT : undefined }}
    >
      <span>{label}</span>
    </div>
  );
}

function Dates({ children, design }: { children: ReactNode; design: Design }) {
  if (!children) return null;
  return (
    <span className="doc-dates" style={{ color: design.accentTargets.dates ? ACCENT : undefined }}>
      {children}
    </span>
  );
}

function EntryHead({
  entry,
  section,
  design,
  withHeading,
}: {
  entry: Entry;
  section: Section;
  design: Design;
  withHeading: boolean;
}) {
  const range = formatRange(entry.startDate, entry.endDate, entry.current, design.dateFormat);
  const title = entry.title.trim() || (section.kind === 'custom' ? entry.subtitle : '') || '—';
  const subtitle = entry.title.trim() ? entry.subtitle : '';
  const place = entry.location.trim();
  const sameLine = design.entrySubtitle === 'same-line';

  const titleNode = (
    <span
      className="doc-entry__title"
      style={{ color: design.accentTargets.entryTitle ? ACCENT : undefined }}
    >
      {title}
      {entry.url.trim() ? <span className="doc-entry__url"> · {entry.url.trim()}</span> : null}
    </span>
  );

  const subNode = subtitle ? (
    <span
      className="doc-sub"
      style={{ color: design.accentTargets.entrySubtitle ? ACCENT : undefined }}
    >
      {subtitle}
    </span>
  ) : null;

  const locationNode = place ? <span className="doc-loc">{place}</span> : null;

  return (
    <>
      {withHeading ? <SectionHeading section={section} design={design} /> : null}
      {design.entryDatePosition === 'left' ? (
        <div className="doc-entry doc-entry--dates-left">
          <div className="doc-entry__rail">
            <Dates design={design}>{range}</Dates>
            {locationNode}
          </div>
          <div className="doc-entry__body">
            {titleNode}
            {sameLine ? <div className="doc-entry__line">{subNode}</div> : subNode}
          </div>
        </div>
      ) : (
        <div className="doc-entry">
          <div className="doc-entry__head">
            <div className="doc-entry__body">
              {sameLine ? (
                <div className="doc-entry__line">
                  {titleNode}
                  {subNode ? <span className="doc-entry__sep"> · </span> : null}
                  {subNode}
                </div>
              ) : (
                <>
                  {titleNode}
                  {subNode}
                </>
              )}
              {design.entryDatePosition !== 'split' && place ? <span className="doc-loc">{place}</span> : null}
            </div>
            {design.entryDatePosition === 'split' ? (
              <div className="doc-entry__rail doc-entry__rail--right">
                <Dates design={design}>{range}</Dates>
                {locationNode}
              </div>
            ) : (
              <Dates design={design}>{range}</Dates>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ItemsBlock({ section, design }: { section: Section; design: Design }) {
  const items = section.items.filter((item) => item.name.trim());
  const withLevel = metaFor(section.kind).itemLabels?.withLevel;
  return (
    <div className={`doc-items doc-items--cols-${section.columns}`} data-separator={design.detailsSeparator}>
      {items.map((item: Item) => (
        <div key={item.id} className="doc-item">
          <span className="doc-item__name">{item.name}</span>
          {withLevel && item.level ? <span className="doc-item__level"> — {item.level}</span> : null}
        </div>
      ))}
    </div>
  );
}

function plainGroup(key: string, newPage: boolean, el: ReactNode): Group {
  return { key, indexInEntry: 0, entryLength: 1, tight: false, newPage, el };
}

/**
 * One group per entry fragment: the head with the first description block, then
 * one group per remaining block. A fragment is the smallest unit a page break
 * may fall between.
 */
function entryGroups(section: Section, design: Design, entries: Entry[]): Group[] {
  const groups: Group[] = [];

  entries.forEach((entry, entryIndex) => {
    const blocks = descriptionBlocks(entry.description);
    const [first, ...rest] = blocks;
    const entryLength = Math.max(1, blocks.length);

    groups.push({
      key: `${entry.id}:0`,
      indexInEntry: 0,
      entryLength,
      tight: rest.length > 0,
      newPage: entryIndex === 0 && section.newPage,
      el: (
        <div className="doc-section">
          <EntryHead
            entry={entry}
            section={section}
            design={design}
            withHeading={entryIndex === 0}
          />
          {first ? (
            <div className="doc-entry__desc">
              <DescriptionBlockView block={first} />
            </div>
          ) : null}
        </div>
      ),
    });

    rest.forEach((block, index) => {
      groups.push({
        key: `${entry.id}:${index + 1}`,
        indexInEntry: index + 1,
        entryLength,
        tight: index < rest.length - 1,
        newPage: false,
        el: (
          <div className="doc-section">
            <DescriptionBlockView block={block} />
          </div>
        ),
      });
    });
  });

  return groups;
}

export function buildGroups(resume: Resume): Group[] {
  const groups: Group[] = [
    plainGroup('header', false, <DocHeader personal={resume.personal} design={resume.design} />),
  ];

  for (const section of resume.sections) {
    if (!section.visible) continue;

    if (section.kind === 'summary' || section.kind === 'declaration') {
      if (!section.text.trim()) continue;
      groups.push(
        plainGroup(
          `${section.id}:text`,
          section.newPage,
          <div className="doc-section" data-section={section.kind}>
            <SectionHeading section={section} design={resume.design} />
            <RichText text={section.text} className="doc-desc" />
          </div>,
        ),
      );
      continue;
    }

    const meta = metaFor(section.kind);
    if (meta.type === 'items') {
      const items = section.items.filter((item) => item.name.trim());
      if (!items.length) continue;
      groups.push(
        plainGroup(
          `${section.id}:items`,
          section.newPage,
          <div className="doc-section" data-section={section.kind}>
            <SectionHeading section={section} design={resume.design} />
            <ItemsBlock section={section} design={resume.design} />
          </div>,
        ),
      );
      continue;
    }

    const entries = section.entries.filter(
      (entry) => entry.title.trim() || entry.subtitle.trim() || entry.description.trim(),
    );
    if (!entries.length) continue;
    groups.push(...entryGroups(section, resume.design, entries));
  }

  return groups;
}
