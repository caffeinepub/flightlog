import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetFlightEntries } from '../hooks/useQueries';
import FlightRecordsTable from '../components/FlightRecordsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, RotateCcw, ClipboardList } from 'lucide-react';

export default function FlightRecordsPage() {
  const navigate = useNavigate();
  const [monthInput, setMonthInput] = useState('');
  const [studentInput, setStudentInput] = useState('');
  const [activeMonth, setActiveMonth] = useState<string | undefined>(undefined);
  const [activeStudent, setActiveStudent] = useState<string | undefined>(undefined);

  const { data: entries = [], isLoading } = useGetFlightEntries(activeMonth, activeStudent);

  const handleSearch = () => {
    setActiveMonth(monthInput.trim() || undefined);
    setActiveStudent(studentInput.trim() || undefined);
  };

  const handleReset = () => {
    setMonthInput('');
    setStudentInput('');
    setActiveMonth(undefined);
    setActiveStudent(undefined);
  };

  const isFiltered = !!activeMonth || !!activeStudent;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <button
          onClick={() => navigate({ to: '/' })}
          className="p-2 rounded-lg hover:bg-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-muted-foreground" />
        </button>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'oklch(0.70 0.15 180 / 0.15)' }}
        >
          <ClipboardList size={18} style={{ color: 'oklch(0.70 0.15 180)' }} />
        </div>
        <h1 className="page-title">Flight Records</h1>
        {entries.length > 0 && (
          <span className="ml-auto text-sm font-medium px-3 py-1 rounded-full"
            style={{ background: 'oklch(0.70 0.15 180 / 0.15)', color: 'oklch(0.72 0.15 180)' }}
          >
            {entries.length} {entries.length === 1 ? 'record' : 'records'}
          </span>
        )}
      </div>

      {/* Filter Panel */}
      <div className="aviation-card rounded-xl p-5 mb-6">
        <p className="section-label">Filter Records</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Month (YYYY-MM)</Label>
            <Input
              value={monthInput}
              onChange={(e) => setMonthInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 2026-02"
              className="min-h-[44px] bg-input border-border font-mono"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Student Name</Label>
            <Input
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by student name"
              className="min-h-[44px] bg-input border-border"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              onClick={handleSearch}
              className="min-h-[44px] px-5 gap-2"
              style={{
                background: 'linear-gradient(135deg, oklch(0.62 0.18 230) 0%, oklch(0.55 0.2 225) 100%)',
                color: 'oklch(0.98 0.005 220)',
              }}
            >
              <Search size={15} />
              Search
            </Button>
            {isFiltered && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="min-h-[44px] px-4 gap-2 border-border hover:bg-accent"
              >
                <RotateCcw size={14} />
                Reset
              </Button>
            )}
          </div>
        </div>

        {isFiltered && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeMonth && (
              <span className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'oklch(0.62 0.18 230 / 0.15)', color: 'oklch(0.75 0.18 230)' }}
              >
                Month: {activeMonth}
              </span>
            )}
            {activeStudent && (
              <span className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'oklch(0.70 0.15 180 / 0.15)', color: 'oklch(0.72 0.15 180)' }}
              >
                Student: {activeStudent}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="aviation-card rounded-xl p-6 space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" style={{ background: 'oklch(0.22 0.04 240)' }} />
          ))}
        </div>
      ) : (
        <FlightRecordsTable entries={entries} />
      )}
    </div>
  );
}
