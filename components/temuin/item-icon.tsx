"use client"

import {
  KeyRound,
  Wallet,
  Glasses,
  Tv,
  Smartphone,
  Watch,
  Headphones,
  CreditCard,
  BookOpen,
  Milk,
  Plug,
  Gem,
  FileText,
  Utensils,
  ToyBrick,
  Box,
  type LucideIcon,
} from "lucide-react"

const MAP: Record<string, LucideIcon> = {
  key: KeyRound,
  wallet: Wallet,
  glasses: Glasses,
  remote: Tv,
  phone: Smartphone,
  watch: Watch,
  headphones: Headphones,
  card: CreditCard,
  book: BookOpen,
  bottle: Milk,
  plug: Plug,
  gem: Gem,
  file: FileText,
  utensils: Utensils,
  toy: ToyBrick,
}

export function ItemIcon({ name, className }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? Box
  return <Icon className={className} aria-hidden="true" />
}
