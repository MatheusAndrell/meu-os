import { useState } from 'react'
import { brl, brlShort } from './utils'

/* Radar: data = [{ label, value (0..1), color }] */
export function Radar({ data, size = 260 }) {
  const c = size / 2
  const r = size / 2 - 40
  const n = data.length
  const pt = (i, v) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [c + Math.cos(a) * r * v, c + Math.sin(a) * r * v]
  }
  const poly = (v) => data.map((_, i) => pt(i, v).join(',')).join(' ')
  const shape = data.map((d, i) => pt(i, Math.max(0.04, d.value)).join(',')).join(' ')
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="radar" role="img"
      aria-label={data.map((d) => `${d.label}: ${(d.value * 5).toFixed(1)} de 5`).join(', ')}>
      {[0.2, 0.4, 0.6, 0.8, 1].map((v) => (
        <polygon key={v} points={poly(v)} style={{ fill: 'none', stroke: 'var(--line-2)' }} />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 1)
        return <line key={i} x1={c} y1={c} x2={x} y2={y} style={{ stroke: 'var(--line)' }} />
      })}
      <polygon points={shape} className="radar-shape" />
      {data.map((d, i) => {
        const [x, y] = pt(i, Math.max(0.04, d.value))
        const [lx, ly] = pt(i, 1.2)
        const anchor = Math.abs(lx - c) < 4 ? 'middle' : lx > c ? 'start' : 'end'
        return (
          <g key={d.label}>
            <circle cx={x} cy={y} r="4" style={{ fill: d.color, stroke: 'var(--surface)', strokeWidth: 2 }} />
            <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" className="radar-label">
              {d.label}
              <tspan className="radar-val" dx="5">{(d.value * 5).toFixed(1)}</tspan>
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* Paired monthly bars: data = [{ label, in, out }] */
export function MonthBars({ data, height = 170 }) {
  const [hover, setHover] = useState(null)
  const w = 360
  const pad = { t: 12, b: 24, l: 4, r: 4 }
  const max = Math.max(1, ...data.flatMap((d) => [d.in, d.out]))
  const slot = (w - pad.l - pad.r) / data.length
  const bw = Math.min(16, slot / 3.2)
  const ih = height - pad.t - pad.b
  const y = (v) => pad.t + ih - (v / max) * ih
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${w} ${height}`} className="bars" role="img"
        aria-label={data.map((d) => `${d.label}: entradas ${brl(d.in)}, saídas ${brl(d.out)}`).join('; ')}>
        {[0.5, 1].map((g) => (
          <line key={g} x1={pad.l} x2={w - pad.r} y1={y(max * g)} y2={y(max * g)} style={{ stroke: 'var(--line)', strokeDasharray: '2 4' }} />
        ))}
        <line x1={pad.l} x2={w - pad.r} y1={y(0)} y2={y(0)} style={{ stroke: 'var(--line-2)' }} />
        {data.map((d, i) => {
          const cx = pad.l + slot * i + slot / 2
          const active = hover === i
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'default' }}>
              <rect x={cx - slot / 2} y={pad.t} width={slot} height={ih} style={{ fill: active ? 'var(--line)' : 'transparent' }} rx="6" />
              <rect x={cx - bw - 1} y={y(d.in)} width={bw} height={Math.max(0, y(0) - y(d.in))} rx="3" style={{ fill: 'var(--mint)' }} />
              <rect x={cx + 1} y={y(d.out)} width={bw} height={Math.max(0, y(0) - y(d.out))} rx="3" style={{ fill: 'var(--coral)' }} />
              <text x={cx} y={height - 6} textAnchor="middle" className="axis-label">{d.label}</text>
            </g>
          )
        })}
      </svg>
      {hover != null && (
        <div className="chart-tip" style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}>
          <strong>{data[hover].label}</strong>
          <span><i style={{ background: 'var(--mint)' }} /> {brlShort(data[hover].in)}</span>
          <span><i style={{ background: 'var(--coral)' }} /> {brlShort(data[hover].out)}</span>
        </div>
      )}
    </div>
  )
}

/* Horizontal ranked bars: data = [{ label, value, color }] */
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
