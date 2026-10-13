import { useState } from 'react'
import { brl, brlShort } from './utils'

/* Barras mensais pareadas: data = [{ label, in, out }] */
export function MonthBars({ data, height = 180 }) {
  const [hover, setHover] = useState(null)
  const w = 420
  const pad = { t: 14, b: 26, l: 0, r: 0 }
  const max = Math.max(1, ...data.flatMap((d) => [d.in, d.out]))
  const slot = (w - pad.l - pad.r) / data.length
  const bw = Math.min(22, slot / 3)
  const ih = height - pad.t - pad.b
  const y = (v) => pad.t + ih - (v / max) * ih
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${w} ${height}`} className="bars" role="img"
        aria-label={data.map((d) => `${d.label}: entradas ${brl(d.in)}, saídas ${brl(d.out)}`).join('; ')}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={pad.l} x2={w - pad.r} y1={y(max * g)} y2={y(max * g)} style={{ stroke: 'var(--rule-soft)' }} />
        ))}
        {data.map((d, i) => {
          const cx = pad.l + slot * i + slot / 2
          const active = hover === i
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={cx - slot / 2} y={pad.t} width={slot} height={ih} style={{ fill: active ? 'var(--paper-2)' : 'transparent' }} />
              <rect x={cx - bw - 1} y={y(d.in)} width={bw} height={Math.max(0, y(0) - y(d.in))} style={{ fill: 'var(--ink)' }} />
              <rect x={cx + 1} y={y(d.out)} width={bw} height={Math.max(0, y(0) - y(d.out))} style={{ fill: 'var(--orange)' }} />
              <text x={cx} y={height - 7} textAnchor="middle" className="axis-label">{d.label}</text>
            </g>
          )
        })}
        <line x1={pad.l} x2={w - pad.r} y1={y(0)} y2={y(0)} style={{ stroke: 'var(--ink)', strokeWidth: 1.5 }} />
      </svg>
      {hover != null && (
        <div className="chart-tip" style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}>
          <strong>{data[hover].label}</strong>
          <span><i style={{ background: 'var(--paper)' }} /> {brlShort(data[hover].in)}</span>
          <span><i style={{ background: 'var(--orange)' }} /> {brlShort(data[hover].out)}</span>
        </div>
      )}
    </div>
  )
}

/* Barras horizontais ranqueadas: data = [{ label, value, color }] */
export function RankBars({ data, format = brl }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <ul className="rank">
      {data.map((d) => (
        <li key={d.label}>
          <div className="rank-top">
            <span><i style={{ background: d.color }} />{d.label}</span>
            <span className="mono">{format(d.value)}</span>
          </div>
          <div className="rank-track">
            <span style={{ width: `${(d.value / max) * 100}%`, background: d.color }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
