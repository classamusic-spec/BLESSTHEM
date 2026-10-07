import { Fragment } from 'react';
import type { Passage } from '@/content/scripture';
import { cx } from '@/lib/cx';
import styles from './ScriptureText.module.css';

interface ScriptureTextProps {
  passage: Passage;
  /** Show verse numbers (context view). */
  numbers?: boolean;
  /** Verse keys to emphasise (the card’s verses inside a context passage). */
  highlight?: Set<string>;
  size?: 'card' | 'context' | 'moment';
  className?: string;
}

/**
 * Verified Scripture, typeset with care: poetry keeps its lines and indents,
 * prose flows as paragraphs, psalm headings sit quietly above.
 */
export function ScriptureText({ passage, numbers, highlight, size = 'card', className }: ScriptureTextProps) {
  type Line = { indent: number; stanza: boolean; parts: Array<{ text: string; verse?: number; key: string; hl: boolean }> };
  const lines: Line[] = [];
  passage.verses.forEach((v, vi) => {
    v.segs.forEach(([text, indent, flags], si) => {
      const startsLine = si === 0 ? (flags & 1) === 1 || lines.length === 0 : (flags & 1) === 1;
      const part = { text, verse: si === 0 ? v.verse : undefined, key: `${v.key}-${si}`, hl: highlight?.has(v.key) ?? false };
      if (startsLine || !lines.length || (passage.poetry && indent > 0 && si === 0 && vi > 0)) {
        lines.push({ indent, stanza: lines.length > 0 && (flags & 2) === 2, parts: [part] });
      } else {
        lines[lines.length - 1].parts.push(part);
      }
    });
  });

  const heading = passage.verses[0]?.heading;

  return (
    <div className={cx(styles.scripture, styles[size], passage.poetry ? styles.poetry : styles.prose, className)} lang="en">
      {heading && <p className={styles.heading}>{heading}</p>}
      {lines.map((line, i) => (
        <p key={i} className={cx(styles.line, line.stanza && styles.stanza)} data-indent={passage.poetry ? line.indent : 0}>
          {line.parts.map((part, pi) => (
            <Fragment key={part.key}>
              {pi > 0 && ' '}
              <span className={cx(part.hl && styles.highlight)}>
                {numbers && part.verse !== undefined && <sup className={styles.num}>{part.verse}</sup>}
                {part.text}
              </span>
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
