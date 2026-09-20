"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getSpaces,
  getSpace,
  getSpaceTypes,
  getActiveDiskon,
  checkAvailability,
  type Space,
  type Diskon,
  type Availability,
} from "@/lib/api";

export function useSpaces(params?: { tipe?: string; search?: string }) {
  return useQuery<Space[]>({
    queryKey: ["spaces", params?.tipe, params?.search],
    queryFn: () => getSpaces(params),
  });
}

export function useSpace(id: string | number | undefined) {
  return useQuery<Space>({
    queryKey: ["space", id],
    queryFn: () => getSpace(id!),
    enabled: Boolean(id),
  });
}

export function useSpaceTypes() {
  return useQuery<string[]>({
    queryKey: ["space-types"],
    queryFn: getSpaceTypes,
  });
}

export function useActiveDiskon() {
  return useQuery<Diskon[]>({
    queryKey: ["diskon-active"],
    queryFn: getActiveDiskon,
  });
}

export function useCheckAvailability(params: {
  id_space?: number | string;
  tanggal?: string;
  jam_mulai?: string;
  durasi_jam?: number | string;
}) {
  const enabled = Boolean(
    params.id_space && params.tanggal && params.jam_mulai && params.durasi_jam
  );

  return useQuery<Availability>({
    queryKey: [
      "availability",
      params.id_space,
      params.tanggal,
      params.jam_mulai,
      params.durasi_jam,
    ],
    queryFn: () =>
      checkAvailability({
        id_space: params.id_space!,
        tanggal: params.tanggal!,
        jam_mulai: params.jam_mulai!,
        durasi_jam: params.durasi_jam!,
      }),
    enabled,
    staleTime: 10000,
  });
}
