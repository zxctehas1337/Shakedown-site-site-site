import React, { useEffect, useMemo, useState } from 'react'
import '../styles/Snowfall.css'

type Snowflake = {
  id: number
  leftVw: number
  sizePx: number
  opacity: number
  blurPx: number
  durationS: number
  delayS: number
  swayPx: number
}

export default function Snowfall() {
  const enabled = (import.meta as any)?.env?.VITE_SNOWFALL !== 'false'

  const flakes = useMemo<Snowflake[]>(() => {
    const count = 60
    const rand = (min: number, max: number) => min + Math.random() * (max - min)

    return Array.from({ length: count }, (_, idx) => ({
      id: idx,
      leftVw: rand(0, 100),
      sizePx: rand(2, 6),
      opacity: rand(0.25, 0.9),
      blurPx: rand(0, 1.2),
      durationS: rand(7, 15),
      delayS: rand(-15, 0),
      swayPx: rand(8, 40)
    }))
  }, [])

  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(mql.matches)

    update()

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', update)
      return () => mql.removeEventListener('change', update)
    }

    mql.addListener(update)
    return () => mql.removeListener(update)
  }, [])

  if (!enabled || reduceMotion) return null

  return (
    <div className="snowfall" aria-hidden="true">
      {flakes.map((f) => (
        <span
          key={f.id}
          className="snowfall__flake"
          style={
            {
              '--snow-left': `${f.leftVw}vw`,
              '--snow-size': `${f.sizePx}px`,
              '--snow-opacity': String(f.opacity),
              '--snow-blur': `${f.blurPx}px`,
              '--snow-duration': `${f.durationS}s`,
              '--snow-delay': `${f.delayS}s`,
              '--snow-sway': `${f.swayPx}px`
            } as React.CSSProperties
          }
        >
          <span className="snowfall__flakeInner" />
        </span>
      ))}
    </div>
  )
}
