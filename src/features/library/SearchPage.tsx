import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { TOPIC_BY_ID } from '@/content/taxonomy';
import { isPlus, useStore } from '@/data/store';
import { Page, PageHeader, Section } from '@/design/Layout';
import { fadeUp, stagger } from '@/design/motion';
import { EmptyState } from '@/design/States';
import { TopicCard } from '@/design/Topic';
import { checkSafety, resourcesFor, SAFETY_COPY } from '@/engine/safety';
import { search } from '@/engine/search';
import { track } from '@/services/analytics';
import { usePaywall } from '@/features/premium/PaywallProvider';
import { EntryRow } from './EntryRow';
import styles from './SearchPage.module.css';

const EXAMPLES = [
  'My daughter is afraid of starting middle school',
  'Prayer for my son who is being bullied',
  'Scripture for my teenager making bad choices',
  'Prayer before an exam',
  'Can’t sleep — nightmares',
  'A friend moved away',
];

/** Natural-language search: describe what’s happening, find Scripture to pray with. */
export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const deferred = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const plus = useStore(isPlus);
  const paywall = usePaywall();

  const safety = useMemo(() => checkSafety(deferred), [deferred]);
  const results = useMemo(() => (deferred.trim().length >= 2 ? search(deferred) : null), [deferred]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setParams(query ? { q: query } : {}, { replace: true });
      if (results) track({ name: 'search_performed', props: { results: results.entries.length, topics: results.topics.length, safety: Boolean(safety) } });
      if (safety) track({ name: 'safety_support_shown', props: { category: safety.category } });
    }, 700);
    return () => window.clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Page>
      <PageHeader title="Search" back="/library" size="compact" />
      <form
        className={styles.field}
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          inputRef.current?.blur();
        }}
      >
        <MagnifyingGlass size={20} weight="bold" aria-hidden="true" />
        <label htmlFor="search" className="visually-hidden">
          Describe what you’re praying about
        </label>
        <input
          ref={inputRef}
          id="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What’s on your heart?"
          autoComplete="off"
          enterKeyHint="search"
          className={styles.input}
        />
        {query && (
          <button type="button" className={styles.clear} onClick={() => setQuery('')} aria-label="Clear search">
            <X size={16} weight="bold" />
          </button>
        )}
      </form>

      <AnimatePresence mode="wait">
        {!results ? (
          <motion.div key="examples" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className={styles.hint}>Describe what’s happening in your own words.</p>
            <ul role="list" className={styles.examples}>
              {EXAMPLES.map((ex) => (
                <li key={ex}>
                  <button type="button" className={styles.example} onClick={() => setQuery(ex)}>
                    “{ex}”
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <motion.div key="results" className={styles.results} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {safety && (
              <section className={styles.safety} aria-labelledby="safety-title" role="alert">
                <h2 id="safety-title" className={styles.safetyTitle}>
                  {SAFETY_COPY[safety.category].title}
                </h2>
                <p className={styles.safetyBody}>{SAFETY_COPY[safety.category].body}</p>
                <ul role="list" className={styles.resources}>
                  {resourcesFor(safety.category).map((r) => (
                    <li key={r.name}>
                      <a href={r.href} className={styles.resource} target={r.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                        <strong>{r.action}</strong>
                        <span>{r.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <p className={styles.safetyNote}>Numbers shown are for the United States. Elsewhere, call your local emergency number.</p>
              </section>
            )}

            {results.entries.length === 0 && results.topics.length === 0 ? (
              !safety && <EmptyState pose="curious" compact title="We couldn’t find a match yet." body="Try a simpler phrase, like “worry,” “new school” or “bedtime.”" />
            ) : (
              <>
                {results.topics.length > 0 && (
                  <Section title={safety ? 'When you’re ready, these may help' : 'Topics that may help'}>
                    <div className={styles.topics}>
                      {results.topics.map((t) => {
                        const topic = TOPIC_BY_ID[t.topic];
                        return <TopicCard key={t.topic} to={`/library/topic/${t.topic}`} title={topic.title} icon={topic.icon} meta={topic.description} locked={!plus && !topic.free} />;
                      })}
                    </div>
                  </Section>
                )}
                {results.entries.length > 0 && (
                  <Section title="Passages to pray with">
                    <motion.ul role="list" className={styles.entries} variants={stagger(0.04)} initial="hidden" animate="show">
                      {results.entries.map(({ entry, why }) => {
                        const locked = !plus && !TOPIC_BY_ID[entry.topic].free;
                        return (
                          <motion.li key={entry.id} variants={fadeUp}>
                            <EntryRow entry={entry} showTopic why={why} locked={locked} onLocked={() => paywall.open(`search:${entry.topic}`)} />
                          </motion.li>
                        );
                      })}
                    </motion.ul>
                    <p className={styles.footnote}>Suggestions of Scripture to pray with — not answers on God’s behalf.</p>
                  </Section>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}
