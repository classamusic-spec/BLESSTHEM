import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Link, useNavigate } from 'react-router';
import type { SceneId } from '@/content/scenery';
import { cx } from '@/lib/cx';
import { IconButton } from './Button';
import { SceneImage } from './SceneImage';
import { page } from './motion';
import styles from './Layout.module.css';

/** A screen: consistent gutters, safe areas, gentle entrance. */
export function Page({ children, className, wide, bleed }: { children: ReactNode; className?: string; wide?: boolean; bleed?: boolean }) {
  return (
    <motion.main
      id="main"
      className={cx(styles.page, wide && styles.wide, bleed && styles.bleed, className)}
      variants={page}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {children}
    </motion.main>
  );
}

interface PageHeaderProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  back?: string | boolean;
  actions?: ReactNode;
  size?: 'large' | 'compact';
  /** A photograph behind the title: the page’s own place. The subtitle sits below it. */
  scene?: SceneId;
  /** The title for the slim bar that appears on scroll, when the page’s own title is elsewhere. */
  condensedTitle?: ReactNode;
  /** The bar appears once this scrolls under it (by default, the title). */
  condenseAfter?: RefObject<HTMLElement | null>;
}

/** True once `target` has scrolled up under the bar. */
function useCondensed(target: RefObject<HTMLElement | null>, bar: RefObject<HTMLElement | null>) {
  const [condensed, setCondensed] = useState(false);
  useEffect(() => {
    const el = target.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const inset = bar.current?.offsetHeight || 56;
    const io = new IntersectionObserver(([entry]) => setCondensed(!entry.isIntersecting && entry.boundingClientRect.top < inset), {
      rootMargin: `-${inset}px 0px 0px 0px`,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [target, bar]);
  return condensed;
}

export function PageHeader({ title, eyebrow, subtitle, back, actions, size = 'large', scene, condensedTitle, condenseAfter }: PageHeaderProps) {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const condensed = useCondensed(condenseAfter ?? (title ? titleRef : headerRef), barRef);
  const goBack = () => (typeof back === 'string' ? navigate(back) : window.history.length > 1 ? navigate(-1) : navigate('/today'));

  const bar = (back || actions) && (
    <div className={styles.headerBar}>
      {back ? (
        <IconButton label="Back" tone="surface" onClick={goBack}>
          <CaretLeft size={20} weight="bold" />
        </IconButton>
      ) : (
        <span />
      )}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );

  // Large titles hand over to a slim frosted bar once they scroll away, as on iOS.
  const condensedBar = (
    <div className={cx(styles.condensed, condensed && styles.condensedOn)} aria-hidden={!condensed} inert={!condensed}>
      <div ref={barRef} className={styles.condensedBar}>
        <div className={styles.condensedRow}>
          {back ? (
            <IconButton label="Back" onClick={goBack}>
              <CaretLeft size={20} weight="bold" />
            </IconButton>
          ) : (
            <span />
          )}
          <p className={styles.condensedTitle}>{condensedTitle ?? title}</p>
          {actions ? <div className={cx(styles.actions, styles.condensedActions)}>{actions}</div> : <span />}
        </div>
      </div>
    </div>
  );

  if (scene) {
    return (
      <>
        {condensedBar}
        <header ref={headerRef} className={styles.sceneHeader}>
          <div className={styles.band}>
            <div className={styles.bandScene} aria-hidden="true">
              <SceneImage scene={scene} priority sizes="100vw" className={styles.bandImage} />
              <span className={styles.bandBlur} />
            </div>
            {bar}
            {eyebrow && <p className={cx('overline', styles.bandEyebrow)}>{eyebrow}</p>}
            <h1 ref={titleRef} className={styles.bandTitle}>
              {title}
            </h1>
          </div>
          {subtitle && <p className={styles.bandSubtitle}>{subtitle}</p>}
        </header>
      </>
    );
  }
  return (
    <>
      {condensedBar}
      <header ref={headerRef} className={cx(styles.header, size === 'compact' && styles.headerCompact)}>
        {bar}
        {eyebrow && <p className={cx('overline', styles.eyebrow)}>{eyebrow}</p>}
        <h1 ref={titleRef} className={styles.title}>
          {title}
        </h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>
    </>
  );
}

export function Section({ title, action, children, className, id }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section className={cx(styles.section, className)} aria-labelledby={title && id ? id : undefined}>
      {(title || action) && (
        <div className={styles.sectionHead}>
          {title && (
            <h2 id={id} className={styles.sectionTitle}>
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({ children, className, tone = 'plain', as: As = 'div' }: { children: ReactNode; className?: string; tone?: 'plain' | 'sand' | 'sage' | 'blue' | 'gold'; as?: 'div' | 'article' | 'section' }) {
  return <As className={cx(styles.card, styles[`card-${tone}`], className)}>{children}</As>;
}

/* ── Settings rows ───────────────────────────────────────── */

export function SettingsGroup({ title, children, footer }: { title?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className={styles.group}>
      {title && <h2 className={cx('overline', styles.groupTitle)}>{title}</h2>}
      <div className={styles.groupBody} role="list">
        {children}
      </div>
      {footer && <p className={styles.groupFooter}>{footer}</p>}
    </div>
  );
}

interface SettingsRowProps {
  icon?: ReactNode;
  label: ReactNode;
  value?: ReactNode;
  detail?: ReactNode;
  to?: string;
  onClick?: () => void;
  control?: ReactNode;
  danger?: boolean;
  /** id of the control, so the label text names it */
  htmlFor?: string;
}

export function SettingsRow({ icon, label, value, detail, to, onClick, control, danger, htmlFor }: SettingsRowProps) {
  const inner = (
    <>
      {icon && <span className={cx(styles.rowIcon, danger && styles.rowDanger)}>{icon}</span>}
      <span className={styles.rowText}>
        {htmlFor ? (
          <label htmlFor={htmlFor} className={cx(styles.rowLabel, danger && styles.rowDanger)}>
            {label}
          </label>
        ) : (
          <span className={cx(styles.rowLabel, danger && styles.rowDanger)}>{label}</span>
        )}
        {detail && <span className={styles.rowDetail}>{detail}</span>}
      </span>
      {value && <span className={styles.rowValue}>{value}</span>}
      {control}
      {(to || onClick) && !control && <CaretRight size={16} weight="bold" className={styles.chevron} aria-hidden="true" />}
    </>
  );
  if (to)
    return (
      <Link to={to} className={cx(styles.row, styles.rowInteractive)} role="listitem">
        {inner}
      </Link>
    );
  if (onClick)
    return (
      <div role="listitem">
        <button type="button" className={cx(styles.row, styles.rowInteractive)} onClick={onClick}>
          {inner}
        </button>
      </div>
    );
  return (
    <div className={styles.row} role="listitem">
      {inner}
    </div>
  );
}

/* ── Ornaments ───────────────────────────────────────────── */

/** A small botanical sprig used between sections of a blessing. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cx(styles.ornament, className)} aria-hidden="true">
      <span className={styles.rule} />
      <svg viewBox="0 0 40 16" width="40" height="16">
        <path d="M4 8h32" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity=".55" />
        <path d="M20 8c-3.2-4.6-8.2-5.6-11.4-4 2.6 3.6 7.4 4.8 11.4 4Z" fill="currentColor" opacity=".8" />
        <path d="M20 8c3.2 4.6 8.2 5.6 11.4 4-2.6-3.6-7.4-4.8-11.4-4Z" fill="currentColor" opacity=".55" />
        <circle cx="20" cy="8" r="1.8" fill="var(--color-gold)" />
      </svg>
      <span className={styles.rule} />
    </div>
  );
}
