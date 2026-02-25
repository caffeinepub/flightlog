import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Plane, Shield, Clock, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/generated/login-bg.dim_1920x1080.png)' }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-navy-950/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-6 py-4 flex items-center gap-3">
          <img
            src="/assets/generated/flight-log-logo.dim_256x256.png"
            alt="Flight Log Logo"
            className="w-10 h-10 rounded-lg"
          />
          <span className="font-display text-xl font-bold text-sky-300 tracking-wider">
            FLIGHT LOG
          </span>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Hero card */}
            <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                  <Plane className="w-8 h-8 text-primary" />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Welcome Back
                </h1>
                <p className="text-muted-foreground text-sm">
                  Sign in to access your flight log and records
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-sky-400" />
                  </div>
                  <span>Track flight hours by day and month</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart2 className="w-4 h-4 text-sky-400" />
                  </div>
                  <span>Student and aircraft hour reports</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-sky-400" />
                  </div>
                  <span>Secure, decentralized data storage</span>
                </div>
              </div>

              {/* Login button */}
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full h-12 text-base font-display font-semibold tracking-wide"
                size="lg"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plane className="w-5 h-5" />
                    Sign In
                  </span>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Secured by Internet Identity — no passwords required
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-4 text-center text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} Flight Log App
        </footer>
      </div>
    </div>
  );
}
