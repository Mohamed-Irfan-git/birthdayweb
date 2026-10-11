import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { ArrowDown, ArrowRight, Sparkles, Star } from 'lucide-react'
import { letter, recipientName, storyCopy, surprises, wishes } from '../content'

const FriendshipUniverse = lazy(() => import('./FriendshipUniverse'))

function Continue({ target, label = 'Continue the story' }: { target: string; label?: string }) {
  return (
    <a className="continue-link" href={`#${target}`} aria-label={label}>
      <span>{label}</span><ArrowDown size={14} strokeWidth={1.5} />
    </a>
  )
}

function ChapterTitle({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="chapter-title reveal">
      <p className="chapter-kicker">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {children && <div className="chapter-intro">{children}</div>}
    </div>
  )
}

export function BirthdayReveal() {
  return (
    <section className="chapter birthday-scene" id="chapter-2" data-chapter="2" aria-labelledby="birthday-title">
      <div className="birthday-halo" aria-hidden="true"><span /><span /><span /></div>
      <div className="floating-pearl pearl-one" aria-hidden="true" />
      <div className="floating-pearl pearl-two" aria-hidden="true" />
      <div className="floating-butterfly butterfly-one" aria-hidden="true">✳</div>
      <div className="birthday-copy reveal">
        <p className="birthday-heading" id="birthday-title"><span>HAPPY</span><span>BIRTHDAY</span></p>
        <h2 className="birthday-name">{recipientName.toUpperCase().split('').map((letter, index) => <span key={index}>{letter}</span>)}</h2>
        <p className="birthday-message">{storyCopy.birthday.message}</p>
        <p className="birthday-today">{storyCopy.birthday.today}</p>
      </div>
      <div className="petal-field" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <Continue target="chapter-3" label="Follow the stars" />
    </section>
  )
}

export function FriendshipScene() {
  const sceneRef = useRef<HTMLElement>(null)
  const [show3D, setShow3D] = useState(false)
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || !window.matchMedia('(min-width: 700px) and (prefers-reduced-motion: no-preference)').matches) return
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2', { powerPreference: 'low-power' })
    if (!gl) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShow3D(true)
        observer.disconnect()
      }
    }, { rootMargin: '35% 0px' })
    observer.observe(scene)
    return () => observer.disconnect()
  }, [])
  return (
    <section className="chapter friendship-scene" id="chapter-3" data-chapter="3" aria-labelledby="friendship-title" ref={sceneRef}>
      <div className="friendship-sky" aria-hidden="true">
        {show3D && <Suspense fallback={null}><FriendshipUniverse /></Suspense>}
        <div className="friendship-orbit orbit-a" /><div className="friendship-orbit orbit-b" />
        <div className="distant-star distant-star-left"><span /><i>{recipientName}</i></div>
        <div className="distant-star distant-star-right"><span /><i>A friend</i></div>
        <svg className="star-ribbon" viewBox="0 0 900 360" preserveAspectRatio="none"><path d="M30 275 C220 10 430 390 615 128 S795 48 870 74" /></svg>
      </div>
      <div className="friendship-copy reveal">
        <ChapterTitle id="friendship-title" eyebrow="03 · DIFFERENT PLACES, SAME SKY" title={<>Different places,<br />same sky.</>}>
          {storyCopy.friendship.lines.map((line) => <p key={line}>{line}</p>)}
        </ChapterTitle>
        <div className="friendship-last reveal">{storyCopy.friendship.closing.map((line) => <p key={line}>{line}</p>)}</div>
      </div>
      <Continue target="chapter-4" label="Find a wish" />
    </section>
  )
}

function WishFlower({ index, opened, onOpen }: { index: number; opened: boolean; onOpen: () => void }) {
  const positions = [
    { x: 13, y: 57, scale: 0.9 }, { x: 31, y: 33, scale: 1.05 }, { x: 51, y: 52, scale: 1.2 },
    { x: 72, y: 34, scale: 0.95 }, { x: 87, y: 59, scale: 1.1 }, { x: 39, y: 76, scale: 0.82 },
  ]
  const position = positions[index]
  return (
    <button
      type="button"
      className={`wish-flower ${opened ? 'is-open' : ''}`}
      style={{ '--x': `${position.x}%`, '--y': `${position.y}%`, '--flower-scale': position.scale } as CSSProperties}
      onClick={onOpen}
      aria-label={`Open wish flower ${index + 1}${opened ? ', wish discovered' : ''}`}
      aria-pressed={opened}
    >
      <span className="flower-aura" />
      <img className="flower-art" src="/art/wish-flower.webp" alt="" loading="lazy" decoding="async" />
    </button>
  )
}

