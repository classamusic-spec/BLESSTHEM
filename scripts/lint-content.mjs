#!/usr/bin/env node
/**
 * Content linter for curated blessings.
 *
 *   node scripts/lint-content.mjs                      # every file in src/content/blessings
 *   node scripts/lint-content.mjs path/to/batch.ts     # one file
 *
 * Errors fail the run. Warnings are worth a second look.
 * Checks: schema, ids, verified Scripture references (BSB + WEB), word and
 * sentence budgets, template tokens, theological guardrails, tone.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadTranslation } from './lib/bible.mjs';
import { expandRef, parseRef } from './lib/usfm.mjs';
import { ROOT } from './lib/sources.mjs';

const { TOPICS, OCCASIONS } = await import(pathToFileURL(path.join(ROOT, 'src/content/taxonomy.ts')).href);
const { AGE_GROUPS } = await import(pathToFileURL(path.join(ROOT, 'src/content/types.ts')).href);

const TOPIC_IDS = new Set(TOPICS.map((t) => t.id));
const OCCASION_IDS = new Set(OCCASIONS.map((o) => o.id));
const RELATIONSHIPS = new Set(['child', 'grandchild', 'spouse', 'family', 'parent', 'friend', 'other']);
const ALLOWED_TOKENS = new Set(['{name}', '{Name}', '{them}', '{Them}', '{their}', '{Their}', '{theirs}', '{themselves}']);

/** Phrases that break Bless Them's theological and tonal boundaries. */
const FORBIDDEN = [
  [/god (told|tells) (me|you|us)/i, 'claims divine revelation'],
  [/the lord (revealed|told|showed me)/i, 'claims divine revelation'],
  [/god (has )?revealed to/i, 'claims divine revelation'],
  [/god (says|said) (that )?(you|your|he|she|they) (will|shall)/i, 'speaks for God about the future'],
  [/god promises (that )?(you|your|he|she|they) will/i, 'promises a specific outcome'],
  [/\bthus says\b/i, 'prophetic formula'],
  [/\b(guarantee[sd]?|guaranteed)\b/i, 'guarantees an outcome'],
  [/you will (be healed|pass|win|succeed|never)/i, 'predicts an outcome'],
  [/(will|shall) never (get sick|be hurt|fail|struggle|be sad)/i, 'promises a pain-free life'],
  [/nothing bad (will|can) (ever )?happen/i, 'promises a pain-free life'],
  [/(no|nothing) harm (will|can|shall) come/i, 'promises a pain-free life'],
  [/everything happens for a reason/i, 'cliché that can wound in grief'],
  [/needed (another|an) angel/i, 'unbiblical cliché'],
  [/(more|enough|lack of|little) faith (and|to|then)? ?(you|they|he|she) (would|will|could)/i, 'ties outcomes to amount of faith'],
  [/if (you|they|he|she) (had|have) (more|enough) faith/i, 'ties outcomes to amount of faith'],
  [/anxiety is (a )?sin/i, 'shames anxiety'],
  [/\b(rich|wealth|wealthy|prosperity|abundance of money|financial blessing)\b/i, 'prosperity framing'],
  [/\b(manifest|speak it into existence|name it and claim it|claim it|the universe)\b/i, 'non-Christian / prosperity framing'],
  [/hedge of protection/i, 'church cliché'],
  [/traveling mercies/i, 'church cliché'],
  [/\bfather god,? we just\b/i, 'filler'],
  [/\bjust\b.*\bjust\b.*\bjust\b/i, 'too many “just”s'],
  [/\b(level up|streak|crush it|unlock)\b/i, 'gamified tone'],
];

