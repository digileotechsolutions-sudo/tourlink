"use client";
import { useEffect, useState } from "react";
import {
  Activity,
  BadgeCheck,
  BookOpen,
  CarFront,
  CircleDollarSign,
  LayoutDashboard,
  Map,
  RefreshCw,
  Settings,
  ShieldCheck,
  Star,
  TrendingUp,
  UsersRound,
  WalletCards,
  XCircle,
} from "lucide-react";
import { AdminUsersSection } from "@/components/admin-users-section";
import { AdminVehicleApprovals } from "@/components/admin-vehicle-approvals";
import { AdminTripApprovals } from "@/components/admin-trip-approvals";

type Stats = {
  users: number;
  travelers: number;
  operators: number;
  owners: number;
  trips: number;
  vehicles: number;
  bookings: number;
  completed: number;
  cancelled: number;
  revenue: number;
  commission: number;
  payouts: number;
  verification: number;
  averageRating: number;
};
type Charts = {
  bookingSeries: { label: string; count: number; revenue: number }[];
  destinations: { name: string; _count: { trips: number } }[];
  topTrips: { name: string; _count: { bookings: number } }[];
  topVehicles: { name: string; _count: { bookings: number } }[];
  operatorRows: { name: string; _count: { trips: number } }[];
};
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  verificationLevel: string;
  approvalStatus: string;
  accountStatus: string;
  createdAt: string;
  realizedRevenue: number;
  projectedRevenue: number;
};
type Verification = {
  id: string;
  type: string;
  status: string;
  user: {
    name: string;
    email: string;
    role: string;
    verificationLevel: string;
  };
};
type Trip = {
  id: string;
  name: string;
  slug: string;
  status: string;
  featured: boolean;
  verificationStatus: string;
  operator: { name: string; operatorProfile: { companyName: string } | null };
};
type Setting = { id: string; key: string; value: string };
type AuditLog = {
  id: string;
  action: string;
  entity: string;
  createdAt: string;
  admin: { name: string; email: string };
};
const tabs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: UsersRound },
  { key: "verification", label: "Verification", icon: ShieldCheck },
  { key: "vehicles", label: "Vehicle approvals", icon: CarFront },
  { key: "trips", label: "Trip approvals", icon: Map },
  { key: "listings", label: "Listings", icon: Map },
  { key: "finance", label: "Finance", icon: CircleDollarSign },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "audit", label: "Audit log", icon: Activity },
];

