import { useCallback, useEffect, useState } from 'react'
import { useStore } from './store'
import { LS } from './constants'
import type { User } from './constants'
import { Nav } from './components/Nav'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Receipts } from './pages/Receipts'
import { RegisterModal } from './modals/RegisterModal'
import { LoginModal } from './modals/LoginModal'
import { UploadModal } from './modals/UploadModal'
import { StickyCta } from './components/StickyCta'
import { Toasts } from './components/Toasts'

export type OverlayId = 'register' | 'login' | 'upload' | null

export function App() {
  const { page, user, setPendingAction } = useStore()
  const [overlay, setOverlay] = useState<OverlayId>(null)

  const openOverlay = useCallback((id: Exclude<OverlayId, null>) => setOverlay(id), [])
  const closeOverlay = useCallback(() => setOverlay(null), [])

  // Lock body scroll while an overlay is open (matches legacy behaviour).
  useEffect(() => {
    document.body.style.overflow = overlay ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [overlay])

  // Decides whether to register, login, or jump straight to upload.
  const handleUploadCTA = useCallback(() => {
    if (user) {
      setOverlay('upload')
      return
    }
    setPendingAction('upload')
    const saved = (() => {
      try {
        return JSON.parse(localStorage.getItem(LS.USER) || 'null') as User | null
      } catch {
        return null
      }
    })()
    // Known device (has a saved PIN) → login; otherwise register.
    setOverlay(saved && saved.pin ? 'login' : 'register')
  }, [user, setPendingAction])

  return (
    <>
      <div id="summer-banner">
        <span className="fr-inline">
          ◆ Morocco Mall — Drive Your Summer · Jeu-concours · 6 au 27 juillet 2026 ◆
        </span>
        <span className="ar-inline">
          ◆ موروكو مول — درايف يور صمر · مسابقة · 6 – 27 يوليوز 2026 ◆
        </span>
      </div>

      <Nav onUploadCTA={handleUploadCTA} />

      {page === 'landing' && <Landing onUploadCTA={handleUploadCTA} onOpenUpload={() => setOverlay('upload')} />}
      {page === 'dashboard' && <Dashboard onOpenUpload={() => setOverlay('upload')} />}
      {page === 'receipts' && <Receipts onOpenUpload={() => setOverlay('upload')} />}

      <RegisterModal
        open={overlay === 'register'}
        onClose={closeOverlay}
        onSwitchToLogin={() => openOverlay('login')}
        onRegistered={() => setOverlay('upload')}
      />
      <LoginModal
        open={overlay === 'login'}
        onClose={closeOverlay}
        onSwitchToRegister={() => openOverlay('register')}
        onLoggedIn={() => setOverlay('upload')}
      />
      <UploadModal open={overlay === 'upload'} onClose={closeOverlay} />

      <StickyCta onUploadCTA={handleUploadCTA} />
      <Toasts />
    </>
  )
}
