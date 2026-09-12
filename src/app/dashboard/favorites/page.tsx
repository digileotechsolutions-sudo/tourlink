import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const favorites = await prisma.favorite.findMany({ where: { userId: user.id }, include: { trip: { include: { destination: true, images: true, reviews: true } } } });
  return <div className="rounded-2xl bg-white p-5 shadow-soft sm:p-7"><p className="eyebrow">Your shortlist</p><h2 className="mt-1 text-2xl font-black">Saved journeys</h2>{favorites.length ? <div className="mt-7 grid gap-4 sm:grid-cols-2">{favorites.map(({ trip }) => { if (!trip) return null; const average = trip.reviews.length ? trip.reviews.reduce((total, review) => total + review.rating, 0) / trip.reviews.length : 0; return <Link key={trip.id} href={`/trips/${trip.slug}`} className="group overflow-hidden rounded-2xl border border-slate-100"><div className="relative h-40"><Image src={trip.images[0]?.url || trip.destination.imageUrl} alt={trip.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 640px) 90vw, 40vw" /></div><div className="p-4"><h3 className="font-extrabold">{trip.name}</h3><p className="mt-2 text-xs text-slate-500"><MapPin size={13} className="mr-1 inline text-sun" />{trip.destination.name}</p><p className="mt-3 text-xs font-bold text-sun"><Star size={13} className="mr-1 inline fill-current" />{average.toFixed(1)} rating</p></div></Link>; })}</div> : <div className="grid place-items-center py-16 text-center"><Heart className="text-sun" /><h3 className="mt-4 font-extrabold">Nothing saved yet</h3><p className="mt-2 text-sm text-slate-500">Tap save on a journey that feels like you.</p><Link href="/trips" className="mt-5 rounded-full bg-ink px-4 py-3 text-xs font-extrabold text-white">Explore trips</Link></div>}</div>;
}
