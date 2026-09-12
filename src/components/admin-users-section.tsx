"use client";

import { Pencil, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

type User = { id: string; name: string; email: string; role: string; verificationLevel: string; approvalStatus: string; accountStatus: string; createdAt: string; realizedRevenue: number; projectedRevenue: number };
type EditValues = { role: string; verificationLevel: string; approvalStatus: string; accountStatus: string; approvalNote: string };

export function AdminUsersSection({ users, setUsers }: { users: User[]; setUsers: React.Dispatch<React.SetStateAction<User[]>> }) {
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<EditValues>({ role: "TRAVELER", verificationLevel: "BASIC", approvalStatus: "PENDING", accountStatus: "ACTIVE", approvalNote: "" });

  function startEdit(user: User) {
    setEditing(user.id);
    setForm({ role: user.role, verificationLevel: user.verificationLevel, approvalStatus: user.approvalStatus, accountStatus: user.accountStatus, approvalNote: "" });
    setNotice("");
  }

  async function saveUser(userId: string) {
    setBusy(userId);
    setNotice("");
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: userId, ...form, approvalNote: form.approvalNote || null }) });
    const data = await response.json();
    setBusy("");
    if (!response.ok) { setNotice(data.error || "User could not be updated."); return; }
    setUsers(current => current.map(user => user.id === userId ? { ...user, ...data.user } : user));
    setEditing(null);
    setNotice("User details updated.");
  }

  async function deleteUser(user: User) {
    if (!window.confirm(`Delete ${user.name}'s account? This cannot be undone.`)) return;
    setBusy(user.id);
    const response = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id }) });
    const data = await response.json();
    setBusy("");
    if (!response.ok) { setNotice(data.error || "User could not be deleted."); return; }
    setUsers(current => current.filter(item => item.id !== user.id));
    setNotice(`${user.name} was deleted.`);
  }

  return <section className="rounded-2xl bg-white p-6 shadow-soft">
    <p className="eyebrow">People on TourLink</p>
    <div className="mt-1 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Users</h2><span className="text-xs font-bold text-slate-400">{users.length} accounts</span></div>
    {notice && <p className="mt-4 rounded-xl bg-sand p-3 text-xs font-bold text-ink">{notice}</p>}
    <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[1120px] text-left text-sm"><thead className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="pb-3">User</th><th className="pb-3">Role</th><th className="pb-3">Trust</th><th className="pb-3">Account</th><th className="pb-3">Realized revenue</th><th className="pb-3">Projected revenue</th><th className="pb-3">Actions</th></tr></thead><tbody>{users.map(user => <tr key={user.id} className="border-b border-slate-50"><td className="py-4"><p className="font-extrabold">{user.name}</p><p className="mt-1 text-xs text-slate-400">{user.email}</p></td><td className="py-4 text-xs font-bold">{user.role.replaceAll("_", " ")}</td><td className="py-4"><span className="rounded-full bg-sand px-2.5 py-1 text-[10px] font-black">{user.verificationLevel}</span></td><td className="py-4"><span className="rounded-full bg-mist px-2.5 py-1 text-[10px] font-black">{user.accountStatus}</span></td><td className="py-4 text-xs font-bold">KES {user.realizedRevenue.toLocaleString("en-KE")}</td><td className="py-4 text-xs font-bold text-lagoon">KES {user.projectedRevenue.toLocaleString("en-KE")}</td><td className="py-4"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => startEdit(user)} disabled={busy === user.id} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-[10px] font-black text-ink hover:bg-mist"><Pencil size={13} />Edit</button>{user.role !== "ADMIN" && <button type="button" onClick={() => deleteUser(user)} disabled={busy === user.id} className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-[10px] font-black text-red-600 transition hover:bg-red-50 disabled:opacity-50"><Trash2 size={13} />Delete</button>}</div></td></tr>)}</tbody></table></div>
    {editing && <div className="mt-6 rounded-2xl bg-mist p-5"><div className="flex items-center justify-between gap-3"><div><p className="eyebrow">User permissions</p><h3 className="mt-1 text-lg font-black">Modify account</h3></div><button type="button" onClick={() => setEditing(null)} aria-label="Close edit form"><X size={18} /></button></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="grid gap-1 text-xs font-bold text-slate-600">Role<select value={form.role} onChange={event => setForm({ ...form, role: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs"><option value="TRAVELER">Traveler</option><option value="OPERATOR">Tour operator</option><option value="VEHICLE_OWNER">Vehicle owner</option><option value="ADMIN">Admin</option></select></label><label className="grid gap-1 text-xs font-bold text-slate-600">Trust level<select value={form.verificationLevel} onChange={event => setForm({ ...form, verificationLevel: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs"><option value="BASIC">Basic</option><option value="VERIFIED">Verified</option><option value="TRUSTED">Trusted</option></select></label><label className="grid gap-1 text-xs font-bold text-slate-600">Approval<select value={form.approvalStatus} onChange={event => setForm({ ...form, approvalStatus: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs"><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></label><label className="grid gap-1 text-xs font-bold text-slate-600">Account status<select value={form.accountStatus} onChange={event => setForm({ ...form, accountStatus: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="SUSPENDED">Suspended</option></select></label><label className="grid gap-1 text-xs font-bold text-slate-600 sm:col-span-2 lg:col-span-4">Approval note<textarea value={form.approvalNote} onChange={event => setForm({ ...form, approvalNote: event.target.value })} maxLength={1000} rows={2} placeholder="Optional note sent to the user" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" /></label></div><button type="button" disabled={busy === editing} onClick={() => saveUser(editing)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-xs font-extrabold text-white disabled:opacity-50"><Save size={14} />{busy === editing ? "Saving..." : "Save changes"}</button></div>}
  </section>;
}