export function WishesGarden({ opened, onOpen }: { opened: Set<number>; onOpen: (index: number) => void }) {
  const [activeWish, setActiveWish] = useState<number | null>(null)
  const chooseWish = (index: number) => { onOpen(index); setActiveWish(index) }
  return (
    <section className="chapter garden-scene" id="chapter-4" data-chapter="4" aria-labelledby="garden-title">
      <div className="garden-cloud cloud-left" aria-hidden="true" /><div className="garden-cloud cloud-right" aria-hidden="true" />
      <div className="garden-island" aria-hidden="true"><span /><span /><span /><span /></div>
      <div className="garden-title-wrap">
        <ChapterTitle id="garden-title" eyebrow="04 · THE GARDEN OF WISHES" title={<>A garden<br />of wishes.</>}>
          <p>Choose a flower to open a wish.</p>
        </ChapterTitle>
      </div>
      <div className="garden-flowers" role="group" aria-label="Six birthday wish flowers">
        {wishes.map((_, index) => <WishFlower key={index} index={index} opened={opened.has(index)} onOpen={() => chooseWish(index)} />)}
      </div>
      <div className="garden-note" aria-live="polite" aria-atomic="true">
        <span className="discover-count">{opened.size} of {wishes.length} wishes discovered</span>
        {activeWish !== null && <p>{wishes[activeWish]}</p>}
      </div>
      <Continue target="chapter-5" label="Look to the sky" />
    </section>
  )
}

function SurpriseGlyph({ id }: { id: string }) {
  if (id === 'star') return <Star size={34} strokeWidth={1.15} fill="currentColor" aria-hidden="true" />
  if (id === 'gift') return <span className="gift-glyph" aria-hidden="true"><i /><b /></span>
  if (id === 'planet') return <span className="planet-glyph" aria-hidden="true"><i /></span>
  if (id === 'flower') return <span className="surprise-flower-glyph" aria-hidden="true">✿</span>
  if (id === 'moon') return <span className="moon-glyph" aria-hidden="true" />
  if (id === 'crystal') return <span className="crystal-glyph" aria-hidden="true" />
  if (id === 'constellation') return <svg className="constellation-glyph" viewBox="0 0 60 60" aria-hidden="true"><path d="M8 42 22 14l15 30 14-19" /><circle cx="8" cy="42" r="3" /><circle cx="22" cy="14" r="3" /><circle cx="37" cy="44" r="3" /><circle cx="51" cy="25" r="3" /></svg>
  return <Sparkles size={34} strokeWidth={1.15} aria-hidden="true" />
}

export function SurprisesScene({ discovered, onDiscover }: { discovered: Set<string>; onDiscover: (id: string) => void }) {
  const [active, setActive] = useState<string | null>(null)
  const activeSurprise = surprises.find((item) => item.id === active)
  return (
    <section className="chapter surprise-scene" id="chapter-5" data-chapter="5" aria-labelledby="surprises-title">
      <div className="surprise-header reveal">
        <ChapterTitle id="surprises-title" eyebrow="05 · A SKY FULL OF LITTLE SURPRISES" title={<>See what the<br />stars are hiding.</>} />
        <p className="discovery-progress">{discovered.size}<span> / 8</span></p>
      </div>
      <div className="surprise-map" role="group" aria-label="Eight little celestial surprises">
        {surprises.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={`surprise-object object-${item.id} ${discovered.has(item.id) ? 'is-discovered' : ''} ${active === item.id ? 'is-active' : ''}`}
            style={{ '--object-index': index } as CSSProperties}
            onClick={() => { onDiscover(item.id); setActive(item.id) }}
            aria-label={`${item.name}${discovered.has(item.id) ? ', discovered' : ', discover surprise'}`}
            aria-pressed={active === item.id}
          >
            <span className="object-halo" /><SurpriseGlyph id={item.id} /><span className="object-spark" aria-hidden="true">✦</span>
          </button>
        ))}
        <svg className="constellation-lines" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true"><path d="M60 290 175 85 355 155 465 375 610 105 785 204 915 74" /></svg>
      </div>
      <div className="surprise-reveal" aria-live="polite" aria-atomic="true">
        {activeSurprise ? <><span className="surprise-name">{activeSurprise.name}</span><p>{activeSurprise.message}</p></> : <p>Every little light is hiding something for you.</p>}
      </div>
      <Continue target="chapter-6" label="Make a wish" />
    </section>
  )
}

