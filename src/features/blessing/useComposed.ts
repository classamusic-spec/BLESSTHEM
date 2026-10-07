import { useEffect, useMemo, useState } from 'react';
import { ENTRY_BY_ID } from '@/content/blessings';
import { getPassage, isTranslationLoaded, loadTranslation, type TranslationId } from '@/content/scripture';
import type { Person } from '@/data/models';
import { useStore } from '@/data/store';
import { composeBlessing, type ComposedBlessing, type PersonLike } from '@/engine/compose';

/** The reader’s chosen translation, loaded on demand (BSB ships with the app). */
export function useTranslation(): { translation: TranslationId; ready: boolean } {
  const translation = useStore((s) => s.settings.translation);
  const [ready, setReady] = useState(() => isTranslationLoaded(translation));
  useEffect(() => {
    if (isTranslationLoaded(translation)) {
      setReady(true);
      return;
    }
    setReady(false);
    let live = true;
    loadTranslation(translation).then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, [translation]);
  return { translation, ready };
}

export function useComposed(entryId: string | undefined, person: PersonLike | Person | undefined): { composed: ComposedBlessing | null; loading: boolean } {
  const { translation, ready } = useTranslation();
  const composed = useMemo(() => {
    const entry = entryId ? ENTRY_BY_ID.get(entryId) : undefined;
    if (!entry || !person || !ready) return null;
    return composeBlessing(entry, person, translation);
  }, [entryId, person, translation, ready]);
  return { composed, loading: !ready };
}

export function usePassage(ref: string | undefined) {
  const { translation, ready } = useTranslation();
  return useMemo(() => (ref && ready ? getPassage(ref, translation) : null), [ref, translation, ready]);
}
