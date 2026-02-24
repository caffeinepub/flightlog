import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Category, FlightEntry, UserProfile } from '../backend';

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

export function useAddCategory(categoryType: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCategory(categoryType, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', categoryType] });
    },
  });
}

export function useDeleteCategory(categoryType: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCategory(categoryType, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', categoryType] });
    },
  });
}

// ─── Flight Entries ───────────────────────────────────────────────────────────

export function useGetFlightEntries(filterMonth?: string, filterStudent?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FlightEntry[]>({
    queryKey: ['flightEntries', filterMonth ?? null, filterStudent ?? null],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFlightEntries(
        filterMonth && filterMonth.trim() ? filterMonth.trim() : null,
        filterStudent && filterStudent.trim() ? filterStudent.trim() : null
      );
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
    },
  });
}
