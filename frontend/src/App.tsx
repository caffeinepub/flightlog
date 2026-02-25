import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useGetCallerUserProfile';
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
import StudentReportPage from './pages/StudentReportPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-display">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card/50 py-4 px-4 text-center text-sm text-muted-foreground">
        <p>
          Built with{' '}
          <span className="text-red-400">♥</span>{' '}
          using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'flight-log-app')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>{' '}
          &copy; {new Date().getFullYear()}
        </p>
      </footer>
      {showProfileSetup && <ProfileSetupModal />}
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
  path: '/flight-records',
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

const studentReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-report',
  component: StudentReportPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  flightLogRoute,
  flightRecordsRoute,
  studentsRoute,
  instructorsRoute,
  aircraftRoute,
  exercisesRoute,
  studentReportRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
