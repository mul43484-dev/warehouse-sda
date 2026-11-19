"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import { StockLog } from "@/types/inventory";
import { Calendar, Filter, FileText, Search, Loader2 } from "lucide-react";

export default function LogbookMutasiPage() {
  const supabase = createClientComponentClient();

  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    // Menggunakan foreign key join untuk merujuk tabel materials
    const { data } = await supabase
      .from("stock_logs")
      .select("*, materials(kode_material, nama_material)")
      .order("created_at", { ascending: false });

    if (data) setLogs(data as any);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Fungsi Export Data ke CSV langsung via HP Browser
  function exportKeCSV() {
    if (logs.length === 0) return;
    const header = ["Tanggal Jam", "Kode Material", "Nama Material", "Jenis", "Jumlah", "Stok Awal", "Stok Akhir", "PIC", "Keterangan"];
    const rows = logs.map((log) => [
      new Date(log.created_at).toLocaleString("id-ID"),
      log.materials?.kode_material || "",
      log.materials?.nama_material || "",
      log.jenis_transaksi,
      log.qty,
      log.stok_awal,
      log.stok_akhir,
      log.pic,
      log.keterangan.replace(/,/g, " "),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Mutasi_Gudang_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    const matchesSearch = log.materials?.nama_material.toLowerCase().includes(term) ||
      log.materials?.kode_material.toLowerCase().includes(term) ||
      log.pic.toLowerCase().includes(term) ||
      log.keterangan.toLowerCase().includes(term);

    const matchesJenis = filterJenis ? log.jenis_transaksi === filterJenis : true;
    return matchesSearch && matchesJenis;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Logbook Mutasi</h1>
          <p className="text-xs text-gray-500">Riwayat kronologis pergerakan material.</p>
        </div>
        <button onClick={exportKeCSV} className="bg-emerald-600 text-white px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-1 shadow-sm">
          <FileText size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-3 text-gray-400" size={16} />
          <input type="text" placeholder="Kata kunci..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-gray-200 text-xs rounded-xl pl-8 pr-2 py-2.5 outline-none" />
        </div>
        <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)} className="bg-white border border-gray-200 text-xs rounded-xl px-2 py-2.5 outline-none">
          <option value="">Semua Jenis</option>
          <option value="MASUK">MASUK</option>
          <option value="KELUAR">KELUAR</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-[10px]">{new Date(log.created_at).toLocaleString("id-ID")}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${log.jenis_transaksi === "MASUK" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                  {log.jenis_transaksi}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{log.materials?.nama_material}</h4>
                <p className="text-gray-400 text-[11px]">{log.materials?.kode_material} • PIC: <span className="text-gray-700 font-medium">{log.pic}</span></p>
              </div>
              <div className="flex justify-between items-center border-t border-b py-1.5 my-1 text-[11px] bg-gray-50 px-2 rounded-lg">
                <div>Jumlah: <span className="font-bold text-gray-800">{log.qty}</span></div>
                <div className="text-gray-500">Alur: {log.stok_awal} → <span className="font-bold text-blue-600">{log.stok_akhir}</span></div>
              </div>
              <p className="text-gray-600 text-[11px] bg-amber-50/40 p-2 rounded-lg border border-amber-100/30">
                <span className="font-semibold block text-[10px] text-amber-800">Keterangan:</span>
                {log.keterangan}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
