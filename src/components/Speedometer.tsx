import { useEffect, useRef } from 'react'

const ARC_LEN = 353.4
const MAX = 50000

/** Animated speedometer gauge; needle + km/h ease toward the user's total. */
export function Speedometer({ total }: { total: number }) {
  const needleRef = useRef<SVGGElement>(null)
  const arcRef = useRef<SVGPathElement>(null)
  const kmhRef = useRef<SVGTextElement>(null)
  const fromDeg = useRef(0)
  const fromKmh = useRef(0)

  useEffect(() => {
    const needle = needleRef.current
    const arc = arcRef.current
    const speed = kmhRef.current
    if (!needle || !arc || !speed) return

    const pct = Math.min(total / MAX, 1)
    const toDeg = pct * 270
    const toKmh = Math.round(pct * 260)
    const startDeg = fromDeg.current
    const startKmh = fromKmh.current

    const t0 = performance.now()
    const dur = 1400
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      const e = ease(t)
      const deg = startDeg + (toDeg - startDeg) * e
      needle.setAttribute('transform', `translate(120,95) rotate(${deg})`)
      speed.textContent = String(Math.round(startKmh + (toKmh - startKmh) * e))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    arc.style.strokeDashoffset = (ARC_LEN * (1 - pct)).toFixed(1)

    fromDeg.current = toDeg
    fromKmh.current = toKmh
    return () => cancelAnimationFrame(raf)
  }, [total])

  return (
    <div className="speedo-scene">
      <svg viewBox="0 0 240 165" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="arcGrad" gradientUnits="userSpaceOnUse" x1="67" y1="148" x2="173" y2="148">
            <stop offset="0%" stopColor="#E07850" />
            <stop offset="100%" stopColor="#C9A96E" />
          </linearGradient>
        </defs>
        <rect width="240" height="165" fill="#0b0b14" rx="12" />
        <path d="M 67 148 A 75 75 0 1 1 173 148" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" strokeLinecap="round" />
        <path d="M 192 73 A 75 75 0 0 1 173 148" fill="none" stroke="rgba(210,60,40,0.2)" strokeWidth="12" strokeLinecap="round" />
        <path
          ref={arcRef}
          id="speedo-arc"
          d="M 67 148 A 75 75 0 1 1 173 148"
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={ARC_LEN}
          strokeDashoffset={ARC_LEN}
        />
        <line x1="67" y1="148" x2="74" y2="141" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
        <line x1="46" y1="86" x2="55" y2="87" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="81" y1="31" x2="86" y2="39" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
        <line x1="147" y1="25" x2="143" y2="34" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="192" y1="73" x2="182" y2="76" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
        <line x1="173" y1="148" x2="166" y2="141" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
        <text x="59" y="160" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="Mulish,sans-serif">0</text>
        <text x="75" y="22" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="Mulish,sans-serif">100</text>
        <text x="202" y="69" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="Mulish,sans-serif">200</text>
        <text x="181" y="160" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="Mulish,sans-serif">260</text>
        <g ref={needleRef} id="speedo-needle-group" transform="translate(120,95) rotate(0)">
          <line x1="0" y1="0" x2="-48" y2="48" stroke="#E07850" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="0" x2="7" y2="-7" stroke="#E07850" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </g>
        <circle cx="120" cy="95" r="8" fill="#0b0b14" stroke="#C9A96E" strokeWidth="2" />
        <circle cx="120" cy="95" r="3" fill="#C9A96E" />
        <text ref={kmhRef} id="speedo-kmh" x="120" y="118" textAnchor="middle" fontSize="26" fontWeight="700" fill="#ffffff" fontFamily="Mulish,sans-serif">0</text>
        <text x="120" y="131" textAnchor="middle" fontSize="8" fill="rgba(201,169,110,0.65)" fontFamily="Mulish,sans-serif" letterSpacing="2">KM/H</text>
      </svg>
    </div>
  )
}
