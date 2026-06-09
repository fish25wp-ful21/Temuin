import type { Room, TrackedItem, NavStep } from "./types"
import { CATEGORIES, getCategory, roomName } from "./data"

// ---- Natural language query matching (offline, on-device simulation) ----

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// keyword map for fuzzy Indonesian matching
const KEYWORDS: Record<string, string[]> = {
  kunci: ["kunci", "kunciku", "motor", "mobil"],
  dompet: ["dompet", "dompetku", "wallet"],
  kacamata: ["kacamata", "kaca mata", "kacamataku"],
  remote: ["remote", "remot", "tv", "televisi"],
  ponsel: ["ponsel", "hp", "handphone", "telepon", "telpon"],
  jam: ["jam", "jam tangan", "arloji"],
  headphone: ["headphone", "headset", "earphone"],
  kartu: ["kartu", "ktp", "atm"],
  buku: ["buku", "catatan", "notes"],
  botol: ["botol", "minum", "tumbler"],
  elektronik: ["elektronik", "charger", "kabel"],
  perhiasan: ["perhiasan", "cincin", "kalung", "gelang"],
  dokumen: ["dokumen", "surat", "ijazah"],
  dapur: ["dapur", "panci", "sendok"],
  mainan: ["mainan", "boneka", "lego"],
}

export interface QueryResult {
  item: TrackedItem | null
  response: string
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.round(diff / 60000)
  if (min < 1) return "baru saja"
  if (min < 60) return `${min} menit lalu`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} jam lalu`
  const d = Math.round(hr / 24)
  return `${d} hari lalu`
}

export function answerQuery(query: string, items: TrackedItem[], rooms: Room[]): QueryResult {
  const q = normalize(query)
  if (!q) {
    return { item: null, response: "Coba tanyakan, misalnya: \"Di mana kunciku?\" atau \"Cari dompet\"." }
  }

  // find which category the query refers to
  let matchedCat: string | null = null
  let bestScore = 0
  for (const [catId, words] of Object.entries(KEYWORDS)) {
    for (const w of words) {
      if (q.includes(w) && w.length > bestScore) {
        matchedCat = catId
        bestScore = w.length
      }
    }
  }

  if (!matchedCat) {
    return {
      item: null,
      response: "Maaf, aku belum mengenali barang itu. Coba sebutkan barang seperti kunci, dompet, atau kacamata.",
    }
  }

  const cat = getCategory(matchedCat)
  const candidates = items.filter((i) => i.categoryId === matchedCat)

  if (candidates.length === 0) {
    if (cat?.premium) {
      return {
        item: null,
        response: `Kategori "${cat.name}" belum aktif. Buka kategori tambahan lewat Pi untuk melacaknya.`,
      }
    }
    return {
      item: null,
      response: `Aku belum pernah melihat ${cat?.name ?? "barang"} itu. Jelajahi rumah dengan kamera agar aku bisa mengingatnya.`,
    }
  }

  // most recently seen
  const item = candidates.sort((a, b) => b.lastSeen - a.lastSeen)[0]
  const room = roomName(rooms, item.roomId)
  const ago = timeAgo(item.lastSeen)

  const response = `${item.label} terakhir terlihat di ${room}, ${item.spot}. Terakhir dilihat ${ago}.`
  return { item, response }
}

// ---- AR navigation step generation (simulated walk toward the item) ----

export function buildNavSteps(item: TrackedItem, rooms: Room[]): NavStep[] {
  const room = roomName(rooms, item.roomId)
  const dirSeed = (item.x + item.y) % 3
  const firstTurn: NavStep =
    dirSeed === 0
      ? { direction: "left", text: `Belok kiri menuju ${room}` }
      : dirSeed === 1
        ? { direction: "right", text: `Belok kanan menuju ${room}` }
        : { direction: "straight", text: `Jalan lurus menuju ${room}` }

  const dist = Math.max(2, Math.round((item.y / 100) * 8))

  return [
    firstTurn,
    { direction: "straight", text: `Lurus ${dist} meter` },
    { direction: item.x > 50 ? "right" : "left", text: `Belok ${item.x > 50 ? "kanan" : "kiri"} sedikit` },
    { direction: "arrived", text: `Terakhir terlihat ${item.spot}` },
  ]
}

export function suggestions(): string[] {
  return ["Di mana kunciku?", "Cari dompet", "Kacamata di mana?", "Cari remote TV"]
}

export { CATEGORIES }
