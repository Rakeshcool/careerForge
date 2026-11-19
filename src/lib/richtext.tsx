import type { ReactNode } from 'react';

/**
 * Renders a deliberately small formatting subset: **bold**, *italic*,
 * [label](https://link) and `- ` bullets. No HTML is ever injected.
 */
function inlineNodes(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={index}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('[')) {
      const parts = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (parts && /^https?:\/\//i.test(parts[2])) {
        nodes.push(
          <a key={index} href={parts[2]} target="_blank" rel="noreferrer noopener">
            {parts[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(<em key={index}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
    index += 1;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export interface DescriptionBlock {
  kind: 'paragraph' | 'bullet';
  text: string;
}

/**
 * Splits text into the smallest units that may be separated by a page break.
 * A bullet or paragraph is atomic, which lets long entries flow across pages
 * without ever cutting a line in half.
 */
export function descriptionBlocks(text: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^[-•*]\s+/.test(trimmed)) {
      blocks.push({ kind: 'bullet', text: trimmed.replace(/^[-•*]\s+/, '') });
    } else {
      blocks.push({ kind: 'paragraph', text: trimmed });
    }
  }
  return blocks;
}

export function DescriptionBlockView({ block }: { block: DescriptionBlock }) {
  if (block.kind === 'bullet') {
    return (
      <ul className="doc-bullets">
        <li>{inlineNodes(block.text)}</li>
      </ul>
    );
  }
  return <p className="doc-para">{inlineNodes(block.text)}</p>;
}

/** Free text (summary, declaration): the same blocks, without entry layout. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = descriptionBlocks(text);
  if (!blocks.length) return null;
  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <DescriptionBlockView key={index} block={block} />
      ))}
    </div>
  );
}
