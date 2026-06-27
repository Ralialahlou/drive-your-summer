import { useEffect } from 'react'
import { useStore } from '../store'
import { Speedometer } from '../components/Speedometer'

export function Dashboard({ onOpenUpload }: { onOpenUpload: () => void }) {
  const { lang, t, user, userTotal, showPage, logout } = useStore()

  // Guard: no user → bounce to landing (matches legacy renderDashboard).
  useEffect(() => {
    if (!user) showPage('landing')
  }, [user, showPage])

  if (!user) return null

  const isAr = lang === 'ar'
  const locale = isAr ? 'ar-MA' : 'fr-MA'
  const totalStr = userTotal.toLocaleString(locale)

  const badge =
    userTotal === 0
      ? isAr
        ? 'أشارك الآن'
        : 'Je participe'
      : isAr
        ? `🏆 ${totalStr} درهم`
        : `🏆 ${totalStr} MAD`
  const next =
    userTotal === 0
      ? isAr
        ? 'كل إيصال يقرّبك من قائمة أفضل 20 متسوقًا'
        : 'Chaque ticket compte et vous rapproche de la victoire.'
      : isAr
        ? 'أنت على الطريق الصحيح. واصل تحميل إيصالات الشراء للارتقاء في الترتيب.'
        : 'Vous êtes sur la bonne voie. Continuez à télécharger vos tickets pour grimper dans le classement.'

  return (
    <div id="page-dashboard" className="pg-enter" style={{ display: 'block' }}>
      <div className="dash-top">
        <div className="dash-top-inner">
          <div>
            <button className="back-btn" onClick={() => showPage('landing')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>{t('dash.back')}</span>
            </button>
            <div className="dash-greeting">
              <h1>
                <span>{t('dash.welcome')}</span>{' '}
                <em className="f-i" style={{ color: 'var(--or)' }}>{user.firstName}</em>
              </h1>
              <p>{t('dash.sub')}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={onOpenUpload}>{t('dash.newticket')}</button>
            <button className="btn btn-outline-light btn-sm" onClick={() => showPage('receipts')}>{t('dash.mytickets')}</button>
            <button className="btn-outline-danger btn-sm" onClick={logout}>{t('dash.logout')}</button>
          </div>
        </div>
      </div>

      <div className="dash-body">
        <div className="dash-grid">
          <div className="dash-card dash-wide">
            <p className="dash-card-title" style={{ textAlign: 'center' }}>{t('dash.progress')}</p>
            <div className="speedo-wrap">
              <Speedometer total={userTotal} />
              <div style={{ textAlign: 'center' }}>
                <span className="ring-total">{totalStr}</span>
                <span className="ring-mad">MAD</span>
                <p className="ring-badge">{badge}</p>
                <p className="ring-badge-sub">{next}</p>
              </div>
            </div>
          </div>

          <div className="dash-card dash-wide">
            <p className="dash-card-title">{t('dash.howtowin')}</p>
            <p className="fr-txt" style={{ fontSize: '.9rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
              À la clôture de l'opération, les <strong style={{ color: 'var(--corail)' }}>20 participants ayant cumulé le plus grand montant d'achats</strong> seront sélectionnés pour la finale.
              Plus vous téléchargez de tickets, plus votre total augmente et plus vous vous rapprochez du Top 20.
              L'un des finalistes remportera la <strong style={{ color: 'var(--bleu)' }}>Soueast S05</strong> d'une valeur de <strong>300 000 DH</strong>.
            </p>
            <p className="ar-txt" style={{ fontSize: '.9rem', color: 'var(--text-mid)', lineHeight: 2 }}>
              عند نهاية الحملة، سيتم اختيار <strong style={{ color: 'var(--corail)' }}>20 مشاركًا حققوا أعلى إجمالي للمشتريات</strong> للتأهل إلى المرحلة النهائية.
              كلما قمت بتحميل المزيد من إيصالات الشراء، ارتفع إجمالي مشترياتك واقتربت أكثر من قائمة أفضل 20 متسوقًا.
              وسيفوز أحد المتأهلين بسيارة <strong style={{ color: 'var(--bleu)' }}>Soueast S05</strong> بقيمة <strong>300.000 درهم</strong>.
            </p>
            <div className="top20-box">
              <span style={{ fontSize: '1.5rem' }}>🏆</span>
              <div>
                <p className="fr-txt" style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text)' }}>Objectif : intégrer le Top 20</p>
                <p className="ar-txt" style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text)' }}>هدفك: الوصول إلى قائمة أفضل 20 متسوقًا</p>
                <p className="fr-txt" style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>Continuez à cumuler vos achats pour améliorer votre position et maximiser vos chances d'accéder à la finale.</p>
                <p className="ar-txt" style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>واصل تجميع مشترياتك لتحسين ترتيبك وتعزيز فرصك في التأهل إلى المرحلة النهائية.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
