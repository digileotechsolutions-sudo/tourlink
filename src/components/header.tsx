"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const dashboardPage = pathname.startsWith("/dashboard");
  const adminPage = pathname.startsWith("/admin");
  const privatePage = dashboardPage || adminPage;
  const authPage = pathname === "/login" || pathname === "/register" || pathname === "/admin/login";
  useEffect(() => { fetch("/api/auth/me").then(response => response.json()).then(data => setUser(data.user || null)).catch(() => setUser(null)); }, [pathname]);
  if (authPage) return null;
  const links = privatePage ? [] : [{ href: "/trips", label: "Find a trip" }, { href: "/vehicles", label: "Hire a vehicle" }, { href: "/destinations", label: "Destinations" }, { href: "/how-it-works", label: "How it works" }];
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); setOpen(false); router.push(adminPage ? "/admin/login" : "/"); router.refresh(); }
  const portalHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";
  const showUserActions = Boolean(user) && (!dashboardPage || adminPage);
  const isAdmin = user?.role === "ADMIN";

  return <header className="sticky top-0 z-50 border-b border-white/10 bg-ink text-white"><div className="container-page flex h-[76px] items-center justify-between gap-8">
    <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}><span className="grid h-9 w-9 place-items-center rounded-xl bg-sun text-ink"><Compass size={21} strokeWidth={2.5} /></span><span><span className="block text-[21px] font-black tracking-[-.06em]">TOUR<span className="text-sun">link</span></span><span className="hidden text-[8px] font-bold uppercase tracking-[.18em] text-white/50 sm:block">Trips · Vehicles · Together</span></span></Link>
    <nav className="hidden items-center gap-7 text-sm font-semibold text-white/75 lg:flex">{links.map(link => <Link key={link.href} href={link.href} className={`transition hover:text-white ${pathname.startsWith(link.href) ? "text-sun" : ""}`}>{link.label}</Link>)}</nav>
    <div className="hidden items-center gap-4 sm:flex">{showUserActions ? <>{!isAdmin && <Link href={portalHref} className="text-sm font-bold text-white/80 hover:text-white">Dashboard</Link>}<button onClick={logout} className="rounded-full bg-sun px-5 py-3 text-sm font-extrabold text-ink transition hover:bg-orange-300">Log out</button></> : !privatePage && !user ? <><Link href="/login" className="text-sm font-bold text-white/80 hover:text-white">Log in</Link><Link href="/register" className="rounded-full bg-sun px-5 py-3 text-sm font-extrabold text-ink transition hover:bg-orange-300">Join TourLink</Link></> : null}</div>
    <button className="rounded-lg p-2 lg:hidden" aria-label="Open menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
  </div>{open && <div className="absolute left-0 right-0 top-[76px] border-t border-white/10 bg-ink px-5 pb-6 pt-3 shadow-2xl lg:hidden"><nav className="grid gap-1">{links.map(link => <Link onClick={() => setOpen(false)} key={link.href} href={link.href} className="rounded-xl px-3 py-3 font-semibold text-white/80 hover:bg-white/10">{link.label}</Link>)}<div className="mt-3 flex gap-3 border-t border-white/10 pt-4">{showUserActions ? <>{!isAdmin && <Link onClick={() => setOpen(false)} href={portalHref} className="rounded-full border border-white/20 px-4 py-3 text-sm font-bold">Dashboard</Link>}<button onClick={logout} className="rounded-full bg-sun px-4 py-3 text-sm font-bold text-ink">Log out</button></> : !privatePage && !user ? <><Link onClick={() => setOpen(false)} href="/login" className="rounded-full border border-white/20 px-4 py-3 text-sm font-bold">Log in</Link><Link onClick={() => setOpen(false)} href="/register" className="rounded-full bg-sun px-4 py-3 text-sm font-bold text-ink">Join TourLink</Link></> : null}</div></nav></div>}</header>;
}
