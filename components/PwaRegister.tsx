"use client";
import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker terdaftar: ", reg.scope))
          .catch((err) => console.error("Registrasi Service Worker gagal: ", err));
      });
    }
  }, []);

  return null;
}
