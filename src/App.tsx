import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Star } from 'lucide-react'
import { chapters, storyCopy } from './content'
import { AudioButton } from './components/AudioButton'
import { Atmosphere } from './components/Atmosphere'
import { SceneBridge } from './components/SceneBridge'
import { BirthdayReveal, CakeScene, FinaleScene, FriendshipScene, LetterScene, SurprisesScene, WishesGarden } from './components/chapters'

gsap.registerPlugin(ScrollTrigger)

function ChapterNavigation({ active }: { active: number }) {
  return (
    <nav className="chapter-navigation" aria-label="Birthday chapters">
      <span className="chapter-nav-current">0{active + 1}<i />0{chapters.length}</span>
      <div className="chapter-nav-dots">
        {chapters.map((chapter, index) => (
          <a
            href={`#chapter-${index + 1}`}
            key={chapter}
            aria-label={`Chapter ${index + 1}: ${chapter}`}
            aria-current={active === index ? 'step' : undefined}
            className={active === index ? 'is-active' : ''}
          />
        ))}
      </div>
      <span className="chapter-nav-title">{chapters[active]}</span>
    </nav>
  )
}

export default function App() {
  const [entered, setEntered] = useState(false)
  const [opening, setOpening] = useState(false)
  const [activeChapter, setActiveChapter] = useState(0)
  const [openedWishes, setOpenedWishes] = useState<Set<number>>(() => new Set())
  const [discoveredSurprises, setDiscoveredSurprises] = useState<Set<string>>(() => new Set())
  const [replayKey, setReplayKey] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const openTimer = useRef<number | undefined>(undefined)
  const scrollTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    document.body.classList.toggle('prelude-locked', !entered)
    return () => document.body.classList.remove('prelude-locked')
  }, [entered])

  useEffect(() => {
    if (!entered) return
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((element) => {
        gsap.fromTo(element,
          { autoAlpha: 0, y: 24, filter: 'blur(8px)' },
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 84%', once: true },
          },
        )
      })
      gsap.fromTo('.birthday-name span',
        { yPercent: 105, rotateX: -60, opacity: 0, filter: 'blur(9px)' },
        { yPercent: 0, rotateX: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.11, duration: 1.4, ease: 'power4.out', delay: 0.25, scrollTrigger: { trigger: '#chapter-2', start: 'top 78%', once: true } },
      )
      gsap.to('.friendship-sky', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: '#chapter-3', start: 'top bottom', end: 'bottom top', scrub: 1 },
      })
      gsap.utils.toArray<HTMLElement>('.scene-bridge').forEach((bridge) => {
        gsap.timeline({
          scrollTrigger: { trigger: bridge, start: 'top 92%', end: 'bottom 8%', scrub: .65 },
        })
          .fromTo(bridge.querySelector('.bridge-world-from'), { opacity: .8, scale: 1 }, { opacity: 0, scale: 1.28, duration: 1 }, 0)
          .fromTo(bridge.querySelector('.bridge-world-to'), { opacity: 0, scale: 1.24 }, { opacity: .85, scale: 1, duration: 1 }, 0)
          .fromTo(bridge.querySelector('.bridge-thread'), { scaleX: 0, opacity: .15 }, { scaleX: 1, opacity: 1, duration: 1 }, 0)
          .fromTo(bridge.querySelector('.bridge-core'), { x: -70, scale: .4, rotate: -35, opacity: 0 }, { x: 0, scale: 1.2, rotate: 0, opacity: 1, duration: .55 }, 0)
          .to(bridge.querySelector('.bridge-core'), { scale: 8, rotate: 70, opacity: 0, duration: .45 }, .55)
          .fromTo(bridge.querySelector('.bridge-origin'), { opacity: 1, scale: 1 }, { opacity: 0, scale: .35, duration: .38 }, .38)
          .fromTo(bridge.querySelector('.bridge-destination'), { opacity: 0, scale: .35, rotate: -50 }, { opacity: 1, scale: 1, rotate: 0, duration: .4 }, .5)
          .fromTo(bridge.querySelector('.bridge-caption'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .3 }, .21)
          .to(bridge.querySelector('.bridge-caption'), { opacity: 0, y: -12, duration: .28 }, .72)
      })
      ScrollTrigger.refresh()
    }, root)
    return () => ctx.revert()
  }, [entered, replayKey])

  useEffect(() => {
    if (!entered || !rootRef.current) return
    const sections = rootRef.current.querySelectorAll<HTMLElement>('.chapter')
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      const chapter = visible?.target.getAttribute('data-chapter')
      if (chapter) setActiveChapter(Number(chapter) - 1)
    }, { threshold: [0.22, 0.45, 0.68] })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [entered, replayKey])

  useEffect(() => () => {
    window.clearTimeout(openTimer.current)
    window.clearTimeout(scrollTimer.current)
  }, [])

  const openInvitation = () => {
    if (opening || entered) return
    setOpening(true)
    openTimer.current = window.setTimeout(() => {
      setEntered(true)
      setOpening(false)
      setActiveChapter(1)
      scrollTimer.current = window.setTimeout(() => {
        document.getElementById('chapter-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 90)
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 80 : 1050)
  }

  const restart = () => {
    window.clearTimeout(openTimer.current)
    window.clearTimeout(scrollTimer.current)
    setOpening(false)
    setEntered(false)
    setActiveChapter(0)
    setOpenedWishes(new Set())
    setDiscoveredSurprises(new Set())
    setReplayKey((value) => value + 1)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const discoverWish = (index: number) => {
    setOpenedWishes((previous) => new Set(previous).add(index))
  }
  const discoverSurprise = (id: string) => {
    setDiscoveredSurprises((previous) => new Set(previous).add(id))
  }

  return (
    <div className={`universe ${entered ? 'is-open' : 'is-locked'} ${activeChapter === 6 ? 'light-chapter' : ''}`} ref={rootRef}>
      <Atmosphere />

      <section className={`invitation ${opening ? 'is-opening' : ''}`} id="chapter-1" data-chapter="1" aria-labelledby="invitation-title" key={replayKey}>
        <div className="invitation-nebula nebula-left" aria-hidden="true" /><div className="invitation-nebula nebula-right" aria-hidden="true" />
        <div className="invitation-orbit orbit-invitation" aria-hidden="true" />
        <div className="invitation-content">
          <div className="envelope-wrap" aria-hidden="true">
            <div className="envelope-aura" />
            <div className="envelope-back" />
            <div className="envelope-letter"><i /><i /><i /></div>
            <div className="envelope-front"><i /><i /></div>
            <div className="envelope-flap" />
            <div className="envelope-seal"><Star size={15} fill="currentColor" strokeWidth={1} /></div>
            <img className="envelope-render" src="/art/envelope.webp" alt="" fetchPriority="high" />
          </div>
          <div className="invitation-copy">
            <h1 className="invitation-greeting" id="invitation-title">{storyCopy.invitation.greeting}</h1>
            <p className="invitation-line invitation-line-one">{storyCopy.invitation.firstLine}</p>
            <p className="invitation-line invitation-line-two">{storyCopy.invitation.secondLine}</p>
            <button className="open-button" onClick={entered ? () => document.getElementById('chapter-2')?.scrollIntoView({ behavior: 'smooth' }) : openInvitation} disabled={opening}>
            <span>{opening ? 'A little magic…' : storyCopy.invitation.openButton}</span>
            </button>
            <p className="invitation-tagline">{storyCopy.invitation.tagline}</p>
          </div>
        </div>
      </section>

      <div className={`portal-transition ${opening ? 'is-active' : ''}`} aria-hidden="true"><span /><i /><i /><i /></div>

      {entered && <div className="story">
        <BirthdayReveal />
        <SceneBridge kind="sky" />
        <FriendshipScene />
        <SceneBridge kind="garden" />
        <WishesGarden opened={openedWishes} onOpen={discoverWish} />
        <SceneBridge kind="surprises" />
        <SurprisesScene discovered={discoveredSurprises} onDiscover={discoverSurprise} />
        <SceneBridge kind="cake" />
        <CakeScene key={replayKey} />
        <SceneBridge kind="letter" />
        <LetterScene />
        <SceneBridge kind="finale" />
        <FinaleScene onRestart={restart} />
      </div>}

      <AudioButton chapter={activeChapter} />
      {entered && <ChapterNavigation active={activeChapter} />}

    </div>
  )
}
