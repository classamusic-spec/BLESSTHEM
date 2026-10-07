import { X } from '@phosphor-icons/react';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { IconButton } from './Button';
import { spring } from './motion';
import styles from './Sheet.module.css';

interface SheetProps {
  open: boolean;
  onClose(): void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** `tall` for reading surfaces (context, journal), `full` for immersive flows. */
  size?: 'auto' | 'tall' | 'full';
  tone?: 'default' | 'sand' | 'night';
  footer?: ReactNode;
  hideClose?: boolean;
  /** A visually hidden title still names the dialog for assistive tech. */
  titleHidden?: boolean;
  className?: string;
}

let openSheets = 0;

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Bottom sheet on phones, centred dialog on wide screens. Accessible modal semantics throughout. */
export function Sheet({ open, onClose, title, description, children, size = 'auto', tone = 'default', footer, hideClose, titleHidden, className }: SheetProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const wide = useMediaQuery('(min-width: 720px)');
  const drag = useDragControls();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement;
    openSheets += 1;
    document.documentElement.classList.add('sheet-open');
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      const first = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel;
      first?.focus({ preventScroll: true });
    }, 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      openSheets -= 1;
      if (openSheets <= 0) {
        openSheets = 0;
        document.body.style.overflow = '';
        document.documentElement.classList.remove('sheet-open');
      }
      restoreRef.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const motionProps = wide
    ? {
        initial: { opacity: 0, scale: 0.97, y: 12 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.98, y: 8 },
        transition: spring.soft,
      }
    : {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
        transition: spring.soft,
        drag: 'y' as const,
        dragControls: drag,
        dragListener: false,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 0.7 },
        onDragEnd: (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
          if (info.offset.y > 110 || info.velocity.y > 650) onClose();
        },
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cx(styles.root, wide && styles.centered)}>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={cx(styles.panel, styles[size], styles[`tone-${tone}`], className)}
            {...motionProps}
          >
            <div className={styles.grab} onPointerDown={(e) => !wide && drag.start(e)}>
              {!wide && <span className={styles.handle} aria-hidden="true" />}
              {(title || !hideClose) && (
                <div className={cx(styles.header, (!title || titleHidden) && styles.headerBare)}>
                  {title && (
                    <h2 id={titleId} className={cx(styles.title, titleHidden && 'visually-hidden')}>
                      {title}
                    </h2>
                  )}
                  {!hideClose && (
                    <IconButton label="Close" onClick={onClose} className={styles.close} size="sm">
                      <X size={20} />
                    </IconButton>
                  )}
                </div>
              )}
              {description && (
                <p id={descId} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            <div className={styles.body}>{children}</div>
            {footer && <div className={styles.footer}>{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
