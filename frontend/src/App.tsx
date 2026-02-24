import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import LoginScreen from './components/LoginScreen';
import ProfileSetupModal from './components/ProfileSetupModal';
import Header from './components/Header';
import MainMenuPage from './pages/MainMenuPage';
import FlightLogEntryPage from './pages/FlightLogEntryPage';
import FlightRecordsPage from './pages/FlightRecordsPage';
import StudentsPage from './pages/StudentsPage';
import InstructorsPage from './pages/InstructorsPage';
import AircraftPage from './pages/AircraftPage';
import ExercisesPage from './pages/ExercisesPage';
import { Toaster } from '@/components/ui/sonner';
import { useGetCallerUserProfile } from './hooks/useGetCallerUserProfile';

function AppLayout() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <footer className="border-t border-border py-4 px-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} FlightLog Pro &mdash; Built with{' '}
          <span className="text-red-400">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'flightlog-pro')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-500 hover:text-sky-400 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
      {showProfileSetup && (
        <ProfileSetupModal
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
          }}
        />
      )}
    </div>
  );
}

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MainMenuPage,
});

const flightLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/flight-log',
  component: FlightLogEntryPage,
});

const flightRecordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/records',
  component: FlightRecordsPage,
});

const studentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/students',
  component: StudentsPage,
});

const instructorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/instructors',
  component: InstructorsPage,
});

const aircraftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/aircraft',
  component: AircraftPage,
});

const exercisesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/exercises',
  component: ExercisesPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  flightLogRoute,
  flightRecordsRoute,
  studentsRoute,
  instructorsRoute,
  aircraftRoute,
  exercisesRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" theme="dark" />
    </>
  );
}
