import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { Button } from '@/components/ui/button';
import { Plane, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/flight-log': 'New Flight Log',
  '/records': 'Flight Records',
  '/students': 'Students',
  '/instructors': 'Instructors',
  '/aircraft': 'Aircraft',
  '/exercises': 'Exercises',
};

export default function Header() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { data: userProfile } = useGetCallerUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPath = routerState.location.pathname;
  const pageTitle = PAGE_TITLES[currentPath] ?? 'FlightLog Pro';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setMobileMenuOpen(false);
  };

  if (!identity) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border"
      style={{
        background: 'linear-gradient(90deg, oklch(0.14 0.03 240 / 0.97) 0%, oklch(0.16 0.035 238 / 0.97) 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center"
              style={{ background: 'oklch(0.62 0.18 230 / 0.15)', border: '1px solid oklch(0.62 0.18 230 / 0.3)' }}
            >
              <Plane size={16} style={{ color: 'oklch(0.62 0.18 230)' }} />
            </div>
            <span className="font-display text-lg font-bold tracking-wider hidden sm:block"
              style={{ color: 'oklch(0.62 0.18 230)' }}
            >
              FLIGHTLOG
            </span>
          </button>

          {currentPath !== '/' && (
            <>
              <span className="text-border hidden sm:block">/</span>
              <span className="font-display text-base font-semibold tracking-wide text-foreground truncate">
                {pageTitle}
              </span>
            </>
          )}
        </div>

        {/* Desktop: User info + Logout */}
        <div className="hidden sm:flex items-center gap-3">
          {userProfile && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'oklch(0.20 0.04 240)' }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'oklch(0.62 0.18 230 / 0.2)', color: 'oklch(0.75 0.18 230)' }}
              >
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground">{userProfile.name}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="min-h-[36px] gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <LogOut size={15} />
            Logout
          </Button>
        </div>

        {/* Mobile: Hamburger */}
        <button
          className="sm:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border px-4 py-3 space-y-2"
          style={{ background: 'oklch(0.14 0.03 240 / 0.98)' }}
        >
          {userProfile && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
              style={{ background: 'oklch(0.20 0.04 240)' }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'oklch(0.62 0.18 230 / 0.2)', color: 'oklch(0.75 0.18 230)' }}
              >
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground">{userProfile.name}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors min-h-[44px]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
