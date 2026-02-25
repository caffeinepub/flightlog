import { useNavigate } from '@tanstack/react-router';
import ListManager from '../components/ListManager';
import { useGetTotalFlightHoursByAircraft } from '../hooks/useQueries';
import { ArrowLeft, Wrench, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatHours } from '../utils/timeCalculations';

export default function AircraftPage() {
  const navigate = useNavigate();
  const { data: aircraftHours, isLoading: hoursLoading } = useGetTotalFlightHoursByAircraft();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/' })}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-orange-400" />
          <h1 className="font-display text-xl font-bold text-foreground">Aircraft</h1>
        </div>
      </div>

      {/* Total hours summary */}
      {(hoursLoading || (aircraftHours && aircraftHours.length > 0)) && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-400" />
            <h2 className="font-display text-sm font-semibold text-foreground">Total Flight Hours by Aircraft</h2>
          </div>
          {hoursLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {aircraftHours?.map(summary => (
                <div key={summary.aircraft} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm font-medium text-foreground">{summary.aircraft}</span>
                  <span className="font-display font-bold text-orange-400 text-sm">
                    {formatHours(summary.totalFlightHours)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-6">
        <p className="text-sm text-muted-foreground mb-4">
          Manage your aircraft fleet. Aircraft added here will appear in the flight log entry form.
        </p>
        <ListManager
          categoryType="aircraft"
          title="Aircraft"
          placeholder="Enter aircraft registration or name..."
        />
      </div>
    </div>
  );
}
