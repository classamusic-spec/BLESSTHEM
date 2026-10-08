import { beforeEach, describe, expect, it } from 'vitest';
import { FREE_LIMITS } from './models';
import { currentBlessing, initialState, isPlus, useStore } from './store';
import { ENTRIES } from '@/content/blessings';
import { dayKey } from '@/lib/dates';

beforeEach(() => {
  localStorage.clear();
  useStore.setState({ ...initialState() });
});

const addNoah = () =>
  useStore.getState().addPerson({ name: 'Noah', relationship: 'son', ageGroup: 'elementary', focusTopics: ['courage', 'kindness'] });

describe('store', () => {
  it('derives pronouns and a hue for a new person', () => {
    const noah = addNoah();
    expect(noah.pronouns).toBe('he');
    expect(noah.hue).toBeTruthy();
    expect(useStore.getState().selectedPersonId).toBe(noah.id);
  });

  it('prepares a stable blessing for today and records prayer', () => {
    const noah = addNoah();
    const b1 = useStore.getState().ensureBlessing(noah.id)!;
    const b2 = useStore.getState().ensureBlessing(noah.id)!;
    expect(b1.id).toBe(b2.id);
    expect(useStore.getState().markPrayed(b1.id).first).toBe(true);
    expect(currentBlessing(useStore.getState().blessings, noah.id, dayKey())?.prayedAt).toBeTruthy();
    expect(useStore.getState().markPrayed(b1.id).first).toBe(false);
  });

  it('replaces today’s blessing when the focus changes', () => {
    const noah = addNoah();
    const first = useStore.getState().ensureBlessing(noah.id)!;
    const next = useStore.getState().changeFocus(noah.id, 'kindness')!;
    expect(next.topicId).toBe('kindness');
    expect(useStore.getState().blessings.find((b) => b.id === first.id)?.replaced).toBe(next.id === first.id ? undefined : true);
  });

  it('keeps the parent’s journal entries when a person is removed', () => {
    const noah = addNoah();
    const entry = useStore.getState().addJournalEntry({ kind: 'request', text: 'Big math test Thursday.', personId: noah.id });
    useStore.getState().removePerson(noah.id);
    const kept = useStore.getState().journal.find((j) => j.id === entry.id);
    expect(kept).toBeDefined();
    expect(kept?.personId).toBeUndefined();
    expect(useStore.getState().people).toHaveLength(0);
  });

  it('marks a prayer answered with a note, and can undo', () => {
    const entry = useStore.getState().addJournalEntry({ kind: 'request', text: 'A kind friend at school.' });
    useStore.getState().markAnswered(entry.id, 'He met Sam at lunch.');
    expect(useStore.getState().journal[0].answerNote).toBe('He met Sam at lunch.');
    useStore.getState().unmarkAnswered(entry.id);
    expect(useStore.getState().journal[0].answeredAt).toBeUndefined();
  });

  it('limits favorites on the free plan and lifts the limit on Bless Them+', () => {
    const ids = ENTRIES.slice(0, FREE_LIMITS.favorites + 1).map((e) => e.id);
    ids.slice(0, FREE_LIMITS.favorites).forEach((id) => useStore.getState().toggleFavorite(id));
    expect(useStore.getState().toggleFavorite(ids[FREE_LIMITS.favorites]).limited).toBe(true);
    useStore.getState().setSubscription({ tier: 'plus', status: 'active', plan: 'annual' });
    expect(isPlus(useStore.getState())).toBe(true);
    expect(useStore.getState().toggleFavorite(ids[FREE_LIMITS.favorites]).added).toBe(true);
  });

  it('treats a canceled plan as active until the end of the paid period', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const past = new Date(Date.now() - 86_400_000).toISOString();
    expect(isPlus({ subscription: { tier: 'plus', status: 'canceled', renewsAt: future } })).toBe(true);
    expect(isPlus({ subscription: { tier: 'plus', status: 'canceled', renewsAt: past } })).toBe(false);
  });

  it('completes a journey day when its blessing is prayed', () => {
    const noah = addNoah();
    const progress = useStore.getState().startJourney('courage-7', noah.id);
    const entry = ENTRIES.find((e) => e.topic === 'courage')!;
    const b = useStore.getState().setBlessing(noah.id, entry.id, 'journey', { journeyId: 'courage-7', journeyDay: 0 })!;
    useStore.getState().markPrayed(b.id);
    expect(useStore.getState().journeys.find((j) => j.id === progress.id)?.completedDays).toEqual([0]);
  });

  it('erases everything on reset', () => {
    addNoah();
    useStore.getState().addJournalEntry({ kind: 'gratitude', text: 'Thankful.' });
    useStore.getState().resetAll();
    expect(useStore.getState().people).toHaveLength(0);
    expect(useStore.getState().journal).toHaveLength(0);
    expect(useStore.getState().onboarded).toBe(false);
  });
});
