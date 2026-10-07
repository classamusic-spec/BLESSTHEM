import { useEffect, useState } from 'react';
import { OCCASIONS, OCCASION_BY_ID } from '@/content/taxonomy';
import type { OccasionId } from '@/content/types';
import type { Person } from '@/data/models';
import { useStore } from '@/data/store';
import { Button } from '@/design/Button';
import { Switch, TextField } from '@/design/Controls';
import { Sheet } from '@/design/Sheet';
import { useToast } from '@/design/Toast';
import { TopicIcon } from '@/design/TopicIcon';
import { dayKey } from '@/lib/dates';
import { cx } from '@/lib/cx';
import { haptics } from '@/services/haptics';
import styles from './SpecialDateSheet.module.css';

/** Milestones and special days — so the right blessing is ready when it matters. */
export function SpecialDateSheet({ open, onClose, person }: { open: boolean; onClose(): void; person: Person }) {
  const add = useStore((s) => s.addSpecialDate);
  const toast = useToast();
  const [occasion, setOccasion] = useState<OccasionId>('birthday');
  const [date, setDate] = useState(dayKey());
  const [yearly, setYearly] = useState(true);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (open) {
      setOccasion('birthday');
      setDate(dayKey());
      setYearly(true);
      setNote('');
      setError(undefined);
    }
  }, [open]);

  const save = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Please choose a date.');
      return;
    }
    add({ personId: person.id, occasion, date, yearly, note: note.trim() || undefined });
    haptics.light();
    toast.show(`${OCCASION_BY_ID[occasion].label} saved for ${person.name}.`);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add a special day"
      description={`We’ll prepare a fitting blessing for ${person.name} when it comes.`}
      size="tall"
      footer={
        <Button block onClick={save}>
          Save
        </Button>
      }
    >
      <div className={styles.grid} role="radiogroup" aria-label="Kind of day">
        {OCCASIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={occasion === o.id}
            className={cx(styles.occasion, occasion === o.id && styles.on)}
            onClick={() => {
              haptics.selection();
              setOccasion(o.id);
              setYearly(Boolean(o.yearly));
            }}
          >
            <TopicIcon name={o.icon} size={20} />
            {o.label}
          </button>
        ))}
      </div>
      <div className={styles.fields}>
        <TextField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={error} />
        <div className={styles.toggleRow}>
          <label htmlFor="yearly" className={styles.toggleLabel}>
            Repeats every year
          </label>
          <Switch id="yearly" label="Repeats every year" checked={yearly} onChange={setYearly} />
        </div>
        <TextField label="Note" optional value={note} onChange={(e) => setNote(e.target.value)} placeholder="Turning 7" maxLength={80} />
      </div>
    </Sheet>
  );
}
