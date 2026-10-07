import { AnimatePresence, motion } from 'motion/react';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { spring } from './motion';
import styles from './Toast.module.css';

interface ToastItem {
  id: number;
  message: ReactNode;
  icon?: ReactNode;
  action?: { label: string; onClick(): void };
}

interface ToastApi {
  show(message: ReactNode, opts?: { icon?: ReactNode; action?: ToastItem['action']; duration?: number }): void;
}

const ToastContext = createContext<ToastApi>({ show: () => undefined });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback<ToastApi['show']>(
    (message, opts = {}) => {
      const id = ++seq.current;
      setItems((list) => [...list.slice(-1), { id, message, icon: opts.icon, action: opts.action }]);
      window.setTimeout(() => dismiss(id), opts.duration ?? (opts.action ? 5200 : 3200));
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className={styles.region} role="status" aria-live="polite">
          <AnimatePresence initial={false}>
            {items.map((t) => (
              <motion.div
                key={t.id}
                layout
                className={styles.toast}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.18 } }}
                transition={spring.soft}
              >
                {t.icon && <span className={styles.icon}>{t.icon}</span>}
                <span className={styles.message}>{t.message}</span>
                {t.action && (
                  <button
                    type="button"
                    className={styles.action}
                    onClick={() => {
                      t.action!.onClick();
                      dismiss(t.id);
                    }}
                  >
                    {t.action.label}
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
