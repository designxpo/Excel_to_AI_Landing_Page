"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, KeyRound, UserCheck, UserX, Copy, Check, X } from "lucide-react";

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
  createdBy: string | null;
  lastLoginAt: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function TeamTab() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // Password reveal modal (shown once when a password is generated)
  const [revealedPassword, setRevealedPassword] = useState<{
    email: string;
    password: string;
    context: "created" | "reset";
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Per-row pending action
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/team", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AdminUser[] = await res.json();
      setAdmins(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load admins. Check the server log.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim(), name: newName.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      setRevealedPassword({
        email: body.admin.email,
        password: body.password,
        context: "created",
      });
      setNewEmail("");
      setNewName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admin");
    } finally {
      setCreating(false);
    }
  }

  async function handleAction(
    id: string,
    action: "deactivate" | "reactivate" | "reset_password" | "delete",
    email: string,
  ) {
    if (action === "delete") {
      if (!confirm(`Permanently delete ${email}? This cannot be undone.`)) return;
    }
    if (action === "reset_password") {
      if (!confirm(`Generate a new password for ${email}? The existing password stops working immediately.`)) return;
    }

    setPendingId(id);
    setError(null);
    try {
      const url = `/api/admin/team/${id}`;
      const res = await fetch(url, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: action === "delete" ? undefined : JSON.stringify({ action }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);

      if (action === "reset_password" && body.password) {
        setRevealedPassword({ email, password: body.password, context: "reset" });
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setPendingId(null);
    }
  }

  function copyPassword() {
    if (!revealedPassword) return;
    navigator.clipboard.writeText(revealedPassword.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-lg font-bold mb-1 text-[#003368]">Team Access</h2>
      <p className="text-sm text-slate-500 mb-6">
        Add admins, reset their passwords, or revoke access. Generated passwords are shown once — share them through a secure channel.
      </p>

      {/* Add admin form */}
      <form
        onSubmit={handleCreate}
        className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 space-y-4"
      >
        <h3 className="text-sm font-bold text-[#003368] uppercase tracking-wider">Add admin</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-600 uppercase tracking-wide">Email</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="teammate@analytixlabs.co.in"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00DF83]/50 focus:border-[#00DF83] bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-600 uppercase tracking-wide">
              Name <span className="font-normal text-slate-400 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tanvi Sharma"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00DF83]/50 focus:border-[#00DF83] bg-white"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-[#003368] hover:bg-[#002244] text-white font-bold py-2 px-5 rounded-lg text-sm transition-all flex items-center gap-2 disabled:opacity-60"
        >
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating…
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Create admin
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      {/* Admin list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-[#003368] uppercase tracking-wider">
            {loading ? "Loading…" : `${admins.length} admin${admins.length === 1 ? "" : "s"}`}
          </h3>
          <button
            onClick={load}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No admins in the table yet. Log in once with your env credentials — they'll seed automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Email</th>
                  <th className="text-left px-5 py-3 font-semibold">Name</th>
                  <th className="text-left px-5 py-3 font-semibold">Last login</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => {
                  const busy = pendingId === a.id;
                  return (
                    <tr key={a.id} className="border-t border-slate-100">
                      <td className="px-5 py-3 font-mono text-xs text-slate-700">{a.email}</td>
                      <td className="px-5 py-3 text-slate-600">{a.name || "—"}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(a.lastLoginAt)}</td>
                      <td className="px-5 py-3">
                        {a.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#00875A] bg-[#00DF83]/10 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 bg-[#00DF83] rounded-full" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" /> Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={busy}
                            onClick={() => handleAction(a.id, "reset_password", a.email)}
                            title="Reset password"
                            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-[#003368] disabled:opacity-40"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          {a.isActive ? (
                            <button
                              disabled={busy}
                              onClick={() => handleAction(a.id, "deactivate", a.email)}
                              title="Deactivate"
                              className="p-1.5 rounded-md text-slate-500 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              disabled={busy}
                              onClick={() => handleAction(a.id, "reactivate", a.email)}
                              title="Reactivate"
                              className="p-1.5 rounded-md text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            disabled={busy}
                            onClick={() => handleAction(a.id, "delete", a.email)}
                            title="Delete"
                            className="p-1.5 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Password reveal modal */}
      {revealedPassword && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-[#003368]">
                {revealedPassword.context === "created" ? "Admin created" : "Password reset"}
              </h3>
              <button
                onClick={() => setRevealedPassword(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Share this password with <span className="font-semibold">{revealedPassword.email}</span> through
                a secure channel (Bitwarden, 1Password, signal, etc.). It will <span className="font-semibold">not be shown again</span>.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-sm break-all select-all">
                {revealedPassword.password}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={copyPassword}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#003368] hover:bg-[#002244] text-white font-bold py-2 px-4 rounded-lg text-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy password"}
                </button>
                <button
                  onClick={() => setRevealedPassword(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
