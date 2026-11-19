"use client";
import React, { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isApple = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(isApple);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsReady(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsReady(false);
    }
  };

  if (isIOS) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex items-start space-x-3 mb-4">
        <Share className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <span className="font-semibold block mb-0.5">Pasang Aplikasi di iPhone</span>
          Buka menu browser Safari Anda, lalu ketuk opsi <span className="font-bold">"Add to Home Screen"</span> untuk performa mobile optimal.
        </div>
      </div>
    );
  }

  if (!isReady) return null;

  return (
    <button onClick={handleInstallClick} className="w-full mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 active:scale-95 transition-transform">
      <Download size={18} />
      <span>Pasang Aplikasi Gudang Material</span>
    </button>
  );
}
