"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";

type AuthGuardProps = {
  children: React.ReactNode;
  roles?: UserRole[];
  fallback?: React.ReactNode;
};

export function AuthGuard({ children, roles, fallback }: AuthGuardProps) {
  const { isAuthenticated, user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-sm text-slate-500">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ?? null;
  }

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
        You do not have the permissions required to view this section.
      </div>
    );
  }

  return <>{children}</>;
}
