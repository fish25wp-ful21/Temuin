"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, Send, X, Search, Sparkles } from "lucide-react"
import { ARNavOverlay } from "./ar-nav-overlay"
import { answerQuery, suggestions, type QueryResult } from "@/lib/temuin/engine"
import type { Room, TrackedItem } from "@/lib/temuin/types"

interface Props {
  items: TrackedItem[]
  rooms: Room[]
  initialQuery?: string
  onItemFound?: (id: string) => void
}

export function CameraView({ items, rooms, initialQuery, onItemFound }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [camReady, setCamReady] = useState(false)
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<QueryResult | null>(null)
  const [target, setTarget] = useState<TrackedItem | null>(null)
  const [listening, setListening] = useState(false)
  const recogRef = useRef<any>(null)

  // Camera active ONLY while foreground (component mounted) — privacy-first
  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
          setCamReady(true)
        }
      } catch {
        setCamReady(false)
      }
    }
    start()
    return () => {
      cancelled = true
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (initialQuery) runQuery(initialQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  const runQuery = (q: string) => {
    setQuery(q)
    const res = answerQuery(q, items, rooms)
    setResult(res)
    setTarget(res.item)
    if (res.item) onItemFound?.(res.item.id)
  }

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (query.trim()) runQuery(query)
  }

  const toggleVoice = () => {
    const SR =
      (typeof window !== "undefined" && (window as any).SpeechRecognition) ||
      (typeof window !== "undefined" && (window as any).webkitSpeechRecognition)
    if (!SR) {
      // graceful fallback: simulate offline voice-to-text
      setListening(true)
      setTimeout(() => {
        setListening(false)
        runQuery("Di mana kunciku?")
      }, 1800)
      return
    }
    if (listening) {
      recogRef.current?.stop()
      setListening(false)
      return
    }
    const recog = new SR()
    recog.lang = "id-ID"
    recog.interimResults = false
    recog.continuous = false
    recog.onresult = (ev: any) => {
      const text = ev.results[0][0].transcript
      runQuery(text)
    }
    recog.onend = () => setListening(false)
    recog.onerror = () => setListening(false)
    recogRef.current = recog
    setListening(true)
    recog.start()
  }

  const clear = () => {
    setResult(null)
    setTarget(null)
    setQuery("")
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* camera feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* dim + simulated environment when no camera */}
      {!camReady && (
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-background" />
      )}
      <div className="absolute inset-0 bg-black/30" />

      {/* status badge */}
      <div className="absolute left-1/2 top-14 z-30 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 backdrop-blur-md">
          <span
            className={`h-2 w-2 rounded-full ${camReady ? "bg-accent" : "bg-muted-foreground"} ${camReady ? "animate-pulse" : ""}`}
          />
          <span className="text-xs text-muted-foreground">
            {camReady ? "Memori visual aktif" : "Mode simulasi (kamera nonaktif)"}
          </span>
        </div>
      </div>

      {/* AR overlay when a target is found */}
      {target && <ARNavOverlay item={target} rooms={rooms} />}

      {/* result card */}
      {result && (
        <div className="absolute inset-x-0 bottom-32 z-30 px-4">
          <div className="animate-slide-up rounded-2xl border border-primary/30 bg-background/85 p-4 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-pretty text-sm leading-relaxed text-foreground">{result.response}</p>
              <button
                onClick={clear}
                aria-label="Tutup"
                className="ml-auto shrink-0 rounded-full p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* query bar */}
      <div className="absolute inset-x-0 bottom-20 z-30 px-4 pb-2">
        {!result && (
          <div className="mb-3 flex flex-wrap justify-center gap-2">
            {suggestions().map((s) => (
              <button
                key={s}
                onClick={() => runQuery(s)}
                className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={submit} className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-background/85 px-4 py-3 backdrop-blur-xl">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tanya: Di mana kunciku?"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button type="submit" aria-label="Cari" className="shrink-0 text-primary">
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={toggleVoice}
            aria-label="Pencarian suara"
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
          >
            {listening && (
              <span className="absolute inset-0 rounded-2xl bg-primary animate-mic-ring" />
            )}
            <Mic className="relative h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
