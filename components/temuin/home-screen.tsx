"use client"

import { Camera, Clock, MapPin, Search } from "lucide-react"
import type { Room, TrackedItem } from "@/lib/temuin/types"
import { ItemIcon } from "./item-icon"
import { getCategory, roomName } from "@/lib/temuin/data"
import { timeAgo } from "@/lib/temuin/engine"

interface Props {
  items: TrackedItem[]
  rooms: Room[]
  onOpenCamera: () => void
  onQuickFind: (categoryId: string) => void
}

export function HomeScreen({ items, rooms, onOpenCamera, onQuickFind }: Props) {
  const recent = [...items].sort((a, b) => b.lastSeen - a.lastSeen).slice(0, 5)
  const scannedRooms = rooms.filter((r) => r.scanned).length

  return (
    <div className="min-h-[100dvh] bg-background pb-24 text-foreground">
      <header className="px-5 pt-12 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none">TemuIn</h1>
            <p className="text-xs text-muted-foreground">Asisten pencari barang offline</p>
          </div>
        </div>
      </header>

      {/* hero / open camera */}
      <div className="px-5 pt-4">
        <button
          onClick={onOpenCamera}
          className="relative flex w-full flex-col items-start overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 to-secondary p-5 text-left"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Camera className="h-6 w-6" />
          </div>
          <p className="mt-4 text-lg font-semibold">Buka Kamera &amp; Cari</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Aktifkan memori visual dan dapatkan panduan AR menuju barangmu.
          </p>
        </button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 px-5 pt-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-2xl font-bold text-foreground">{items.length}</p>
          <p className="text-xs text-muted-foreground">Barang terlacak</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-2xl font-bold text-foreground">{scannedRooms}</p>
          <p className="text-xs text-muted-foreground">Ruangan dipetakan</p>
        </div>
      </div>

      {/* recent items */}
      <div className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Terakhir terlihat</h2>
        <div className="space-y-2">
          {recent.map((item) => {
            const cat = getCategory(item.categoryId)
            return (
              <button
                key={item.id}
                onClick={() => onQuickFind(item.categoryId)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <ItemIcon name={cat?.icon ?? "box"} className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.label}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {roomName(rooms, item.roomId)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(item.lastSeen)}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