export function AdminDashboard() {
  const [data, setData] = useState<{ stats: Stats; charts: Charts } | null>(
    null,
  );
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<Verification[]>([]);
  const [tab, setTab] = useState("overview");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const responses = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/verification"),
      ]);
      if (responses.some((response) => !response.ok)) throw new Error();
      const [stats, userData, verification] = await Promise.all(
        responses.map((response) => response.json()),
      );
      setData(stats);
      setUsers(userData.users || []);
      setRequests(verification.requests || []);
    } catch {
      setError("The admin dashboard could not load its data.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  if (loading) return <Loading />;
  if (error || !data)
    return (
      <main className="min-h-screen bg-mist p-6">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-soft">
          <XCircle className="mx-auto text-red-500" />
          <h1 className="mt-4 text-xl font-black">
            Admin dashboard unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button
            onClick={load}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-extrabold text-white"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </main>
    );
          {tab === "trips" && <AdminTripApprovals />}
  return (
    <main className="min-h-screen bg-mist pb-16">
      <div className="container-page py-7">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">TourLink control room</p>
            <h1 className="display mt-1 text-4xl font-bold">Admin dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage people, trust, marketplace inventory and platform finances.
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold"
          >
            <RefreshCw size={14} /> Refresh data
          </button>
        </div>
        <nav className="mb-7 flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-soft">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold ${tab === key ? "bg-ink text-white" : "text-slate-500 hover:bg-mist"}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
        {tab === "overview" && (
          <Overview stats={data.stats} charts={data.charts} users={users} setTab={setTab} />
        )}
        {tab === "users" && (
          <AdminUsersSection users={users} setUsers={setUsers} />
        )}
        {tab === "verification" && (
          <VerificationSection
            users={users}
            setUsers={setUsers}
            requests={requests}
            setRequests={setRequests}
          />
        )}
        {tab === "listings" && (
          <ListingsSection stats={data.stats} charts={data.charts} />
        )}
        {tab === "finance" && <FinanceSection stats={data.stats} />}
        {tab === "settings" && <SettingsSection />}
        {tab === "audit" && <AuditSection />}
      </div>
    </main>
  );
}

function Overview({
  stats,
  charts,
  users,
  setTab,
}: {
  stats: Stats;
  charts: Charts;
  users: User[];
  setTab: (tab: string) => void;
}) {
  const max = Math.max(1, ...charts.bookingSeries.map((point) => point.count));
  const maxRevenue = Math.max(1, ...charts.bookingSeries.map((point) => point.revenue));
  const projectedRevenue = users.reduce((total, user) => total + user.projectedRevenue, 0);
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Total users"
          value={stats.users.toLocaleString()}
          detail={`${stats.travelers} travelers · ${stats.operators} operators`}
          icon={UsersRound}
        />
        <Metric
          label="Total bookings"
          value={stats.bookings.toLocaleString()}
          detail={`${stats.completed} completed`}
          icon={BookOpen}
        />
        <Metric
          label="Revenue"
          value={`KES ${stats.revenue.toLocaleString()}`}
          detail={`KES ${stats.commission.toLocaleString()} commission`}
          icon={CircleDollarSign}
        />
        <Metric
          label="Projected revenue"
          value={`KES ${projectedRevenue.toLocaleString("en-KE")}`}
          detail="Future non-cancelled bookings"
          icon={TrendingUp}
        />
        <Metric
          label="Average rating"
          value={stats.averageRating.toFixed(1)}
          detail={`${stats.verification} verification requests`}
          icon={Star}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <Panel eyebrow="Performance" title="Bookings and revenue over time">
          <div className="mb-4 flex flex-wrap gap-4 text-[10px] font-bold text-slate-500"><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-lagoon" />Bookings</span><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-sun" />Revenue</span></div>
          <div className="flex h-48 items-end gap-3 border-b border-l border-slate-100 px-3">
            {charts.bookingSeries.map((point) => (
              <div
                key={point.label}
                className="group flex flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-full w-full max-w-10 items-end justify-center gap-1">
                  <div className="relative w-3 rounded-t-md bg-lagoon" style={{ height: `${Math.max(8, (point.count / max) * 100)}%` }} title={`${point.count} bookings`} />
                  <div className="relative w-3 rounded-t-md bg-sun" style={{ height: `${Math.max(8, (point.revenue / maxRevenue) * 100)}%` }} title={`KES ${point.revenue.toLocaleString("en-KE")}`} />
                </div>
                <span className="text-[10px] text-slate-400">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <section className="rounded-2xl bg-ink p-6 text-white">
          <p className="eyebrow text-sun">Needs attention</p>
          <h2 className="mt-1 text-2xl font-black">Keep trust moving</h2>
          <div className="mt-6 grid gap-3">
            <Queue
              label="Account approvals"
              value={String(users.filter((user) => user.approvalStatus === "PENDING").length)}
              icon={UsersRound}
              onClick={() => setTab("verification")}
            />
            <Queue
              label="Verification requests"
              value={String(stats.verification)}
              icon={ShieldCheck}
              onClick={() => setTab("verification")}
            />
            <Queue
              label="Published trips"
              value={String(stats.trips)}
              icon={Map}
              onClick={() => setTab("listings")}
            />
          </div>
        </section>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Ranked
          title="Popular trips"
          rows={charts.topTrips.map((row) => ({
            label: row.name,
            value: row._count.bookings,
          }))}
        />
        <Ranked
          title="Popular destinations"
          rows={charts.destinations.map((row) => ({
            label: row.name,
            value: row._count.trips,
          }))}
        />
        <Ranked
          title="Top operators"
          rows={charts.operatorRows.map((row) => ({
            label: row.name,
            value: row._count.trips,
          }))}
        />
      </div>
    </div>
  );
}

function LegacyUsersSection({
  users: initial,
  setUsers: setParentUsers,
}: {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}) {
  const [users, setUsers] = useState(initial);
  const [filter, setFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "TRAVELER",
  });
  const visible =
    filter === "ALL" ? users : users.filter((user) => user.role === filter);
  function updateUsers(update: (current: User[]) => User[]) {
    setUsers(update);
    setParentUsers(update);
  }
  async function review(user: User, accountStatus: string) {
    setBusy(user.id);
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, accountStatus }),
    });
    const data = await response.json();
    setBusy("");
    if (response.ok)
      updateUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, ...data.user } : item,
        ),
      );
    else setNotice(data.error || "User could not be updated.");
  }
  async function addUser(event: React.FormEvent) {
    event.preventDefault();
    setBusy("new");
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setBusy("");
    if (!response.ok) {
      setNotice(data.error || "User could not be created.");
      return;
    }
    updateUsers((current) => [
      {
        ...data.user,
        verificationLevel: "VERIFIED",
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setForm({ name: "", email: "", phone: "", password: "", role: "TRAVELER" });
    setShowAdd(false);
    setNotice("User created and activated.");
  }
  return (
    <Panel eyebrow="People on TourLink" title="Users">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "ALL", label: "All users" },
            { key: "TRAVELER", label: "Travelers" },
            { key: "OPERATOR", label: "Tour Operators" },
            { key: "VEHICLE_OWNER", label: "Vehicle Owners" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-full px-3 py-2 text-[10px] font-black ${filter === item.key ? "bg-ink text-white" : "bg-mist text-slate-500"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-full bg-sun px-4 py-2.5 text-xs font-extrabold"
        >
          {showAdd ? "Close form" : "Add user"}
        </button>
      </div>
      {showAdd && (
        <form
          onSubmit={addUser}
          className="mt-5 grid gap-3 rounded-xl bg-mist p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Full name"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
          />
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            placeholder="Email"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
          />
          <input
            required
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: event.target.value })
            }
            placeholder="Phone"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
          />
          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            placeholder="Temporary password"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
          />
          <select
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
          >
            <option value="TRAVELER">Traveler</option>
            <option value="OPERATOR">Tour Operator</option>
            <option value="VEHICLE_OWNER">Vehicle Owner</option>
          </select>
          <button
            disabled={busy === "new"}
            className="rounded-xl bg-lagoon px-4 py-2.5 text-xs font-extrabold text-white sm:col-span-2 lg:col-span-5"
          >
            Create active account
          </button>
        </form>
      )}
      {notice && (
        <p className="mt-4 rounded-xl bg-sand p-3 text-xs font-bold text-ink">
          {notice}
        </p>
      )}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="pb-3">User</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Trust</th>
              <th className="pb-3">Account</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((user) => (
              <tr key={user.id} className="border-b border-slate-50">
                <td className="py-4">
                  <p className="font-extrabold">{user.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{user.email}</p>
                </td>
                <td className="py-4 text-xs font-bold">
                  {user.role.replaceAll("_", " ")}
                </td>
                <td className="py-4">
                  <Status value={user.verificationLevel} />
                </td>
                <td className="py-4">
                  <Status value={user.accountStatus} />
                </td>
                <td className="py-4">
                  <div className="flex flex-wrap gap-2">
                    {user.accountStatus !== "ACTIVE" && (
                      <button
                        disabled={busy === user.id}
                        onClick={() => review(user, "ACTIVE")}
                        className="rounded-full bg-lagoon px-3 py-2 text-[10px] font-black text-white"
                      >
                        Activate
                      </button>
                    )}
                    {user.accountStatus === "ACTIVE" && (
                      <button
                        disabled={busy === user.id}
                        onClick={() => review(user, "INACTIVE")}
                        className="rounded-full border border-slate-200 px-3 py-2 text-[10px] font-black"
                      >
                        Set inactive
                      </button>
                    )}
                    {user.accountStatus !== "SUSPENDED" && (
                      <button
                        disabled={busy === user.id}
                        onClick={() => review(user, "SUSPENDED")}
                        className="rounded-full border border-red-200 px-3 py-2 text-[10px] font-black text-red-600"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function VerificationSection({
  users,
  setUsers,
  requests,
  setRequests,
}: {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  requests: Verification[];
  setRequests: React.Dispatch<React.SetStateAction<Verification[]>>;
}) {
  const [busy, setBusy] = useState("");
  const pendingUsers = users.filter(
    (user) => user.approvalStatus === "PENDING",
  );
  async function reviewUser(
    user: User,
    approvalStatus: "APPROVED" | "REJECTED",
  ) {
    setBusy(user.id);
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, approvalStatus }),
    });
    const data = await response.json();
    setBusy("");
    if (response.ok)
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, ...data.user } : item,
        ),
      );
  }
  async function reviewRequest(
    id: string,
    status: "APPROVED" | "REJECTED" | "MORE_INFO",
  ) {
    const response = await fetch("/api/admin/verification", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (response.ok)
      setRequests((current) => current.filter((request) => request.id !== id));
  }
  return (
    <div className="grid gap-6">
      <Panel eyebrow="Account approval" title="People waiting for approval">
        <div className="grid gap-3">
          {pendingUsers.length ? (
            pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 p-4"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-sand text-lagoon">
                  <UsersRound size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold">{user.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {user.email} · {user.role.replaceAll("_", " ")}
                  </p>
                </div>
                <button
                  disabled={busy === user.id}
                  onClick={() => reviewUser(user, "REJECTED")}
                  className="rounded-full border border-red-200 px-3 py-2 text-[10px] font-black text-red-600"
                >
                  Reject
                </button>
                <button
                  disabled={busy === user.id}
                  onClick={() => reviewUser(user, "APPROVED")}
                  className="rounded-full bg-leaf px-3 py-2 text-[10px] font-black text-white"
                >
                  Approve and email
                </button>
              </div>
            ))
          ) : (
            <Empty text="No people are waiting for account approval." />
          )}
        </div>
      </Panel>
      <Panel eyebrow="Provider trust" title="Verification requests">
        <div className="grid gap-3">
          {requests.length ? (
            requests.map((request) => (
              <div
                key={request.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 p-4"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-sand text-lagoon">
                  <BadgeCheck size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold">{request.user.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {request.user.email} · {request.type.replaceAll("_", " ")}
                  </p>
                </div>
                <button
                  onClick={() => reviewRequest(request.id, "MORE_INFO")}
                  className="rounded-full border border-slate-200 px-3 py-2 text-[10px] font-black"
                >
                  More info
                </button>
                <button
                  onClick={() => reviewRequest(request.id, "REJECTED")}
                  className="rounded-full border border-red-200 px-3 py-2 text-[10px] font-black text-red-600"
                >
                  Reject
                </button>
                <button
                  onClick={() => reviewRequest(request.id, "APPROVED")}
                  className="rounded-full bg-leaf px-3 py-2 text-[10px] font-black text-white"
                >
                  Approve
                </button>
              </div>
            ))
          ) : (
            <Empty text="No pending provider verification requests." />
          )}
        </div>
      </Panel>
    </div>
  );
}

