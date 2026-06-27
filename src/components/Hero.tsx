import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { useCountdown } from '../hooks/useCountdown'

const SLIDES = [
  '/assets/img/keys/Key2.webp',
  '/assets/img/keys/Key12.webp',
  '/assets/img/keys/Key19.webp',
  '/assets/img/keys/Key22.webp',
  '/assets/img/keys/Key23.webp',
  '/assets/img/keys/Key24.webp',
]

export function Hero() {
  const { t } = useStore()
  const cd = useCountdown()
  const sliderRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const interacted = useRef(false)

  // Sync active dot from scroll position.
  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return
    let tick = 0
    const onScroll = () => {
      cancelAnimationFrame(tick)
      tick = requestAnimationFrame(() => {
        const idx = Math.round(slider.scrollLeft / slider.offsetWidth)
        setActive(Math.max(0, Math.min(idx, SLIDES.length - 1)))
      })
    }
    slider.addEventListener('scroll', onScroll, { passive: true })
    const onTouch = () => {
      interacted.current = true
    }
    slider.addEventListener('touchstart', onTouch, { passive: true, once: true })
    return () => {
      slider.removeEventListener('scroll', onScroll)
      slider.removeEventListener('touchstart', onTouch)
    }
  }, [])

  // Auto-advance every 5s until the user interacts.
  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return
    const id = setInterval(() => {
      if (interacted.current) return
      const idx = Math.round(slider.scrollLeft / slider.offsetWidth)
      const next = (idx + 1) % SLIDES.length
      slider.scrollTo({ left: slider.offsetWidth * next, behavior: 'smooth' })
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const goto = (i: number) => {
    const slider = sliderRef.current
    if (slider) slider.scrollTo({ left: slider.offsetWidth * i, behavior: 'smooth' })
  }

  return (
    <section id="hero">
      <div className="hero-slider" id="hero-slider" ref={sliderRef}>
        {SLIDES.map((src, i) => (
          <div className="hero-slide" key={src}>
            <img
              src={src}
              className="hero-slide-img"
              alt="Drive Your Summer"
              {...(i === 0 ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
            />
            <div className="hero-slide-overlay" />
          </div>
        ))}
      </div>

      <div className="hero-topright">
        <div className="hero-badge-70 fr-txt">
          <span className="hero-badge-label">Jusqu'à</span>
          <span className="hero-badge-pct">-70%</span>
        </div>
        <div className="hero-badge-70 ar-txt">
          <span className="hero-badge-label">حتى</span>
          <span className="hero-badge-pct">-70%</span>
        </div>
        <img src="/assets/Logo_MM_1.svg" alt="Morocco Mall" className="hero-mm-logo" />
      </div>

      <div className="hero-title-block">
        <h1 className="hero-title">
          <span className="hero-drive">Drive Your</span>
          <em className="hero-summer">Summer</em>
        </h1>
        <p className="hero-sub-slide fr-txt">
          Jusqu'à -70% sur plus de 360 marques et une Soueast S05 à gagner.
        </p>
        <p className="hero-sub-slide ar-txt">
          استفد من تخفيضات تصل إلى 70% على أكثر من 360 علامة تجارية، واغتنم فرصتك
          للفوز بسيارة Soueast S05.
        </p>
      </div>

      <div className="hero-cd-wrap">
        <p className="cd-lbl-title">{t('hero.cdlbl')}</p>
        <div className="cd-frame">
          <div className="countdown">
            <div className="cd-item">
              <span className="cd-num">{cd.d}</span>
              <span className="cd-lbl">{t('cd.d')}</span>
            </div>
            <span className="cd-sep">:</span>
            <div className="cd-item">
              <span className="cd-num">{cd.h}</span>
              <span className="cd-lbl">{t('cd.h')}</span>
            </div>
            <span className="cd-sep">:</span>
            <div className="cd-item">
              <span className="cd-num">{cd.m}</span>
              <span className="cd-lbl">{t('cd.m')}</span>
            </div>
            <span className="cd-sep">:</span>
            <div className="cd-item">
              <span className="cd-num">{cd.s}</span>
              <span className="cd-lbl">{t('cd.s')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-dots" id="hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === active ? 'active' : ''}`}
            data-idx={i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => goto(i)}
          />
        ))}
      </div>
    </section>
  )
}
