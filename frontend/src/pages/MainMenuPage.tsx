import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useTodayFlightHours, useMonthFlightHours } from '../hooks/useQueries';
import {
  Plane, BookOpen, Users, UserCheck, Wrench, GraduationCap, BarChart2, Clock, Calendar
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatHours } from '../utils/timeCalculations';

interface NavTile {
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const navTiles: NavTile[] = [
  {
    path: '/flight-log',
    label: 'Flight Log',
    description: 'Record a new flight entry',
    icon: <Plane className="w-6 h-6" />,
    color: 'text-sky-400 bg-sky-400/10',
  },
  {
    path: '/flight-records',
    label: 'Flight Records',
    description: 'View and manage all flights',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'text-blue-400 bg-blue-400/10',
  },
  {
    path: '/students',
    label: 'Students',
    description: 'Manage student roster',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'text-purple-400 bg-purple-400/10',
  },
  {
    path: '/instructors',
    label: 'Instructors',
    description: 'Manage instructor roster',
    icon: <UserCheck className="w-6 h-6" />,
    color: 'text-amber-400 bg-amber-400/10',
  },
  {
    path: '/aircraft',
    label: 'Aircraft',
    description: 'Manage aircraft fleet',
    icon: <Wrench className="w-6 h-6" />,
    color: 'text-orange-400 bg-orange-400/10',
  },
  {
    path: '/exercises',
    label: 'Exercises',
    description: 'Manage training exercises',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'text-teal-400 bg-teal-400/10',
  },
  {
    path: '/student-report',
    label: 'Student Report',
    description: 'Total hours per student',
    icon: <BarChart2 className="w-6 h-6" />,
    color: 'text-green-400 bg-green-400/10',
  },
];

export default function MainMenuPage() {
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: todayHours, isLoading: todayLoading } = useTodayFlightHours();
  const { data: monthHours, isLoading: monthLoading } = useMonthFlightHours();

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary/20 to-sky-500/10 border border-primary/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-1">
          <Plane className="w-6 h-6 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            {profileLoading ? (
              <Skeleton className="h-7 w-40 inline-block" />
            ) : (
              `Welcome, ${userProfile?.name || 'Pilot'}!`
            )}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-9">
          {now.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-sky-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Today's Hours</p>
            {todayLoading ? (
              <Skeleton className="h-6 w-16 mt-0.5" />
            ) : (
              <p className="font-display font-bold text-xl text-foreground">
                {formatHours(todayHours ?? 0)}
              </p>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{monthName}</p>
            {monthLoading ? (
              <Skeleton className="h-6 w-16 mt-0.5" />
            ) : (
              <p className="font-display font-bold text-xl text-foreground">
                {formatHours(monthHours ?? 0)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation grid */}
      <div>
        <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {navTiles.map((tile) => (
            <button
              key={tile.path}
              onClick={() => navigate({ to: tile.path })}
              className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/50 hover:bg-card/80 transition-all group min-h-[80px] flex flex-col gap-2"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tile.color}`}>
                {tile.icon}
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {tile.label}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">{tile.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
