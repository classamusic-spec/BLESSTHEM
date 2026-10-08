import { BookOpen, HandHeart, UsersThree } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { LogoMark, Logo } from '@/brand/Logo';
import { ENTRY_BY_ID } from '@/content/blessings';
import { useStore } from '@/data/store';
import type { Person } from '@/data/models';
import { ButtonLink } from '@/design/Button';
import { fadeUp, stagger } from '@/design/motion';
import { SceneImage } from '@/design/SceneImage';
import { Emblem } from '@/design/Emblem';
import { BlessingCard } from '@/features/blessing/BlessingCard';
import styles from './AboutPage.module.css';

const SAMPLE: Person = {
  id: 'sample',
  name: 'Noah',
  relationship: 'son',
  ageGroup: 'elementary',
  pronouns: 'he',
  focusTopics: ['courage'],
  hue: 'sage',
  order: 0,
  createdAt: new Date().toISOString(),
};

const STEPS = [
  { icon: UsersThree, title: 'Choose someone.', body: 'Select the person on your heart.' },
  { icon: BookOpen, title: 'Receive Scripture.', body: 'Find a biblical passage connected to what they’re facing.' },
  { icon: HandHeart, title: 'Speak the blessing.', body: 'Pray it aloud, save it, or share it with them.' },
];

/** The product homepage: what Bless Them is, in its own quiet voice. */
export default function AboutPage() {
  const onboarded = useStore((s) => s.onboarded && s.people.length > 0);
  const sampleEntry = ENTRY_BY_ID.has('courage-jos-1-9') ? 'courage-jos-1-9' : [...ENTRY_BY_ID.keys()][0];
  const cta = onboarded ? '/today' : '/welcome';

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <Link to="/" aria-label="Bless Them home" className={styles.logo}>
          <Logo size={28} />
        </Link>
        <ButtonLink to={cta} size="sm" variant="secondary">
          {onboarded ? 'Open the app' : 'Get started'}
        </ButtonLink>
      </header>

      <main id="main">
        <section className={styles.hero}>
          <motion.div className={styles.heroText} variants={stagger(0.1, 0.1)} initial="hidden" animate="show">
            <motion.h1 variants={fadeUp} className={styles.title}>
              Speak Scripture over the people you love.
            </motion.h1>
            <motion.p variants={fadeUp} className={styles.lede}>
              Personalized biblical blessings and prayers for the people God has placed in your life.
            </motion.p>
            <motion.div variants={fadeUp} className={styles.heroCta}>
              <ButtonLink to={cta}>Start blessing your family</ButtonLink>
              <span className={styles.small}>Free to begin · No ads, ever</span>
            </motion.div>
          </motion.div>
          <div className={styles.stage}>
            <motion.div className={styles.stageScene} aria-hidden="true" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
              <SceneImage scene="meadow-dawn" priority sizes="(min-width: 900px) 520px, 100vw" className={styles.stageImage} />
            </motion.div>
            <motion.div className={styles.device} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <div className={styles.screen} aria-hidden="true" inert>
                <BlessingCard person={SAMPLE} entryId={sampleEntry} minimal footer={<div />} />
              </div>
            </motion.div>
          </div>
        </section>

        <section className={styles.value}>
          <Emblem size={96} glow />
          <h2 className={styles.valueTitle}>
            Sometimes you know who you’re praying for.
            <br />
            You just don’t know what to pray.
          </h2>
          <p className={styles.valueBody}>
            Bless Them helps you find Scripture, put your heart into words, and build a simple rhythm of prayer for the people you love.
          </p>
        </section>

        <section className={styles.steps} aria-label="How it works">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <motion.div key={title} className={styles.step} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
              <span className={styles.stepNum}>{i + 1}</span>
              <Icon size={28} weight="duotone" className={styles.stepIcon} />
              <h3 className={styles.stepTitle}>{title}</h3>
              <p className={styles.stepBody}>{body}</p>
            </motion.div>
          ))}
        </section>

        <section className={styles.promise}>
          <h2 className={styles.valueTitle}>Made with care.</h2>
          <ul role="list" className={styles.promises}>
            <li>
              <strong>Verified Scripture.</strong> Every verse comes from public-domain translations, checked verse-by-verse. Never generated, never altered.
            </li>
            <li>
              <strong>Theological humility.</strong> Blessings say what Scripture reminds us — never what “God told me.”
            </li>
            <li>
              <strong>Parent-first privacy.</strong> No child accounts, no ads, no selling data. Your prayers stay yours.
            </li>
            <li>
              <strong>Two quiet minutes.</strong> Built to help you look up from the screen, not stay on it.
            </li>
          </ul>
          <ButtonLink to={cta}>Start blessing your family</ButtonLink>
        </section>

        <section className={styles.legal}>
          <h2 id="privacy">Privacy</h2>
          <p>
            Bless Them stores your people, blessings and journal on your device. Children never need accounts, emails or profiles. We collect only anonymous product counts (for example, “a blessing was completed”), never names, prayers, notes or searches — and you can turn even that off in Settings. You can export or delete all of your data at any time.
          </p>
          <h2 id="terms">Terms</h2>
          <p>
            Bless Them+ is available monthly ($4.99) or yearly ($34.99, with a 7-day free trial). Subscriptions renew automatically until canceled; cancel anytime at least 24 hours before renewal and keep access until the end of the paid period. Bless Them offers spiritual encouragement and is not a substitute for pastoral, medical, legal or mental-health care. If anyone is in danger, contact emergency services.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <LogoMark size={28} />
        <p>Bless Them exists to help people speak God’s Word, love, hope, wisdom, and prayer over the people entrusted to them.</p>
      </footer>
    </div>
  );
}
