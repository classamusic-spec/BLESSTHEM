import { MotionConfig } from 'motion/react';
import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { AppShell } from '@/app/AppShell';
import { RouteFallback } from '@/app/RouteFallback';
import { useStore } from '@/data/store';
import { ToastProvider } from '@/design/Toast';
import { TodayPage } from '@/features/today/TodayPage';
import { configureAnalytics, track } from '@/services/analytics';
import { onServiceWorkerMessage } from '@/services/sw-register';
import { applyDaypart, applySettings } from '@/services/theme';
import { useNotificationScheduler } from '@/features/notifications/useNotificationScheduler';
import { loadTranslation } from '@/content/scripture';

const Onboarding = lazy(() => import('@/features/onboarding/Onboarding'));
const PeoplePage = lazy(() => import('@/features/people/PeoplePage'));
const PersonPage = lazy(() => import('@/features/people/PersonPage'));
const PersonEditPage = lazy(() => import('@/features/people/PersonEditPage'));
const LibraryPage = lazy(() => import('@/features/library/LibraryPage'));
const TopicPage = lazy(() => import('@/features/library/TopicPage'));
const SearchPage = lazy(() => import('@/features/library/SearchPage'));
const EntryPage = lazy(() => import('@/features/library/EntryPage'));
const JourneysPage = lazy(() => import('@/features/journeys/JourneysPage'));
const JourneyPage = lazy(() => import('@/features/journeys/JourneyPage'));
const CollectionPage = lazy(() => import('@/features/library/CollectionPage'));
const JournalPage = lazy(() => import('@/features/journal/JournalPage'));
const JournalEntryPage = lazy(() => import('@/features/journal/JournalEntryPage'));
const BlessingPage = lazy(() => import('@/features/blessing/BlessingPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const SettingsDetail = lazy(() => import('@/features/settings/SettingsDetail'));
const PlusPage = lazy(() => import('@/features/premium/PlusPage'));
const AboutPage = lazy(() => import('@/features/marketing/AboutPage'));

function useAppEffects() {
  const settings = useStore((s) => s.settings);
  const installId = useStore((s) => s.installId);
  const recordOpen = useStore((s) => s.recordOpen);

  useEffect(() => applySettings(settings), [settings]);
  useEffect(() => {
    configureAnalytics({ enabled: settings.analytics, installId });
  }, [settings.analytics, installId]);
  useEffect(() => {
    if (settings.translation !== 'bsb') void loadTranslation(settings.translation);
  }, [settings.translation]);

  useEffect(() => {
    applyDaypart();
    recordOpen();
    const source = new URLSearchParams(window.location.search).get('source') ?? undefined;
    track({ name: 'app_opened', props: { source } });
    const id = window.setInterval(applyDaypart, 5 * 60_000);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onScheme = () => applySettings(useStore.getState().settings);
    media.addEventListener('change', onScheme);
    // Let the splash breathe for a beat, then fade it away.
    const splash = document.getElementById('splash');
    const t = window.setTimeout(() => splash?.classList.add('is-done'), 380);
    const t2 = window.setTimeout(() => splash?.remove(), 1000);
    return () => {
      window.clearInterval(id);
      media.removeEventListener('change', onScheme);
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [recordOpen]);
}

/** Notification taps while the app is already open arrive as service-worker messages. */
function ServiceWorkerBridge() {
  const navigate = useNavigate();
  useEffect(() => onServiceWorkerMessage((data) => data.type === 'navigate' && data.url && navigate(data.url)), [navigate]);
  return null;
}

function RequireOnboarded({ children }: { children: ReactNode }) {
  const onboarded = useStore((s) => s.onboarded);
  const hasPeople = useStore((s) => s.people.length > 0);
  const location = useLocation();
  if (!onboarded || !hasPeople) return <Navigate to="/welcome" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

function RootRedirect() {
  const onboarded = useStore((s) => s.onboarded && s.people.length > 0);
  return <Navigate to={onboarded ? '/today' : '/welcome'} replace />;
}

function Scheduler() {
  useNotificationScheduler();
  return null;
}

export function App() {
  useAppEffects();
  const reduce = useStore((s) => s.settings.motion === 'reduce');

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'user'}>
      <ToastProvider>
        <BrowserRouter>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <ServiceWorkerBridge />
          <Scheduler />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/welcome" element={<Onboarding />} />
              <Route path="/about" element={<AboutPage />} />
              <Route
                element={
                  <RequireOnboarded>
                    <AppShell />
                  </RequireOnboarded>
                }
              >
                <Route path="/today" element={<TodayPage />} />
                <Route path="/blessing/:blessingId" element={<BlessingPage />} />
                <Route path="/people" element={<PeoplePage />} />
                <Route path="/people/new" element={<PersonEditPage />} />
                <Route path="/people/:personId" element={<PersonPage />} />
                <Route path="/people/:personId/edit" element={<PersonEditPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/library/search" element={<SearchPage />} />
                <Route path="/library/topic/:topicId" element={<TopicPage />} />
                <Route path="/library/entry/:entryId" element={<EntryPage />} />
                <Route path="/library/collection/:collectionId" element={<CollectionPage />} />
                <Route path="/library/journeys" element={<JourneysPage />} />
                <Route path="/library/journeys/:journeyId" element={<JourneyPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/journal/:entryId" element={<JournalEntryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/:section" element={<SettingsDetail />} />
                <Route path="/plus" element={<PlusPage />} />
              </Route>
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </MotionConfig>
  );
}
