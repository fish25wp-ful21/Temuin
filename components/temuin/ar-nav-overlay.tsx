"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, ArrowLeft, ArrowRight, MapPin } from "lucide-react"
import type { NavStep, TrackedItem } from "@/lib/temuin/types"
import { buildNavSteps } from "@/lib/temuin/engine"
import type { Room } from "@/lib/temuin/types"
import { ItemIcon } from "./item-icon"
import { getCategory } from "@/lib/temuin/data"

interface Props {
  item: TrackedItem
  rooms: Room[]
}

export function ARNavOverlay({ item, rooms }: Props) {
  const steps = buildNavSteps(item, rooms)
  const [stepIndex, setStepIndex] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setStepIndex(0)
    timer.current = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, 2600)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])

  const step: NavStep = steps[stepIndex]
  const arrived = step.direction === "arrived"
  const cat = getCategory(item.categoryId)

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-between">
      {/* top guidance pill */}
      <div className="mt-20 flex items-center gap-2 rounded-full border border-primary/40 bg-background/80 px-4 py-2 backdrop-blur-md animate-slide-up">
        <DirIcon dir={step.direction} />
        <span className="text-sm font-medium text-foreground">{step.text}</span>
      </div>

      {/* floor path */}
      {!arrived && (
        <div className="absolute bottom-0 left-1/2 h-2/3 w-40 -translate-x-1/2">
          <div
            className="mx-auto h-full w-24 animate-path-flow opacity-80"
            style={{
              clipPath: "polygon(38% 100%, 62% 100%, 80% 0, 20% 0)",
              background:
                "repeating-linear-gradient(to bottom, var(--primary) 0 12px, transparent 12px 32px)",
            }}
          />
        </div>
      )}

      {/* center arrow / target marker */}
      <div className="flex flex-1 items-center justify-center">
        {arrived ? (
          <div className="flex flex-col items-center gap-3 animate-ar-pulse">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent bg-accent/15 shadow-[0_0_40px_var(--accent)]">
              <ItemIcon name={cat?.icon ?? "box"} className="h-10 w-10 text-accent" />
            </div>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              {item.label} di sini
            </span>
          </div>
        ) : (
          <div className="animate-ar-pulse">
            <DirArrow dir={step.direction} />
          </div>
        )}
      </div>

      {/* bottom target info */}
      <div className="mb-40 flex items-center gap-2 rounded-2xl border border-border bg-background/80 px-4 py-2 backdrop-blur-md">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-xs text-muted-foreground">Target: {item.spot}</span>
      </div>
    </div>
  )
}

function DirIcon({ dir }: { dir: NavStep["direction"] }) {
  const cls = "h-4 w-4 text-primary"
  if (dir === "left") return <ArrowLeft className={cls} />
  if (dir === "right") return <ArrowRight className={cls} />
  if (dir === "arrived") return <MapPin className="h-4 w-4 text-accent" />
  return <ArrowUp className={cls} />
}

function DirArrow({ dir }: { dir: NavStep["direction"] }) {
  const base = "h-20 w-20 text-primary drop-shadow-[0_0_20px_var(--primary)]"
  if (dir === "left") return <ArrowLeft className={base} strokeWidth={2.5} />
  if (dir === "right") return <ArrowRight className={base} strokeWidth={2.5} />
  return <ArrowUp className={base} strokeWidth={2.5} />
}
