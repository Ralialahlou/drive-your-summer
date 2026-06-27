import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { LS } from '../constants'
import type { User } from '../constants'

function readSavedUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(LS.USER) || 'null') as User | null
  } catch {
    return null
  }
}

export function Nav({ onUploadCTA }: { onUploadCTA: () => void }) {
  const { lang, setLang, t, user, showPage, logout } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  // Sticky offset under the banner + scrolled state.
  useEffect(() => {
    const onScroll = () => {
      const bannerH =
        document.getElementById('summer-banner')?.offsetHeight || 36
      setScrolled(window.scrollY > 60)
      const nav = navRef.current
      if (nav) {
        nav.style.top =
          window.scrollY < bannerH ? `${bannerH - window.scrollY}px` : '0'
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on outside click.
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('#nav-mobile-menu') && !target.closest('#nav-mobile-btn')) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [menuOpen])

  const isAr = lang === 'ar'
  const savedUser = readSavedUser()
  const hasPin = !!(savedUser && savedUser.pin)

  const langToggle = (extraClass = '') => (
    <div className={extraClass || 'lang-toggle'} style={extraClass ? undefined : { marginRight: 8 }}>
      <button
        className={`lang-btn ${lang === 'fr' ? 'active' : ''}`}
        onClick={() => setLang('fr')}
      >
        FR
      </button>
      <button
        className={`lang-btn ${lang === 'ar' ? 'active' : ''}`}
        onClick={() => setLang('ar')}
      >
        عربي
      </button>
    </div>
  )

  return (
    <>
      <nav id="nav" ref={navRef} className={scrolled ? 'scrolled' : ''}>
        <button
          className="nav-brand"
          onClick={() => showPage('landing')}
          style={{ cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }}
        >
          <span className="nav-mm">
            <img src="/assets/Logo_MM_1.svg" alt="Morocco Mall" className="nav-mm-logo" />
          </span>
          <span className="nav-campaign">Drive Your Summer</span>
        </button>

        <div className="nav-actions" id="nav-actions">
          {langToggle()}
          {user ? (
            <>
              <span className="nav-chip">{user.firstName}</span>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => showPage('dashboard')}
              >
                {isAr ? 'لوحتي' : 'Mon espace'}
              </button>
              <button className="btn-outline-danger btn-sm" onClick={logout}>
                {isAr ? 'خروج' : 'Se déconnecter'}
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onUploadCTA}>
              {t('nav.cta')}
            </button>
          )}
        </div>

        <button
          className={`nav-mobile-btn ${user ? 'is-logged' : ''}`}
          id="nav-mobile-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="18"
            height="18"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="mob-dot" />
        </button>
      </nav>

      {menuOpen && (
        <div
          id="nav-mobile-menu"
          style={{
            display: 'block',
            top: (navRef.current?.getBoundingClientRect().bottom ?? 56) + 'px',
          }}
        >
          {user ? (
            <>
              <div className="mob-menu-user">👋 {user.firstName}</div>
              {langToggle('mob-lang')}
              <hr className="mob-divider" />
              <button
                className="mob-menu-item primary"
                onClick={() => {
                  setMenuOpen(false)
                  setTimeout(onUploadCTA, 80)
                }}
              >
                {isAr ? 'تحميل إيصال الشراء' : 'Télécharger un ticket'}
              </button>
              <button
                className="mob-menu-item"
                onClick={() => {
                  showPage('dashboard')
                  setMenuOpen(false)
                }}
              >
                {isAr ? 'لوحتي' : 'Mon espace'}
              </button>
              <button
                className="mob-menu-item danger"
                onClick={() => {
                  logout()
                  setMenuOpen(false)
                }}
              >
                {isAr ? 'تسجيل الخروج' : 'Se déconnecter'}
              </button>
            </>
          ) : (
            <>
              {langToggle('mob-lang')}
              <hr className="mob-divider" />
              <button
                className="mob-menu-item primary"
                onClick={() => {
                  setMenuOpen(false)
                  onUploadCTA()
                }}
              >
                {hasPin
                  ? isAr
                    ? 'تسجيل الدخول'
                    : 'Se connecter'
                  : isAr
                    ? 'إنشاء حساب'
                    : 'Créer un compte'}
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
