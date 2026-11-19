"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Box, ArrowLeftRight, ClipboardList, LogOut, User } from "lucide-react";
import { createClientComponentClient } from "@/lib/supabase";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", session.user.id)
          .single();
        if (data) setProfile(data);
      } else {
        setProfile(null);
      }
    }
    getProfile();
  }, [pathname, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  if (pathname === "/login") return null;

  const menus = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Master", href: "/master", icon: Box },
    { name: "Transaksi", href: "/transaksi", icon: ArrowLeftRight },
    { name: "Logbook", href: "/logbook", icon: ClipboardList },
  ];

  return (
    <>
      {/* Desktop Header Top Navigation */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 justify-between items-center px-6 z-50">
        <div className="font-bold text-lg text-blue-600">Gudang Logbook</div>
        <nav className="flex space-x-6">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const isActive = pathname === menu.href;
            return (
              <Link key={menu.href} href={menu.href} className={`flex items-center space-x-2 text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}>
                <Icon size={18} />
                <span>{menu.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center space-x-4">
          {profile && (
            <div className="text-right text-xs">
              <p className="font-semibold text-gray-800">{profile.full_name}</p>
              <p className="text-gray-500 capitalize">{profile.role}</p>
            </div>
          )}
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700 flex items-center space-x-1 text-sm font-medium">
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Mobile Sticky Top Header for Profile */}
      <div className="md:hidden w-full bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            <User size={18} />
          </div>
          {profile ? (
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">{profile.full_name}</p>
              <p className="text-xs text-gray-500 capitalize leading-none">{profile.role}</p>
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-600">Memuat Sesi...</p>
          )}
        </div>
        <button onClick={handleLogout} className="p-2 text-red-500 rounded-lg bg-red-50">
          <LogOut size={18} />
        </button>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 safe-bottom">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const isActive = pathname === menu.href;
          return (
            <Link key={menu.href} href={menu.href} className={`flex flex-col items-center justify-center w-full h-full text-center space-y-1 ${isActive ? "text-blue-600" : "text-gray-400"}`}>
              <Icon size={20} />
              <span className="text-[10px] font-medium">{menu.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
