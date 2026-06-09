"use client"

import { useCallback, useEffect, useState } from "react"
import type { Room, TrackedItem } from "@/lib/temuin/types"
import { DEFAULT_ROOMS, SEED_ITEMS } from "@/lib/temuin/data"

const ITEMS_KEY = "temuin_items_v1"
const ROOMS_KEY = "temuin_rooms_v1"
const UNLOCKED_KEY = "temuin_unlocked_v1"
const ONBOARD_KEY = "temuin_onboarded_v1"

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function useTemuInStore() {
  const [items, setItems] = useState<TrackedItem[]>(SEED_ITEMS)
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS)
  const [unlocked, setUnlocked] = useState<string[]>([])
  const [onboarded, setOnboarded] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(load(ITEMS_KEY, SEED_ITEMS))
    setRooms(load(ROOMS_KEY, DEFAULT_ROOMS))
    setUnlocked(load(UNLOCKED_KEY, []))
    setOnboarded(load(ONBOARD_KEY, false))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
  }, [items, hydrated])
  useEffect(() => {
    if (hydrated) localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))
  }, [rooms, hydrated])
  useEffect(() => {
    if (hydrated) localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked))
  }, [unlocked, hydrated])
  useEffect(() => {
    if (hydrated) localStorage.setItem(ONBOARD_KEY, JSON.stringify(onboarded))
  }, [onboarded, hydrated])

  const updateItemSeen = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, lastSeen: Date.now() } : i)))
  }, [])

  const addRoomScan = useCallback((name: string) => {
    setRooms((prev) => [
      ...prev,
      { id: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(), name, scanned: true },
    ])
  }, [])

  const markRoomScanned = useCallback((id: string) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, scanned: true } : r)))
  }, [])

  const unlockCategory = useCallback((id: string) => {
    setUnlocked((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const completeOnboarding = useCallback(() => setOnboarded(true), [])

  const clearAllData = useCallback(() => {
    localStorage.removeItem(ITEMS_KEY)
    localStorage.removeItem(ROOMS_KEY)
    localStorage.removeItem(UNLOCKED_KEY)
    localStorage.removeItem(ONBOARD_KEY)
    setItems(SEED_ITEMS)
    setRooms(DEFAULT_ROOMS)
    setUnlocked([])
    setOnboarded(false)
  }, [])

  return {
    items,
    rooms,
    unlocked,
    onboarded,
    hydrated,
    updateItemSeen,
    addRoomScan,
    markRoomScanned,
    unlockCategory,
    completeOnboarding,
    clearAllData,
  }
}

export type TemuInStore = ReturnType<typeof useTemuInStore>
