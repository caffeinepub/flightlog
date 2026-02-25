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
import { toast } from 'sonner';
import { calcFlightTime, dateStringToEpochBigInt, getTodayDateString } from '../utils/timeCalculations';
import { ArrowLeft, Plane, Save } from 'lucide-react';

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

  const totalFlightTime = calcFlightTime(takeoffTime, landingTime);

  const validate = (): string | null => {
    if (!date) return 'Date is required';
    if (!student) return 'Student is required';
    if (!instructor) return 'Instructor is required';
    if (!aircraft) return 'Aircraft is required';
    if (!exercise) return 'Exercise is required';
    if (!takeoffTime) return 'Takeoff time is required';
    if (!landingTime) return 'Landing time is required';
    if (!/^\d{1,2}:\d{2}$/.test(takeoffTime)) return 'Takeoff time must be HH:MM format';
    if (!/^\d{1,2}:\d{2}$/.test(landingTime)) return 'Landing time must be HH:MM format';
    const count = parseInt(landingCount);
    if (isNaN(count) || count < 1) return 'Landing count must be at least 1';
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const entry: FlightEntry = {
      date,
      dateEpoch: dateStringToEpochBigInt(date),
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
      toast.success('Flight entry saved!');
      // Reset form
      setDate(getTodayDateString());
      setStudent('');
      setInstructor('');
      setAircraft('');
      setExercise('');
      setFlightType('dual');
      setTakeoffTime('');
      setLandingTime('');
      setLandingType('day');
      setLandingCount('1');
    } catch {
      toast.error('Failed to save flight entry');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: '/' })}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-primary" />
          <h1 className="font-display text-xl font-bold text-foreground">New Flight Entry</h1>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11"
          />
        </div>

        {/* Student */}
        <div className="space-y-1.5">
          <Label>Student</Label>
          <Select value={student} onValueChange={setStudent}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students && students.length > 0 ? (
                students.map(s => (
                  <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="_none" disabled>No students — add in Students page</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Instructor */}
        <div className="space-y-1.5">
          <Label>Instructor</Label>
          <Select value={instructor} onValueChange={setInstructor}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select instructor" />
            </SelectTrigger>
            <SelectContent>
              {instructors && instructors.length > 0 ? (
                instructors.map(i => (
                  <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="_none" disabled>No instructors — add in Instructors page</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Aircraft */}
        <div className="space-y-1.5">
          <Label>Aircraft</Label>
          <Select value={aircraft} onValueChange={setAircraft}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select aircraft" />
            </SelectTrigger>
            <SelectContent>
              {aircraftList && aircraftList.length > 0 ? (
                aircraftList.map(a => (
                  <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="_none" disabled>No aircraft — add in Aircraft page</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Exercise */}
        <div className="space-y-1.5">
          <Label>Exercise</Label>
          <Select value={exercise} onValueChange={setExercise}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select exercise" />
            </SelectTrigger>
            <SelectContent>
              {exercises && exercises.length > 0 ? (
                exercises.map(e => (
                  <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="_none" disabled>No exercises — add in Exercises page</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Flight Type */}
        <div className="space-y-1.5">
          <Label>Flight Type</Label>
          <div className="flex gap-2">
            <button
              onClick={() => setFlightType('dual')}
              className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                flightType === 'dual'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
            >
              Dual
            </button>
            <button
              onClick={() => setFlightType('solo')}
              className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                flightType === 'solo'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
            >
              Solo
            </button>
          </div>
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="takeoff">Takeoff (HH:MM)</Label>
            <Input
              id="takeoff"
              value={takeoffTime}
              onChange={(e) => setTakeoffTime(e.target.value)}
              placeholder="09:00"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="landing">Landing (HH:MM)</Label>
            <Input
              id="landing"
              value={landingTime}
              onChange={(e) => setLandingTime(e.target.value)}
              placeholder="10:30"
              className="h-11"
            />
          </div>
        </div>

        {/* Total flight time display */}
        {takeoffTime && landingTime && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Flight Time</span>
            <span className="font-display font-bold text-primary text-xl">{totalFlightTime}</span>
          </div>
        )}

        {/* Landing Type */}
        <div className="space-y-1.5">
          <Label>Landing Type</Label>
          <div className="flex gap-2">
            <button
              onClick={() => setLandingType('day')}
              className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                landingType === 'day'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
            >
              ☀️ Day
            </button>
            <button
              onClick={() => setLandingType('night')}
              className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                landingType === 'night'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
            >
              🌙 Night
            </button>
          </div>
        </div>

        {/* Landing Count */}
        <div className="space-y-1.5">
          <Label htmlFor="landing-count">Landing Count</Label>
          <Input
            id="landing-count"
            type="number"
            min="1"
            value={landingCount}
            onChange={(e) => setLandingCount(e.target.value)}
            className="h-11"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/flight-records' })}
            className="flex-1 h-11"
          >
            View Records
          </Button>
          <Button
            onClick={handleSave}
            disabled={addFlightEntry.isPending}
            className="flex-1 h-11 font-display font-semibold"
          >
            {addFlightEntry.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Entry
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
