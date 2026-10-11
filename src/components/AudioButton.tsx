import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

type Chord = readonly [number, number, number]

type Score = {
  tempo: number
  chords: readonly Chord[]
}

const D: Chord = [50, 54, 57]
const Bm: Chord = [47, 50, 54]
const G: Chord = [43, 47, 50]
const A: Chord = [45, 49, 52]
const Em: Chord = [40, 43, 47]

// Each chapter has its own variation of the same gentle theme.
const scores: readonly Score[] = [
  { tempo: 66, chords: [D, Bm, G, A] },
  { tempo: 76, chords: [D, G, Bm, A] },
  { tempo: 70, chords: [Bm, G, D, A] },
  { tempo: 72, chords: [G, D, Em, A] },
  { tempo: 78, chords: [D, A, Bm, G] },
  { tempo: 82, chords: [D, G, A, D] },
  { tempo: 64, chords: [Bm, G, D, A] },
  { tempo: 74, chords: [G, A, D, D] },
]

const melody: readonly (number | null)[] = [0, null, 2, 1, null, 2, 1, null]
const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

function playVoice(
  audio: AudioContext,
  output: AudioNode,
  midi: number,
  start: number,
  length: number,
  volume: number,
  type: OscillatorType,
  attack: number,
) {
  const oscillator = audio.createOscillator()
  const envelope = audio.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency(midi), start)
  envelope.gain.setValueAtTime(0.0001, start)
  envelope.gain.linearRampToValueAtTime(volume, start + attack)
  envelope.gain.setValueAtTime(volume, start + Math.max(attack, length - 0.26))
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + length)
  oscillator.connect(envelope)
  envelope.connect(output)
  oscillator.start(start)
  oscillator.stop(start + length + 0.02)
  oscillator.onended = () => {
    oscillator.disconnect()
    envelope.disconnect()
  }
}

class BirthdayScore {
  private audio: AudioContext | null = null
  private input: GainNode | null = null
  private master: GainNode | null = null
  private interval: number | undefined
  private nextTime = 0
  private step = 0
  private chapter = 0
  private wanted = true
  private playing = false

  setChapter(chapter: number) {
    this.chapter = chapter
  }

  async start() {
    if (!this.wanted || this.playing || !window.AudioContext) return

    if (!this.audio) {
      const audio = new window.AudioContext()
      const input = audio.createGain()
      const dry = audio.createGain()
      const delay = audio.createDelay(1)
      const feedback = audio.createGain()
      const wet = audio.createGain()
      const master = audio.createGain()

      dry.gain.value = 0.82
      delay.delayTime.value = 0.31
      feedback.gain.value = 0.2
      wet.gain.value = 0.18
      master.gain.value = 0

      input.connect(dry)
      dry.connect(master)
      input.connect(delay)
      delay.connect(feedback)
      feedback.connect(delay)
      delay.connect(wet)
      wet.connect(master)
      master.connect(audio.destination)

      this.audio = audio
      this.input = input
      this.master = master
    }

    const audio = this.audio
    await audio.resume()
    if (!this.wanted || this.playing || audio.state !== 'running') return

    this.playing = true
    this.nextTime = audio.currentTime + 0.08
    this.step = 0
    this.master?.gain.cancelScheduledValues(audio.currentTime)
    this.master?.gain.setTargetAtTime(0.58, audio.currentTime, 0.65)
    this.schedule()
    this.interval = window.setInterval(() => this.schedule(), 90)
  }

  private schedule() {
    const audio = this.audio
    const input = this.input
    if (!audio || !input || !this.playing) return

    while (this.nextTime < audio.currentTime + 0.28) {
      const score = scores[this.chapter] ?? scores[0]
      const eighth = 30 / score.tempo
      const position = this.step % 8
      const chord = score.chords[Math.floor(this.step / 8) % score.chords.length]
      const at = this.nextTime

      if (position === 0) {
        chord.forEach((note, index) => {
          playVoice(audio, input, note, at, eighth * 7.7, index === 0 ? 0.026 : 0.018, 'triangle', 0.4)
        })
        playVoice(audio, input, chord[0] - 12, at, eighth * 3.7, 0.035, 'sine', 0.18)
      }
      if (position === 4) {
        playVoice(audio, input, chord[0] - 12, at, eighth * 3.6, 0.023, 'sine', 0.15)
      }

      const noteIndex = melody[position]
      if (noteIndex !== null) {
        const note = chord[noteIndex] + 24
        playVoice(audio, input, note, at, eighth * 1.65, 0.033, 'sine', 0.025)
        playVoice(audio, input, note + 12, at, eighth * 0.85, 0.007, 'triangle', 0.01)
      }

      this.step += 1
      this.nextTime += eighth
    }
  }

  stop() {
    this.wanted = false
    this.playing = false
    window.clearInterval(this.interval)
    this.interval = undefined
    if (this.audio && this.master) {
      this.master.gain.cancelScheduledValues(this.audio.currentTime)
      this.master.gain.setTargetAtTime(0, this.audio.currentTime, 0.2)
    }
  }

  enable() {
    this.wanted = true
    return this.start()
  }

  dispose() {
    this.stop()
    void this.audio?.close()
  }
}

export function AudioButton({ chapter }: { chapter: number }) {
  const [enabled, setEnabled] = useState(true)
  const scoreRef = useRef<BirthdayScore | null>(null)

  useEffect(() => {
    const score = new BirthdayScore()
    scoreRef.current = score
    const begin = () => { void score.start().catch(() => undefined) }
    // Sound is enabled by default. A browser that blocks autoplay will begin on
    // the first touch, click, or keypress (including opening the invitation).
    begin()
    window.addEventListener('pointerdown', begin, { passive: true })
    window.addEventListener('keydown', begin)
    return () => {
      window.removeEventListener('pointerdown', begin)
      window.removeEventListener('keydown', begin)
      score.dispose()
      scoreRef.current = null
    }
  }, [])

  useEffect(() => { scoreRef.current?.setChapter(chapter) }, [chapter])

  const toggle = () => {
    const score = scoreRef.current
    if (!score) return
    if (enabled) score.stop()
    else void score.enable().catch(() => undefined)
    setEnabled(!enabled)
  }

  return (
    <button className={`sound-toggle ${enabled ? 'is-on' : ''}`} onClick={toggle} aria-label={enabled ? 'Turn music off' : 'Turn music on'} aria-pressed={enabled}>
      {enabled ? <Volume2 size={17} strokeWidth={1.5} /> : <VolumeX size={17} strokeWidth={1.5} />}
      <span className="sound-label">{enabled ? 'Music on' : 'Music off'}</span>
    </button>
  )
}
