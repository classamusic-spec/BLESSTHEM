import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { isNative } from './platform';

/**
 * Light, selective haptics: blessing completion, selection, saving, journal entries.
 * Android/Chrome use the Vibration API. iOS Safari (18+) has no vibration API, but
 * toggling a native switch control produces the system selection haptic, so we use
 * that as a progressive enhancement. Calls must happen inside a user gesture. The native
 * app uses the system's own Taptic Engine and vibration patterns instead.
 */
let enabled = true;

export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

const canVibrate = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
const isIOS = () => typeof navigator !== 'undefined' && /iP(hone|ad|od)/.test(navigator.userAgent);

function iosTick() {
  try {
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.cssText = 'position:fixed;opacity:0;pointer-events:none;width:0;height:0;overflow:hidden';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.tabIndex = -1;
    label.appendChild(input);
    document.body.appendChild(label);
    label.click();
    label.remove();
  } catch {
    /* no haptics available */
  }
}

function pulse(pattern: number | number[], iosTicks = 1) {
  if (!enabled) return;
  if (canVibrate()) {
    navigator.vibrate(pattern);
  } else if (isIOS()) {
    iosTick();
    if (iosTicks > 1) setTimeout(iosTick, 90);
  }
}

const native = {
  selection: () => void Haptics.selectionChanged().catch(() => undefined),
  light: () => void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined),
  success: () => void Haptics.notification({ type: NotificationType.Success }).catch(() => undefined),
};

export const haptics = {
  /** Choosing a person, a chip, a tab. */
  selection: () => enabled && (isNative() ? native.selection() : pulse(6)),
  /** Saving a favorite or a journal entry. */
  light: () => enabled && (isNative() ? native.light() : pulse(10)),
  /** “I prayed this.” A soft double beat — never a buzz. */
  success: () => enabled && (isNative() ? native.success() : pulse([12, 60, 16], 2)),
};
