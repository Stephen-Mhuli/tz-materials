"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuthContext } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import {
  fetchAdminUsers,
  resetUserPassword,
  setUserActive,
  setUserKycStatus,
} from "@/lib/api";
import type { User } from "@/lib/types";

type ResetState = {
  value: string;
  confirm: string;
  loading: boolean;
  error: string | null;
  success: string | null;
};

type KycState = {
  value: "inactive" | "pending" | "confirmed";
  loading: boolean;
  error: string | null;
  success: string | null;
};

export default function UsersPage() {
  return (
    <AuthGuard roles={["ops_admin"]}>
      <UsersManager />
    </AuthGuard>
  );
}

function UsersManager() {
  const { tokens } = useAuthContext();
  const { t } = useLocale();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [resetState, setResetState] = useState<Record<string, ResetState>>({});
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>(
    {},
  );
  const [kycState, setKycState] = useState<Record<string, KycState>>({});

  useEffect(() => {
    if (!tokens?.access) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminUsers(tokens.access);
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("users_load_failed"));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tokens?.access]);

  useEffect(() => {
    setKycState((prev) => {
      const next = { ...prev };
      users.forEach((user) => {
        const isSeller =
          user.role === "seller_admin" || user.role === "seller_staff";
        if (!isSeller || next[user.id]) return;
        next[user.id] = {
          value: (user.kyc_status || "pending") as KycState["value"],
          loading: false,
          error: null,
          success: null,
        };
      });
      return next;
    });
  }, [users]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => {
      return (
        user.full_name.toLowerCase().includes(term) ||
        user.phone.toLowerCase().includes(term) ||
        (user.email ?? "").toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    });
  }, [users, search]);

  const handleReset = async (userId: string) => {
    if (!tokens?.access) return;
    const state = resetState[userId];
    if (!state?.value || !state?.confirm) {
      setResetState((prev) => ({
        ...prev,
        [userId]: {
          value: state?.value ?? "",
          confirm: state?.confirm ?? "",
          loading: false,
          error: t("users_reset_missing"),
          success: null,
        },
      }));
      return;
    }
    if (state.value !== state.confirm) {
      setResetState((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          loading: false,
          error: t("users_reset_mismatch"),
          success: null,
        },
      }));
      return;
    }
    setResetState((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        loading: true,
        error: null,
        success: null,
      },
    }));
    try {
      await resetUserPassword(tokens.access, userId, state.value);
      setResetState((prev) => ({
        ...prev,
        [userId]: {
          value: "",
          confirm: "",
          loading: false,
          error: null,
          success: t("users_reset_success"),
        },
      }));
    } catch (err) {
      setResetState((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          loading: false,
          error: err instanceof Error ? err.message : t("users_reset_failed"),
          success: null,
        },
      }));
    }
  };

  const handleToggleActive = async (userId: string, nextActive: boolean) => {
    if (!tokens?.access) return;
    setUpdatingStatus((prev) => ({ ...prev, [userId]: true }));
    try {
      await setUserActive(tokens.access, userId, nextActive);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_active: nextActive } : user,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("users_status_failed"));
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleKycUpdate = async (userId: string) => {
    if (!tokens?.access) return;
    const state = kycState[userId];
    if (!state) return;
    setKycState((prev) => ({
      ...prev,
      [userId]: { ...state, loading: true, error: null, success: null },
    }));
    try {
      await setUserKycStatus(tokens.access, userId, state.value);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, kyc_status: state.value } : user,
        ),
      );
      setKycState((prev) => ({
        ...prev,
        [userId]: { ...state, loading: false, success: t("users_kyc_saved") },
      }));
    } catch (err) {
      setKycState((prev) => ({
        ...prev,
        [userId]: {
          ...state,
          loading: false,
          error: err instanceof Error ? err.message : t("users_kyc_failed"),
        },
      }));
    }
  };

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-6 py-8 shadow-soft sm:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("users_badge")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-primary">
          {t("users_title")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-secondary">
          {t("users_intro")}
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {t("users_search_label")}
            </p>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("users_search_placeholder")}
              className="mt-2 w-full rounded-full border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)]"
            />
          </div>
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3 text-sm text-secondary">
            {t("users_count", { count: filteredUsers.length })}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] shadow-soft">
          <div className="grid grid-cols-[1.1fr_1fr_1fr_1.2fr_1fr_1.3fr] gap-4 border-b border-[color:var(--border-muted)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            <span>{t("users_col_name")}</span>
            <span>{t("users_col_phone")}</span>
            <span>{t("users_col_role")}</span>
            <span>{t("users_col_status")}</span>
            <span>{t("users_col_account_status")}</span>
            <span>{t("users_col_actions")}</span>
          </div>
          {loading ? (
            <div className="px-5 py-6 text-sm text-muted">
              {t("users_loading")}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted">
              {t("users_empty")}
            </div>
          ) : (
            <div className="divide-y divide-[color:var(--border-muted)]">
              {filteredUsers.map((user) => {
                const state = resetState[user.id] ?? {
                  value: "",
                  confirm: "",
                  loading: false,
                  error: null,
                  success: null,
                };
                const isSeller =
                  user.role === "seller_admin" || user.role === "seller_staff";
                const kyc = kycState[user.id];
                return (
                  <div
                    key={user.id}
                    className="grid grid-cols-[1.1fr_1fr_1fr_1.2fr_1fr_1.3fr] gap-4 px-5 py-4 text-sm text-secondary"
                  >
                    <div>
                      <p className="font-semibold text-primary">{user.full_name}</p>
                      {user.email && (
                        <p className="text-xs text-muted">{user.email}</p>
                      )}
                    </div>
                    <div className="font-semibold text-primary">{user.phone}</div>
                    <div className="capitalize">{user.role.replace("_", " ")}</div>
                    <div className="space-y-2 text-xs uppercase tracking-[0.14em] text-muted">
                      {isSeller ? (
                        <>
                          <select
                            value={kyc?.value ?? "pending"}
                            onChange={(event) =>
                              setKycState((prev) => ({
                                ...prev,
                                [user.id]: {
                                  ...(kyc ?? {
                                    value: "pending",
                                    loading: false,
                                    error: null,
                                    success: null,
                                  }),
                                  value: event.target.value as KycState["value"],
                                  error: null,
                                  success: null,
                                },
                              }))
                            }
                            className="w-full rounded-full border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-1 text-[10px] font-semibold text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)]"
                          >
                            <option value="inactive">{t("users_kyc_inactive")}</option>
                            <option value="pending">{t("users_kyc_pending")}</option>
                            <option value="confirmed">{t("users_kyc_confirmed")}</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleKycUpdate(user.id)}
                            disabled={kyc?.loading}
                            className="inline-flex w-full items-center justify-center rounded-full border border-[color:var(--border-muted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {kyc?.loading
                              ? t("users_kyc_updating")
                              : t("users_kyc_save")}
                          </button>
                          {kyc?.error && (
                            <p className="text-[10px] text-red-500">{kyc.error}</p>
                          )}
                          {kyc?.success && (
                            <p className="text-[10px] text-emerald-500">{kyc.success}</p>
                          )}
                        </>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div className="flex items-start">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleActive(user.id, !(user.is_active ?? true))
                        }
                        disabled={updatingStatus[user.id]}
                        className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition ${
                          user.is_active ?? true
                            ? "border-emerald-300 text-emerald-600 hover:bg-emerald-500/10"
                            : "border-amber-300 text-amber-600 hover:bg-amber-500/10"
                        }`}
                      >
                        {updatingStatus[user.id]
                          ? t("users_status_updating")
                          : user.is_active ?? true
                            ? t("users_status_active")
                            : t("users_status_inactive")}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="password"
                        value={state.value}
                        onChange={(event) =>
                          setResetState((prev) => ({
                            ...prev,
                            [user.id]: {
                              ...state,
                              value: event.target.value,
                              error: null,
                              success: null,
                            },
                          }))
                        }
                        placeholder={t("users_reset_placeholder")}
                        className="w-full rounded-full border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-xs text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)]"
                      />
                      <input
                        type="password"
                        value={state.confirm}
                        onChange={(event) =>
                          setResetState((prev) => ({
                            ...prev,
                            [user.id]: {
                              ...state,
                              confirm: event.target.value,
                              error: null,
                              success: null,
                            },
                          }))
                        }
                        placeholder={t("users_reset_confirm_placeholder")}
                        className="w-full rounded-full border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-xs text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)]"
                      />
                      <button
                        type="button"
                        onClick={() => handleReset(user.id)}
                        disabled={state.loading}
                        className="inline-flex w-full items-center justify-center rounded-full border border-[color:var(--border-muted)] px-3 py-2 text-xs font-semibold text-primary transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {state.loading
                          ? t("users_resetting")
                          : t("users_reset_button")}
                      </button>
                      {state.error && (
                        <p className="text-xs text-red-500">{state.error}</p>
                      )}
                      {state.success && (
                        <p className="text-xs text-emerald-500">{state.success}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