const WARN = [
  [/!/, 'exclamation mark — Bless Them speaks calmly'],
  [/\b(sanctif|justif|propitiat|anoint|fellowship|backslid|lukewarm|quiet time|devotions)\w*/i, 'church jargon'],
  [/[“"][^”"]{25,}[”"]/, 'long quotation — paraphrase instead (wording differs between translations)'],
  [/\byour (mom|mother|dad|father|parents)\b/i, 'assumes who is speaking'],
  [/\b(mommy|daddy)\b/i, 'assumes who is speaking'],
];

const words = (s) => (s.match(/[\p{L}\p{N}’'{}-]+/gu) ?? []).length;
const sentences = (s) => (s.replace(/\b(e\.g|i\.e|Mr|Mrs|Dr|St)\./g, '$1').match(/[.?!…]+(?=\s|$)/g) ?? []).length;

const bsb = loadTranslation('bsb', { verify: false }).verses;
const web = loadTranslation('web', { verify: false }).verses;

const files = process.argv.slice(2).length
  ? process.argv.slice(2).map((f) => path.resolve(f))
  : fs
      .readdirSync(path.join(ROOT, 'src/content/blessings'))
      .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
      .map((f) => path.join(ROOT, 'src/content/blessings', f));

let errorCount = 0;
let warnCount = 0;
const seenIds = new Map();
const refUse = new Map();
const topicCounts = new Map();

for (const file of files) {
  const mod = await import(pathToFileURL(file).href);
  const entries = mod.entries;
  const rel = path.relative(ROOT, file);
  if (!Array.isArray(entries)) {
    console.error(`✗ ${rel}: must export \`entries\` (an array)`);
    errorCount++;
    continue;
  }
  for (const e of entries) {
    const errs = [];
    const warns = [];
    const where = `${rel} › ${e?.id ?? '(no id)'}`;
    const req = ['id', 'topic', 'ref', 'contextRef', 'contextNote', 'reflection', 'blessing', 'prayer', 'talk', 'ages', 'keywords', 'notes'];
    for (const k of req) if (e[k] === undefined || e[k] === '') errs.push(`missing "${k}"`);
    if (errs.length) {
      console.error(`✗ ${where}\n    ${errs.join('\n    ')}`);
      errorCount += errs.length;
      continue;
    }

    // ids & topics
    if (seenIds.has(e.id)) errs.push(`duplicate id (also in ${seenIds.get(e.id)})`);
    seenIds.set(e.id, rel);
    if (!TOPIC_IDS.has(e.topic)) errs.push(`unknown topic "${e.topic}"`);
    topicCounts.set(e.topic, (topicCounts.get(e.topic) ?? 0) + 1);

    // references
    let r;
    try {
      r = parseRef(e.ref);
    } catch (err) {
      errs.push(err.message);
    }
    if (r) {
      const expectedId = `${e.topic}-${r.book.toLowerCase()}-${r.startChapter}-${r.startVerse}`;
      if (e.id !== expectedId) errs.push(`id should be "${expectedId}"`);
      const keys = expandRef(e.ref, bsb);
      const span = (r.endChapter - r.startChapter) * 100 + (r.endVerse - r.startVerse) + 1;
      if (!keys.length || keys.length !== span) errs.push(`"${e.ref}" does not resolve fully in the BSB (${keys.length}/${span} verses)`);
      if (keys.length > 4) errs.push(`"${e.ref}" is ${keys.length} verses — keep the card to 1–3 (max 4)`);
      for (const k of keys) if (!web.has(k)) errs.push(`${k} is missing from the WEB — choose a passage present in both`);
      refUse.set(e.ref, [...(refUse.get(e.ref) ?? []), e.id]);
      try {
        const c = parseRef(e.contextRef);
        const ckeys = expandRef(e.contextRef, bsb);
        if (!ckeys.length) errs.push(`contextRef "${e.contextRef}" does not resolve`);
        if (!keys.every((k) => ckeys.includes(k))) errs.push(`contextRef "${e.contextRef}" must contain "${e.ref}"`);
        if (ckeys.length > 20) errs.push(`contextRef is ${ckeys.length} verses — keep it under 20`);
        if (ckeys.length < 2) warns.push('contextRef is a single verse — include the surrounding verses');
        for (const k of ckeys) if (!web.has(k)) errs.push(`context ${k} is missing from the WEB`);
        if (c.book !== r.book) errs.push('contextRef must be in the same book');
      } catch (err) {
        errs.push(err.message);
      }
    }

    // budgets
    const budget = (field, text, min, max) => {
      const n = words(text);
      if (n < min || n > max) errs.push(`${field}: ${n} words (aim ${min}–${max})`);
    };
    budget('contextNote', e.contextNote, 15, 80);
    budget('reflection', e.reflection, 28, 90);
    budget('blessing', e.blessing, 38, 100);
    budget('prayer', e.prayer, 40, 105);
    const rs = sentences(e.reflection);
    if (rs < 2 || rs > 4) errs.push(`reflection: ${rs} sentences (2–4)`);
    if (!/\b(you|your)\b/i.test(e.blessing)) errs.push('blessing should speak directly to them (“you”)');
    if (!/^(Father|Lord|God|Jesus|Heavenly Father|Holy Spirit|Dear (God|Lord|Father|Jesus)|Gracious|Faithful|Loving|Good|Shepherd|Abba)/.test(e.prayer.trim()))
      errs.push('prayer should be addressed to God (start with “Father,” “Lord,” “God,” “Jesus,” …)');
    if (!/\{name\}|\{Name\}/.test(e.prayer)) errs.push('prayer should name the person with {name}');
    if (!/Amen\.$/.test(e.prayer.trim())) errs.push('prayer should end with “Amen.”');

    // talk prompts
    const t = e.talk ?? {};
    for (const k of ['child', 'teen', 'adult']) if (!t[k]) errs.push(`talk.${k} is required`);
    const tw = (k, max) => t[k] && words(t[k]) > max && errs.push(`talk.${k}: ${words(t[k])} words (≤ ${max})`);
    tw('little', 16);
    tw('child', 20);
    tw('teen', 22);
    tw('adult', 22);
    if ((e.ages.includes('baby') || e.ages.includes('preschool')) && !t.little)
      errs.push('talk.little is required when ages include baby or preschool');

    // ages, relationships, occasions, keywords
    if (!Array.isArray(e.ages) || !e.ages.length) errs.push('ages must be a non-empty array');
    for (const a of e.ages ?? []) if (!AGE_GROUPS.includes(a)) errs.push(`unknown age group "${a}"`);
    for (const rel2 of e.relationships ?? []) if (!RELATIONSHIPS.has(rel2)) errs.push(`unknown relationship "${rel2}"`);
    for (const o of e.occasions ?? []) if (!OCCASION_IDS.has(o)) errs.push(`unknown occasion "${o}"`);
    if (!Array.isArray(e.keywords) || e.keywords.length < 3) errs.push('keywords: add at least 3');
    for (const k of e.keywords ?? []) if (k !== k.toLowerCase()) errs.push(`keyword "${k}" should be lowercase`);
    const topic = TOPICS.find((x) => x.id === e.topic);
    if (topic) for (const a of e.ages) if (!topic.ages.includes(a)) warns.push(`age "${a}" is outside the topic's range`);

    // tokens and guardrails
    const userFacing = { contextNote: e.contextNote, reflection: e.reflection, blessing: e.blessing, prayer: e.prayer, ...Object.fromEntries(Object.entries(t).map(([k, v]) => [`talk.${k}`, v])) };
    for (const [field, text] of Object.entries(userFacing)) {
      if (typeof text !== 'string') continue;
      for (const tok of text.match(/\{[^}]*\}/g) ?? []) if (!ALLOWED_TOKENS.has(tok)) errs.push(`${field}: token ${tok} not allowed (use {name}, {them}, {their}; never {they})`);
      for (const [re, why] of FORBIDDEN) if (re.test(text)) errs.push(`${field}: ${why} — “${text.match(re)[0]}”`);
      for (const [re, why] of WARN) {
        if (field.startsWith('talk.') && why.startsWith('long quotation')) continue;
        if (re.test(text)) warns.push(`${field}: ${why}`);
      }
      if (/\s{2,}/.test(text)) warns.push(`${field}: double space`);
      if (/'/.test(text)) warns.push(`${field}: use curly apostrophes (’)`);
      if (/ - /.test(text)) warns.push(`${field}: use an em dash (—) rather than a hyphen`);
    }

    if (errs.length) {
      console.error(`✗ ${where}\n    ${errs.join('\n    ')}`);
      errorCount += errs.length;
    }
    if (warns.length) {
      console.warn(`△ ${where}\n    ${warns.join('\n    ')}`);
      warnCount += warns.length;
    }
  }
}

for (const [ref, ids] of refUse) {
  if (ids.length > 2) {
    console.warn(`△ ${ref} is used ${ids.length} times (${ids.join(', ')}) — prefer variety`);
    warnCount++;
  }
}

const total = [...topicCounts.values()].reduce((a, b) => a + b, 0);
console.log(`\n${total} entries across ${topicCounts.size} topics in ${files.length} file(s): ${errorCount} error(s), ${warnCount} warning(s).`);
process.exit(errorCount ? 1 : 0);