export function CakeScene() {
  const [lit, setLit] = useState(true)
  const [blowing, setBlowing] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [flamesOut, setFlamesOut] = useState(0)
  const [sequence, setSequence] = useState(0)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  const blowCandles = () => {
    if (blowing) return
    if (!lit) {
      setLit(true)
      setFlamesOut(0)
      setCelebrating(false)
      setSequence((value) => value + 1)
      return
    }
    setBlowing(true)
    timers.current.forEach((timer) => window.clearTimeout(timer))
    ;[370, 690, 1010].forEach((delay, index) => {
      timers.current.push(window.setTimeout(() => setFlamesOut(index + 1), delay))
    })
    timers.current.push(window.setTimeout(() => {
      setLit(false)
      setCelebrating(true)
      setBlowing(false)
    }, 1240))
  }

  return (
    <section className={`chapter cake-scene ${celebrating ? 'is-celebrating' : ''}`} id="chapter-6" data-chapter="6" aria-labelledby="cake-title">
      <div className="cake-copy reveal">
        <ChapterTitle id="cake-title" eyebrow={`06 · MAKE A WISH, ${recipientName.toUpperCase()}`} title={<>One little<br />wish.</>}>
          <p>{storyCopy.cake.personal}</p>
          <p className="cake-instruction">{celebrating ? 'Your wish is on its way.' : storyCopy.cake.instruction}</p>
        </ChapterTitle>
        <button className="outline-button candle-button" onClick={blowCandles} disabled={blowing}>
          {blowing ? 'A little moment…' : lit ? 'Blow Out the Candles' : 'Light the Candles Again'}
          {!blowing && <ArrowRight size={15} strokeWidth={1.5} />}
        </button>
        {celebrating && <p className="cake-blessing" aria-live="polite">{storyCopy.cake.blessing}</p>}
      </div>
      <div className={`cake-art ${lit ? '' : 'candles-out'}`} aria-hidden="true" key={sequence}>
        <div className="cake-glow" />
        <img className="cake-image" src="/art/cake.webp" alt="" loading="lazy" decoding="async" />
        <div className="cake-candles">{[0, 1, 2].map((item) => <i className={`cake-flame ${flamesOut > item || !lit ? 'is-out' : ''}`} key={item} />)}</div>
        <div className="cake-confetti">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ '--i': i + 1 } as CSSProperties} />)}</div>
        <div className="cake-smoke"><i /><i /><i /></div>
      </div>
      <Continue target="chapter-7" label="Read your letter" />
    </section>
  )
}

export function LetterScene() {
  return (
    <section className="chapter letter-scene" id="chapter-7" data-chapter="7" aria-labelledby="letter-title">
      <div className="letter-sunlight" aria-hidden="true" />
      <div className="letter-petal letter-petal-one" aria-hidden="true">✿</div><div className="letter-petal letter-petal-two" aria-hidden="true">✿</div>
      <div className="letter-layout">
        <div className="letter-aside reveal"><span className="letter-stamp" aria-hidden="true">✳</span><span className="letter-line" /></div>
        <article className="letter-sheet reveal" aria-labelledby="letter-title">
          <h2 id="letter-title" className="letter-greeting">{letter[0]}</h2>
          <p className="letter-happy">{letter[1]}</p>
          <div className="letter-body">{letter.slice(2, 8).map((line) => <p key={line}>{line}</p>)}</div>
          <p className="letter-signoff">{letter[8]}<span>{letter[9]}</span></p>
        </article>
      </div>
      <Continue target="chapter-8" label="See the finale" />
    </section>
  )
}

export function FinaleScene({ onRestart }: { onRestart: () => void }) {
  return (
    <section className="chapter finale-scene" id="chapter-8" data-chapter="8" aria-labelledby="finale-title">
      <div className="finale-moon" aria-hidden="true"><span /></div>
      <div className="finale-orbit orbit-one" aria-hidden="true" /><div className="finale-orbit orbit-two" aria-hidden="true" />
      <div className="firework firework-one" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="firework firework-two" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="finale-copy reveal">
        <p className="finale-overline">08 · THE UNFORGETTABLE FINALE</p>
        <h2 id="finale-title">HAPPY BIRTHDAY<span>{recipientName.toUpperCase()}</span></h2>
        <div className="finale-message">{storyCopy.finale.lines.map((line) => <p key={line}>{line}</p>)}</div>
        <button className="outline-button restart-button" onClick={onRestart}>Experience the Magic Again <ArrowRight size={15} strokeWidth={1.5} /></button>
      </div>
      <div className="finale-confetti" aria-hidden="true">{Array.from({ length: 32 }, (_, i) => <i key={i} style={{ '--i': i + 1 } as CSSProperties} />)}</div>
    </section>
  )
}
