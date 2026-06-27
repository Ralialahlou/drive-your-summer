import { useEffect, useState, type FormEvent } from 'react'
import { useStore } from '../store'
import { LS } from '../constants'
import type { User } from '../constants'

interface Props {
  open: boolean
  onClose: () => void
  onSwitchToRegister: () => void
  onLoggedIn: () => void
}

type View = 'login' | 'forgot1' | 'forgot2'

function readSavedUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(LS.USER) || 'null') as User | null
  } catch {
    return null
  }
}

export function LoginModal({ open, onClose, onSwitchToRegister, onLoggedIn }: Props) {
  const { lang, t, login, pendingAction, setPendingAction, showToast } = useStore()
  const isAr = lang === 'ar'

  const [view, setView] = useState<View>('login')
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPin, setLoginPin] = useState('')
  const [forgotPhone, setForgotPhone] = useState('')
  const [sentCode, setSentCode] = useState('')
  const [resetCodeInput, setResetCodeInput] = useState('')
  const [resetNewPin, setResetNewPin] = useState('')

  // Reset to the login view whenever the modal re-opens.
  useEffect(() => {
    if (open) setView('login')
  }, [open])

  const norm = (s: string) => s.replace(/\s/g, '')

  const submitLogin = (e: FormEvent) => {
    e.preventDefault()
    const saved = readSavedUser()
    if (!saved || norm(saved.phone) !== norm(loginPhone)) {
      showToast(isAr ? 'الرقم غير موجود.' : 'Numéro introuvable.', 'or')
      return
    }
    if (saved.pin !== loginPin.trim()) {
      showToast(isAr ? 'الرمز غير صحيح.' : 'Code incorrect.', 'or')
      return
    }
    login(saved)
    onClose()
    showToast(isAr ? `👋 أهلاً بعودتك، ${saved.firstName}!` : `👋 Bon retour, ${saved.firstName} !`, 'or')
    if (pendingAction === 'upload') {
      setPendingAction(null)
      setTimeout(onLoggedIn, 400)
    }
  }

  const sendResetCode = () => {
    const saved = readSavedUser()
    if (!saved || norm(saved.phone) !== norm(forgotPhone)) {
      showToast(isAr ? 'الرقم غير موجود.' : 'Numéro introuvable.', 'or')
      return
    }
    let code = ''
    for (let i = 0; i < 6; i++) code += Math.floor(Math.random() * 10)
    const expires = Date.now() + 300000 // 5 min
    localStorage.setItem(LS.RESET, JSON.stringify({ code, phone: forgotPhone, expires }))
    setSentCode(code)
    setView('forgot2')
  }

  const confirmResetPin = () => {
    let resetData: { code: string; expires: number } | null = null
    try {
      resetData = JSON.parse(localStorage.getItem(LS.RESET) || 'null')
    } catch {
      resetData = null
    }
    if (!resetData || resetData.code !== resetCodeInput.trim()) {
      showToast(isAr ? 'رمز التحقق غير صحيح.' : 'Code de vérification incorrect.', 'or')
      return
    }
    if (Date.now() > resetData.expires) {
      showToast(isAr ? 'انتهت صلاحية الرمز. حاول مجدداً.' : 'Code expiré. Veuillez recommencer.', 'or')
      return
    }
    if (!resetNewPin.trim() || resetNewPin.trim().length < 4) {
      showToast(isAr ? 'الرمز السري يجب أن يتكون من 4 أرقام.' : 'Code secret à 4 chiffres requis.', 'or')
      return
    }
    const saved = readSavedUser()
    if (saved) {
      saved.pin = resetNewPin.trim()
      localStorage.setItem(LS.USER, JSON.stringify(saved))
    }
    localStorage.removeItem(LS.RESET)
    showToast(
      isAr ? 'تم إعادة تعيين الرمز! سجّل دخولك الآن.' : 'Code réinitialisé ! Connectez-vous maintenant.',
      'success'
    )
    setView('login')
  }

  const title =
    view === 'login'
      ? isAr
        ? 'تسجيل الدخول'
        : 'Se connecter'
      : t('forgot.title')
  const subtitle =
    view === 'login'
      ? isAr
        ? 'ادخل إلى مساحة مشاركتك.'
        : 'Accédez à votre espace de participation.'
      : t('forgot.sub')

  return (
    <div className={`overlay ${open ? 'open' : ''}`} id="overlay-login">
      <div className="modal">
        <div className="modal-hd">
          <img src="/assets/mm-wordmark.png" alt="Morocco Mall" className="modal-mm-logo" />
          <div className="modal-hd-text">
            <h3 id="login-modal-title">{title}</h3>
            <p id="login-modal-sub">{subtitle}</p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {view === 'login' && (
          <div id="login-form-wrap">
            <form onSubmit={submitLogin}>
              <div className="form-g">
                <label htmlFor="login-phone">{t('login.phone')}</label>
                <input className="form-input" id="login-phone" type="tel" placeholder="+212 6 XX XX XX XX" required autoComplete="tel" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} />
              </div>
              <div className="form-g">
                <label htmlFor="login-pin">{t('login.pin.lbl')}</label>
                <input className="form-input" id="login-pin" type="password" inputMode="numeric" maxLength={4} placeholder="••••" required autoComplete="current-password" value={loginPin} onChange={(e) => setLoginPin(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 6 }}>{t('login.submit')}</button>
              <p style={{ textAlign: 'center', marginTop: 14, fontSize: '.82rem' }}>
                <a href="#" className="link-muted" onClick={(e) => { e.preventDefault(); setView('forgot1') }}>{t('login.forgot')}</a>
              </p>
              <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
              <p style={{ textAlign: 'center', fontSize: '.82rem', color: 'var(--text-muted)' }}>
                <span>{t('login.noaccount')}</span>{' '}
                <a href="#" className="link-muted" onClick={(e) => { e.preventDefault(); onSwitchToRegister() }}>{t('login.signup')}</a>
              </p>
            </form>
          </div>
        )}

        {view === 'forgot1' && (
          <div id="forgot-pin-wrap">
            <p style={{ fontSize: '.88rem', color: 'var(--text-mid)', marginBottom: 20 }}>{t('forgot.intro')}</p>
            <div className="form-g">
              <label htmlFor="forgot-phone">{t('login.phone')}</label>
              <input className="form-input" id="forgot-phone" type="tel" placeholder="+212 6 XX XX XX XX" value={forgotPhone} onChange={(e) => setForgotPhone(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 6 }} onClick={sendResetCode}>{t('forgot.send')}</button>
            <p style={{ textAlign: 'center', marginTop: 14, fontSize: '.82rem' }}>
              <a href="#" className="link-muted" onClick={(e) => { e.preventDefault(); setView('login') }}>{t('forgot.back')}</a>
            </p>
          </div>
        )}

        {view === 'forgot2' && (
          <div id="forgot-pin-wrap">
            <div className="code-sent-box">
              <p className="code-sent-label">{t('forgot.sent.lbl')}</p>
              <p className="code-sent-value" id="code-sent-value">{sentCode}</p>
              <p className="code-sent-note">{t('forgot.sent.note')}</p>
            </div>
            <div className="form-g" style={{ marginTop: 18 }}>
              <label htmlFor="reset-code-input">{t('forgot.code.lbl')}</label>
              <input className="form-input" id="reset-code-input" type="tel" inputMode="numeric" maxLength={6} placeholder="––––––" value={resetCodeInput} onChange={(e) => setResetCodeInput(e.target.value)} />
            </div>
            <div className="form-g">
              <label htmlFor="reset-new-pin">{t('forgot.pin.lbl')}</label>
              <input className="form-input" id="reset-new-pin" type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={resetNewPin} onChange={(e) => setResetNewPin(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 6 }} onClick={confirmResetPin}>{t('forgot.submit')}</button>
            <p style={{ textAlign: 'center', marginTop: 14, fontSize: '.82rem' }}>
              <a href="#" className="link-muted" onClick={(e) => { e.preventDefault(); setView('login') }}>{t('forgot.back')}</a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
