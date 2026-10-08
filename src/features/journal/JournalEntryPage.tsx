import { Compass, HandHeart, Heart, PencilSimple, Sparkle, Trash } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ENTRY_BY_ID } from '@/content/blessings';
import { formatRef } from '@/content/scripture';
import { useStore } from '@/data/store';
import { Button, ButtonLink, IconButton } from '@/design/Button';
import { ConfirmationSheet } from '@/design/ConfirmationSheet';
import { TextArea } from '@/design/Controls';
import { Page, PageHeader } from '@/design/Layout';
import { spring } from '@/design/motion';
import { PersonAvatar } from '@/design/PersonAvatar';
import { Sheet } from '@/design/Sheet';
import { EmptyState } from '@/design/States';
import { useToast } from '@/design/Toast';
import { Emblem } from '@/design/Emblem';
import { formatLongDate } from '@/lib/dates';
import { haptics } from '@/services/haptics';
import { deletePhoto, photoURL } from '@/services/photos';
import { Composer } from './Composer';
import styles from './JournalEntryPage.module.css';

const KIND_TITLE = { reflection: 'Reflection', request: 'Prayer', gratitude: 'Gratitude', note: 'Note' } as const;

export default function JournalEntryPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const entry = useStore((s) => s.journal.find((j) => j.id === entryId));
  const person = useStore((s) => s.people.find((p) => p.id === entry?.personId));
  const update = useStore((s) => s.updateJournalEntry);
  const remove = useStore((s) => s.deleteJournalEntry);
  const markAnswered = useStore((s) => s.markAnswered);
  const unmarkAnswered = useStore((s) => s.unmarkAnswered);
  const toast = useToast();
  const [sheet, setSheet] = useState<'edit' | 'delete' | 'answer' | null>(null);
  const [answerNote, setAnswerNote] = useState('');
  const [thanked, setThanked] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    if (entry?.photoId) photoURL(entry.photoId).then((u) => live && setPhoto(u));
    return () => {
      live = false;
    };
  }, [entry?.photoId]);

  if (!entry) {
    return (
      <Page>
        <PageHeader title="" back="/journal" />
        <EmptyState icon={Compass} title="This entry isn’t here anymore." action={<ButtonLink to="/journal">Back to Journal</ButtonLink>} />
      </Page>
    );
  }

  const curated = entry.entryId ? ENTRY_BY_ID.get(entry.entryId) : undefined;
  const answered = Boolean(entry.answeredAt);

  return (
    <Page>
      <PageHeader
        title=""
        back="/journal"
        size="compact"
        actions={
          <>
            <IconButton
              label={entry.favorite ? 'Remove from favorites' : 'Add to favorites'}
              pressed={entry.favorite}
              tone="surface"
              onClick={() => {
                haptics.light();
                update(entry.id, { favorite: !entry.favorite });
              }}
            >
              <Heart size={20} weight={entry.favorite ? 'fill' : 'regular'} />
            </IconButton>
            <IconButton label="Edit" tone="surface" onClick={() => setSheet('edit')}>
              <PencilSimple size={20} />
            </IconButton>
          </>
        }
      />

      <article className={styles.article}>
        <p className="overline">
          {KIND_TITLE[entry.kind]} · {formatLongDate(new Date(entry.createdAt))}
        </p>
        {person && (
          <Link to={`/people/${person.id}`} className={styles.person}>
            <PersonAvatar person={person} size={28} />
            {person.name}
          </Link>
        )}
        <p className={styles.text}>{entry.text}</p>
        {photo && <img src={photo} alt="Photo attached to this entry" className={styles.photo} />}
        {curated && (
          <p className={styles.scripture}>
            Prayed with <strong>{formatRef(curated.ref)}</strong>
            {entry.blessingId && (
              <>
                {' · '}
                <Link to={`/blessing/${entry.blessingId}`}>Open the blessing</Link>
              </>
            )}
          </p>
        )}

        <AnimatePresence mode="wait">
          {answered ? (
            <motion.section key="answered" className={styles.answered} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring.soft}>
              <div className={styles.answeredHead}>
                <Sparkle size={18} weight="fill" />
                Answered · {formatLongDate(new Date(entry.answeredAt!))}
              </div>
              {entry.answerNote && <p className={styles.answerNote}>“{entry.answerNote}”</p>}
              <Button variant="ghost" size="sm" onClick={() => unmarkAnswered(entry.id)}>
                Undo
              </Button>
            </motion.section>
          ) : (
            entry.kind === 'request' && (
              <motion.div key="cta" className={styles.cta} exit={{ opacity: 0 }}>
                <Button
                  variant="secondary"
                  icon={<Sparkle />}
                  onClick={() => {
                    setAnswerNote('');
                    setThanked(false);
                    setSheet('answer');
                  }}
                >
                  Mark as answered
                </Button>
              </motion.div>
            )
          )}
        </AnimatePresence>

        <div className={styles.delete}>
          <Button variant="ghost" size="sm" icon={<Trash />} onClick={() => setSheet('delete')}>
            Delete entry
          </Button>
        </div>
      </article>

      <Composer open={sheet === 'edit'} onClose={() => setSheet(null)} editing={entry} />

      <ConfirmationSheet
        open={sheet === 'delete'}
        onClose={() => setSheet(null)}
        destructive
        title="Delete this entry?"
        body="It will be removed from this device and can’t be recovered."
        confirmLabel="Delete entry"
        onConfirm={() => {
          if (entry.photoId) void deletePhoto(entry.photoId);
          remove(entry.id);
          setSheet(null);
          toast.show('Entry deleted.');
          navigate('/journal', { replace: true });
        }}
      />

      <Sheet open={sheet === 'answer'} onClose={() => setSheet(null)} title={thanked ? 'Thank you, God.' : 'Remember this.'} size="tall">
        <AnimatePresence mode="wait">
          {thanked ? (
            <motion.div key="thanks" className={styles.thanks} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={spring.gentle}>
              <Emblem icon={HandHeart} size={96} glow />
              <p className={styles.thanksText}>This answered prayer is kept in your journal, so you can always look back on what God has done.</p>
              <Button onClick={() => setSheet(null)}>Done</Button>
            </motion.div>
          ) : (
            <motion.div key="ask" exit={{ opacity: 0 }}>
              <p className={styles.prompt}>Take a moment to thank God for how this prayer was answered.</p>
              <blockquote className={styles.original}>{entry.text}</blockquote>
              <TextArea
                label="How was it answered?"
                optional
                serif
                rows={4}
                value={answerNote}
                onChange={(e) => setAnswerNote(e.target.value)}
                placeholder="She found a kind friend in her new class."
              />
              <Button
                block
                className={styles.save}
                onClick={() => {
                  haptics.success();
                  markAnswered(entry.id, answerNote);
                  setThanked(true);
                }}
              >
                Give thanks
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Sheet>
    </Page>
  );
}