function ListingsSection({ stats, charts }: { stats: Stats; charts: Charts }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [busy, setBusy] = useState("");
  useEffect(() => {
    fetch("/api/admin/trips")
      .then((response) => response.json())
      .then((result) => setTrips(result.trips || []));
  }, []);
  async function update(
    id: string,
    input: Partial<Pick<Trip, "featured" | "verificationStatus" | "status">>,
  ) {
    setBusy(id);
    const response = await fetch(`/api/admin/trips/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok)
      setTrips((current) =>
        current.map((trip) => (trip.id === id ? { ...trip, ...input } : trip)),
      );
    setBusy("");
  }
  return (
    <div className="grid gap-6">
      <Panel eyebrow="Marketplace inventory" title="Trips and listings">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric
            label="Trips"
            value={String(stats.trips)}
            detail="Published and draft"
            icon={Map}
          />
          <Metric
            label="Vehicles"
            value={String(stats.vehicles)}
            detail="Listed fleet"
            icon={CarFront}
          />
          <Metric
            label="Featured trips"
            value={String(trips.filter((trip) => trip.featured).length)}
            detail="Currently promoted"
            icon={Star}
          />
        </div>
        <div className="mt-6 grid gap-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="rounded-xl border border-slate-100 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold">{trip.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {trip.operator.operatorProfile?.companyName ||
                      trip.operator.name}{" "}
                    · {trip.slug}
                  </p>
                </div>
                <Status value={trip.verificationStatus} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  disabled={busy === trip.id}
                  onClick={() =>
                    update(trip.id, { verificationStatus: "APPROVED" })
                  }
                  className="rounded-full bg-leaf px-3 py-2 text-[10px] font-black text-white"
                >
                  Approve
                </button>
                <button
                  disabled={busy === trip.id}
                  onClick={() =>
                    update(trip.id, { verificationStatus: "REJECTED" })
                  }
                  className="rounded-full border border-red-200 px-3 py-2 text-[10px] font-black text-red-600"
                >
                  Reject
                </button>
                <button
                  disabled={busy === trip.id}
                  onClick={() => update(trip.id, { featured: !trip.featured })}
                  className="rounded-full border border-slate-200 px-3 py-2 text-[10px] font-black"
                >
                  {trip.featured ? "Remove featured" : "Feature trip"}
                </button>
                <button
                  disabled={busy === trip.id}
                  onClick={() =>
                    update(trip.id, {
                      status:
                        trip.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                    })
                  }
                  className="rounded-full border border-slate-200 px-3 py-2 text-[10px] font-black"
                >
                  {trip.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Ranked
          title="Popular trips"
          rows={charts.topTrips.map((row) => ({
            label: row.name,
            value: row._count.bookings,
          }))}
        />
        <Ranked
          title="Popular vehicles"
          rows={charts.topVehicles.map((row) => ({
            label: row.name,
            value: row._count.bookings,
          }))}
        />
      </div>
    </div>
  );
}

function FinanceSection({ stats }: { stats: Stats }) {
  return (
    <Panel eyebrow="Financial controls" title="Finance">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Successful revenue"
          value={`KES ${stats.revenue.toLocaleString()}`}
          detail="Verified payments only"
          icon={CircleDollarSign}
        />
        <Metric
          label="Commission"
          value={`KES ${stats.commission.toLocaleString()}`}
          detail="Platform earnings"
          icon={WalletCards}
        />
        <Metric
          label="Provider payouts"
          value={`KES ${stats.payouts.toLocaleString()}`}
          detail="Payout ledger total"
          icon={TrendingUp}
        />
        <Metric
          label="Refund exposure"
          value={`${stats.cancelled} bookings`}
          detail="Review refund policy"
          icon={XCircle}
        />
      </div>
    </Panel>
  );
}
function SettingsSection() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((response) => response.json())
      .then((result) => setSettings(result.settings || []));
  }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    const data = await response.json();
    if (!response.ok) {
      setNotice(data.error || "Setting could not be saved.");
      return;
    }
    setSettings((current) =>
      [...current.filter((item) => item.key !== key), data.setting].sort(
        (a, b) => a.key.localeCompare(b.key),
      ),
    );
    setKey("");
    setValue("");
    setNotice("Setting saved.");
  }
  return (
    <Panel eyebrow="Platform configuration" title="System settings">
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          required
          value={key}
          onChange={(event) => setKey(event.target.value)}
          placeholder="setting_key"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-lagoon"
        />
        <input
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Value"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-lagoon"
        />
        <button className="rounded-xl bg-ink px-5 py-3 text-xs font-extrabold text-white">
          Save
        </button>
      </form>
      {notice && <p className="mt-3 text-xs font-bold text-lagoon">{notice}</p>}
      <div className="mt-6 grid gap-3">
        {settings.length ? (
          settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
            >
              <span className="text-sm font-bold">{setting.key}</span>
              <span className="rounded-full bg-sand px-3 py-1.5 text-[10px] font-black">
                {setting.value}
              </span>
            </div>
          ))
        ) : (
          <Empty text="No custom settings saved yet." />
        )}
      </div>
    </Panel>
  );
}
function AuditSection() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  useEffect(() => {
    fetch("/api/admin/audit")
      .then((response) => response.json())
      .then((result) => setLogs(result.logs || []));
  }, []);
  return (
    <Panel eyebrow="Accountability" title="Audit logs">
      <div className="grid gap-3">
        {logs.length ? (
          logs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-slate-100 p-4"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <p className="text-sm font-extrabold">
                  {log.action.replaceAll("_", " ")}
                </p>
                <span className="text-[10px] text-slate-400">
                  {new Date(log.createdAt).toLocaleString("en-KE")}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {log.entity} · {log.admin.name} · {log.admin.email}
              </p>
            </div>
          ))
        ) : (
          <Empty text="No audit records yet." />
        )}
      </div>
    </Panel>
  );
}
function Ranked({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number }[];
}) {
  return (
    <Panel eyebrow="Demand" title={title}>
      <div className="grid gap-4">
        {rows.length ? (
          rows.map((row, index) => (
            <div key={row.label}>
              <div className="flex justify-between text-sm">
                <span className="font-bold">
                  {index + 1}. {row.label}
                </span>
                <span className="text-xs text-slate-400">{row.value}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-sand">
                <div
                  className="h-2 rounded-full bg-lagoon"
                  style={{
                    width: `${Math.max(8, Math.min(100, row.value * 10))}%`,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <Empty text="No data yet." />
        )}
      </div>
    </Panel>
  );
}
function Metric({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof UsersRound;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-sand text-lagoon">
        <Icon size={17} />
      </span>
      <p className="mt-5 text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-[11px] text-leaf">{detail}</p>
    </div>
  );
}
function Queue({
  label,
  value,
  icon: Icon,
  onClick,
}: {
  label: string;
  value: string;
  icon: typeof UsersRound;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl bg-white/10 p-3 text-left hover:bg-white/15"
    >
      <Icon size={18} className="text-sun" />
      <span className="flex-1 text-xs font-bold">{label}</span>
      <strong className="text-xs">{value}</strong>
    </button>
  );
}
function Status({ value }: { value: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${value === "APPROVED" || value === "VERIFIED" || value === "TRUSTED" || value === "PUBLISHED" || value === "ACTIVE" ? "bg-leaf/10 text-leaf" : value === "REJECTED" || value === "ARCHIVED" || value === "SUSPENDED" ? "bg-red-50 text-red-600" : "bg-sand text-[#a45913]"}`}
    >
      {value}
    </span>
  );
}
function Panel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-soft">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-black">{title}</h2>
      <div className="mt-7">{children}</div>
    </section>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl bg-mist p-8 text-center text-sm text-slate-500">
      {text}
    </p>
  );
}
function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-mist">
      <div className="text-center">
        <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-sand border-t-lagoon" />
        <p className="mt-4 text-xs font-bold text-slate-400">
          Loading control room...
        </p>
      </div>
    </main>
  );
}
