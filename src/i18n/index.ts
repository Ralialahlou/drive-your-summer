import fr from './fr.json'
import ar from './ar.json'

export type Lang = 'fr' | 'ar'

export const T: Record<Lang, Record<string, string>> = { fr, ar }

export function detectInitialLang(): Lang {
  const saved = localStorage.getItem('dys_lang')
  if (saved === 'fr' || saved === 'ar') return saved
  const param = new URLSearchParams(window.location.search).get('lang')
  if (param === 'fr' || param === 'ar') return param
  return 'fr'
}
