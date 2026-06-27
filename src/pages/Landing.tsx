import { useEffect } from 'react'
import { useStore } from '../store'
import { Hero } from '../components/Hero'
import { CarCarousel } from '../components/CarCarousel'

interface Props {
  onUploadCTA: () => void
  onOpenUpload: () => void
}

function scrollTo2(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function Landing({ onUploadCTA }: Props) {
  const { t, user, showPage } = useStore()

  // Reveal-on-scroll for .fade-up elements (mirrors legacy IntersectionObserver).
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('.fade-up').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div id="page-landing" className="pg-enter">
      <Hero />

      <div style={{ padding: '8px 0', background: 'var(--bg)' }}>
        <div className="or-ornament container">
          <span className="or-ornament-dot" />
        </div>
      </div>

      {/* RULES */}
      <section id="rules" className="section">
        <div className="container">
          <div className="rules-hd fade-up">
            <p className="eyebrow fr-txt">La règle du jeu</p>
            <p className="eyebrow ar-txt">قواعد اللعبة</p>
            <h2 className="fr-txt nowrap-lg" style={{ color: 'var(--text)' }}>
              Comment <em className="f-i" style={{ color: 'var(--corail)' }}>tenter votre chance ?</em>
            </h2>
            <h2 className="ar-txt" style={{ color: 'var(--text)' }}>
              كيف <em className="f-i" style={{ color: 'var(--corail)' }}>تحظى بفرصتك ؟</em>
            </h2>
          </div>
          <div className="rules-grid">
            <div className="rule-card fade-up">
              <div className="rule-num">01</div>
              <div className="rule-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <h3 className="fr-txt">Faites-vous plaisir</h3>
              <h3 className="ar-txt">استمتع بتسوّقك</h3>
              <p className="fr-txt">
                Shoppez vos marques préférées au Morocco Mall et cumulez au moins <strong>1 000 DH</strong> d'achats.
              </p>
              <p className="ar-txt">
                تسوّق من علاماتك التجارية المفضلة في Morocco Mall واجمع مشتريات بقيمة <strong>1000 درهم</strong> أو أكثر.
              </p>
            </div>
            <div className="rule-card fade-up">
              <div className="rule-num">02</div>
              <div className="rule-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="fr-txt">Cumulez vos chances</h3>
              <h3 className="ar-txt">ضاعف فرصك</h3>
              <p className="fr-txt">Téléchargez votre ticket et augmentez vos opportunités de gagner.</p>
              <p className="ar-txt">حمّل وصل الشراء الخاص بك وزِد من فرصك في الفوز.</p>
            </div>
            <div className="rule-card fade-up">
              <div className="rule-num">03</div>
              <div className="rule-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
                  <path d="M6 9H4a2 2 0 00-2 2v2a2 2 0 002 2h2M18 9h2a2 2 0 012 2v2a2 2 0 01-2 2h-2" />
                  <path d="M6 9l2-5h8l2 5M6 9h12v6H6z" strokeLinejoin="round" />
                  <circle cx="9" cy="17" r="1.5" />
                  <circle cx="15" cy="17" r="1.5" />
                </svg>
              </div>
              <h3 className="fr-txt">Gagnez la Soueast S05</h3>
              <h3 className="ar-txt">اربح سيارة Soueast S05</h3>
              <p className="fr-txt">
                Les 20 meilleurs acheteurs seront finalistes. L'un d'eux repartira au volant de la Soueast S05.
              </p>
              <p className="ar-txt">
                سيتأهل أفضل 20 متسوقًا إلى المرحلة النهائية، وسيفوز أحدهم بسيارة Soueast S05.
              </p>
            </div>
          </div>
          <p className="rules-note fr-txt">* Valable dans toutes les enseignes du Morocco Mall (hors Marjane).</p>
          <p className="rules-note ar-txt">* صالح في جميع متاجر Morocco Mall (باستثناء مرجان).</p>
          <p className="rules-tagline fr-txt">Chaque ticket compte et vous rapproche de la victoire.</p>
          <p className="rules-tagline ar-txt">كل إيصال يقرّبك من قائمة أفضل 20 متسوقًا.</p>
          <div className="rules-cta">
            <button className="btn btn-primary btn-lg" onClick={onUploadCTA}>{t('rules.cta1')}</button>
            <button className="btn btn-outline-bleu" onClick={() => scrollTo2('car-showcase')}>
              {t('rules.cta2')}
            </button>
          </div>
        </div>
      </section>

      <div style={{ padding: '8px 0', background: 'var(--sable-light)' }}>
        <div className="or-ornament container">
          <span className="or-ornament-dot" />
        </div>
      </div>

      {/* CAR SHOWCASE */}
      <section id="car-showcase" className="section">
        <div className="container">
          <div className="showcase-inner">
            <div className="car-info fade-up">
              <p className="eyebrow fr-txt">Le prix à gagner</p>
              <p className="eyebrow ar-txt">الجائزة الكبرى</p>
              <h2 className="fr-txt" style={{ color: 'var(--text)' }}>
                Morocco Mall vous fait gagner <em className="f-i" style={{ color: 'var(--or)' }}>une Soueast S05</em>
              </h2>
              <h2 className="ar-txt" style={{ color: 'var(--text)' }}>
                Morocco Mall يمنحك فرصة الفوز <em className="f-i" style={{ color: 'var(--or)' }}>بسيارة Soueast S05</em>
              </h2>
              <p className="car-name-big">Soueast S05</p>
              <p className="fr-txt">
                Faites vos achats, téléchargez vos tickets et tentez de rejoindre les 20 finalistes.
              </p>
              <p className="ar-txt">
                قم بمشترياتك، حمّل إيصالاتك، وحاول أن تكون من بين المتأهلين العشرين إلى المرحلة النهائية.
              </p>
              <p className="car-info fr-txt">
                Alliance parfaite entre design raffiné, technologie de pointe et confort absolu, ce SUV a été pensé
                pour sublimer chacun de vos trajets. Chaque achat vous rapproche un peu plus du volant.
              </p>
              <p className="car-info ar-txt">
                يجمع هذا الـ SUV بين التصميم الأنيق، والتكنولوجيا المتطورة، والراحة الاستثنائية، ليمنحك تجربة قيادة
                ترتقي بكل رحلة. كل عملية شراء تقرّبك أكثر من المقعد خلف المقود.
              </p>
              <div className="car-specs">
                <div className="spec-item">
                  <span className="spec-val">300 000</span>
                  <span className="spec-lbl fr-txt">Valeur MAD</span>
                  <span className="spec-lbl ar-txt">القيمة بالدرهم</span>
                </div>
                <div className="spec-item">
                  <span className="spec-val fr-txt">SUV Élec.</span>
                  <span className="spec-val ar-txt">SUV كهربائي</span>
                  <span className="spec-lbl fr-txt">Motorisation</span>
                  <span className="spec-lbl ar-txt">المحرك</span>
                </div>
                <div className="spec-item">
                  <span className="spec-val">Top 20</span>
                  <span className="spec-lbl fr-txt">Finalistes</span>
                  <span className="spec-lbl ar-txt">المتأهلون</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={onUploadCTA}>{t('car.cta')}</button>
            </div>
            <CarCarousel />
          </div>
        </div>
      </section>

      {/* UPLOAD CTA */}
      <section id="upload-cta" className="section">
        <div className="container">
          <div className="cta-inner fade-up">
            <p className="eyebrow fr-txt">Chaque achat vous rapproche du volant</p>
            <p className="eyebrow ar-txt">كل عملية شراء تقرّبك أكثر من المقود</p>
            <h2 className="fr-txt">
              La route vers la Soueast S05 <em className="f-i" style={{ color: 'var(--corail)' }}>commence ici</em>
            </h2>
            <h2 className="ar-txt">
              طريقك نحو الفوز بسيارة <em className="f-i" style={{ color: 'var(--corail)' }}>Soueast S05 يبدأ من هنا</em>
            </h2>
            <p className="fr-txt">
              Faites vos achats au Morocco Mall, téléchargez vos tickets et tentez de rejoindre les 20 finalistes.
            </p>
            <p className="fr-txt">
              Cumulez vos tickets, grimpez dans le classement et tentez de faire partie des 20 finalistes.
            </p>
            <p className="ar-txt">
              تسوّق في Morocco Mall، حمّل إيصالات الشراء الخاصة بك، وحاول أن تكون من بين أفضل 20 متسوقًا المتأهلين إلى المرحلة النهائية.
            </p>
            <p className="ar-txt">
              كل إيصال يمنحك فرصة إضافية للارتقاء في الترتيب وزيادة حظوظك في الوصول إلى النهائي.
            </p>
            <div className="cta-actions">
              <button className="btn btn-primary btn-lg" onClick={onUploadCTA}>{t('cta.btn1')}</button>
              {user && (
                <button className="btn btn-outline-or" onClick={() => showPage('dashboard')}>
                  {t('cta.dash')}
                </button>
              )}
            </div>
            <p className="cta-note fr-txt">
              Valable dans toutes les enseignes du Morocco Mall, hors Marjane. Du 6 au 27 juillet 2026.
            </p>
            <p className="cta-note ar-txt">
              العرض ساري في جميع متاجر Morocco Mall (باستثناء مرجان)، وذلك من 6 إلى 27 يوليوز 2026.
            </p>
          </div>
        </div>
      </section>

      {/* WORLD CUP BANNER */}
      <div className="wc-banner">
        <img src="/assets/image-end-of-page.png" alt="Morocco Mall soutient l'Équipe Nationale" />
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <img src="/assets/mm-wordmark.png" alt="Morocco Mall" className="footer-mm-logo" />
          <div className="footer-brand">Drive Your <span>Summer</span></div>
          <div className="footer-divider" />
          <p className="footer-copy fr-txt">Summer Sales Morocco Mall × Soueast S05 — Été 2026</p>
          <p className="footer-copy ar-txt">سولد الصيف — موروكو مول × سوييست S05 — 2026</p>
          <p className="footer-copy fr-txt" style={{ marginTop: -8 }}>© 2026 Morocco Mall. Tous droits réservés.</p>
          <p className="footer-copy ar-txt" style={{ marginTop: -8 }}>© 2026 موروكو مول. جميع الحقوق محفوظة.</p>
          <p className="footer-legal fr-txt">
            Jeu-concours organisé par Morocco Mall du 6 au 27 juillet 2026. Pour participer, effectuez un achat
            minimum de 1 000 MAD dans les enseignes participantes du Morocco Mall (hors Marjane). Les 20 participants
            ayant le plus grand total d'achats cumulés seront sélectionnés à la clôture de la campagne. L'un d'eux
            remportera une Soueast S05 d'une valeur de 300 000 MAD. Règlement complet disponible à l'accueil du
            Morocco Mall.
          </p>
          <p className="footer-legal ar-txt">
            مسابقة تنظمها موروكو مول من 6 إلى 27 يوليوز 2026. للمشاركة، اشترِ بـ 1.000 درهم على الأقل في متاجر موروكو
            مول المشاركة (ما عدا مرجان). أفضل 20 مشاركاً من حيث إجمالي المشتريات سيُختارون. سيفوز أحدهم بسيارة سوييست
            S05 بقيمة 300.000 درهم. النظام الداخلي متوفر لدى استقبال موروكو مول.
          </p>
        </div>
      </footer>
    </div>
  )
}
