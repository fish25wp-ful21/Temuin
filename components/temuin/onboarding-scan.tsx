"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScanLine, Check, ShieldCheck, Camera, Map } from "lucide-react"
import type { Room } from "@/lib/temuin/types"

interface Props {
  rooms: Room[]
  onScanRoom: (id: string) => void
  onComplete: () => void
}

export function OnboardingScan({ rooms, onScanRoom, onComplete }: Props) {
  const [scanning, setScanning] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set(rooms.filter((r) => r.scanned).map((r) => r.id)))

  const scan = (id: string) => {
    setScanning(id)
    setTimeout(() => {
      onScanRoom(id)
      setDone((prev) => new Set(prev).add(id))
      setScanning(null)
    }, 2200)
  }

  const scannedCount = done.size

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="px-6 pt-12 pb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
          <Map className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-balance text-2xl font-bold">Petakan Rumahmu</h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Scan setiap ruangan satu kali untuk membangun peta 3D rumah. Semua tersimpan lokal di perangkat.
        </p>
      </header>

      <div className="flex-1 space-y-3 px-5">
        {rooms.map((room) => {
          const isScanned = done.has(room.id)
          const isScanning = scanning === room.id
          return (
            <div
              key={room.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
                {isScanning ? (
                  <>
                    <Camera className="h-5 w-5 text-primary" />
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-primary animate-scan-sweep" />
                  </>
                ) : isScanned ? (
                  <Check className="h-5 w-5 text-accent" />
                ) : (
                  <ScanLine className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{room.name}</p>
                <p className="text-xs text-muted-foreground">
                  {isScanning ? "Memindai..." : isScanned ? "Peta tersimpan" : "Belum dipindai"}
                </p>
              </div>
              <Button
                size="sm"
                variant={isScanned ? "secondary" : "default"}
                disabled={isScanning}
                onClick={() => scan(room.id)}
                className="shrink-0"
              >
                {isScanned ? "Scan ulang" : "Scan"}
              </Button>
            </div>
          )
        })}
      </div>

      <div className="space-y-3 px-5 pb-8 pt-4">
        <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
          <span>Tidak ada data yang dikirim ke server. 100% offline.</span>
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={scannedCount === 0}
          onClick={onComplete}
        >
          {scannedCount === 0 ? "Scan minimal 1 ruangan" : `Mulai (${scannedCount} ruangan dipetakan)`}
        </Button>
      </div>
    </div>
  )
}
