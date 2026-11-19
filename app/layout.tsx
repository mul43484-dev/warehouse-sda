import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import PwaRegister from "@/components/PwaRegister";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gudang Material & Logbook",
  description: "Sistem Manajemen Inventaris Gudang Mobile-First",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gudang Material",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} pb-20 md:pb-0 md:pt-16`}>
        <PwaRegister />
        <Navigation />
        <main className="max-w-md mx-auto p-4 md:max-w-4xl min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
