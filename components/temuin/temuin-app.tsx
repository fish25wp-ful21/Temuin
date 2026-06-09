"use client"

import { useState } from "react"
import { useTemuInStore } from "@/hooks/use-temuin-store"
import { OnboardingScan } from "./onboarding-scan"
import { HomeScreen } from "./home-screen"
import { CameraView } from "./camera-view"
import { ItemsScreen } from "./items-screen"
import { SettingsScreen } from "./settings-screen"
import { BottomNav } from "./bottom-nav"
import type { Screen } from "@/lib/temuin/types"

export function TemuInApp() {
  const store = useTemuInStore()
  const [screen, setScreen] = useState<Screen>("home")
  const [pendingQuery, setPendingQuery] = useState<string | undefined>(undefined)
  const [forceScan, setForceScan] = useState(false)

  if (!store.hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!store.onboarded || forceScan) {
    return (
      <OnboardingScan
        rooms={store.rooms}
        onScanRoom={store.markRoomScanned}
        onComplete={() => {
          store.completeOnboarding()
          setForceScan(false)
          setScreen("home")
        }}
      />
    )
  }

  const findCategory = (categoryId: string) => {
    const queries: Record<string, string> = {
      kunci: "Di mana kunciku?",
      dompet: "Cari dompet",
      kacamata: "Kacamata di mana?",
      remote: "Cari remote TV",
      ponsel: "Di mana ponselku?",
      jam: "Cari jam tangan",
      headphone: "Cari headphone",
      botol: "Cari botol minum",
    }
    setPendingQuery(queries[categoryId] ?? `Cari ${categoryId}`)
    setScreen("camera")
  }

  return (
    <div className="mx-auto max-w-md bg-background">
      {screen === "home" && (
        <HomeScreen
          items={store.items}
          rooms={store.rooms}
          onOpenCamera={() => {
            setPendingQuery(undefined)
            setScreen("camera")
          }}
          onQuickFind={findCategory}
        />
      )}

      {screen === "camera" && (
        <CameraView
          items={store.items}
          rooms={store.rooms}
          initialQuery={pendingQuery}
          onItemFound={store.updateItemSeen}
        />
      )}

      {screen === "items" && (
        <ItemsScreen
          items={store.items}
          rooms={store.rooms}
          unlocked={store.unlocked}
          onUnlock={store.unlockCategory}
          onFind={findCategory}
        />
      )}

      {screen === "settings" && (
        <SettingsScreen
          rooms={store.rooms}
          items={store.items}
          unlocked={store.unlocked}
          onRescan={() => setForceScan(true)}
          onUnlock={store.unlockCategory}
          onClearData={store.clearAllData}
        />
      )}

      <BottomNav active={screen} onChange={setScreen} />
    </div>
  )
}
