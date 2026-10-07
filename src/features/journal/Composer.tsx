import { Camera, Check, Trash } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { isPlus, useStore } from '@/data/store';
import type { JournalEntry, JournalKind } from '@/data/models';
import { Button } from '@/design/Button';
import { Segmented, TextArea } from '@/design/Controls';
import { PersonAvatar } from '@/design/PersonAvatar';
import { Sheet } from '@/design/Sheet';
import { useToast } from '@/design/Toast';
import { cx } from '@/lib/cx';
import { haptics } from '@/services/haptics';
import { deletePhoto, photoURL, savePhoto } from '@/services/photos';
import { usePaywall } from '@/features/premium/PaywallProvider';
import styles from './Composer.module.css';

export interface ComposerSeed {
  kind?: JournalKind;
  personId?: string;
  blessingId?: string;
  entryId?: string;
  text?: string;
}

const PLACEHOLDER: Record<JournalKind, string> = {
  reflection: 'What was on your heart as you prayed?',
  request: 'What would you like to keep praying about? (“Big math test Thursday.”)',
  gratitude: 'What are you thankful for today?',
  note: 'Write anything you want to remember.',
};

const TITLE: Record<JournalKind, string> = {
  reflection: 'Add a reflection',
  request: 'A prayer to keep',
  gratitude: 'Give thanks',
  note: 'A note',
};

interface ComposerProps {
  open: boolean;
  onClose(): void;
  seed?: ComposerSeed;
  editing?: JournalEntry;
  onSaved?(entry: JournalEntry): void;
}

export function Composer({ open, onClose, seed, editing, onSaved }: ComposerProps) {
  const people = useStore((s) => s.people);
  const plus = useStore(isPlus);
  const add = useStore((s) => s.addJournalEntry);
  const update = useStore((s) => s.updateJournalEntry);
  const paywall = usePaywall();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [kind, setKind] = useState<JournalKind>('reflection');
  const [text, setText] = useState('');
  const [personId, setPersonId] = useState<string | undefined>();
  const [photoId, setPhotoId] = useState<string | undefined>();
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    setKind(editing?.kind ?? seed?.kind ?? 'reflection');
    setText(editing?.text ?? seed?.text ?? '');
    setPersonId(editing?.personId ?? seed?.personId);
    setPhotoId(editing?.photoId);
    setError(undefined);
  }, [open, editing, seed]);

  useEffect(() => {
    let live = true;
    if (photoId) photoURL(photoId).then((u) => live && setPhoto(u));
    else setPhoto(null);
    return () => {
      live = false;
    };
  }, [photoId]);

  const save = () => {
    if (!text.trim()) {
      setError('Write a few words first — even one line is enough.');
      return;
    }
    haptics.light();
    if (editing) {
      update(editing.id, { text: text.trim(), kind, personId, photoId });
      toast.show('Saved.', { icon: <Check weight="bold" /> });
      onClose();
      return;
    }
    const entry = add({ kind, text, personId, blessingId: seed?.blessingId, entryId: seed?.entryId, photoId });
    toast.show(kind === 'request' ? 'We’ll keep this prayer with you.' : 'Saved to your journal.', { icon: <Check weight="bold" /> });
    onSaved?.(entry);
    onClose();
  };

  const pickPhoto = () => {
    if (!plus) {
      paywall.open('journal-photo');
      return;
    }
    fileRef.current?.click();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? 'Edit entry' : TITLE[kind]}
      size="tall"
      footer={
        <Button block onClick={save}>
          Save
        </Button>
      }
    >
      {!seed?.blessingId && !editing && (
        <div className={styles.kind}>
          <Segmented
            label="Kind of entry"
            layoutId="composer-kind"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'request', label: 'Prayer' },
              { value: 'reflection', label: 'Reflection' },
              { value: 'gratitude', label: 'Gratitude' },
            ]}
          />
        </div>
      )}

      {people.length > 0 && (
        <div className={styles.people} role="radiogroup" aria-label="Who is this about?">
          <p className={styles.peopleLabel}>For</p>
          <div className={styles.peopleRow}>
            {people.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={personId === p.id}
                className={cx(styles.person, personId === p.id && styles.personOn)}
                onClick={() => {
                  haptics.selection();
                  setPersonId(personId === p.id ? undefined : p.id);
                }}
              >
                <PersonAvatar person={p} size={28} />
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <TextArea
        label="Your words"
        className={styles.text}
        serif
        rows={6}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError(undefined);
        }}
        placeholder={PLACEHOLDER[kind]}
        error={error}
        data-autofocus
        maxLength={4000}
      />

      <div className={styles.photoRow}>
        {photo ? (
          <div className={styles.photo}>
            <img src={photo} alt="Attached photo" />
            <button
              type="button"
              className={styles.removePhoto}
              aria-label="Remove photo"
              onClick={() => {
                if (photoId && !editing) void deletePhoto(photoId);
                setPhotoId(undefined);
              }}
            >
              <Trash size={16} />
            </button>
          </div>
        ) : (
          <Button variant="quiet" size="sm" icon={<Camera />} onClick={pickPhoto}>
            Add a photo {!plus && <span className={styles.plusTag}>+</span>}
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setPhotoId(await savePhoto(file));
            e.target.value = '';
          }}
        />
      </div>
      <p className={styles.private}>Your journal is private. It stays on this device and is never used for analytics.</p>
    </Sheet>
  );
}
