import { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useQueryClient } from '@tanstack/react-query';
import { Plane, Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/flight-log': 'Flight Log Entry',
  '/flight-records': 'Flight Records',
  '/students': 'Students',
  '/instructors': 'Instructors',
  '/aircraft': 'Aircraft',
  '/exercises': 'Exercises',
  '/student-report': 'Student Report',
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const currentTitle = PAGE_TITLES[location.pathname] || 'Flight Log';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/flight-log', label: 'Flight Log' },
    { path: '/flight-records', label: 'Records' },
    { path: '/students', label: 'Students' },
    { path: '/instructors', label: 'Instructors' },
    { path: '/aircraft', label: 'Aircraft' },
    { path: '/exercises', label: 'Exercises' },
    { path: '/student-report', label: 'Student Report' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 flex-shrink-0"
            aria-label="Go to dashboard"
          >
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-primary tracking-wider hidden sm:block text-sm">
              FLIGHT LOG
            </span>
          </button>
          <span className="text-muted-foreground hidden sm:block">/</span>
          <span className="font-display font-semibold text-foreground text-sm truncate">
            {currentTitle}
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate({ to: link.path })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                location.pathname === link.path
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated && userProfile && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="max-w-24 truncate">{userProfile.name}</span>
            </div>
          )}

          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-9"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs">Logout</span>
            </Button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-card/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {isAuthenticated && userProfile && (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border-b border-border mb-2 pb-3">
                <User className="w-4 h-4" />
                <span>{userProfile.name}</span>
              </div>
            )}
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate({ to: link.path });
                  setMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center ${
                  location.pathname === link.path
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </button>
            ))}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors min-h-[44px] flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
