import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllFlightEntries } from '../hooks/useQueries';
import { FlightEntry } from '../backend';
import FlightRecordsTable from '../components/FlightRecordsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { exportToExcel } from '../utils/excelExport';
import { ArrowLeft, Search, X, Download, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface FlightEntryWithId extends FlightEntry {
  id: bigint;
}

export default function FlightRecordsPage() {
  const navigate = useNavigate();
  const { data: allEntries, isLoading, isError } = useGetAllFlightEntries();

  const [monthFilter, setMonthFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');

  const filteredEntries = useMemo<FlightEntryWithId[]>(() => {
    if (!allEntries) return [];
    return allEntries
      .filter(entry => {
        const monthMatch = !monthFilter || entry.date.startsWith(monthFilter.trim());
        const studentMatch = !studentFilter ||
          entry.student.toLowerCase().includes(studentFilter.trim().toLowerCase());
        return monthMatch && studentMatch;
      });
    // allEntries already has id: bigint (dateEpoch) from useGetAllFlightEntries
  }, [allEntries, monthFilter, studentFilter]);

  const handleReset = () => {
    setMonthFilter('');
    setStudentFilter('');
  };

  const handleExport = () => {
    if (filteredEntries.length === 0) {
      toast.error('No records to export');
      return;
    }
    const now = new Date();
    const filename = `flight-log-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.xlsx`;
    exportToExcel(filteredEntries, filename);
    toast.success(`Exported ${filteredEntries.length} records`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
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
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="font-display text-xl font-bold text-foreground">Flight Records</h1>
        </div>
        <div className="ml-auto">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              placeholder="Filter by month (YYYY-MM)"
              className="h-11"
            />
          </div>
          <div className="flex-1">
            <Input
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              placeholder="Filter by student name"
              className="h-11"
            />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleReset}
              className="h-11 gap-1.5 flex-1 sm:flex-none"
            >
              <X className="w-4 h-4" />
              Reset
            </Button>
            <Button
              className="h-11 gap-1.5 flex-1 sm:flex-none"
              onClick={() => {}} // filtering is reactive
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>

        {/* Filter summary */}
        {(monthFilter || studentFilter) && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing {filteredEntries.length} of {allEntries?.length ?? 0} records
            {monthFilter && ` · Month: ${monthFilter}`}
            {studentFilter && ` · Student: ${studentFilter}`}
          </p>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-destructive">
          <p className="font-display text-lg mb-1">Failed to load flight records</p>
          <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
        </div>
      ) : (
        <FlightRecordsTable entries={filteredEntries} />
      )}
    </div>
  );
}
