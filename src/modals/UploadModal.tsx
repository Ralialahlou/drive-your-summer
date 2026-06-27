import { useEffect, useState, type ChangeEvent, type DragEvent } from 'react'
import { useStore } from '../store'

interface Props {
  open: boolean
  onClose: () => void
}

export function UploadModal({ open, onClose }: Props) {
  const { lang, t, addReceipt, showPage, showToast } = useStore()
  const isAr = lang === 'ar'

  const [dataURL, setDataURL] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [amount, setAmount] = useState('')
  const [success, setSuccess] = useState(false)
  const [drag, setDrag] = useState(false)

  // Reset the form each time the modal opens.
  useEffect(() => {
    if (open) {
      setDataURL(null)
      setFileName('')
      setAmount('')
      setSuccess(false)
      setDrag(false)
    }
  }, [open])

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setDataURL(e.target?.result as string)
      setFileName('✓ ' + file.name)
    }
    reader.readAsDataURL(file)
  }

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) readFile(file)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) readFile(file)
  }

  const submit = () => {
    const amt = parseFloat(amount)
    if (!dataURL) {
      showToast(isAr ? '📷 أضف صورة فاتورتك.' : '📷 Ajoutez une photo de votre ticket.', 'or')
      return
    }
    if (!amt || amt < 1000) {
      showToast(isAr ? '⚠️ الحد الأدنى للمبلغ هو 1.000 درهم.' : '⚠️ Le montant minimum est 1 000 MAD.', 'or')
      return
    }
    addReceipt({ amount: amt, image: dataURL })
    setSuccess(true)
    showToast(
      isAr ? '🎉 تم تسجيل الفاتورة! تم تحديث إجماليك.' : '🎉 Ticket enregistré ! Votre total a été mis à jour.',
      'success'
    )
  }

  return (
    <div className={`overlay ${open ? 'open' : ''}`} id="overlay-upload">
      <div className="modal">
        <div className="modal-hd">
          <div className="modal-hd-text">
            <h3>{success ? t('upload.ok.h') : t('upload.title')}</h3>
            <p>{success ? t('upload.ok.p') : t('upload.sub')}</p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {!success ? (
          <div id="upload-form-wrap">
            <label
              className={`upload-zone ${drag ? 'drag' : ''}`}
              id="upload-zone"
              onDragOver={(e) => {
                e.preventDefault()
                setDrag(true)
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
            >
              <input type="file" id="file-input" accept="image/*" capture="environment" onChange={onFileSelect} />
              <span className="upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="38" height="38" style={{ color: 'var(--or)' }} aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </span>
              <h4>{t('upload.zone.h')}</h4>
              <p>{t('upload.zone.p')}</p>
              {dataURL && <img id="upload-preview" className="upload-preview show" src={dataURL} alt="Aperçu" />}
            </label>
            {fileName && <p className="upload-fname show" id="upload-fname">{fileName}</p>}
            <div className="form-g">
              <label htmlFor="upload-amount">{t('upload.label')}</label>
              <div className="amount-wrap">
                <input className="form-input" id="upload-amount" type="number" min="1000" step="0.01" placeholder="1 000" required value={amount} onChange={(e) => setAmount(e.target.value)} />
                <span className="amount-sfx">MAD</span>
              </div>
              <p style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: 5 }}>{t('upload.min')}</p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={submit}>{t('upload.submit')}</button>
          </div>
        ) : (
          <div className="success-screen show" id="upload-success">
            <span className="success-icon">🎉</span>
            <h3>{t('upload.ok.h')}</h3>
            <p>{t('upload.ok.p')}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
              <button className="btn btn-or btn-sm" onClick={() => setSuccess(false)}>{t('upload.another')}</button>
              <button
                className="btn btn-outline-bleu btn-sm"
                onClick={() => {
                  onClose()
                  showPage('dashboard')
                }}
              >
                {t('cta.dash')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
