import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { FlightEntry, UserProfile, Category, AircraftSummary, StudentTotalHours } from '../backend';
import { toast } from 'sonner';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Categories ──────────────────────────────────────────────────────────────

export function useListCategories(categoryType: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['categories', categoryType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCategories(categoryType);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryType, name }: { categoryType: string; name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCategory(categoryType, name);
    },
    onSuccess: (_, { categoryType }) => {
      queryClient.invalidateQueries({ queryKey: ['categories', categoryType] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryType, name }: { categoryType: string; name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCategory(categoryType, name);
    },
    onSuccess: (_, { categoryType }) => {
      queryClient.invalidateQueries({ queryKey: ['categories', categoryType] });
    },
  });
}

// ─── Flight Entries ───────────────────────────────────────────────────────────

/**
 * Returns flight entries with their real backend storage keys as `id`.
 * The backend stores entries keyed by Time.now().toNat() (nanoseconds).
 * We use dateEpoch as a stable per-entry identifier since the backend
 * does not expose the storage key in getFlightEntries.
 */
export function useGetFlightEntries(filterMonth?: string, filterStudent?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<FlightEntry & { id: bigint }>>({
    queryKey: ['flightEntries', filterMonth, filterStudent],
    queryFn: async () => {
      if (!actor) return [];
      const entries = await actor.getFlightEntries(
        filterMonth || null,
        filterStudent || null
      );
      // Use dateEpoch as the entry identifier
      return entries.map((entry) => ({ ...entry, id: entry.dateEpoch }));
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllFlightEntries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<FlightEntry & { id: bigint }>>({
    queryKey: ['flightEntries', undefined, undefined],
    queryFn: async () => {
      if (!actor) return [];
      const entries = await actor.getFlightEntries(null, null);
      // Use dateEpoch as the entry identifier
      return entries.map((entry) => ({ ...entry, id: entry.dateEpoch }));
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddFlightEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: FlightEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addFlightEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flightEntries'] });
      queryClient.invalidateQueries({ queryKey: ['todayFlightHours'] });
      queryClient.invalidateQueries({ queryKey: ['monthFlightHours'] });
      queryClient.invalidateQueries({ queryKey: ['aircraftTotalHours'] });
      queryClient.invalidateQueries({ queryKey: ['studentTotalHours'] });
    },
  });
}

export function useEditFlightEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, updatedEntry }: { entryId: bigint; updatedEntry: FlightEntry }) => {
      if (!actor) throw new Error('Actor not available');
      // Ensure all FlightEntry fields have correct types before calling backend
      const entry: FlightEntry = {
        date: String(updatedEntry.date),
        dateEpoch: BigInt(updatedEntry.dateEpoch),
        student: String(updatedEntry.student),
        instructor: String(updatedEntry.instructor),
        aircraft: String(updatedEntry.aircraft),
        exercise: String(updatedEntry.exercise),
        flightType: updatedEntry.flightType,
        takeoffTime: String(updatedEntry.takeoffTime),
        landingTime: String(updatedEntry.landingTime),
        totalFlightTime: String(updatedEntry.totalFlightTime),
        landingType: updatedEntry.landingType,
        landingCount: BigInt(updatedEntry.landingCount),
      };
      // Use updateFlightEntry (correct backend method name)
      return actor.updateFlightEntry(BigInt(entryId), entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flightEntries'] });
      queryClient.invalidateQueries({ queryKey: ['todayFlightHours'] });
      queryClient.invalidateQueries({ queryKey: ['monthFlightHours'] });
      queryClient.invalidateQueries({ queryKey: ['aircraftTotalHours'] });
      queryClient.invalidateQueries({ queryKey: ['studentTotalHours'] });
      toast.success('Flight entry updated successfully');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to update flight entry';
      toast.error(message);
    },
  });
}

export function useDeleteFlightEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteFlightEntry(BigInt(entryId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flightEntries'] });
      queryClient.invalidateQueries({ queryKey: ['todayFlightHours'] });
      queryClient.invalidateQueries({ queryKey: ['monthFlightHours'] });
      queryClient.invalidateQueries({ queryKey: ['aircraftTotalHours'] });
      queryClient.invalidateQueries({ queryKey: ['studentTotalHours'] });
      toast.success('Flight entry deleted successfully');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to delete flight entry';
      toast.error(message);
    },
  });
}

// ─── Aircraft Total Hours ─────────────────────────────────────────────────────

export function useGetTotalFlightHoursByAircraft() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AircraftSummary[]>({
    queryKey: ['aircraftTotalHours'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTotalFlightHoursByAircraft();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Student Total Hours ──────────────────────────────────────────────────────

export function useGetStudentTotalHours() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentTotalHours[]>({
    queryKey: ['studentTotalHours'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTotalFlightHoursByStudent();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export function useTodayFlightHours() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['todayFlightHours'],
    queryFn: async () => {
      if (!actor) return 0;
      const today = new Date().toISOString().split('T')[0];
      const entries = await actor.getFlightEntries(null, null);
      const todayEntries = entries.filter(e => e.date === today);
      let totalMinutes = 0;
      for (const entry of todayEntries) {
        const parts = entry.totalFlightTime.split(':');
        if (parts.length === 2) {
          totalMinutes += parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      }
      return totalMinutes / 60;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useMonthFlightHours() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['monthFlightHours'],
    queryFn: async () => {
      if (!actor) return 0;
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const entries = await actor.getFlightEntries(month, null);
      let totalMinutes = 0;
      for (const entry of entries) {
        const parts = entry.totalFlightTime.split(':');
        if (parts.length === 2) {
          totalMinutes += parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      }
      return totalMinutes / 60;
    },
    enabled: !!actor && !actorFetching,
  });
}
