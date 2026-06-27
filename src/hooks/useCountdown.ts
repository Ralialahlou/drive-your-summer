import { useEffect, useState } from 'react'
import { CAMPAIGN_END } from '../constants'

const pad = (n: number) => String(n).padStart(2, '0')

export interface CountdownValue {
  d: string
  h: string
  m: string
  s: string
  /** Compact form for the sticky bar, e.g. "11j 04h". */
  sticky: string
  ended: boolean
}

function compute(): CountdownValue {
  const diff = CAMPAIGN_END.getTime() - Date.now()
  if (diff <= 0) {
    return { d: '00', h: '00', m: '00', s: '00', sticky: '0j 00h', ended: true }
  }
  const dv = Math.floor(diff / 86400000)
  const hv = Math.floor((diff % 86400000) / 3600000)
  const mv = Math.floor((diff % 3600000) / 60000)
  const sv = Math.floor((diff % 60000) / 1000)
  return {
    d: pad(dv),
    h: pad(hv),
    m: pad(mv),
    s: pad(sv),
    sticky: `${dv}j ${pad(hv)}h`,
    ended: false,
  }
}

export function useCountdown(): CountdownValue {
  const [value, setValue] = useState<CountdownValue>(compute)
  useEffect(() => {
    const id = setInterval(() => setValue(compute()), 1000)
    return () => clearInterval(id)
  }, [])
  return value
}
