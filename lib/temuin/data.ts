import type { ItemCategory, Room, TrackedItem } from "./types"

// 10 free categories + premium categories
export const CATEGORIES: ItemCategory[] = [
  { id: "kunci", name: "Kunci", icon: "key", premium: false, group: "Dasar" },
  { id: "dompet", name: "Dompet", icon: "wallet", premium: false, group: "Dasar" },
  { id: "kacamata", name: "Kacamata", icon: "glasses", premium: false, group: "Dasar" },
  { id: "remote", name: "Remote TV", icon: "remote", premium: false, group: "Dasar" },
  { id: "ponsel", name: "Ponsel", icon: "phone", premium: false, group: "Dasar" },
  { id: "jam", name: "Jam Tangan", icon: "watch", premium: false, group: "Dasar" },
  { id: "headphone", name: "Headphone", icon: "headphones", premium: false, group: "Dasar" },
  { id: "kartu", name: "Kartu (KTP/ATM)", icon: "card", premium: false, group: "Dasar" },
  { id: "buku", name: "Buku/Catatan", icon: "book", premium: false, group: "Dasar" },
  { id: "botol", name: "Botol Minum", icon: "bottle", premium: false, group: "Dasar" },
  // premium
  { id: "elektronik", name: "Alat Elektronik", icon: "plug", premium: true, group: "Tambahan" },
  { id: "perhiasan", name: "Perhiasan", icon: "gem", premium: true, group: "Tambahan" },
  { id: "dokumen", name: "Dokumen Penting", icon: "file", premium: true, group: "Tambahan" },
  { id: "dapur", name: "Perlengkapan Dapur", icon: "utensils", premium: true, group: "Tambahan" },
  { id: "mainan", name: "Mainan Anak", icon: "toy", premium: true, group: "Tambahan" },
]

export const DEFAULT_ROOMS: Room[] = [
  { id: "ruang-tamu", name: "Ruang Tamu", scanned: true },
  { id: "kamar-tidur", name: "Kamar Tidur", scanned: true },
  { id: "ruang-makan", name: "Ruang Makan", scanned: true },
  { id: "dapur", name: "Dapur", scanned: false },
  { id: "ruang-kerja", name: "Ruang Kerja", scanned: true },
]

const now = Date.now()
const min = 60 * 1000
const hr = 60 * min

// Seed of items detected by the (simulated) passive visual memory
export const SEED_ITEMS: TrackedItem[] = [
  {
    id: "i1",
    categoryId: "kunci",
    label: "Kunci motor",
    roomId: "ruang-makan",
    x: 62,
    y: 40,
    spot: "di meja makan, di samping piring",
    lastSeen: now - 18 * min,
  },
  {
    id: "i2",
    categoryId: "dompet",
    label: "Dompet kulit",
    roomId: "ruang-tamu",
    x: 38,
    y: 58,
    spot: "di bawah bantal sofa",
    lastSeen: now - 2 * hr,
  },
  {
    id: "i3",
    categoryId: "kacamata",
    label: "Kacamata baca",
    roomId: "ruang-kerja",
    x: 70,
    y: 30,
    spot: "di atas meja kerja, dekat lampu",
    lastSeen: now - 45 * min,
  },
  {
    id: "i4",
    categoryId: "remote",
    label: "Remote TV",
    roomId: "ruang-tamu",
    x: 50,
    y: 70,
    spot: "di rak bawah meja televisi",
    lastSeen: now - 4 * hr,
  },
  {
    id: "i5",
    categoryId: "ponsel",
    label: "Ponsel cadangan",
    roomId: "kamar-tidur",
    x: 44,
    y: 35,
    spot: "di atas nakas samping tempat tidur",
    lastSeen: now - 1 * hr,
  },
  {
    id: "i6",
    categoryId: "jam",
    label: "Jam tangan",
    roomId: "kamar-tidur",
    x: 60,
    y: 55,
    spot: "di laci meja rias",
    lastSeen: now - 6 * hr,
  },
  {
    id: "i7",
    categoryId: "headphone",
    label: "Headphone",
    roomId: "ruang-kerja",
    x: 30,
    y: 60,
    spot: "tergantung di kursi kerja",
    lastSeen: now - 25 * min,
  },
  {
    id: "i8",
    categoryId: "botol",
    label: "Botol minum",
    roomId: "dapur",
    x: 55,
    y: 45,
    spot: "di rak dekat wastafel",
    lastSeen: now - 3 * hr,
  },
]

export function getCategory(id: string): ItemCategory | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

export function roomName(rooms: Room[], id: string): string {
  return rooms.find((r) => r.id === id)?.name ?? id
}
