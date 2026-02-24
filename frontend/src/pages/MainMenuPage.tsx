import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useGetFlightEntries } from '../hooks/useQueries';
import {
  Plane,
  Users,
  UserCheck,
  Wrench,
  BookOpen,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    to: '/flight-log',
    icon: Plane,
    label: 'New Flight Log',
    description: 'Record a new flight entry',
    color: 'oklch(0.62 0.18 230)',
    bg: 'oklch(0.62 0.18 230 / 0.12)',
  },
  {
    to: '/records',
    icon: ClipboardList,
    label: 'Flight Records',
    description: 'View and filter all flight logs',
    color: 'oklch(0.70 0.15 180)',
    bg: 'oklch(0.70 0.15 180 / 0.12)',
  },
  {
    to: '/students',
    icon: Users,
    label: 'Students',
    description: 'Manage student roster',
    color: 'oklch(0.75 0.15 140)',
    bg: 'oklch(0.75 0.15 140 / 0.12)',
  },
  {
    to: '/instructors',
    icon: UserCheck,
    label: 'Instructors',
    description: 'Manage instructor roster',
    color: 'oklch(0.72 0.18 60)',
    bg: 'oklch(0.72 0.18 60 / 0.12)',
  },
  {
    to: '/aircraft',
    icon: Wrench,
    label: 'Aircraft',
    description: 'Manage aircraft fleet',
    color: 'oklch(0.68 0.2 25)',
    bg: 'oklch(0.68 0.2 25 / 0.12)',
  },
  {
    to: '/exercises',
    icon: BookOpen,
    label: 'Exercises',
    description: 'Manage training exercises',
    color: 'oklch(0.65 0.15 280)',
    bg: 'oklch(0.65 0.15 280 / 0.12)',
  },
];

export default function MainMenuPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: flightEntries = [] } = useGetFlightEntries();

  const today = new Date().toISOString().slice(0, 10);
  const todayFlights = flightEntries.filter(e => e.date === today).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="aviation-card rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'url(/assets/generated/login-bg.dim_1280x800.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-foreground">
              {userProfile ? `Welcome back, ${userProfile.name}` : 'Welcome to FlightLog Pro'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-4 py-2 rounded-xl"
              style={{ background: 'oklch(0.62 0.18 230 / 0.12)', border: '1px solid oklch(0.62 0.18 230 / 0.2)' }}
            >
              <div className="font-display text-2xl font-bold" style={{ color: 'oklch(0.75 0.18 230)' }}>
                {flightEntries.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Flights</div>
            </div>
            <div className="text-center px-4 py-2 rounded-xl"
              style={{ background: 'oklch(0.70 0.15 180 / 0.12)', border: '1px solid oklch(0.70 0.15 180 / 0.2)' }}
            >
              <div className="font-display text-2xl font-bold" style={{ color: 'oklch(0.72 0.15 180)' }}>
                {todayFlights}
              </div>
              <div className="text-xs text-muted-foreground">Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {NAV_ITEMS.map(({ to, icon: Icon, label, description, color, bg }) => (
          <button
            key={to}
            onClick={() => navigate({ to })}
            className="aviation-card rounded-xl p-5 text-left group transition-all duration-200 hover:scale-[1.02] hover:shadow-lg min-h-[44px] flex items-center gap-4"
            style={{
              border: `1px solid ${color.replace(')', ' / 0.2)')}`,
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
              style={{ background: bg }}
            >
              <Icon size={22} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-base font-semibold tracking-wide text-foreground">
                {label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                {description}
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
