"use client"

import { Home, Camera, Boxes, Settings } from "lucide-react"
import type { Screen } from "@/lib/temuin/types"

interface Props {
  active: Screen
  onChange: (s: Screen) => void
}

const TABS: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "items", label: "Barang", icon: Boxes },
  { id: "camera", label: "Cari", icon: Camera },
  { id: "settings", label: "Pengaturan", icon: Settings },
]

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {TABS.map((tab) => {
          const isCam = tab.id === "camera"
          const isActive = active === tab.id
          const Icon = tab.icon
          if (isCam) {
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="flex flex-col items-center"
                aria-label={tab.label}
              >
                <span className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="mt-0.5 text-[10px] font-medium text-primary">{tab.label}</span>
              </button>
            )
          }
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-1 flex-col items-center gap-1 py-1"
              aria-label={tab.label}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] ${isActive ? "font-medium text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
