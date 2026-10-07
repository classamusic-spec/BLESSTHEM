import { Plus } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useRef, type KeyboardEvent } from 'react';
import type { Person } from '@/data/models';
import { cx } from '@/lib/cx';
import { haptics } from '@/services/haptics';
import { spring } from './motion';
import { PersonAvatar } from './PersonAvatar';
import styles from './PersonSelector.module.css';

interface PersonSelectorProps {
  people: Person[];
  selectedId?: string;
  prayedIds?: Set<string>;
  onSelect(id: string): void;
  onAdd?(): void;
  label?: string;
}

/** “Who are you blessing today?” — a calm row of monograms with a gliding selection ring. */
export function PersonSelector({ people, selectedId, prayedIds, onSelect, onAdd, label = 'Choose who to bless' }: PersonSelectorProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: KeyboardEvent, index: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + people.length) % people.length;
    refs.current[next]?.focus();
    onSelect(people[next].id);
  };

  return (
    <div className={styles.scroller}>
      <div className={styles.row} role="radiogroup" aria-label={label}>
        {people.map((p, i) => {
          const selected = p.id === selectedId;
          return (
            <button
              key={p.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (!selectedId && i === 0) ? 0 : -1}
              className={cx(styles.person, selected && styles.selected)}
              onClick={() => {
                if (!selected) haptics.selection();
                onSelect(p.id);
              }}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className={styles.avatarWrap}>
                {selected && <motion.span layoutId="person-ring" className={styles.ring} transition={spring.ui} />}
                <motion.span animate={{ scale: selected ? 1 : 0.92 }} transition={spring.ui} className={styles.avatarInner}>
                  <PersonAvatar person={p} size={56} prayed={prayedIds?.has(p.id)} />
                </motion.span>
              </span>
              <span className={styles.name}>
                {p.name}
                {prayedIds?.has(p.id) && <span className="visually-hidden">, prayed for today</span>}
              </span>
            </button>
          );
        })}
        {onAdd && (
          <button type="button" className={styles.person} onClick={onAdd}>
            <span className={styles.avatarWrap}>
              <span className={styles.add}>
                <Plus size={22} weight="regular" />
              </span>
            </span>
            <span className={styles.name}>Add</span>
          </button>
        )}
      </div>
    </div>
  );
}
