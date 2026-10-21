// Blog text <-> Sanity Portable Text. The editor is plain text with three light conventions:
//   "## Heading", "### Subheading", "> Quote"; blank lines separate paragraphs.
import { makeKey } from './api';

const STYLE_PREFIX = { h2: '## ', h3: '### ', blockquote: '> ' };

export function blocksToText(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .filter((b) => b._type === 'block')
    .map((b) => (STYLE_PREFIX[b.style] || '') + (b.children || []).map((c) => c.text || '').join(''))
    .join('\n\n');
}

export function textToBlocks(text) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      let style = 'normal';
      let t = p;
      if (t.startsWith('### ')) { style = 'h3'; t = t.slice(4); }
      else if (t.startsWith('## ')) { style = 'h2'; t = t.slice(3); }
      else if (t.startsWith('> ')) { style = 'blockquote'; t = t.slice(2); }
      return {
        _key: makeKey(), _type: 'block', style, markDefs: [],
        children: [{ _key: makeKey(), _type: 'span', text: t.replace(/\n/g, ' '), marks: [] }],
      };
    });
}

// True when the stored post uses bold/italic/links that the plain editor would flatten.
export function hasRichFormatting(blocks) {
  return Array.isArray(blocks) && blocks.some((b) => (b.markDefs || []).length || (b.children || []).some((c) => (c.marks || []).length) || (b.listItem));
}
