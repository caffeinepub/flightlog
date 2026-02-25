import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAddFlightEntry, useListCategories } from '../hooks/useQueries';
import { FlightEntry, Variant_day_night, Variant_dual_solo } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calcFlightTime, getTodayDateString } from '../utils/timeCalculations';
import { ArrowLeft, PlaneTakeoff, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FlightLogEntryPage() {
  const navigate = useNavigate();
  const addFlightEntry = useAddFlightEntry();

  const { data: students } = useListCategories('student');
  const { data: instructors } = useListCategories('instructor');
  const { data: aircraftList } = useListCategories('aircraft');
  const { data: exercises } = useListCategories('exercise');

  const [date, setDate] = useState(getTodayDateString());
  const [student, setStudent] = useState('');
  const [instructor, setInstructor] = useState('');
  const [aircraft, setAircraft] = useState('');
  const [exercise, setExercise] = useState('');
  const [flightType, setFlightType] = useState<'solo' | 'dual'>('dual');
  const [takeoffTime, setTakeoffTime] = useState('');
  const [landingTime, setLandingTime] = useState('');
  const [landingType, setLandingType] = useState<'day' | 'night'>('day');
  const [landingCount, setLandingCount] = useState('1');
  const [formError, setFormError] = useState<string | null>(null);

  const totalFlightTime = calcFlightTime(takeoffTime, landingTime);

  const validate = (): string | null => {
    if (!date) return 'Date is required';
    if (!student) return 'Student is required';
    if (!instructor) return 'Instructor is required';
    if (!aircraft) return 'Aircraft is required';
    if (!exercise) return 'Exercise is required';
    if (!takeoffTime) return 'Takeoff time is required';
    if (!landingTime) return 'Landing time is required';
    if (!/^\d{1,2}:\d{2}$/.test(takeoffTime)) return 'Takeoff time must be HH:MM';
    if (!/^\d{1,2}:\d{2}$/.test(landingTime)) return 'Landing time must be HH:MM';
    const count = parseInt(landingCount);
    if (isNaN(count) || count < 1) return 'Landing count must be at least 1';
    return null;
  };

  const handleSave = async () => {
    setFormError(null);
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    // Use current time in nanoseconds as dateEpoch so it matches the backend storage key
    const nowNs = BigInt(Date.now()) * BigInt(1_000_000);

    const entry: FlightEntry = {
      date,
      dateEpoch: nowNs,
      student,
      instructor,
      aircraft,
      exercise,
      flightType: flightType === 'solo' ? Variant_dual_solo.solo : Variant_dual_solo.dual,
      takeoffTime,
      landingTime,
      totalFlightTime,
      landingType: landingType === 'night' ? Variant_day_night.night : Variant_day_night.day,
      landingCount: BigInt(parseInt(landingCount)),
    };

    try {
      await addFlightEntry.mutateAsync(entry);
      toast.success('Flight entry saved successfully');
      navigate({ to: '/flight-records' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save flight entry';
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/' })}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <PlaneTakeoff className="w-5 h-5 text-primary" />
          <h1 className="font-display text-xl font-bold text-foreground">New Flight Entry</h1>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setFormError(null); }}
            className="h-11"
            disabled={addFlightEntry.isPending}
          />
        </div>

        {/* Student */}
        <div className="space-y-1.5">
          <Label>Student</Label>
          <Select
            value={student}
            onValueChange={(v) => { setStudent(v); setFormError(null); }}
            disabled={addFlightEntry.isPending}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students?.map(s => (
                <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Instructor */}
        <div className="space-y-1.5">
          <Label>Instructor</Label>
          <Select
            value={instructor}
            onValueChange={(v) => { setInstructor(v); setFormError(null); }}
            disabled={addFlightEntry.isPending}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select instructor" />
            </SelectTrigger>
            <SelectContent>
              {instructors?.map(i => (
                <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aircraft */}
        <div className="space-y-1.5">
          <Label>Aircraft</Label>
          <Select
            value={aircraft}
            onValueChange={(v) => { setAircraft(v); setFormError(null); }}
            disabled={addFlightEntry.isPending}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select aircraft" />
            </SelectTrigger>
            <SelectContent>
              {aircraftList?.map(a => (
                <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exercise */}
        <div className="space-y-1.5">
          <Label>Exercise</Label>
          <Select
            value={exercise}
            onValueChange={(v) => { setExercise(v); setFormError(null); }}
            disabled={addFlightEntry.isPending}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select exercise" />
            </SelectTrigger>
            <SelectContent>
              {exercises?.map(e => (
                <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Flight Type */}
        <div className="space-y-1.5">
          <Label>Flight Type</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFlightType('dual')}
              disabled={addFlightEntry.isPending}
              className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                flightType === 'dual'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-foreground hover:bg-muted'
              }`}
            >
              Dual
            </button>
            <button
              type="button"
              onClick={() => setFlightType('solo')}
              disabled={addFlightEntry.isPending}
              className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                flightType === 'solo'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-foreground hover:bg-muted'
              }`}
            >
              Solo
            </button>
          </div>
        </div>

        {/* Times */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="takeoff">Takeoff (HH:MM)</Label>
            <Input
              id="takeoff"
              type="text"
              placeholder="09:00"
              value={takeoffTime}
              onChange={(e) => { setTakeoffTime(e.target.value); setFormError(null); }}
              className="h-11"
              disabled={addFlightEntry.isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="landing">Landing (HH:MM)</Label>
            <Input
              id="landing"
              type="text"
              placeholder="10:30"
              value={landingTime}
              onChange={(e) => { setLandingTime(e.target.value); setFormError(null); }}
              className="h-11"
              disabled={addFlightEntry.isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Total Time</Label>
            <div className="h-11 flex items-center px-3 rounded-lg bg-muted border border-border text-sm font-bold text-primary">
              {totalFlightTime}
            </div>
          </div>
        </div>

        {/* Landing Type */}
        <div className="space-y-1.5">
          <Label>Landing Type</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLandingType('day')}
              disabled={addFlightEntry.isPending}
              className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                landingType === 'day'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-foreground hover:bg-muted'
              }`}
            >
              ☀️ Day
            </button>
            <button
              type="button"
              onClick={() => setLandingType('night')}
              disabled={addFlightEntry.isPending}
              className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                landingType === 'night'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-foreground hover:bg-muted'
              }`}
            >
              🌙 Night
            </button>
          </div>
        </div>

        {/* Landing Count */}
        <div className="space-y-1.5">
          <Label htmlFor="landingCount">Number of Landings</Label>
          <Input
            id="landingCount"
            type="number"
            min="1"
            value={landingCount}
            onChange={(e) => { setLandingCount(e.target.value); setFormError(null); }}
            className="h-11"
            disabled={addFlightEntry.isPending}
          />
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={addFlightEntry.isPending}
          className="w-full h-12 text-base font-display"
        >
          {addFlightEntry.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            'Save Flight Entry'
          )}
        </Button>
      </div>
    </div>
  );
}
