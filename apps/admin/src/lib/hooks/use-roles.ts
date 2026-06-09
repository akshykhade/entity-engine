"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMyRoles, fetchRoles } from "@/lib/api/roles";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });
}

export function useMyRoles() {
  return useQuery({
    queryKey: ["roles", "me"],
    queryFn: fetchMyRoles,
  });
}
