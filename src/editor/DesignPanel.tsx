import type { Design, FontKey, Section } from '../types';
import { useActiveResume, useStore } from '../store/store';
import { FONTS, TEMPLATES, applyTemplate } from '../data/templates';
import { TemplatePreview } from '../components/TemplatePreview';
import { Accordion, Field, RangeControl, Segmented, Select, Toggle } from '../components/ui';

const ACCENTS = [
  '#2f6f5e',
  '#1f3b5c',
  '#7b4b6b',
  '#b0691f',
  '#0f766e',
  '#3d5a3d',
  '#9a2f3d',
  '#3f4652',
];

const TARGETS: { key: keyof Design['accentTargets']; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'jobTitle', label: 'Job title' },
  { key: 'headings', label: 'Section headings' },
  { key: 'headingRule', label: 'Heading rule' },
  { key: 'dates', label: 'Dates' },
  { key: 'entryTitle', label: 'Entry title' },
  { key: 'entrySubtitle', label: 'Entry subtitle' },
];

export function DesignPanel() {
  const resume = useActiveResume();
  const patchActive = useStore((state) => state.patchActive);
  const setTemplate = useStore((state) => state.setTemplate);

  if (!resume) return null;
  const design = resume.design;

  const set = (patch: Partial<Design>, key: string) =>
    patchActive((draft) => {
      draft.design = { ...draft.design, ...patch };
    }, `design.${key}`);

  const setTarget = (key: keyof Design['accentTargets'], value: boolean) =>
    patchActive((draft) => {
      draft.design.accentTargets = { ...draft.design.accentTargets, [key]: value };
    }, `design.target.${key}`);

  const setFooter = (key: keyof Design['footer'], value: boolean) =>
    patchActive((draft) => {
      draft.design.footer = { ...draft.design.footer, [key]: value };
    }, `design.footer.${key}`);

  const patchSection = (sectionId: string, mutator: (section: Section) => void, key: string) =>
    patchActive((draft) => {
      const section = draft.sections.find((item) => item.id === sectionId);
      if (section) mutator(section);
    }, `design.section.${sectionId}.${key}`);

  return (
    <div className="mx-auto max-w-xl px-5 py-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Design</h2>
        <p className="text-[12px] text-muted">
          Everything below is stored with the document. Switching a template only replaces these
          design tokens, never your content.
        </p>
      </header>

      <div className="rounded-xl border border-line bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-muted">Design templates</span>
          <span className="text-[11px] text-muted">
            Update the whole design in one click
          </span>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {TEMPLATES.map((template) => {
            const previewDesign = applyTemplate(design, template);
            const active = resume.templateId === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setTemplate(template.id)}
                aria-pressed={active}
                className={`flex-none rounded-lg border p-1.5 text-left transition ${
                  active ? 'border-brand bg-brand-soft' : 'border-line hover:border-brand/40'
                }`}
              >
                <div className="overflow-hidden rounded bg-surface">
                  <TemplatePreview design={previewDesign} zoom={0.11} />
                </div>
                <span className="mt-1 block text-center text-[10px] font-medium">{template.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-white px-4">
        <Accordion title="Document" defaultOpen>
          <div className="space-y-3">
            <Segmented
              label="Page format"
              value={design.pageFormat}
              options={[
                { value: 'A4', label: 'A4' },
                { value: 'Letter', label: 'US Letter' },
              ]}
              onChange={(value) => set({ pageFormat: value }, 'pageFormat')}
            />
            <Field label="Date format">
              <Select
                value={design.dateFormat}
                onChange={(event) => set({ dateFormat: event.target.value as Design['dateFormat'] }, 'dateFormat')}
              >
                <option value="MMM YYYY">Mar 2024</option>
                <option value="MM/YYYY">03/2024</option>
                <option value="DD/MM/YYYY">01/03/2024</option>
                <option value="MM/DD/YYYY">03/01/2024</option>
              </Select>
            </Field>
          </div>
        </Accordion>

        <Accordion title="Layout">
          <div className="space-y-3">
            <Segmented
              label="Header"
              value={design.headerLayout}
              options={[
                { value: 'stacked', label: 'Stacked' },
                { value: 'split', label: 'Split' },
              ]}
              onChange={(value) => set({ headerLayout: value }, 'headerLayout')}
            />
            <Segmented
              label="Header alignment"
              value={design.headerAlign}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Centre' },
              ]}
              onChange={(value) => set({ headerAlign: value }, 'headerAlign')}
            />
            <Segmented
              label="Section heading style"
              value={design.headingStyle}
              options={[
                { value: 'rule', label: 'Rule' },
                { value: 'plain', label: 'Plain' },
                { value: 'bar', label: 'Bar' },
                { value: 'boxed', label: 'Boxed' },
              ]}
              onChange={(value) => set({ headingStyle: value }, 'headingStyle')}
            />
            <Segmented
              label="Capitalisation"
              value={design.headingCase}
              options={[
                { value: 'capitalize', label: 'Capitalise' },
                { value: 'uppercase', label: 'Uppercase' },
              ]}
              onChange={(value) => set({ headingCase: value }, 'headingCase')}
            />
            <Segmented
              label="Date position"
              value={design.entryDatePosition}
              options={[
                { value: 'right', label: 'Right' },
                { value: 'left', label: 'Left' },
                { value: 'split', label: 'Split' },
              ]}
              onChange={(value) => set({ entryDatePosition: value }, 'entryDatePosition')}
            />
            <Segmented
              label="Entry subtitle"
              value={design.entrySubtitle}
              options={[
                { value: 'below', label: 'Below title' },
                { value: 'same-line', label: 'Same line' },
              ]}
              onChange={(value) => set({ entrySubtitle: value }, 'entrySubtitle')}
            />
            <Segmented
              label="Contact details"
              value={design.detailsSeparator}
              options={[
                { value: 'icon', label: 'Icons' },
                { value: 'bullet', label: 'Bullets' },
                { value: 'bar', label: 'Bars' },
              ]}
              onChange={(value) => set({ detailsSeparator: value }, 'detailsSeparator')}
            />
          </div>
        </Accordion>

        <Accordion title="Typography">
          <div className="space-y-3">
            <Field label="Body font">
              <Select
                value={design.bodyFont}
                onChange={(event) => set({ bodyFont: event.target.value as FontKey }, 'bodyFont')}
              >
                {Object.entries(FONTS).map(([key, font]) => (
                  <option key={key} value={key}>
                    {font.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Name font">
              <Select
                value={design.nameFont}
                onChange={(event) => set({ nameFont: event.target.value as Design['nameFont'] }, 'nameFont')}
              >
                <option value="same">Same as body font</option>
                {Object.entries(FONTS).map(([key, font]) => (
                  <option key={key} value={key}>
                    {font.label}
                  </option>
                ))}
              </Select>
            </Field>
            <RangeControl
              label="Base font size"
              value={design.baseSizePt}
              min={9}
              max={13}
              step={0.25}
              suffix="pt"
              onChange={(value) => set({ baseSizePt: value }, 'baseSizePt')}
            />
            <RangeControl
              label="Name size (added to base)"
              value={design.nameSizeDeltaPt}
              min={6}
              max={20}
              step={0.5}
              suffix="pt"
              onChange={(value) => set({ nameSizeDeltaPt: value }, 'nameSizeDeltaPt')}
            />
            <RangeControl
              label="Section headings (added to base)"
              value={design.headingSizeDeltaPt}
              min={0}
              max={8}
              step={0.5}
              suffix="pt"
              onChange={(value) => set({ headingSizeDeltaPt: value }, 'headingSizeDeltaPt')}
            />
            <RangeControl
              label="Entry header (added to base)"
              value={design.entrySizeDeltaPt}
              min={-1}
              max={4}
              step={0.25}
              suffix="pt"
              onChange={(value) => set({ entrySizeDeltaPt: value }, 'entrySizeDeltaPt')}
            />
          </div>
        </Accordion>

        <Accordion title="Spacing & margins">
          <div className="space-y-3">
            <RangeControl
              label="Line height"
              value={design.lineHeight}
              min={1}
              max={1.6}
              step={0.05}
              onChange={(value) => set({ lineHeight: value }, 'lineHeight')}
            />
            <RangeControl
              label="Space between elements"
              value={design.spacingFactor}
              min={1}
              max={6}
              onChange={(value) => set({ spacingFactor: value }, 'spacingFactor')}
            />
            <RangeControl
              label="Left & right margin"
              value={design.marginHMm}
              min={10}
              max={35}
              step={0.5}
              suffix="mm"
              onChange={(value) => set({ marginHMm: value }, 'marginHMm')}
            />
            <RangeControl
              label="Top & bottom margin"
              value={design.marginVMm}
              min={8}
              max={30}
              step={0.5}
              suffix="mm"
              onChange={(value) => set({ marginVMm: value }, 'marginVMm')}
            />
          </div>
        </Accordion>

        <Accordion title="Colours">
          <div className="space-y-3">
            <div>
              <span className="mb-1 block text-[12px] font-medium text-muted">Accent colour</span>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  aria-label="Accent colour"
                  value={design.accentColor}
                  onChange={(event) => set({ accentColor: event.target.value }, 'accentColor')}
                  className="h-8 w-10 cursor-pointer rounded border border-line bg-white p-0.5"
                />
                {ACCENTS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Use accent ${color}`}
                    aria-pressed={design.accentColor.toLowerCase() === color}
                    onClick={() => set({ accentColor: color }, 'accentColor')}
                    className={`h-6 w-6 rounded-full border-2 ${
                      design.accentColor.toLowerCase() === color ? 'border-ink' : 'border-white'
                    }`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
            <Field label="Text colour">
              <input
                type="color"
                value={design.textColor}
                aria-label="Text colour"
                onChange={(event) => set({ textColor: event.target.value }, 'textColor')}
                className="h-8 w-14 cursor-pointer rounded border border-line bg-white p-0.5"
              />
            </Field>
            <Segmented
              label="Colour area"
              value={design.colorArea}
              options={[
                { value: 'none', label: 'Text only' },
                { value: 'header', label: 'Header band' },
                { value: 'border', label: 'Side border' },
              ]}
              onChange={(value) => set({ colorArea: value }, 'colorArea')}
            />
            <div>
              <span className="mb-1.5 block text-[12px] font-medium text-muted">Apply accent to</span>
              <div className="grid grid-cols-2 gap-1">
                {TARGETS.map((target) => (
                  <label key={target.key} className="flex cursor-pointer items-center gap-2 text-[12px]">
                    <input
                      type="checkbox"
                      checked={design.accentTargets[target.key]}
                      onChange={(event) => setTarget(target.key, event.target.checked)}
                    />
                    {target.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Accordion>

        <Accordion title="Links, photo & footer">
          <div className="space-y-2">
            <Toggle
              label="Underline links"
              checked={design.linkUnderline}
              onChange={(value) => set({ linkUnderline: value }, 'linkUnderline')}
            />
            <Toggle
              label="Blue links"
              checked={design.linkBlue}
              onChange={(value) => set({ linkBlue: value }, 'linkBlue')}
            />
            <Segmented
              label="Photo shape"
              value={design.photoShape}
              options={[
                { value: 'none', label: 'Hidden' },
                { value: 'circle', label: 'Circle' },
                { value: 'rounded', label: 'Rounded' },
                { value: 'square', label: 'Square' },
              ]}
              onChange={(value) => set({ photoShape: value }, 'photoShape')}
            />
            <div className="border-t border-line pt-1">
              <Toggle
                label="Page numbers"
                hint="Footer shows the current page and total."
                checked={design.footer.pageNumbers}
                onChange={(value) => setFooter('pageNumbers', value)}
              />
              <Toggle
                label="Email in footer"
                checked={design.footer.email}
                onChange={(value) => setFooter('email', value)}
              />
              <Toggle
                label="Name in footer"
                checked={design.footer.name}
                onChange={(value) => setFooter('name', value)}
              />
            </div>
          </div>
        </Accordion>

        <Accordion title="Section layout">
          <div className="space-y-3">
            {resume.sections.map((section) => (
              <div key={section.id} className="rounded-lg border border-line p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[12px] font-medium">{section.heading}</span>
                  <label className="flex flex-none cursor-pointer items-center gap-1.5 text-[11px] text-muted">
                    <input
                      type="checkbox"
                      checked={section.newPage}
                      onChange={(event) =>
                        patchSection(section.id, (target) => {
                          target.newPage = event.target.checked;
                        }, 'newPage')
                      }
                    />
                    New page
                  </label>
                </div>
                {section.kind === 'skills' ||
                section.kind === 'languages' ||
                section.kind === 'interests' ? (
                  <div className="mt-2">
                    <Segmented
                      value={section.columns}
                      options={[
                        { value: 1, label: 'One column' },
                        { value: 2, label: 'Two columns' },
                      ]}
                      onChange={(value) =>
                        patchSection(section.id, (target) => {
                          target.columns = value;
                        }, 'columns')
                      }
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Accordion>
      </div>
    </div>
  );
}
