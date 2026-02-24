import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListCategories, useAddFlightEntry } from '../hooks/useQueries';
import { Variant_dual_solo, Variant_day_night } from '../backend';
import { calcFlightTime, dateToEpochNat, todayDateString } from '../utils/timeCalculations';
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
import { ArrowLeft, Plane, Clock, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function FlightLogEntryPage() {
  const navigate = useNavigate();
  const addFlightEntry = useAddFlightEntry();

  const { data: students = [] } = useListCategories('student');
  const { data: instructors = [] } = useListCategories('instructor');
  const { data: aircraftList = [] } = useListCategories('aircraft');
  const { data: exercises = [] } = useListCategories('exercise');

  const [date, setDate] = useState(todayDateString());
  const [student, setStudent] = useState('');
  const [instructor, setInstructor] = useState('');
  const [aircraft, setAircraft] = useState('');
  const [exercise, setExercise] = useState('');
  const [flightType, setFlightType] = useState<'solo' | 'dual'>('dual');
  const [takeoffTime, setTakeoffTime] = useState('');
  const [landingTime, setLandingTime] = useState('');
  const [landingType, setLandingType] = useState<'day' | 'night'>('day');
  const [landingCount, setLandingCount] = useState('1');
  const [totalTime, setTotalTime] = useState('');

  useEffect(() => {
    if (takeoffTime && landingTime) {
      const computed = calcFlightTime(takeoffTime, landingTime);
      setTotalTime(computed);
    } else {
      setTotalTime('');
    }
  }, [takeoffTime, landingTime]);

  const handleSave = async () => {
    if (!date || !student || !instructor || !aircraft || !exercise || !takeoffTime || !landingTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    const computed = calcFlightTime(takeoffTime, landingTime);
    if (!computed) {
      toast.error('Invalid takeoff or landing time format (use HH:MM)');
      return;
    }
    const count = parseInt(landingCount, 10);
    if (isNaN(count) || count < 0) {
      toast.error('Landing count must be a non-negative integer');
      return;
    }

    try {
      await addFlightEntry.mutateAsync({
        date,
        dateEpoch: dateToEpochNat(date),
        student,
        instructor,
        aircraft,
        exercise,
        flightType: flightType === 'solo' ? Variant_dual_solo.solo : Variant_dual_solo.dual,
        takeoffTime,
        landingTime,
        totalFlightTime: computed,
        landingType: landingType === 'day' ? Variant_day_night.day : Variant_day_night.night,
        landingCount: BigInt(count),
      });
      toast.success('Flight log saved successfully!');
      // Reset form
      setDate(todayDateString());
      setStudent('');
      setInstructor('');
      setAircraft('');
      setExercise('');
      setFlightType('dual');
      setTakeoffTime('');
      setLandingTime('');
      setLandingType('day');
      setLandingCount('1');
      setTotalTime('');
    } catch {
      toast.error('Failed to save flight log');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <button
          onClick={() => navigate({ to: '/' })}
          className="p-2 rounded-lg hover:bg-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-muted-foreground" />
        </button>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'oklch(0.62 0.18 230 / 0.15)' }}
        >
          <Plane size={18} style={{ color: 'oklch(0.62 0.18 230)' }} />
        </div>
        <h1 className="page-title">New Flight Log</h1>
      </div>

      <div className="space-y-5">
        {/* Date & Flight Info */}
        <div className="aviation-card rounded-xl p-5 space-y-4">
          <p className="section-label">Flight Information</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-[44px] bg-input border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Flight Type *</Label>
              <div className="flex gap-2 min-h-[44px]">
                {(['dual', 'solo'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFlightType(type)}
                    className="flex-1 rounded-lg text-sm font-semibold capitalize transition-all min-h-[44px]"
                    style={{
                      background: flightType === type
                        ? (type === 'solo' ? 'oklch(0.62 0.18 230 / 0.25)' : 'oklch(0.70 0.15 180 / 0.25)')
                        : 'oklch(0.22 0.04 240)',
                      color: flightType === type
                        ? (type === 'solo' ? 'oklch(0.75 0.18 230)' : 'oklch(0.72 0.15 180)')
                        : 'oklch(0.6 0.04 230)',
                      border: `1px solid ${flightType === type
                        ? (type === 'solo' ? 'oklch(0.62 0.18 230 / 0.4)' : 'oklch(0.70 0.15 180 / 0.4)')
                        : 'oklch(0.28 0.04 240)'}`,
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Student *</Label>
              <Select value={student} onValueChange={setStudent}>
                <SelectTrigger className="min-h-[44px] bg-input border-border">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {students.length === 0 ? (
                    <SelectItem value="_none" disabled>No students added yet</SelectItem>
                  ) : (
                    students.map(s => (
                      <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Instructor *</Label>
              <Select value={instructor} onValueChange={setInstructor}>
                <SelectTrigger className="min-h-[44px] bg-input border-border">
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {instructors.length === 0 ? (
                    <SelectItem value="_none" disabled>No instructors added yet</SelectItem>
                  ) : (
                    instructors.map(i => (
                      <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Aircraft *</Label>
              <Select value={aircraft} onValueChange={setAircraft}>
                <SelectTrigger className="min-h-[44px] bg-input border-border">
                  <SelectValue placeholder="Select aircraft" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {aircraftList.length === 0 ? (
                    <SelectItem value="_none" disabled>No aircraft added yet</SelectItem>
                  ) : (
                    aircraftList.map(a => (
                      <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Exercise *</Label>
              <Select value={exercise} onValueChange={setExercise}>
                <SelectTrigger className="min-h-[44px] bg-input border-border">
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {exercises.length === 0 ? (
                    <SelectItem value="_none" disabled>No exercises added yet</SelectItem>
                  ) : (
                    exercises.map(e => (
                      <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Times */}
        <div className="aviation-card rounded-xl p-5 space-y-4">
          <p className="section-label flex items-center gap-2">
            <Clock size={12} />
            Flight Times
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Takeoff Time *</Label>
              <Input
                type="time"
                value={takeoffTime}
                onChange={(e) => setTakeoffTime(e.target.value)}
                placeholder="HH:MM"
                className="min-h-[44px] bg-input border-border font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Landing Time *</Label>
              <Input
                type="time"
                value={landingTime}
                onChange={(e) => setLandingTime(e.target.value)}
                placeholder="HH:MM"
                className="min-h-[44px] bg-input border-border font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Total Flight Time</Label>
              <div className="min-h-[44px] flex items-center px-3 rounded-lg border font-mono text-sm font-semibold"
                style={{
                  background: 'oklch(0.62 0.18 230 / 0.08)',
                  borderColor: 'oklch(0.62 0.18 230 / 0.3)',
                  color: totalTime ? 'oklch(0.75 0.18 230)' : 'oklch(0.5 0.04 230)',
                }}
              >
                {totalTime || '—:——'}
              </div>
            </div>
          </div>
        </div>

        {/* Landing Details */}
        <div className="aviation-card rounded-xl p-5 space-y-4">
          <p className="section-label">Landing Details</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Landing Type *</Label>
              <div className="flex gap-2 min-h-[44px]">
                {(['day', 'night'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setLandingType(type)}
                    className="flex-1 rounded-lg text-sm font-semibold capitalize transition-all min-h-[44px]"
                    style={{
                      background: landingType === type
                        ? (type === 'day' ? 'oklch(0.75 0.15 80 / 0.2)' : 'oklch(0.55 0.12 280 / 0.2)')
                        : 'oklch(0.22 0.04 240)',
                      color: landingType === type
                        ? (type === 'day' ? 'oklch(0.78 0.15 80)' : 'oklch(0.72 0.12 280)')
                        : 'oklch(0.6 0.04 230)',
                      border: `1px solid ${landingType === type
                        ? (type === 'day' ? 'oklch(0.75 0.15 80 / 0.4)' : 'oklch(0.55 0.12 280 / 0.4)')
                        : 'oklch(0.28 0.04 240)'}`,
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Landing Count *</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={landingCount}
                onChange={(e) => setLandingCount(e.target.value.replace(/[^0-9]/g, ''))}
                className="min-h-[44px] bg-input border-border"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={addFlightEntry.isPending}
          className="w-full min-h-[52px] text-base font-semibold gap-2 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, oklch(0.62 0.18 230) 0%, oklch(0.55 0.2 225) 100%)',
            color: 'oklch(0.98 0.005 220)',
            boxShadow: '0 4px 20px oklch(0.62 0.18 230 / 0.35)',
          }}
        >
          {addFlightEntry.isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving Flight Log...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Flight Log
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
