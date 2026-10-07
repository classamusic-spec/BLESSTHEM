import type { Account, AuthProvider } from '@/data/models';
import { newId } from '@/lib/id';

/**
 * Authentication seam.
 *
 * Production: Supabase Auth (Sign in with Apple, Google OAuth, email magic link —
 * no passwords). See docs/ARCHITECTURE.md › Authentication.
 *
 * This build ships the local provider: accounts live on the device, and guest data
 * is already the account’s data, so “migration” after sign-up is lossless by design.
 * A remote provider only needs to implement this interface.
 */
export interface AuthService {
  readonly mode: 'local' | 'remote';
  signIn(provider: Exclude<AuthProvider, 'guest'>, details: { name?: string; email?: string }): Promise<Account>;
  signOut(): Promise<void>;
}

class LocalAuthService implements AuthService {
  readonly mode = 'local' as const;

  async signIn(provider: Exclude<AuthProvider, 'guest'>, details: { name?: string; email?: string }): Promise<Account> {
    if (provider === 'email' && !/^\S+@\S+\.\S+$/.test(details.email ?? '')) {
      throw new Error('Please enter a valid email address, like name@example.com.');
    }
    await new Promise((r) => setTimeout(r, 450)); // a calm, honest beat rather than an instant flash
    return {
      id: newId('acct'),
      name: (details.name ?? '').trim(),
      email: details.email?.trim() || undefined,
      provider,
      createdAt: new Date().toISOString(),
    };
  }

  async signOut(): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
  }
}

export const auth: AuthService = new LocalAuthService();

export const PROVIDER_LABEL: Record<AuthProvider, string> = {
  guest: 'Guest',
  apple: 'Apple',
  google: 'Google',
  email: 'Email',
};
