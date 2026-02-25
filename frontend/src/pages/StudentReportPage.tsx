import { useNavigate } from '@tanstack/react-router';
import { useGetStudentTotalHours } from '../hooks/useQueries';
import { ArrowLeft, BarChart2, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatHours } from '../utils/timeCalculations';

export default function StudentReportPage() {
  const navigate = useNavigate();
  const { data: studentHours, isLoading, isError } = useGetStudentTotalHours();

  const sorted = studentHours
    ? [...studentHours].sort((a, b) => b.totalFlightHours - a.totalFlightHours)
    : [];

  const grandTotal = sorted.reduce((sum, s) => sum + s.totalFlightHours, 0);

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
          <BarChart2 className="w-5 h-5 text-green-400" />
          <h1 className="font-display text-xl font-bold text-foreground">Student Report</h1>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-destructive p-6">
            <p className="font-display text-lg mb-1">Failed to load student report</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground p-6">
            <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-display text-lg mb-1">No flight data yet</p>
            <p className="text-sm">Add flight entries to see student hour totals.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-display text-xs w-12">#</TableHead>
                  <TableHead className="font-display text-xs">Student</TableHead>
                  <TableHead className="font-display text-xs text-right">Total Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((item, idx) => (
                  <TableRow key={item.student} className="hover:bg-muted/30">
                    <TableCell className="text-xs text-muted-foreground">
                      {idx === 0 ? (
                        <Trophy className="w-4 h-4 text-amber-400" />
                      ) : (
                        idx + 1
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-sm">{item.student}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-display font-bold text-green-400 text-sm">
                        {formatHours(item.totalFlightHours)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Grand total footer */}
            <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-muted/30">
              <span className="text-sm font-medium text-muted-foreground">
                Grand Total ({sorted.length} students)
              </span>
              <span className="font-display font-bold text-foreground text-base">
                {formatHours(grandTotal)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
