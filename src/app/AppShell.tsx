import { AnimatePresence } from 'motion/react';
import { cloneElement, useEffect, type ReactElement } from 'react';
import { useLocation, useOutlet } from 'react-router';
import { OfflineBanner } from '@/design/States';
import { useWide } from '@/hooks/useMediaQuery';
import { NavigationBar, Sidebar } from './NavigationBar';
import styles from './AppShell.module.css';

/** The signed-in frame: navigation, offline banner, and calm page transitions. */
export function AppShell() {
  const location = useLocation();
  const outlet = useOutlet();
  const wide = useWide();
  const section = location.pathname.split('/')[1] ?? '';
  const hideNav = section === 'plus';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle('no-nav', hideNav);
  }, [hideNav]);

  return (
    <div className={styles.shell}>
      {wide && !hideNav && <Sidebar />}
      <div className={styles.content}>
        <OfflineBanner />
        <AnimatePresence mode="wait" initial={false}>
          {outlet && cloneElement(outlet as ReactElement, { key: location.pathname })}
        </AnimatePresence>
      </div>
      {!wide && !hideNav && <NavigationBar />}
    </div>
  );
}
