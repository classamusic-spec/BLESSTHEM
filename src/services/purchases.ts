import type { PlanId, Subscription } from '@/data/models';

/**
 * Subscriptions seam.
 *
 * Production: StoreKit / Google Play Billing via RevenueCat on native, Stripe on web,
 * with server-verified entitlements. This build includes a local preview provider so
 * the full flow (paywall → confirm → unlock) can be experienced. It never charges.
 */

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceLabel: string;
  period: 'month' | 'year';
  perMonthLabel: string;
  trialDays: number;
  badge?: string;
  renewal: string;
}

export const PLANS: Record<PlanId, Plan> = {
  annual: {
    id: 'annual',
    name: 'Yearly',
    price: 34.99,
    priceLabel: '$34.99',
    period: 'year',
    perMonthLabel: '$2.92/month',
    trialDays: 7,
    badge: 'Best value',
    renewal: 'After your 7-day free trial, $34.99 is charged each year until you cancel. Cancel anytime, at least 24 hours before renewal.',
  },
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    price: 4.99,
    priceLabel: '$4.99',
    period: 'month',
    perMonthLabel: '$4.99/month',
    trialDays: 0,
    renewal: '$4.99 is charged each month until you cancel. Cancel anytime, at least 24 hours before renewal.',
  },
};

export interface PurchaseService {
  readonly mode: 'preview' | 'store';
  purchase(plan: PlanId): Promise<Subscription>;
  restore(current: Subscription): Promise<Subscription | null>;
  cancel(current: Subscription): Promise<Subscription>;
}

const addDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

class PreviewPurchaseService implements PurchaseService {
  readonly mode = 'preview' as const;

  async purchase(planId: PlanId): Promise<Subscription> {
    await new Promise((r) => setTimeout(r, 900));
    const plan = PLANS[planId];
    const trial = plan.trialDays > 0;
    return {
      tier: 'plus',
      plan: planId,
      status: trial ? 'trial' : 'active',
      startedAt: new Date().toISOString(),
      trialEndsAt: trial ? addDays(plan.trialDays) : undefined,
      renewsAt: trial ? addDays(plan.trialDays) : addDays(plan.period === 'year' ? 365 : 30),
    };
  }

  async restore(current: Subscription): Promise<Subscription | null> {
    await new Promise((r) => setTimeout(r, 700));
    return current.tier === 'plus' ? current : null;
  }

  async cancel(current: Subscription): Promise<Subscription> {
    await new Promise((r) => setTimeout(r, 500));
    return { ...current, status: 'canceled' };
  }
}

export const purchases: PurchaseService = new PreviewPurchaseService();
