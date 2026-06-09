"use client"

import { useState } from "react"
import { Lock, MapPin, Clock, Navigation } from "lucide-react"
import type { Room, TrackedItem } from "@/lib/temuin/types"
import { ItemIcon } from "./item-icon"
import { CATEGORIES, getCategory, roomName } from "@/lib/temuin/data"
import { timeAgo } from "@/lib/temuin/engine"
import { Button } from "@/components/ui/button"
import { usePurchase } from "@/lib/pi-payment"

interface Props {
  items: TrackedItem[]
  rooms: Room[]
  unlocked: string[]
  onUnlock: (id: string) => void
  onFind: (categoryId: string) => void
}

export function ItemsScreen({ items, rooms, unlocked, onUnlock, onFind }: Props) {
  const { makePurchase } = usePurchase()
  const [busy, setBusy] = useState<string | null>(null)

  const freeCats = CATEGORIES.filter((c) => !c.premium)
  const premiumCats = CATEGORIES.filter((c) => c.premium)

  const itemsFor = (catId: string) => items.filter((i) => i.categoryId === catId)

  const handleUnlock = async (id: string) => {
    setBusy(id)
    try {
      // Pi payment to unlock premium category (on-chain). Falls back to local unlock.
      await makePurchase(id).catch(() => {})
    } finally {
      onUnlock(id)
      setBusy(null)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-24 text-foreground">
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold">Barang &amp; Kategori</h1>
        <p className="text-sm text-muted-foreground">Pantau lokasi terakhir setiap kategori.</p>
      </header>

      <section className="px-5">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Kategori Dasar (gratis)</h2>
        <div className="space-y-2">
          {freeCats.map((cat) => {
            const found = itemsFor(cat.id)
            const latest = found.sort((a, b) => b.lastSeen - a.lastSeen)[0]
            return (
              <div
                key={cat.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <ItemIcon name={cat.icon} className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{cat.name}</p>
                  {latest ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{roomName(rooms, latest.roomId)}</span>
                      <Clock className="h-3 w-3" />
                      <span>{timeAgo(latest.lastSeen)}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Belum terlihat</p>
                  )}
                </div>
                {latest && (
                  <Button size="icon" variant="secondary" className="shrink-0" onClick={() => onFind(cat.id)} aria-label={`Cari ${cat.name}`}>
                    <Navigation className="h-4 w-4 text-primary" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Kategori Tambahan (buka via Pi)</h2>
        <div className="space-y-2">
          {premiumCats.map((cat) => {
            const isUnlocked = unlocked.includes(cat.id)
            return (
              <div
                key={cat.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <ItemIcon name={cat.icon} className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {isUnlocked ? "Aktif — siap dilacak" : "Terkunci"}
                  </p>
                </div>
                {isUnlocked ? (
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
                    Aktif
                  </span>
                ) : (
                  <Button
                    size="sm"
                    className="shrink-0 gap-1"
                    disabled={busy === cat.id}
                    onClick={() => handleUnlock(cat.id)}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    {busy === cat.id ? "..." : "Buka"}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
