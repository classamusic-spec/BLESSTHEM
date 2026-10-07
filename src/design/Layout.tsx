import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { cx } from '@/lib/cx';
import { IconButton } from './Button';
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
}

export function PageHeader({ title, eyebrow, subtitle, back, actions, size = 'large' }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className={cx(styles.header, size === 'compact' && styles.headerCompact)}>
      {(back || actions) && (
        <div className={styles.headerBar}>
          {back ? (
            <IconButton
              label="Back"
              tone="surface"
              onClick={() => (typeof back === 'string' ? navigate(back) : window.history.length > 1 ? navigate(-1) : navigate('/today'))}
            >
              <CaretLeft size={20} weight="bold" />
            </IconButton>
          ) : (
            <span />
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      {eyebrow && <p className={cx('overline', styles.eyebrow)}>{eyebrow}</p>}
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
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

/**
 * Ambient window light — the brand’s quiet signature. Soft, slowly drifting
 * light that changes with the time of day (see tokens.css › daypart).
 */
export function Ambient({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div className={cx(styles.ambient, className)} style={{ opacity: intensity }} aria-hidden="true">
      <span className={styles.lightA} />
      <span className={styles.lightB} />
      <span className={styles.lightC} />
      <span className={styles.beam} />
    </div>
  );
}
