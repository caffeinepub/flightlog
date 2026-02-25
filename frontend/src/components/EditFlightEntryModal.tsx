import { useState, useEffect } from 'react';
import { useEditFlightEntry, useListCategories } from '../hooks/useQueries';
import { FlightEntry, Variant_day_night, Variant_dual_solo } from '../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { calcFlightTime } from '../utils/timeCalculations';
import { AlertCircle, Loader2 } from 'lucide-react';

interface EditFlightEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: (FlightEntry & { id: bigint }) | null;
}

export default function EditFlightEntryModal({ open, onOpenChange, entry }: EditFlightEntryModalProps) {
  const editFlightEntry = useEditFlightEntry();
  const { data: students } = useListCategories('student');
  const { data: instructors } = useListCategories('instructor');
  const { data: aircraftList } = useListCategories('aircraft');
  const { data: exercises } = useListCategories('exercise');

  const [date, setDate] = useState('');
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

  useEffect(() => {
    if (open && entry) {
      setDate(entry.date);
      setStudent(entry.student);
      setInstructor(entry.instructor);
      setAircraft(entry.aircraft);
      setExercise(entry.exercise);
      setFlightType(entry.flightType === Variant_dual_solo.solo ? 'solo' : 'dual');
      setTakeoffTime(entry.takeoffTime);
      setLandingTime(entry.landingTime);
      setLandingType(entry.landingType === Variant_day_night.night ? 'night' : 'day');
      setLandingCount(String(entry.landingCount));
      setFormError(null);
    } else if (!open) {
      setDate('');
      setStudent('');
      setInstructor('');
      setAircraft('');
      setExercise('');
      setFlightType('dual');
      setTakeoffTime('');
      setLandingTime('');
      setLandingType('day');
      setLandingCount('1');
      setFormError(null);
    }
  }, [open, entry]);

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
    if (!entry) return;

    setFormError(null);

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const updatedEntry: FlightEntry = {
      date: date,
      // Preserve the original dateEpoch (which IS the storage key for new entries)
      dateEpoch: entry.dateEpoch,
      student: student,
      instructor: instructor,
      aircraft: aircraft,
      exercise: exercise,
      flightType: flightType === 'solo' ? Variant_dual_solo.solo : Variant_dual_solo.dual,
      takeoffTime: takeoffTime,
      landingTime: landingTime,
      totalFlightTime: totalFlightTime,
      landingType: landingType === 'night' ? Variant_day_night.night : Variant_day_night.day,
      landingCount: BigInt(parseInt(landingCount)),
    };

    try {
      await editFlightEntry.mutateAsync({
        // Use entry.dateEpoch as the storage key (id) — this works for entries
        // added with the updated FlightLogEntryPage that sets dateEpoch = Date.now() in ns
        entryId: entry.dateEpoch,
        updatedEntry,
      });
      // Toast is handled in the mutation's onSuccess
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update flight entry';
      setFormError(message);
      // Toast is handled in the mutation's onError
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!editFlightEntry.isPending) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Flight Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Error display */}
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setFormError(null); }}
              className="h-11"
              disabled={editFlightEntry.isPending}
            />
          </div>

          {/* Student */}
          <div className="space-y-1.5">
            <Label>Student</Label>
            <Select
              value={student}
              onValueChange={(v) => { setStudent(v); setFormError(null); }}
              disabled={editFlightEntry.isPending}
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
              disabled={editFlightEntry.isPending}
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
              disabled={editFlightEntry.isPending}
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
              disabled={editFlightEntry.isPending}
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
                disabled={editFlightEntry.isPending}
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
                disabled={editFlightEntry.isPending}
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
              <Label htmlFor="edit-takeoff">Takeoff (HH:MM)</Label>
              <Input
                id="edit-takeoff"
                type="text"
                placeholder="09:00"
                value={takeoffTime}
                onChange={(e) => { setTakeoffTime(e.target.value); setFormError(null); }}
                className="h-11"
                disabled={editFlightEntry.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-landing">Landing (HH:MM)</Label>
              <Input
                id="edit-landing"
                type="text"
                placeholder="10:30"
                value={landingTime}
                onChange={(e) => { setLandingTime(e.target.value); setFormError(null); }}
                className="h-11"
                disabled={editFlightEntry.isPending}
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
                disabled={editFlightEntry.isPending}
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
                disabled={editFlightEntry.isPending}
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
            <Label htmlFor="edit-landingCount">Number of Landings</Label>
            <Input
              id="edit-landingCount"
              type="number"
              min="1"
              value={landingCount}
              onChange={(e) => { setLandingCount(e.target.value); setFormError(null); }}
              className="h-11"
              disabled={editFlightEntry.isPending}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={editFlightEntry.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={editFlightEntry.isPending}
          >
            {editFlightEntry.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
