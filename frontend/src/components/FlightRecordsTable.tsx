import { useState } from 'react';
import { FlightEntry } from '../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import EditFlightEntryModal from './EditFlightEntryModal';
import { useDeleteFlightEntry } from '../hooks/useQueries';
import { Edit2, Trash2, Loader2 } from 'lucide-react';

interface FlightEntryWithId extends FlightEntry {
  id: bigint;
}

interface FlightRecordsTableProps {
  entries: FlightEntryWithId[];
}

export default function FlightRecordsTable({ entries }: FlightRecordsTableProps) {
  const deleteFlightEntry = useDeleteFlightEntry();
  const [editEntry, setEditEntry] = useState<FlightEntryWithId | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FlightEntryWithId | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEdit = (entry: FlightEntryWithId) => {
    setEditEntry(entry);
    setEditOpen(true);
  };

  const handleDeleteClick = (entry: FlightEntryWithId) => {
    setDeleteTarget(entry);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      // Use dateEpoch as the storage key — this matches the key set in FlightLogEntryPage
      await deleteFlightEntry.mutateAsync(deleteTarget.dateEpoch);
      // Toast is handled in the mutation's onSuccess
    } catch {
      // Toast is handled in the mutation's onError
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-display mb-1">No flight records found</p>
        <p className="text-sm">Try adjusting your filters or add a new flight entry.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="whitespace-nowrap font-display text-xs">Date</TableHead>
              <TableHead className="whitespace-nowrap font-display text-xs">Student</TableHead>
              <TableHead className="whitespace-nowrap font-display text-xs">Instructor</TableHead>
              <TableHead className="whitespace-nowrap font-display text-xs">Aircraft</TableHead>
              <TableHead className="whitespace-nowrap font-display text-xs">Type</TableHead>
              <TableHead className="whitespace-nowrap font-display text-xs">Exercise</TableHead>
              <TableHead className="whitespace-nowrap font-display text-xs">Takeoff</TableHead>
              <TableHead className="whitespace-nowrap font-display text-xs">Landing</TableHead>
              <TableHead className="whitespace-nowrap font-display text-xs">Total</TableHead>
              <TableHead className="whitespace-nowrap font-display text-xs">Ldg Type</TableHead>
              <TableHead className="whitespace-nowrap font-display text-xs">Ldg #</TableHead>
              <TableHead className="whitespace-nowrap font-display text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, idx) => (
              <TableRow key={`${String(entry.dateEpoch)}-${idx}`} className="hover:bg-muted/30">
                <TableCell className="whitespace-nowrap text-xs">{entry.date}</TableCell>
                <TableCell className="whitespace-nowrap text-xs font-medium">{entry.student}</TableCell>
                <TableCell className="whitespace-nowrap text-xs">{entry.instructor}</TableCell>
                <TableCell className="whitespace-nowrap text-xs">{entry.aircraft}</TableCell>
                <TableCell className="whitespace-nowrap text-xs">
                  <Badge variant={entry.flightType === 'solo' ? 'default' : 'secondary'} className="text-xs">
                    {entry.flightType === 'solo' ? 'Solo' : 'Dual'}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs max-w-[120px] truncate">{entry.exercise}</TableCell>
                <TableCell className="whitespace-nowrap text-xs">{entry.takeoffTime}</TableCell>
                <TableCell className="whitespace-nowrap text-xs">{entry.landingTime}</TableCell>
                <TableCell className="whitespace-nowrap text-xs font-bold text-primary">{entry.totalFlightTime}</TableCell>
                <TableCell className="whitespace-nowrap text-xs">
                  <Badge variant={entry.landingType === 'night' ? 'outline' : 'secondary'} className="text-xs">
                    {entry.landingType === 'night' ? '🌙 Night' : '☀️ Day'}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-center">{String(entry.landingCount)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(entry)}
                      aria-label="Edit entry"
                      disabled={deleteFlightEntry.isPending}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive"
                      aria-label="Delete entry"
                      onClick={() => handleDeleteClick(entry)}
                      disabled={deleteFlightEntry.isPending}
                    >
                      {deleteFlightEntry.isPending && deleteTarget?.dateEpoch === entry.dateEpoch ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Controlled delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flight Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the flight entry
              {deleteTarget ? ` for ${deleteTarget.student} on ${deleteTarget.date}` : ''}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteFlightEntry.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteFlightEntry.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteFlightEntry.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditFlightEntryModal
        key={editEntry ? String(editEntry.dateEpoch) : 'none'}
        open={editOpen}
        onOpenChange={setEditOpen}
        entry={editEntry}
      />
    </>
  );
}
