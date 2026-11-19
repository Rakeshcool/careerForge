import { useMemo } from 'react';
import type { Design, Resume } from '../types';
import { buildGroups } from '../document/DocBlocks';
import { DocPage } from '../document/DocumentRuntime';
import { demoPersonal, demoSections } from '../data/demo';
import { pageSize } from '../lib/page';

const DEMO_SECTIONS = demoSections();
const DEMO_PERSONAL = demoPersonal();

export function previewResume(design: Design, withContent = true): Resume {
  return {
    id: 'preview',
    title: 'Preview',
    schemaVersion: 1,
    templateId: 'preview',
    createdAt: '',
    updatedAt: '',
    personal: withContent
      ? DEMO_PERSONAL
      : {
          fullName: '',
          jobTitle: '',
          email: '',
          phone: '',
          address: '',
          website: '',
          linkedin: '',
          photo: '',
        },
    sections: withContent ? DEMO_SECTIONS : [],
    design,
  };
}

export function TemplatePreview({
  design,
  zoom = 0.42,
  withContent = true,
  className = '',
}: {
  design: Design;
  zoom?: number;
  withContent?: boolean;
  className?: string;
}) {
  const groups = useMemo(() => buildGroups(previewResume(design, withContent)), [design, withContent]);
  const { w, h } = pageSize(design.pageFormat);

  return (
    <div
      className={`overflow-hidden bg-white ${className}`}
      style={{ width: `${w * zoom}mm`, height: `${h * zoom}mm` }}
      aria-hidden="true"
    >
      <div style={{ width: `${w}mm`, height: `${h}mm`, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        <DocPage design={design} groups={groups} index={0} total={1} />
      </div>
    </div>
  );
}
