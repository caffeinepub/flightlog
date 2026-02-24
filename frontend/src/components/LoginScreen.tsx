import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Plane, Shield, BookOpen } from 'lucide-react';

export default function LoginScreen() {
  const { login, loginStatus, isLoggingIn, isInitializing } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === 'User is already authenticated') {
        // Already authenticated, ignore
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/generated/login-bg.dim_1280x800.png)' }}
      />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, oklch(0.10 0.03 240 / 0.92) 0%, oklch(0.14 0.04 235 / 0.85) 50%, oklch(0.12 0.03 245 / 0.90) 100%)'
      }} />

      {/* Decorative horizon line */}
      <div className="absolute bottom-1/3 left-0 right-0 h-px opacity-20"
        style={{ background: 'linear-gradient(90deg, transparent, oklch(0.62 0.18 230), transparent)' }}
      />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        <div className="aviation-card p-8 rounded-2xl border border-sky-500/20"
          style={{
            background: 'linear-gradient(135deg, oklch(0.16 0.04 240 / 0.95) 0%, oklch(0.14 0.03 245 / 0.95) 100%)',
            boxShadow: '0 8px 48px oklch(0.08 0.02 240 / 0.8), 0 0 0 1px oklch(0.62 0.18 230 / 0.15)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-4 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{ background: 'oklch(0.62 0.18 230 / 0.15)', border: '1px solid oklch(0.62 0.18 230 / 0.3)' }}
            >
              <img
                src="/assets/generated/flight-log-logo.dim_256x256.png"
                alt="FlightLog Pro"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="oklch(0.62 0.18 230)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4c-1 0-1.5.5-3.5 2.5L11 8 2.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 7.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>';
                }}
              />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-wider text-foreground">
              FLIGHTLOG PRO
            </h1>
            <p className="text-sm mt-1" style={{ color: 'oklch(0.6 0.08 230)' }}>
              Aviation Training Management System
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Plane, label: 'Flight Logs' },
              { icon: BookOpen, label: 'Exercises' },
              { icon: Shield, label: 'Secure' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-lg"
                style={{ background: 'oklch(0.20 0.04 240 / 0.6)' }}
              >
                <Icon size={18} style={{ color: 'oklch(0.62 0.18 230)' }} />
                <span className="text-xs font-medium" style={{ color: 'oklch(0.7 0.04 230)' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoggingIn || isInitializing}
            className="w-full aviation-btn-primary flex items-center justify-center gap-2 text-base font-semibold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ minHeight: '52px' }}
          >
            {isLoggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </>
            ) : isInitializing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Shield size={18} />
                Login with Internet Identity
              </>
            )}
          </button>

          <p className="text-center text-xs mt-4" style={{ color: 'oklch(0.5 0.04 230)' }}>
            Secure, decentralized authentication
          </p>
        </div>
      </div>
    </div>
  );
}
