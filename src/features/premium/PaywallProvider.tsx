import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Sheet } from '@/design/Sheet';
import { track } from '@/services/analytics';
import { Paywall } from './Paywall';

interface PaywallApi {
  /** Opens the paywall. `onUnlocked` runs once the household is on Bless Them+. */
  open(source: string, onUnlocked?: () => void): void;
}

const PaywallContext = createContext<PaywallApi>({ open: () => undefined });

export function PaywallProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<string | null>(null);
  const unlockedRef = useRef<(() => void) | undefined>(undefined);

  const open = useCallback((src: string, onUnlocked?: () => void) => {
    unlockedRef.current = onUnlocked;
    setSource(src);
    track({ name: 'paywall_viewed', props: { source: src } });
  }, []);

  const close = useCallback(() => setSource(null), []);

  const api = useMemo(() => ({ open }), [open]);

  return (
    <PaywallContext.Provider value={api}>
      {children}
      <Sheet open={source !== null} onClose={close} size="full" title="Bless Them+" titleHidden>
        {source && (
          <Paywall
            source={source}
            onClose={close}
            onUnlocked={() => {
              close();
              unlockedRef.current?.();
            }}
          />
        )}
      </Sheet>
    </PaywallContext.Provider>
  );
}

export const usePaywall = () => useContext(PaywallContext);
