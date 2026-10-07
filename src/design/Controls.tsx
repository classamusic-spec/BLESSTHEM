import { Check } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';
import { haptics } from '@/services/haptics';
import { spring } from './motion';
import styles from './Controls.module.css';

/* ── Text fields ─────────────────────────────────────────── */

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, FieldProps & InputHTMLAttributes<HTMLInputElement>>(function TextField(
  { label, hint, error, optional, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const hintId = `${inputId}-hint`;
  const errId = `${inputId}-err`;
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {optional && <span className={styles.optional}>Optional</span>}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={cx(styles.input, error && styles.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? hintId : '', error ? errId : ''].filter(Boolean).join(' ') || undefined}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export const TextArea = forwardRef<HTMLTextAreaElement, FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { serif?: boolean }>(
  function TextArea({ label, hint, error, optional, className, id, serif, ...rest }, ref) {
    const auto = useId();
    const inputId = id ?? auto;
    const hintId = `${inputId}-hint`;
    return (
      <div className={cx(styles.field, className)}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {optional && <span className={styles.optional}>Optional</span>}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={cx(styles.input, styles.textarea, serif && styles.serifInput, error && styles.invalid)}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint ? hintId : undefined}
          {...rest}
        />
        {hint && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

/* ── Switch ──────────────────────────────────────────────── */

export function Switch({ checked, onChange, label, id, disabled }: { checked: boolean; onChange(v: boolean): void; label: string; id?: string; disabled?: boolean }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={cx(styles.switch, checked && styles.switchOn)}
      onClick={() => {
        haptics.selection();
        onChange(!checked);
      }}
    >
      <motion.span className={styles.knob} layout transition={spring.ui} />
    </button>
  );
}

/* ── Segmented control ───────────────────────────────────── */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  layoutId,
}: {
  value: T;
  onChange(v: T): void;
  options: Array<{ value: T; label: string }>;
  label: string;
  layoutId: string;
}) {
  return (
    <div className={styles.segmented} role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            className={cx(styles.segment, on && styles.segmentOn)}
            onClick={() => {
              if (!on) haptics.selection();
              onChange(o.value);
            }}
          >
            {on && <motion.span layoutId={layoutId} className={styles.segmentPill} transition={spring.ui} />}
            <span className={styles.segmentLabel}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Choice card (onboarding) ────────────────────────────── */

export function ChoiceCard({
  selected,
  onSelect,
  title,
  description,
  icon,
  role = 'radio',
}: {
  selected: boolean;
  onSelect(): void;
  title: string;
  description?: string;
  icon?: ReactNode;
  role?: 'radio' | 'checkbox';
}) {
  return (
    <motion.button
      type="button"
      role={role}
      aria-checked={selected}
      className={cx(styles.choice, selected && styles.choiceOn)}
      onClick={() => {
        haptics.selection();
        onSelect();
      }}
      whileTap={{ scale: 0.98 }}
      transition={spring.ui}
    >
      {icon && <span className={styles.choiceIcon}>{icon}</span>}
      <span className={styles.choiceText}>
        <span className={styles.choiceTitle}>{title}</span>
        {description && <span className={styles.choiceDesc}>{description}</span>}
      </span>
      <span className={styles.choiceCheck} aria-hidden="true">
        {selected && (
          <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.ui}>
            <Check size={14} weight="bold" />
          </motion.span>
        )}
      </span>
    </motion.button>
  );
}

/* ── Progress ────────────────────────────────────────────── */

export function ProgressDots({ count, index, label }: { count: number; index: number; label?: string }) {
  return (
    <div className={styles.dots} role="progressbar" aria-valuemin={1} aria-valuemax={count} aria-valuenow={index + 1} aria-label={label ?? `Step ${index + 1} of ${count}`}>
      {Array.from({ length: count }, (_, i) => (
        <motion.span
          key={i}
          className={cx(styles.dot, i <= index && styles.dotOn)}
          animate={{ width: i === index ? 22 : 6 }}
          transition={spring.ui}
        />
      ))}
    </div>
  );
}

export function ProgressRing({ value, size = 44, stroke = 3.5, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className={styles.ring} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.min(1, Math.max(0, value))) }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {children && <span className={styles.ringLabel}>{children}</span>}
    </span>
  );
}
