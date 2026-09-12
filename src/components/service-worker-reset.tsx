"use client";
import { useEffect } from "react";

export function ServiceWorkerReset() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!("serviceWorker" in navigator) || !("caches" in window)) return;
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }, []);
  return null;
}