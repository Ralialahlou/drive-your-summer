import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { LS, LEVELS, type Receipt, type User } from './constants'
import { T, detectInitialLang, type Lang } from './i18n'

export type Page = 'landing' | 'dashboard' | 'receipts'
export type PendingAction = 'upload' | null

type ToastType = '' | 'or' | 'success'
interface Toast {
  id: number
  msg: string
  type: ToastType
}

interface StoreValue {
  // i18n
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string

  // auth / data
  user: User | null
  receipts: Receipt[]
  userTotal: number
  userLevel: number

  // navigation
  page: Page
  showPage: (p: Page) => void

  // pending flow
  pendingAction: PendingAction
  setPendingAction: (a: PendingAction) => void

  // actions
  register: (u: User) => void
  login: (u: User) => void
  logout: () => void
  addReceipt: (r: { amount: number; image: string }) => void

  // toast
  toasts: Toast[]
  showToast: (msg: string, type?: ToastType) => void
}

const StoreContext = createContext<StoreValue | null>(null)

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang)

  const [user, setUser] = useState<User | null>(() => {
    const u = readJSON<User | null>(LS.USER, null)
    const session = localStorage.getItem(LS.SESSION) === '1'
    return u && session ? u : null
  })
  const [receipts, setReceipts] = useState<Receipt[]>(() =>
    readJSON<Receipt[]>(LS.RECEIPTS, [])
  )
  const [page, setPage] = useState<Page>('landing')
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  // ── i18n: reflect lang onto <html> + document title/meta ──
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('lang', lang)
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
    document.title = T[lang]['meta.title'] || document.title
    const desc = document.querySelector('meta[name="description"]')
    if (desc && T[lang]['meta.desc']) desc.setAttribute('content', T[lang]['meta.desc'])
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(LS.LANG, l)
    setLangState(l)
  }, [])

  const t = useCallback((key: string) => T[lang]?.[key] ?? key, [lang])

  // ── persistence ──
  useEffect(() => {
    localStorage.setItem(LS.RECEIPTS, JSON.stringify(receipts))
  }, [receipts])

  const showToast = useCallback((msg: string, type: ToastType = '') => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, msg, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, 3200)
  }, [])

  const showPage = useCallback((p: Page) => {
    setPage(p)
    window.scrollTo(0, 0)
  }, [])

  const persistUser = useCallback((u: User) => {
    localStorage.setItem(LS.USER, JSON.stringify(u))
    localStorage.setItem(LS.SESSION, '1')
  }, [])

  const register = useCallback(
    (u: User) => {
      setUser(u)
      persistUser(u)
    },
    [persistUser]
  )

  const login = useCallback(
    (u: User) => {
      setUser(u)
      localStorage.setItem(LS.SESSION, '1')
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(LS.SESSION)
    setPage('landing')
  }, [])

  const addReceipt = useCallback((r: { amount: number; image: string }) => {
    setReceipts((prev) => [...prev, { id: Date.now(), date: Date.now(), ...r }])
  }, [])

  const userTotal = useMemo(
    () => receipts.reduce((s, r) => s + r.amount, 0),
    [receipts]
  )
  const userLevel = useMemo(() => {
    for (let i = LEVELS.length - 1; i >= 0; i--) if (userTotal >= LEVELS[i].min) return i
    return -1
  }, [userTotal])

  const value: StoreValue = {
    lang,
    setLang,
    t,
    user,
    receipts,
    userTotal,
    userLevel,
    page,
    showPage,
    pendingAction,
    setPendingAction,
    register,
    login,
    logout,
    addReceipt,
    toasts,
    showToast,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
