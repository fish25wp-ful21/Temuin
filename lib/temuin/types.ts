export type RoomId = string

export interface Room {
  id: RoomId
  name: string
  scanned: boolean
}

export interface ItemCategory {
  id: string
  name: string
  icon: string
  premium: boolean
  group: string
}

export interface TrackedItem {
  id: string
  categoryId: string
  label: string
  roomId: RoomId
  // spatial position within room map (0-100 percent)
  x: number
  y: number
  // human readable location hint
  spot: string
  lastSeen: number // epoch ms
}

export type Screen = "home" | "camera" | "items" | "settings"

export interface NavStep {
  direction: "left" | "right" | "straight" | "arrived"
  text: string
}
