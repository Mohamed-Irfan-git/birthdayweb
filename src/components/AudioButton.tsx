import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const MUSIC_VOLUME = 0.38
const FADE_MS = 800

export function AudioButton() {
  const [enabled, setEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const enabledRef = useRef(true)
  const fadeFrameRef = useRef<number | null>(null)

  const fadeTo = (target: number, onComplete?: () => void) => {
    const audio = audioRef.current
    if (!audio) return
    if (fadeFrameRef.current !== null) cancelAnimationFrame(fadeFrameRef.current)
    const from = audio.volume
    const started = performance.now()
    const animate = (now: number) => {
      const progress = Math.min(1, (now - started) / FADE_MS)
      const eased = 1 - (1 - progress) ** 3
      audio.volume = from + (target - from) * eased
      if (progress < 1) fadeFrameRef.current = requestAnimationFrame(animate)
      else {
        fadeFrameRef.current = null
        onComplete?.()
      }
    }
    fadeFrameRef.current = requestAnimationFrame(animate)
  }

  const startMusic = () => {
    const audio = audioRef.current
    if (!audio || !enabledRef.current) return
    const playback = audio.play()
    void playback.then(() => {
      if (enabledRef.current) fadeTo(MUSIC_VOLUME)
      else audio.pause()
    }).catch(() => undefined)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0

    const beginAfterGesture = (event: Event) => {
      const target = event.target
      if (target instanceof Element && target.closest('.sound-toggle')) return
      startMusic()
    }

    // Try immediately; if autoplay is blocked, the invitation's first tap/click
    // starts this same track without needing an extra music-button click.
    startMusic()
    window.addEventListener('pointerdown', beginAfterGesture, { passive: true })
    window.addEventListener('keydown', beginAfterGesture)
    return () => {
      window.removeEventListener('pointerdown', beginAfterGesture)
      window.removeEventListener('keydown', beginAfterGesture)
      if (fadeFrameRef.current !== null) cancelAnimationFrame(fadeFrameRef.current)
      audio.pause()
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    const nextEnabled = !enabled
    enabledRef.current = nextEnabled
    setEnabled(nextEnabled)

    if (nextEnabled) {
      startMusic()
      return
    }

    fadeTo(0, () => audio.pause())
  }

  return (
    <>
      <audio ref={audioRef} className="soundtrack" src="/audio/birthday-score.mp3" loop preload="auto" />
      <button className={`sound-toggle ${enabled ? 'is-on' : ''}`} onClick={toggle} aria-label={enabled ? 'Turn music off' : 'Turn music on'} aria-pressed={enabled}>
        {enabled ? <Volume2 size={17} strokeWidth={1.5} /> : <VolumeX size={17} strokeWidth={1.5} />}
        <span className="sound-label">{enabled ? 'Music on' : 'Music off'}</span>
      </button>
    </>
  )
}
