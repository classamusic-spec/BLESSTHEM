import { Capacitor } from '@capacitor/core';

/**
 * Whether Bless Them is running inside the native iOS or Android app (Capacitor) rather
 * than a browser. Services use this to swap in native notifications, haptics and sharing;
 * everything else is the same code on every platform.
 */
export const isNative = (): boolean => Capacitor.isNativePlatform();

export const platform = (): 'ios' | 'android' | 'web' => Capacitor.getPlatform() as 'ios' | 'android' | 'web';
