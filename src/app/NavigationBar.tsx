import { BookOpen, GearSix, Notebook, SunHorizon, UsersThree, type Icon } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { NavLink, useLocation } from 'react-router';
import { LogoMark } from '@/brand/Logo';
import { isPlus, useStore } from '@/data/store';
import { spring } from '@/design/motion';
import { cx } from '@/lib/cx';
import { haptics } from '@/services/haptics';
import styles from './NavigationBar.module.css';

const ITEMS: Array<{ to: string; label: string; icon: Icon }> = [
  { to: '/today', label: 'Today', icon: SunHorizon },
  { to: '/people', label: 'People', icon: UsersThree },
  { to: '/library', label: 'Library', icon: BookOpen },
  { to: '/journal', label: 'Journal', icon: Notebook },
];

function useActive() {
  const { pathname } = useLocation();
  return (to: string) => pathname === to || pathname.startsWith(`${to}/`) || (to === '/today' && pathname.startsWith('/blessing'));
}

/** Bottom navigation for phones: four calm destinations, nothing more. */
export function NavigationBar() {
  const isActive = useActive();
  return (
    <nav className={styles.bar} aria-label="Primary">
      <ul role="list" className={styles.list}>
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <li key={to}>
              <NavLink
                to={to}
                className={cx(styles.item, active && styles.active)}
                aria-current={active ? 'page' : undefined}
                onClick={() => !active && haptics.selection()}
              >
                {active && <motion.span layoutId="nav-lens" className={styles.lens} transition={spring.soft} />}
                <span className={styles.iconWrap}>
                  <Icon size={24} weight={active ? 'fill' : 'regular'} className={styles.icon} aria-hidden="true" />
                </span>
                <span className={styles.label}>{label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Sidebar for tablets and desktop. */
export function Sidebar() {
  const isActive = useActive();
  const account = useStore((s) => s.account);
  const plus = useStore(isPlus);
  return (
    <aside className={styles.sidebar}>
      <NavLink to="/today" className={styles.brand} aria-label="Bless Them, home">
        <LogoMark size={34} />
        <span className={styles.wordmark}>Bless Them</span>
      </NavLink>
      <nav aria-label="Primary">
        <ul role="list" className={styles.sideList}>
          {ITEMS.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <li key={to}>
                <NavLink to={to} className={cx(styles.sideItem, active && styles.sideActive)} aria-current={active ? 'page' : undefined}>
                  {active && <motion.span layoutId="side-pill" className={styles.sidePill} transition={spring.ui} />}
                  <Icon size={22} weight={active ? 'fill' : 'regular'} className={styles.sideIcon} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={styles.sideFooter}>
        {!plus && (
          <NavLink to="/plus" className={styles.plusLink}>
            <span className={styles.plusBadge}>+</span>
            <span>
              <strong>Bless Them+</strong>
              <small>Unlimited people, journeys and audio</small>
            </span>
          </NavLink>
        )}
        <NavLink to="/settings" className={cx(styles.sideItem, isActive('/settings') && styles.sideActive)}>
          {isActive('/settings') && <motion.span layoutId="side-pill" className={styles.sidePill} transition={spring.ui} />}
          <GearSix size={22} weight={isActive('/settings') ? 'fill' : 'regular'} className={styles.sideIcon} aria-hidden="true" />
          <span>{account?.name ? account.name : 'Settings'}</span>
        </NavLink>
      </div>
    </aside>
  );
}
