"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyReservasi,
  getMyHistory,
  getETicket,
  getReservasi,
  cancelReservasi,
  createReservasi,
  type Reservasi,
  type ETicket,
  type CreateReservasiPayload,
} from "@/lib/api";

export function useMyReservasi(enabled = true) {
  return useQuery<Reservasi[]>({
    queryKey: ["my-reservations"],
    queryFn: getMyReservasi,
    enabled,
  });
}

export function useMyHistory(
  params: { month: number | string; year: number | string },
  enabled = true
) {
  return useQuery<Reservasi[]>({
    queryKey: ["my-history", params.month, params.year],
    queryFn: () => getMyHistory(params),
    enabled,
  });
}

export function useReservasiDetail(id: string | number, enabled = true) {
  return useQuery<Reservasi>({
    queryKey: ["reservasi", id],
    queryFn: () => getReservasi(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useETicket(id: string | number, enabled = true) {
  return useQuery<ETicket>({
    queryKey: ["e-ticket", id],
    queryFn: () => getETicket(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateReservasiMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReservasiPayload) => createReservasi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    },
  });
}

export function useCancelReservasiMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => cancelReservasi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["my-history"] });
    },
  });
}
