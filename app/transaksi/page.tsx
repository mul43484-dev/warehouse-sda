"use client";
import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import { Material } from "@/types/inventory";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function TransaksiPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [jenisTransaksi, setJenisTransaksi] = useState<"MASUK" | "KELUAR">("MASUK");
  const [qty, setQty] = useState<number>(1);
  const [keterangan, setKeterangan] = useState("");
  const [currentUser, setCurrentUser] = useState("");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: mats } = await supabase.from("materials").select("*").order("nama_material");
      if (mats) setMaterials(mats);

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", sessionData.session.user.id)
          .single();
        if (profile) setCurrentUser(profile.full_name);
      }
    }
    loadData();
  }, [supabase]);

  async function handleProses(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const material = materials.find((m) => m.id === selectedMaterialId);
    if (!material) {
      setMessage({ type: "error", text: "Silakan pilih material terlebih dahulu." });
      return;
    }

    if (qty <= 0) {
      setMessage({ type: "error", text: "Jumlah kuantitas valid minimal 1 angka." });
      return;
    }

    const stokAwal = material.stok_saat_ini;
    let stokAkhir = stokAwal;

    if (jenisTransaksi === "MASUK") {
      stokAkhir = stokAwal + qty;
    } else {
      if (qty > stokAwal) {
        setMessage({ type: "error", text: `Gagal! Stok tidak cukup. Sisa stok tersedia: ${stokAwal} ${material.satuan}` });
        return;
      }
      stokAkhir = stokAwal - qty;
    }

    // 1. Catat Logbook
    const { error: logError } = await supabase.from("stock_logs").insert([
      {
        material_id: selectedMaterialId,
        jenis_transaksi: jenisTransaksi,
        qty: qty,
        stok_awal: stokAwal,
        stok_akhir: stokAkhir,
        pic: currentUser || "Petugas Lapangan",
        keterangan: keterangan,
      },
    ]);

    if (logError) {
      setMessage({ type: "error", text: "Gagal memproses catatan log transaksi." });
      return;
    }

    // 2. Update Master Stok
    await supabase.from("materials").update({ stok_saat_ini: stokAkhir }).eq("id", selectedMaterialId);

    setMessage({ type: "success", text: `Sukses mencatat mutasi ${jenisTransaksi} sebanyak ${qty} ${material.satuan}.` });

    // Reset formulir input cepat
    setSelectedMaterialId("");
    setQty(1);
    setKeterangan("");

    // Refresh data internal
    const { data: mats } = await supabase.from("materials").select("*").order("nama_material");
    if (mats) setMaterials(mats);
    router.refresh();
  }

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pencatatan Stok</h1>
        <p className="text-xs text-gray-500">Mutasi masuk logistik dan keluar material gudang.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start space-x-2 text-xs border ${message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {message.type === "success" ? <CheckCircle size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleProses} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Pilih Item Material</label>
          <select required value={selectedMaterialId} onChange={(e) => setSelectedMaterialId(e.target.value)} className="w-full border p-3 rounded-xl bg-transparent">
            <option value="">-- Sentuh & Pilih --</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama_material} ({m.kode_material})
              </option>
            ))}
          </select>
          {selectedMaterial && (
            <p className="text-[11px] text-blue-600 font-medium mt-1">Stok Gudang Terkini: {selectedMaterial.stok_saat_ini} {selectedMaterial.satuan}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Jenis Pergerakan</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setJenisTransaksi("MASUK")} className={`py-3 rounded-xl font-bold text-center border transition-all ${jenisTransaksi === "MASUK" ? "bg-green-600 border-green-600 text-white shadow-sm" : "bg-gray-50 text-gray-600"}`}>
              BARANG MASUK
            </button>
            <button type="button" onClick={() => setJenisTransaksi("KELUAR")} className={`py-3 rounded-xl font-bold text-center border transition-all ${jenisTransaksi === "KELUAR" ? "bg-red-600 border-red-600 text-white shadow-sm" : "bg-gray-50 text-gray-600"}`}>
              BARANG KELUAR
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Jumlah (Qty)</label>
            <input type="number" required min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-full border p-3 rounded-xl outline-none" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Petugas (PIC)</label>
            <input type="text" disabled value={currentUser || "Memuat..."} className="w-full border p-3 bg-gray-50 rounded-xl font-medium text-gray-500" />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Keperluan / Keterangan Penugasan</label>
          <textarea required rows={3} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="w-full border p-3 rounded-xl outline-none" placeholder="Contoh: No WO-9912, Keperluan Perbaikan Mesin Conveyor Line 2, Supplier PT Makmur"></textarea>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-md active:scale-95 transition-transform text-sm mt-2">
          Eksekusi & Update Logbook
        </button>
      </form>
    </div>
  );
}
