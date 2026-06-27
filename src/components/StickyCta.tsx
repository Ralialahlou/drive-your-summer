import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { useCountdown } from '../hooks/useCountdown'

export function StickyCta({ onUploadCTA }: { onUploadCTA: () => void }) {
  const { t, page } = useStore()
  const cd = useCountdown()
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('dys_sticky_off') === '1'
  )
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (page !== 'landing' || dismissed) {
      setShow(false)
      return
    }
    const onScroll = () => {
      const heroH = document.getElementById('hero')?.offsetHeight || 600
      setShow(window.scrollY > heroH * 0.6)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [page, dismissed])

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('dys_sticky_off', '1')
    setShow(false)
  }

  return (
    <div id="sticky-cta" ref={ref} className={show ? 'show' : ''}>
      <div className="sticky-inner">
        <button className="sticky-close" onClick={dismiss} aria-label="Fermer">
          ✕
        </button>
        <p className="sticky-title">{t('sticky.line2')}</p>
        <p className="sticky-sub">
          Fin dans <strong id="sticky-days">{cd.sticky}</strong> · Jeu-concours
          Morocco Mall · Du 6 au 27 juillet 2026
        </p>
        <button
          className="btn btn-primary"
          onClick={onUploadCTA}
          style={{ width: '100%', marginBottom: 4 }}
        >
          {t('nav.cta')}
        </button>
      </div>
    </div>
  )
}
