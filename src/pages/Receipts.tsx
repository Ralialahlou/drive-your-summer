import { useStore } from '../store'

export function Receipts({ onOpenUpload }: { onOpenUpload: () => void }) {
  const { lang, t, receipts, userTotal, showPage } = useStore()
  const isAr = lang === 'ar'
  const locale = isAr ? 'ar-MA' : 'fr-MA'
  const mad = isAr ? 'درهم' : 'MAD'
  const count = receipts.length

  const sub = count
    ? isAr
      ? `${count.toLocaleString(locale)} مشاركة — الإجمالي ${userTotal.toLocaleString(locale)} ${mad}`
      : `${count} participation${count > 1 ? 's' : ''} — total ${userTotal.toLocaleString(locale)} MAD`
    : isAr
      ? 'لا توجد مشاركات بعد.'
      : 'Aucune participation encore.'

  const badge = isAr ? '✓ مقدَّم' : '✓ Soumis'

  return (
    <div id="page-receipts" className="pg-enter" style={{ display: 'block' }}>
      <div className="dash-top">
        <div className="dash-top-inner">
          <div>
            <button className="back-btn" onClick={() => showPage('dashboard')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>{t('receipts.back')}</span>
            </button>
            <div className="dash-greeting">
              <h1 className="fr-txt">Mes <em className="f-i" style={{ color: 'var(--or)' }}>tickets</em></h1>
              <h1 className="ar-txt"><em className="f-i" style={{ color: 'var(--or)' }}>فواتيري</em></h1>
              <p id="receipts-sub">{sub}</p>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={onOpenUpload}>{t('receipts.add')}</button>
          </div>
        </div>
      </div>

      <div className="dash-body">
        <div id="receipts-list-wrap">
          {!count ? (
            <div className="empty-state">
              <span className="empty-icon">🧾</span>
              <p>{isAr ? 'لم تُقدِّم أي فاتورة بعد.' : "Aucun ticket soumis pour l'instant."}</p>
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={onOpenUpload}>
                {isAr ? 'أضف أول فاتورة' : 'Soumettre mon premier ticket'}
              </button>
            </div>
          ) : (
            <>
              <div className="receipts-list">
                {[...receipts].reverse().map((r) => {
                  const dateStr = new Date(r.id).toLocaleDateString(locale, {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                  return (
                    <div className="receipt-row" key={r.id}>
                      <img className="receipt-thumb" src={r.image} alt="Ticket" />
                      <div className="receipt-info">
                        <p className="receipt-date">{dateStr}</p>
                        <p className="receipt-amount">{r.amount.toLocaleString(locale)} {mad}</p>
                      </div>
                      <span className="receipt-badge">{badge}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button className="btn btn-primary" onClick={onOpenUpload}>
                  {isAr ? 'أضف فاتورة' : 'Ajouter un ticket'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
