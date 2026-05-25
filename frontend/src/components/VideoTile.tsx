import { useEffect, useRef } from 'react'

interface VideoTileProps {
  stream: MediaStream | null
  title: string
  subtitle?: string
}

export function VideoTile({ stream, title, subtitle }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videoElement = videoRef.current

    if (!videoElement) {
      return
    }

    videoElement.srcObject = stream

    return () => {
      videoElement.srcObject = null
    }
  }, [stream])

  return (
    <article className="overflow-hidden rounded-[var(--radius)] border border-border bg-card p-4 shadow-[var(--shadow-md)]">
      <header className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{title}</p>
        {subtitle ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
      </header>
      <video
        ref={videoRef}
        className="min-h-64 w-full rounded-[calc(var(--radius)-0.25rem)] border border-border bg-muted object-cover"
        autoPlay
        playsInline
        muted
      />
    </article>
  )
}
