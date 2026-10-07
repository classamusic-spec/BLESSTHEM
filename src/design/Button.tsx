import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cx } from '@/lib/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet' | 'danger';
type Size = 'lg' | 'md' | 'sm';

interface CommonProps {
  variant?: ButtonVariant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  children?: ReactNode;
}

export type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Primary / Secondary / Ghost buttons. Every state is designed:
 * default, hover, pressed, keyboard focus, disabled and loading.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'lg', block, loading, icon, trailingIcon, children, className, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(styles.button, styles[variant], styles[size], block && styles.block, loading && styles.loading, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span className={styles.content}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {children && <span className={styles.label}>{children}</span>}
        {trailingIcon && <span className={styles.icon}>{trailingIcon}</span>}
      </span>
      {loading && (
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </button>
  );
});

export const PrimaryButton = (p: Omit<ButtonProps, 'variant'>) => <Button variant="primary" {...p} />;
export const SecondaryButton = (p: Omit<ButtonProps, 'variant'>) => <Button variant="secondary" {...p} />;
export const GhostButton = (p: Omit<ButtonProps, 'variant'>) => <Button variant="ghost" {...p} />;

/** A link styled as a button (navigation, not action). */
export function ButtonLink({
  variant = 'primary',
  size = 'lg',
  block,
  icon,
  trailingIcon,
  children,
  className,
  ...rest
}: CommonProps & LinkProps) {
  return (
    <Link className={cx(styles.button, styles[variant], styles[size], block && styles.block, className)} {...rest}>
      <span className={styles.content}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {children && <span className={styles.label}>{children}</span>}
        {trailingIcon && <span className={styles.icon}>{trailingIcon}</span>}
      </span>
    </Link>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  tone?: 'plain' | 'surface' | 'brand';
  size?: 'md' | 'sm';
  pressed?: boolean;
}

/** Round icon-only button with a required accessible label and a 44px target. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, children, tone = 'plain', size = 'md', pressed, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cx(styles.iconButton, styles[`tone-${tone}`], styles[`icon-${size}`], className)}
      {...rest}
    >
      {children}
    </button>
  );
});
