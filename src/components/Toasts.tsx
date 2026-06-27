import { useStore } from '../store'

const ICONS: Record<string, string> = {
  success: '✅',
  or: '⭐',
  corail: '🔔',
  '': 'ℹ️',
}

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div id="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-ico">{ICONS[t.type] || 'ℹ️'}</span>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
