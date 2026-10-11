import { useEffect, useRef } from 'react'

type Particle = { x: number; y: number; radius: number; alpha: number; phase: number; speed: number }

export function Atmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: 0, y: 0 }
    const particles: Particle[] = []
    let width = 0
    let height = 0
    let frame = 0

    const seed = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 1.4)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const total = width < 700 ? 82 : 164
      particles.length = 0
      for (let i = 0; i < total; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.3 + 0.25,
          alpha: Math.random() * 0.48 + 0.12,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.14 + 0.025,
        })
      }
      draw(0)
    }

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height)
      for (const particle of particles) {
        if (!reducedMotion) {
          particle.y -= particle.speed
          particle.phase += 0.006
          if (particle.y < -3) particle.y = height + 3
        }
        const dx = pointer.x - particle.x
        const dy = pointer.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const influence = distance < 150 ? (1 - distance / 150) * 8 : 0
        const twinkle = reducedMotion ? 0.86 : 0.66 + Math.sin(particle.phase + time * 0.0007) * 0.32
        context.beginPath()
        context.arc(particle.x - (dx / (distance || 1)) * influence, particle.y - (dy / (distance || 1)) * influence, particle.radius, 0, Math.PI * 2)
        context.fillStyle = `rgba(255, 233, 214, ${particle.alpha * twinkle})`
        context.shadowBlur = particle.radius > 1 ? 8 : 0
        context.shadowColor = 'rgba(229, 192, 223, .9)'
        context.fill()
      }
      context.shadowBlur = 0
      if (!reducedMotion) frame = requestAnimationFrame(draw)
    }

    const onPointer = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
    }
    seed()
    if (!reducedMotion) frame = requestAnimationFrame(draw)
    window.addEventListener('resize', seed, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', seed)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])

  return <canvas ref={canvasRef} className="atmosphere" aria-hidden="true" />
}
