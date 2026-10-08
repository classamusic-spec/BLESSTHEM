import { ChatCircleText, Copy, DownloadSimple, EnvelopeSimple, Export, LockSimple, WhatsappLogo } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/design/Button';
import { Switch } from '@/design/Controls';
import { Sheet } from '@/design/Sheet';
import { useToast } from '@/design/Toast';
import type { ComposedBlessing } from '@/engine/compose';
import { track } from '@/services/analytics';
import { haptics } from '@/services/haptics';
import { SCENES } from '@/content/scenery';
import { daypart, type Daypart } from '@/lib/dates';
import { cx } from '@/lib/cx';
import { CARD_STYLES, channelLinks, downloadBlob, PHOTO_STYLES, renderShareCard, shareImage, type CardStyle } from '@/services/share';
import styles from './ShareSheet.module.css';

/**
 * A blessing becomes a quiet, beautiful image. Only the line, the Scripture and the
 * reference are shared — never journal entries or private notes — and the parent
 * decides whether the person’s name appears at all.
 */
/** A card that matches the hour: first light in the morning, moonlight at night. */
const STYLE_FOR: Record<Daypart, CardStyle> = { morning: 'dawn', day: 'meadow', evening: 'golden', night: 'moonlit' };

export function ShareSheet({ open, onClose, composed }: { open: boolean; onClose(): void; composed: ComposedBlessing }) {
  const [style, setStyle] = useState<CardStyle>(() => STYLE_FOR[daypart()]);
  const [includeName, setIncludeName] = useState(true);
  const line = includeName ? composed.shareLine : composed.shareLineWithoutName;
  const nameOptional = composed.shareLine !== composed.shareLineWithoutName;
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const passage = composed.passage;

  const text = useMemo(() => {
    if (!passage) return line;
    return `${line}\n\n“${passage.text}”\n— ${passage.display} (${passage.translation.abbreviation})\n\nShared with Bless Them`;
  }, [line, passage]);

  useEffect(() => {
    if (!open || !passage) return;
    let live = true;
    setBlob(null);
    renderShareCard({ line, verse: passage.text, reference: `${passage.display} · ${passage.translation.abbreviation}`, style }).then((b) => {
      if (live) setBlob(b);
    });
    return () => {
      live = false;
    };
  }, [open, style, passage, line]);

  useEffect(() => {
    if (open) track({ name: 'share_opened' });
  }, [open]);

  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);

  const links = channelLinks(text);

  const share = async () => {
    if (!blob) return;
    setBusy(true);
    const outcome = await shareImage(blob, text);
    setBusy(false);
    if (outcome === 'shared') {
      haptics.light();
      track({ name: 'share_completed', props: { channel: 'native' } });
      onClose();
    } else if (outcome === 'unsupported') {
      downloadBlob(blob);
      toast.show('Image saved. You can share it from your photos.');
      track({ name: 'share_completed', props: { channel: 'download' } });
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Share this blessing" description="Send it to them, or to someone praying alongside you." size="tall">
      <div className={styles.previewWrap}>
        <motion.div className={styles.preview} layout>
          {url ? (
            <motion.img key={url} src={url} alt={`Share card: ${line} ${passage?.display ?? ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} />
          ) : (
            <span className={styles.placeholder} aria-hidden="true" />
          )}
        </motion.div>
      </div>

      <div className={styles.swatches} role="radiogroup" aria-label="Card style">
        {CARD_STYLES.map(({ id, label }) => {
          const scene = PHOTO_STYLES[id];
          const on = style === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              className={cx(styles.swatch, on && styles.swatchOn)}
              onClick={() => {
                if (!on) haptics.selection();
                setStyle(id);
              }}
            >
              <span className={cx(styles.swatchDot, styles[`dot-${id}`])} style={scene ? { backgroundImage: `url(${SCENES[scene].lqip})` } : undefined} aria-hidden="true" />
              <span className={styles.swatchLabel}>{label}</span>
            </button>
          );
        })}
      </div>

      {nameOptional && (
        <div className={styles.nameRow}>
          <span aria-hidden="true">Show their name</span>
          <Switch checked={includeName} onChange={setIncludeName} label="Show their name on the card" />
        </div>
      )}

      <Button block icon={<Export />} onClick={share} loading={busy} disabled={!blob}>
        Share blessing
      </Button>

      <div className={styles.channels}>
        <a className={styles.channel} href={links.messages} onClick={() => track({ name: 'share_completed', props: { channel: 'messages' } })}>
          <ChatCircleText size={22} weight="duotone" />
          Messages
        </a>
        <a className={styles.channel} href={links.whatsapp} target="_blank" rel="noreferrer" onClick={() => track({ name: 'share_completed', props: { channel: 'whatsapp' } })}>
          <WhatsappLogo size={22} weight="duotone" />
          WhatsApp
        </a>
        <a className={styles.channel} href={links.email} onClick={() => track({ name: 'share_completed', props: { channel: 'email' } })}>
          <EnvelopeSimple size={22} weight="duotone" />
          Email
        </a>
        <button
          type="button"
          className={styles.channel}
          disabled={!blob}
          onClick={() => {
            if (!blob) return;
            downloadBlob(blob);
            haptics.light();
            toast.show('Image saved.');
            track({ name: 'share_completed', props: { channel: 'save' } });
          }}
        >
          <DownloadSimple size={22} weight="duotone" />
          Save image
        </button>
        <button
          type="button"
          className={styles.channel}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              haptics.light();
              toast.show('Copied.');
              track({ name: 'share_completed', props: { channel: 'copy' } });
            } catch {
              toast.show('Copying isn’t available here.');
            }
          }}
        >
          <Copy size={22} weight="duotone" />
          Copy text
        </button>
      </div>

      <p className={styles.privacy}>
        <LockSimple size={14} weight="bold" aria-hidden="true" />
        Only this line and the Scripture are shared. Your journal and notes stay private.
      </p>
    </Sheet>
  );
}
