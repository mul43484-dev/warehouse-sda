"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import { Material } from "@/types/inventory";
import { Search, Plus, Trash2, Edit3, X, Loader2 } from "lucide-react";

export default function MasterMaterialPage() {
  const supabase = createClientComponentClient();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);

  // Form states
  const [editId, setEditId] = useState<string | null>(null);
  const [kodeMaterial, setKodeMaterial] = useState("");
  const [namaMaterial, setNamaMaterial] = useState("");
  const [kategori, setKategori] = useState<any>("Electrical");
  const [satuan, setSatuan] = useState<any>("pcs");
  const [lokasiRak, setLokasiRak] = useState("");
  const [stokSaatIni, setStokSaatIni] = useState(0);
  const [stokMinimum, setStokMinimum] = useState(0);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("materials").select("*").order("created_at", { ascending: false });
    if (data) setMaterials(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      kode_material: kodeMaterial,
      nama_material: namaMaterial,
      kategori,
      satuan,
      lokasi_rak: lokasiRak,
      stok_saat_ini: Number(stokSaatIni),
      stok_minimum: Number(stokMinimum),
    };

    if (editId) {
      await supabase.from("materials").update(payload).eq("id", editId);
    } else {
      await supabase.from("materials").insert([payload]);
    }

    closeModal();
    fetchMaterials();
  }

  function openEdit(item: Material) {
    setEditId(item.id);
    setKodeMaterial(item.kode_material);
    setNamaMaterial(item.nama_material);
    setKategori(item.kategori);
    setSatuan(item.satuan);
    setLokasiRak(item.lokasi_rak);
    setStokSaatIni(item.stok_saat_ini);
    setStokMinimum(item.stok_minimum);
    setIsOpenModal(true);
  }

  function closeModal() {
    setEditId(null);
    setKodeMaterial("");
    setNamaMaterial("");
    setKategori("Electrical");
    setSatuan("pcs");
    setLokasiRak("");
    setStokSaatIni(0);
    setStokMinimum(0);
    setIsOpenModal(false);
  }

  async function handleDelete(id: string) {
    if (confirm("Hapus item data master ini?")) {
      await supabase.from("materials").delete().eq("id", id);
      fetchMaterials();
    }
  }

  const filteredItems = materials.filter((item) => {
    const matchesSearch = item.nama_material.toLowerCase().includes(search.toLowerCase()) ||
      item.kode_material.toLowerCase().includes(search.toLowerCase()) ||
      item.lokasi_rak.toLowerCase().includes(search.toLowerCase());
    const matchesKategori = filterKategori ? item.kategori === filterKategori : true;
    return matchesSearch && matchesKategori;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Master Data</h1>
          <p className="text-xs text-gray-500">Katalog jenis spesifikasi barang.</p>
        </div>
        <button onClick={() => setIsOpenModal(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-1 shadow-sm active:scale-95 transition-transform">
          <Plus size={16} />
          <span>Baru</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-3 text-gray-400" size={16} />
          <input type="text" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-gray-200 text-xs rounded-xl pl-8 pr-2 py-2.5 outline-none" />
        </div>
        <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="bg-white border border-gray-200 text-xs rounded-xl px-2 py-2.5 outline-none">
          <option value="">Semua Kategori</option>
          <option value="Electrical">Electrical</option>
          <option value="Mechanical">Mechanical</option>
          <option value="Consumable">Consumable</option>
          <option value="Sparepart">Sparepart</option>
        </select>
      </div>

      {/* Data Render */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{item.kategori}</span>
                <h3 className="text-sm font-bold text-gray-800 mt-1">{item.nama_material}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{item.kode_material} • Rak: <span className="text-gray-700 font-medium">{item.lokasi_rak}</span></p>
                <div className="mt-2 text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded w-fit">
                  Stok: {item.stok_saat_ini} {item.satuan} <span className="text-gray-400 font-normal ml-1">(Min: {item.stok_minimum})</span>
                </div>
              </div>
              <div className="flex space-x-1">
                <button onClick={() => openEdit(item)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Edit3 size={16} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog Form */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-sm font-bold text-gray-900">{editId ? "Ubah Data Material" : "Tambah Data Baru"}</h2>
              <button onClick={closeModal} className="text-gray-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Kode Barang</label>
                <input type="text" required value={kodeMaterial} onChange={(e) => setKodeMaterial(e.target.value)} className="w-full border p-2.5 rounded-xl outline-none" placeholder="Contoh: MAT-001" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Spesifikasi Material</label>
                <input type="text" required value={namaMaterial} onChange={(e) => setNamaMaterial(e.target.value)} className="w-full border p-2.5 rounded-xl outline-none" placeholder="Nama lengkap barang" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Kategori</label>
                  <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full border p-2.5 rounded-xl bg-transparent">
                    <option value="Electrical">Electrical</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Consumable">Consumable</option>
                    <option value="Sparepart">Sparepart</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Satuan Takaran</label>
                  <select value={satuan} onChange={(e) => setSatuan(e.target.value)} className="w-full border p-2.5 rounded-xl bg-transparent">
                    <option value="pcs">pcs</option>
                    <option value="meter">meter</option>
                    <option value="box">box</option>
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Lokasi Rak Penataan</label>
                <input type="text" required value={lokasiRak} onChange={(e) => setLokasiRak(e.target.value)} className="w-full border p-2.5 rounded-xl outline-none" placeholder="Contoh: Rak A-03" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Kuantitas Stok Sekarang</label>
                  <input type="number" required value={stokSaatIni} onChange={(e) => setStokSaatIni(Number(e.target.value))} className="w-full border p-2.5 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Ambang Stok Minimum</label>
                  <input type="number" required value={stokMinimum} onChange={(e) => setStokMinimum(Number(e.target.value))} className="w-full border p-2.5 rounded-xl outline-none" />
                </div>
              </div>
              Simpan Data



)}

);
              }
