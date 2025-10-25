"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuthContext } from "@/context/AuthContext";
import {
  createSellerProfile,
  fetchSellerProfile,
  type CreateSellerPayload,
  updateSellerProfile,
  fetchSellerInvitations,
  createSellerInvitation,
  cancelSellerInvitation,
} from "@/lib/api";
import type { Seller, SellerInvitation, SellerMember } from "@/lib/types";

export default function SellerPage() {
  return (
    <AuthGuard roles={["seller_admin", "ops_admin"]}>
      <SellerManager />
    </AuthGuard>
  );
}

function SellerManager() {
  const { tokens, user } = useAuthContext();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [invitations, setInvitations] = useState<SellerInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<CreateSellerPayload>({
    business_name: "",
    phone: "",
    email: "",
    tin: "",
    address: "",
    verified: false,
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [inviteSaving, setInviteSaving] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({ email: "", phone: "" });
  const invitationBase = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    if (!tokens?.access) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSellerProfile(tokens.access);
        if (data.length > 0) {
          const existing = data[0];
          setSeller(existing);
          setFormState({
            business_name: existing.business_name,
            phone: existing.phone,
            email: existing.email ?? "",
            tin: existing.tin ?? "",
            address: existing.address ?? "",
            verified: existing.verified,
          });
          const invites = await fetchSellerInvitations(tokens.access);
          setInvitations(invites);
        } else {
          setSeller(null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load seller profile.",
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tokens?.access]);

  const membership = useMemo(() => {
    if (!seller || !user) return null;
    return seller.members.find((member) => member.user.id === user.id) ?? null;
  }, [seller, user]);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    if (user.role === "ops_admin" || user.role === "seller_admin") return true;
    return membership?.role === "admin";
  }, [membership, user]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tokens?.access) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await createSellerProfile(tokens.access, formState);
      const refreshed = await fetchSellerProfile(tokens.access);
      setSeller(refreshed[0] ?? null);
      setSuccessMessage("Seller profile created successfully.");
      const invites = await fetchSellerInvitations(tokens.access);
      setInvitations(invites);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create seller profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tokens?.access || !seller) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const payload: Partial<CreateSellerPayload> = {
        business_name: formState.business_name,
        phone: formState.phone,
        email: formState.email,
        tin: formState.tin,
        address: formState.address,
        verified: formState.verified,
      };
      await updateSellerProfile(tokens.access, seller.id, payload);
      const refreshed = await fetchSellerProfile(tokens.access);
      setSeller(refreshed[0] ?? null);
      setSuccessMessage("Seller profile updated.");
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update seller profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tokens?.access) return;
    setInviteSaving(true);
    setInviteMessage(null);
    setInviteError(null);
    try {
      const created = await createSellerInvitation(tokens.access, inviteForm);
      setInvitations((prev) => [created, ...prev]);
      setInviteMessage("Invitation sent successfully.");
      setInviteForm({ email: "", phone: "" });
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Failed to send invitation.",
      );
    } finally {
      setInviteSaving(false);
    }
  };

  const handleCancelInvite = async (invitationId: number) => {
    if (!tokens?.access) return;
    try {
      await cancelSellerInvitation(tokens.access, invitationId);
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId
            ? { ...inv, status: "cancelled" }
            : inv,
        ),
      );
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Failed to cancel invitation.",
      );
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 text-sm text-muted shadow-soft">
        Loading seller profile...
      </div>
    );
  }

  if (!seller && !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Seller tools
        </p>
        <h1 className="text-3xl font-semibold text-primary">
          Manage your business profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-secondary">
          Keep your organisation details up to date, invite team members, and publish catalogue entries.
        </p>
      </header>

      {error && (
        <div className="rounded-3xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {seller && !editing ? (
        <div className="rounded-3xl border border-[color:var(--border-muted)] bg-brand-soft p-6 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Active seller profile
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-primary">
                {seller.business_name}
              </h2>
              <dl className="mt-3 space-y-2 text-sm text-secondary">
                <Row label="Phone" value={seller.phone} />
                {seller.email && <Row label="Email" value={seller.email} />}
                {seller.address && <Row label="Address" value={seller.address} />}
                <Row label="Verified" value={seller.verified ? "Yes" : "No"} />
              </dl>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setSuccessMessage(null);
                  setError(null);
                }}
                className="rounded-full border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-4 py-2 text-xs font-semibold text-primary transition hover:bg-brand-soft"
              >
                Edit profile
              </button>
            )}
          </div>
        </div>
      ) : (
        <form
          onSubmit={seller ? handleUpdate : handleCreate}
          className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold text-primary">
            {seller ? "Update seller profile" : "Create seller profile"}
          </h2>
          <p className="mt-2 text-sm text-secondary">
            Provide the details your buyers need. LMGa verifies this information before catalogues go live.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <InputField
              label="Business name"
              required
              value={formState.business_name}
              onChange={(value) =>
                setFormState((prev) => ({ ...prev, business_name: value }))
              }
              placeholder="LMGa Aggregates Depot"
            />
            <InputField
              label="Business phone"
              required
              value={formState.phone}
              onChange={(value) =>
                setFormState((prev) => ({ ...prev, phone: value }))
              }
              placeholder="+255700000002"
            />
            <InputField
              label="Email"
              value={formState.email ?? ""}
              onChange={(value) =>
                setFormState((prev) => ({ ...prev, email: value }))
              }
              placeholder="operations@lmga.co.tz"
            />
            <InputField
              label="TIN (optional)"
              value={formState.tin ?? ""}
              onChange={(value) =>
                setFormState((prev) => ({ ...prev, tin: value }))
              }
              placeholder="123-456-789"
            />
            <InputField
              label="Address"
              value={formState.address ?? ""}
              onChange={(value) =>
                setFormState((prev) => ({ ...prev, address: value }))
              }
              placeholder="Plot 21, Nyerere Road, Dar es Salaam"
              multiline
              className="sm:col-span-2"
            />
            {isAdmin && (
              <label className="flex items-center gap-2 text-sm font-medium text-primary">
                <input
                  type="checkbox"
                  checked={formState.verified ?? false}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, verified: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-[color:var(--border-muted)] text-[color:var(--brand)] focus:ring-[color:var(--brand)]"
                />
                Mark seller as verified
              </label>
            )}
          </div>

          {successMessage && (
            <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
              {successMessage}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.01] hover:shadow-strong disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[color:var(--brand-strong)]"
            >
              {saving ? "Saving..." : seller ? "Save changes" : "Create seller profile"}
            </button>
            {seller && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setSuccessMessage(null);
                  setError(null);
                  setFormState({
                    business_name: seller.business_name,
                    phone: seller.phone,
                    email: seller.email ?? "",
                    tin: seller.tin ?? "",
                    address: seller.address ?? "",
                    verified: seller.verified,
                  });
                }}
                className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-sm font-semibold text-primary transition hover:bg-brand-soft"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {seller && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 shadow-soft">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              Team members
            </h3>
            {seller.members.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No team members yet.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-secondary">
                {seller.members.map((member: SellerMember) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-primary">{member.user.full_name}</p>
                      <p className="text-xs text-muted">{member.user.phone}</p>
                    </div>
                    <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      {member.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isAdmin && (
            <div className="space-y-6">
              <form
                onSubmit={handleInvite}
                className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 shadow-soft"
              >
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                  Invite team member
                </h3>
                <p className="mt-2 text-sm text-secondary">
                  Team members receive a unique link to create their seller-staff account. Because email delivery isn&apos;t wired up yet, copy the generated link below or send it manually.
                </p>
                <div className="mt-4 grid gap-4">
                  <InputField
                    label="Email"
                    required
                    value={inviteForm.email}
                    onChange={(value) =>
                      setInviteForm((prev) => ({ ...prev, email: value }))
                    }
                    placeholder="team.member@lmga.co.tz"
                  />
                  <InputField
                    label="Phone"
                    required
                    value={inviteForm.phone}
                    onChange={(value) =>
                      setInviteForm((prev) => ({ ...prev, phone: value }))
                    }
                    placeholder="+255700000009"
                  />
                </div>
                {inviteMessage && (
                  <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-500">
                    {inviteMessage}
                  </div>
                )}
                {inviteError && (
                  <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-500">
                    {inviteError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={inviteSaving}
                  className="mt-4 inline-flex items-center rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.01] hover:shadow-strong disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[color:var(--brand-strong)]"
                >
                  {inviteSaving ? "Sending invite..." : "Send invitation"}
                </button>
              </form>

              <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 shadow-soft">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                  Pending invitations
                </h3>
                {invitations.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">No invitations have been sent.</p>
                ) : (
                  <ul className="mt-3 space-y-3 text-sm text-secondary">
                    {invitations.map((invitation) => (
                      <li
                        key={invitation.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3"
                      >
                        <div className="flex-1 min-w-[180px]">
                          <p className="font-semibold text-primary">{invitation.email}</p>
                          <p className="text-xs text-muted">{invitation.phone}</p>
                          <p className="text-xs text-muted">
                            Status: {invitation.status}
                          </p>
                          {invitation.status === "pending" && (
                            <p className="mt-1 text-xs text-[color:var(--brand)] break-all">
                              Share link: {`${invitationBase}/invite/${invitation.token}`}
                            </p>
                          )}
                        </div>
                        {invitation.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => handleCancelInvite(invitation.id)}
                            className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-500/10"
                          >
                            Cancel
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  className?: string;
};

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
  multiline,
  className,
}: InputFieldProps) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <label className="text-sm font-medium text-primary">
        {label}
        {required ? " *" : ""}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-semibold text-primary">{label}:</span> {value}
    </div>
  );
}
