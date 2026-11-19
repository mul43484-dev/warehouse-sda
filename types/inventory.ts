export interface Material {
  id: string;
  kode_material: string;
  nama_material: string;
  kategori: 'Electrical' | 'Mechanical' | 'Consumable' | 'Sparepart';
  satuan: 'pcs' | 'meter' | 'box' | 'kg' | 'liter';
  lokasi_rak: string;
  stok_saat_ini: number;
  stok_minimum: number;
  created_at?: string;
}

export interface StockLog {
  id: string;
  material_id: string;
  jenis_transaksi: 'MASUK' | 'KELUAR';
  qty: number;
  stok_awal: number;
  stok_akhir: number;
  pic: string;
  keterangan: string;
  created_at: string;
  materials?: {
    kode_material: string;
    nama_material: string;
  };
}

export interface UserProfile {
  id: string;
  full_name: string;
  role: 'admin' | 'staff';
}
