import { Check, UsersThree } from '@phosphor-icons/react';
import type { Person } from '@/data/models';
import { RELATIONSHIP_KIND } from '@/data/models';
import { cx } from '@/lib/cx';
import { initials } from '@/lib/text';
import styles from './PersonAvatar.module.css';

interface PersonAvatarProps {
  person: Pick<Person, 'name' | 'hue' | 'relationship'>;
  size?: number;
  prayed?: boolean;
  className?: string;
  /** Avatars are decorative next to a visible name; pass a label when they stand alone. */
  label?: string;
}

/** A refined monogram — no photos required, no faces of children stored. */
export function PersonAvatar({ person, size = 56, prayed, className, label }: PersonAvatarProps) {
  const isFamily = RELATIONSHIP_KIND[person.relationship] === 'family';
  return (
    <span
      className={cx(styles.avatar, styles[person.hue], className)}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {isFamily ? <UsersThree weight="duotone" size={size * 0.48} /> : <span className={styles.initials}>{initials(person.name)}</span>}
      {prayed && (
        <span className={styles.badge} style={{ width: Math.max(18, size * 0.36), height: Math.max(18, size * 0.36) }}>
          <Check weight="bold" size={Math.max(10, size * 0.2)} />
        </span>
      )}
    </span>
  );
}
