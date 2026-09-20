"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminProfile,
  updateAdminProfile,
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getAdminSpaces,
  createSpace,
  updateSpace,
  deleteSpace,
  getAdminDiskon,
  createDiskon,
  updateDiskon,
  deleteDiskon,
  getAdminReservasi,
  updateStatusReservasi,
  checkIn,
  checkOut,
  getMonthlyReport,
  getIncomeReport,
  type Member,
  type Space,
  type Diskon,
  type Reservasi,
  type SpacePayload,
  type DiskonPayload,
  type RegisterMemberPayload,
} from "@/lib/api";

/* --- Profile --- */
export function useAdminProfile(enabled = true) {
  return useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled,
  });
}

export function useUpdateAdminProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    },
  });
}

/* --- Members --- */
export function useAdminMembers(search?: string, enabled = true) {
  return useQuery<Member[]>({
    queryKey: ["admin-members", search],
    queryFn: () => getMembers(search),
    enabled,
  });
}

export function useAdminMemberDetail(id: string | number, enabled = true) {
  return useQuery<Member>({
    queryKey: ["admin-member", id],
    queryFn: () => getMember(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterMemberPayload) => createMember(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

export function useUpdateMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<RegisterMemberPayload>;
    }) => updateMember(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

export function useDeleteMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

/* --- Spaces --- */
export function useAdminSpaces(enabled = true) {
  return useQuery<Space[]>({
    queryKey: ["admin-spaces"],
    queryFn: getAdminSpaces,
    enabled,
  });
}

export function useCreateSpaceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SpacePayload) => createSpace(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}

export function useUpdateSpaceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<SpacePayload>;
    }) => updateSpace(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}

export function useDeleteSpaceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteSpace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}

/* --- Diskon --- */
export function useAdminDiskon(enabled = true) {
  return useQuery<Diskon[]>({
    queryKey: ["admin-diskon"],
    queryFn: getAdminDiskon,
    enabled,
  });
}

export function useCreateDiskonMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DiskonPayload) => createDiskon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-diskon"] });
      queryClient.invalidateQueries({ queryKey: ["diskon-active"] });
    },
  });
}

export function useUpdateDiskonMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<DiskonPayload>;
    }) => updateDiskon(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-diskon"] });
      queryClient.invalidateQueries({ queryKey: ["diskon-active"] });
    },
  });
}

export function useDeleteDiskonMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteDiskon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-diskon"] });
      queryClient.invalidateQueries({ queryKey: ["diskon-active"] });
    },
  });
}

/* --- Reservasi Admin --- */
export function useAdminReservasi(
  params?: {
    month?: number | string;
    year?: number | string;
    status?: string;
    id_space?: number | string;
    tanggal?: string;
  },
  enabled = true
) {
  return useQuery<Reservasi[]>({
    queryKey: [
      "admin-reservasi",
      params?.month,
      params?.year,
      params?.status,
      params?.id_space,
      params?.tanggal,
    ],
    queryFn: () => getAdminReservasi(params),
    enabled,
  });
}

export function useUpdateStatusReservasiMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) =>
      updateStatusReservasi(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reservasi"] });
    },
  });
}

export function useCheckInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => checkIn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reservasi"] });
    },
  });
}

export function useCheckOutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reservasi"] });
    },
  });
}

/* --- Reports --- */
export function useAdminMonthlyReport(
  params: { month: number | string; year: number | string },
  enabled = true
) {
  return useQuery({
    queryKey: ["admin-report-monthly", params.month, params.year],
    queryFn: () => getMonthlyReport(params),
    enabled,
  });
}

export function useAdminIncomeReport(
  params: { month: number | string; year: number | string },
  enabled = true
) {
  return useQuery({
    queryKey: ["admin-report-income", params.month, params.year],
    queryFn: () => getIncomeReport(params),
    enabled,
  });
}
