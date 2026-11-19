import React from "react";
import { createServerComponentClient } from "@/lib/supabase";
import { Box, Layers, AlertTriangle, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import InstallAppButton from "@/components/InstallAppButton";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createServerComponentClient();

  const { data: materials } = await supabase.from("materials").select("*");
  const { data: logs } = await supabase.from("stock_logs").select("*");

  const todayStr = new Date().toISOString().split("T")[0];
  const { data: todayLogs } = await supabase
    .from("stock_logs")
    .select("*")
    .gte("created_at", `${todayStr}T00:00:00Z`);

  const totalJenis = materials?.length || 0;
  const totalStok = materials?.reduce((acc, curr) => acc + curr.stok_saat_ini, 0) || 0;
  const menipisList = materials?.filter((m) => m.stok_saat_ini <= m.stok_minimum) || [];
  const totalTransaksiHariIni = todayLogs?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Ringkasan</h1>
        <p className="text-xs text-gray-500">Kondisi riil ketersediaan barang di gudang.</p>
      </div>

      <InstallAppButton />

      {/* Grid Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600 w-fit"><Box size={18} /></div>
          <div className="mt-3">
            <span className="text-xs text-gray-400 block">Jenis Material</span>
            <span className="text-xl font-bold text-gray-800">{totalJenis} Item</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="bg-green-50 p-2 rounded-lg text-green-600 w-fit"><Layers size={18} /></div>
          <div className="mt-3">
            <span className="text-xs text-gray-400 block">Total Stok</span>
            <span className="text-xl font-bold text-gray-800">{totalStok} Pcs</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="bg-amber-50 p-2 rounded-lg text-amber-600 w-fit"><AlertTriangle size={18} /></div>
          <div className="mt-3">
            <span className="text-xs text-gray-400 block">Stok Menipis</span>
            <span className="text-xl font-bold text-amber-600">{menipisList.length} Item</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="bg-purple-50 p-2 rounded-lg text-purple-600 w-fit"><ArrowUpRight size={18} /></div>
          <div className="mt-3">
            <span className="text-xs text-gray-400 block">Mutasi Hari Ini</span>
            <span className="text-xl font-bold text-gray-800">{totalTransaksiHariIni} Giat</span>
          </div>
        </div>
      </div>

      {/* Warning List */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Daftar Peringatan Kritis Stok</span>
        </h2>
        {menipisList.length === 0 ? (
          <p className="text-xs text-green-600 bg-green-50 p-3 rounded-lg text-center">Seluruh item logistik aman di atas batas minimum.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {menipisList.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs">
                <div>
                  <p className="font-bold text-gray-800">{item.nama_material}</p>
                  <p className="text-gray-400">{item.kode_material} • Rak: {item.lokasi_rak}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-700">{item.stok_saat_ini} {item.satuan}</p>
                  <p className="text-[10px] text-gray-400">Min: {item.stok_minimum}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
