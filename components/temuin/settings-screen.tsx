"use client"

import { useState } from "react"
import { ShieldCheck, Trash2, ScanLine, Download, RefreshCw, CheckCircle2, User, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { usePurchase } from "@/lib/pi-payment"
import type { Room, TrackedItem } from "@/lib/temuin/types"
import { roomName } from "@/lib/temuin/data"
import { timeAgo } from "@/lib/temuin/engine"

interface Props {
  rooms: Room[]
  items: TrackedItem[]
  unlocked: string[]
  onRescan: () => void
  onUnlock: (id: string) => void
  onClearData: () => void
}

export function SettingsScreen({ rooms, items, unlocked, onRescan, onUnlock, onClearData }: Props) {
  const { isAuthenticated } = usePiAuth()
  const { makePurchase } = usePurchase()
  const [confirming, setConfirming] = useState(false)
  const [exportBusy, setExportBusy] = useState(false)
  const exportUnlocked = unlocked.includes("export")

  const handleExport = async () => {
    if (!exportUnlocked) {
      setExportBusy(true)
      await makePurchase("export").catch(() => {})
      onUnlock("export")
      setExportBusy(false)
      return
    }
    // local export to file — no server involved
    const data = items.map((i) => ({
      barang: i.label,
      ruangan: roomName(rooms, i.roomId),
      lokasi: i.spot,
      terakhir: timeAgo(i.lastSeen),
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "temuin-lokasi-barang.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-24 text-foreground">
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">Privasi, peta, dan akun Pi.</p>
      </header>

      {/* Pi account */}
      <div className="px-5">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Akun Pi Network</p>
            <p className="text-xs text-muted-foreground">
              {isAuthenticated ? "Terautentikasi via Pi Browser" : "Belum terautentikasi"}
            </p>
          </div>
          {isAuthenticated && <CheckCircle2 className="h-5 w-5 text-accent" />}
        </div>
      </div>

      {/* privacy */}
      <div className="px-5 pt-4">
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <p className="font-medium">Privasi-utama</p>
          </div>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
            <li>• Semua video, peta 3D, dan data lokasi diproses lokal di perangkat.</li>
            <li>• Tidak ada data dikirim ke server eksternal.</li>
            <li>• Kamera aktif hanya saat aplikasi di latar depan.</li>
            <li>• Tidak ada pelacakan atau analitik.</li>
          </ul>
        </div>
      </div>

      {/* actions */}
      <div className="space-y-2 px-5 pt-4">
        <button
          onClick={onRescan}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left"
        >
          <ScanLine className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="font-medium">Scan ulang ruangan</p>
            <p className="text-xs text-muted-foreground">Perbarui peta 3D rumah</p>
          </div>
        </button>

        <button
          onClick={handleExport}
          disabled={exportBusy}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left"
        >
          {exportUnlocked ? (
            <Download className="h-5 w-5 text-primary" />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="flex-1">
            <p className="font-medium">Ekspor data lokasi</p>
            <p className="text-xs text-muted-foreground">
              {exportUnlocked ? "Backup ke file lokal" : "Buka fitur via Pi"}
            </p>
          </div>
        </button>

        <button
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left"
          onClick={() => alert("Pembaruan model AI & NLP dikirim aman lewat Pi Network (OTA).")}
        >
          <RefreshCw className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="font-medium">Pembaruan OTA model AI</p>
            <p className="text-xs text-muted-foreground">Arsitektur modular, update via Pi</p>
          </div>
        </button>
      </div>

      {/* danger zone */}
      <div className="px-5 pt-6">
        {confirming ? (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-foreground">Hapus semua data lokal?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Peta 3D, lokasi barang, dan kategori akan dikembalikan ke awal.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onClearData()
                  setConfirming(false)
                }}
              >
                Ya, hapus
              </Button>
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setConfirming(false)}>
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirming(true)}>
            <Trash2 className="h-4 w-4" />
            Hapus semua data lokal
          </Button>
        )}
      </div>

      <p className="px-5 pt-6 text-center text-xs text-muted-foreground">Made with App Studio</p>
    </div>
  )
}
