import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { Footer } from "@/components/footer";
import { ServiceWorkerReset } from "@/components/service-worker-reset";

export const metadata: Metadata = {
  title: { default: "TourLink | One Platform. Endless Journeys.", template: "%s | TourLink" },
  description: "Discover trips, hire verified vehicles and travel Kenya with confidence.",
  applicationName: "TourLink",
  manifest: "/manifest.webmanifest",
  openGraph: { title: "TourLink", description: "Explore. Book. Travel.", type: "website" }
};

export const viewport: Viewport = { themeColor: "#063B00", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ServiceWorkerReset /><Header />{children}<Footer /><BottomNav /></body></html>;
}
