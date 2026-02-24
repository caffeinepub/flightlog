import type { FlightEntry } from '../backend';
import { Variant_dual_solo, Variant_day_night } from '../backend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FlightRecordsTableProps {
  entries: FlightEntry[];
}

export default function FlightRecordsTable({ entries }: FlightRecordsTableProps) {
  if (entries.length === 0) {
    return (
      <div className="aviation-card rounded-xl p-12 text-center">
        <div className="text-4xl mb-3">✈️</div>
        <p className="text-foreground font-medium">No flight records found</p>
        <p className="text-muted-foreground text-sm mt-1">
          Try adjusting your filters or log a new flight.
        </p>
      </div>
    );
  }

  return (
    <div className="aviation-card rounded-xl overflow-hidden">
      <ScrollArea className="w-full">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent"
                style={{ background: 'oklch(0.16 0.03 240)' }}
              >
                {['Date', 'Student', 'Instructor', 'Aircraft', 'Type', 'Exercise', 'Takeoff', 'Landing', 'Total', 'Landing Type', 'Count'].map(col => (
                  <TableHead key={col} className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap py-3"
                    style={{ color: 'oklch(0.55 0.08 230)' }}
                  >
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, idx) => (
                <TableRow
                  key={idx}
                  className="border-border transition-colors"
                  style={{
                    background: idx % 2 === 0 ? 'transparent' : 'oklch(0.17 0.025 240 / 0.5)',
                  }}
                >
                  <TableCell className="text-sm font-mono text-foreground whitespace-nowrap py-3">
                    {entry.date}
                  </TableCell>
                  <TableCell className="text-sm text-foreground whitespace-nowrap">
                    {entry.student}
                  </TableCell>
                  <TableCell className="text-sm text-foreground whitespace-nowrap">
                    {entry.instructor}
                  </TableCell>
                  <TableCell className="text-sm text-foreground whitespace-nowrap">
                    {entry.aircraft}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className={`status-badge ${entry.flightType === Variant_dual_solo.solo ? 'status-solo' : 'status-dual'}`}>
                      {entry.flightType === Variant_dual_solo.solo ? 'Solo' : 'Dual'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-foreground max-w-[120px] truncate">
                    {entry.exercise}
                  </TableCell>
                  <TableCell className="text-sm font-mono text-foreground whitespace-nowrap">
                    {entry.takeoffTime}
                  </TableCell>
                  <TableCell className="text-sm font-mono text-foreground whitespace-nowrap">
                    {entry.landingTime}
                  </TableCell>
                  <TableCell className="text-sm font-mono font-semibold whitespace-nowrap"
                    style={{ color: 'oklch(0.75 0.18 230)' }}
                  >
                    {entry.totalFlightTime}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className={`status-badge ${entry.landingType === Variant_day_night.day ? 'status-day' : 'status-night'}`}>
                      {entry.landingType === Variant_day_night.day ? 'Day' : 'Night'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-center text-foreground">
                    {entry.landingCount.toString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
