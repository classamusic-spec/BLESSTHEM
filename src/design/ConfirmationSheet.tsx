import type { ReactNode } from 'react';
import { Button } from './Button';
import { Sheet } from './Sheet';

interface ConfirmationSheetProps {
  open: boolean;
  onClose(): void;
  onConfirm(): void;
  title: string;
  body?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
}

/** A calm, explicit confirmation — destructive actions always explain what happens. */
export function ConfirmationSheet({ open, onClose, onConfirm, title, body, confirmLabel, cancelLabel = 'Cancel', destructive, busy }: ConfirmationSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={title} hideClose>
      {body && <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>{body}</div>}
      <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <Button variant={destructive ? 'danger' : 'primary'} block onClick={onConfirm} loading={busy}>
          {confirmLabel}
        </Button>
        <Button variant="ghost" block onClick={onClose} data-autofocus>
          {cancelLabel}
        </Button>
      </div>
    </Sheet>
  );
}
