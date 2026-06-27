import { useState, type FormEvent } from 'react'
import { useStore } from '../store'

interface Props {
  open: boolean
  onClose: () => void
  onSwitchToLogin: () => void
  onRegistered: () => void
}

export function RegisterModal({ open, onClose, onSwitchToLogin, onRegistered }: Props) {
  const { lang, t, register, showToast } = useStore()
  const isAr = lang === 'ar'
  const [form, setForm] = useState({ first: '', last: '', phone: '', email: '', pin: '' })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const first = form.first.trim()
    const last = form.last.trim()
    const phone = form.phone.trim()
    const email = form.email.trim()
    const pin = form.pin.trim()
    if (!first || !last || !phone) return
    if (!pin || pin.length < 4) {
      showToast(
        isAr ? 'الرجاء تحديد رمز سري من 4 أرقام.' : 'Veuillez définir un code secret à 4 chiffres.',
        'or'
      )
      return
    }
    register({ firstName: first, lastName: last, phone, email, pin, createdAt: Date.now() })
    onClose()
    showToast(isAr ? `👋 مرحباً، ${first}!` : `👋 Bienvenue, ${first} !`, 'or')
    setTimeout(onRegistered, 400)
  }

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className={`overlay ${open ? 'open' : ''}`} id="overlay-register">
      <div className="modal">
        <div className="modal-hd">
          <img src="/assets/mm-wordmark.png" alt="Morocco Mall" className="modal-mm-logo" />
          <div className="modal-hd-text">
            <h3>{t('reg.title')}</h3>
            <p>{t('reg.sub')}</p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-g">
              <label htmlFor="reg-first">{t('reg.first')}</label>
              <input className="form-input" id="reg-first" type="text" placeholder="Karim" required autoComplete="given-name" value={form.first} onChange={set('first')} />
            </div>
            <div className="form-g">
              <label htmlFor="reg-last">{t('reg.last')}</label>
              <input className="form-input" id="reg-last" type="text" placeholder="Benali" required autoComplete="family-name" value={form.last} onChange={set('last')} />
            </div>
          </div>
          <div className="form-g">
            <label htmlFor="reg-phone">{t('reg.phone')}</label>
            <input className="form-input" id="reg-phone" type="tel" placeholder="+212 6 XX XX XX XX" required autoComplete="tel" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="form-g">
            <label htmlFor="reg-email">{t('reg.email')}</label>
            <input className="form-input" id="reg-email" type="email" placeholder="vous@exemple.ma" required autoComplete="email" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-g">
            <label htmlFor="reg-pin">
              <span className="fr-inline">
                Code secret{' '}
                <span style={{ fontSize: '.65rem', textTransform: 'none', letterSpacing: 0, color: 'rgba(44,74,90,.35)' }}>
                  (4 chiffres — pour vous reconnecter)
                </span>
              </span>
              <span className="ar-inline">
                الرمز السري{' '}
                <span style={{ fontSize: '.65rem', textTransform: 'none', letterSpacing: 0, color: 'rgba(44,74,90,.35)' }}>
                  (4 أرقام — للدخول لاحقاً)
                </span>
              </span>
            </label>
            <input className="form-input" id="reg-pin" type="password" inputMode="numeric" maxLength={4} placeholder="••••" required autoComplete="new-password" value={form.pin} onChange={set('pin')} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 6 }}>
            {t('reg.submit')}
          </button>
          <p style={{ fontSize: '.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
            {t('reg.privacy')}
          </p>
          <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
          <p style={{ textAlign: 'center', fontSize: '.82rem', color: 'var(--text-muted)' }}>
            <span>{t('reg.hasaccount')}</span>{' '}
            <a
              href="#"
              className="link-muted"
              onClick={(e) => {
                e.preventDefault()
                onSwitchToLogin()
              }}
            >
              {t('reg.signin')}
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
