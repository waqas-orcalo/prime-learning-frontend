'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const SERIES = [
  { label: 'Learning Activity', color: '#818cf8', dash: '6 3' },
  { label: 'Plan Of Activity/action', color: '#f472b6', dash: '6 3' },
  { label: 'Review', color: '#60a5fa', dash: '6 3' },
  { label: 'Unit', color: '#c4b5fd', dash: '6 3' },
  { label: 'Progress', color: '#4f46e5', dash: '6 3' },
  { label: 'Target Progress', color: '#10b981', dash: '4 4' },
  { label: 'Red-Amber threshold', color: '#f59e0b', dash: '4 4' },
]

/* Smooth sinusoidal mock data for each series, 12 months */
function genData(amplitude: number, phase: number, offset: number): number[] {
  return MONTHS.map((_, i) => {
    const val = offset + amplitude * Math.sin((i / 11) * Math.PI * 2 + phase)
    return Math.max(0, Math.min(100, val))
  })
}

const SERIES_DATA = [
  genData(30, 0, 55),    // Learning Activity
  genData(35, 0.5, 60),  // Plan of Activity
  genData(25, 1.0, 45),  // Review
  genData(20, 1.5, 50),  // Unit
  genData(15, 2.0, 40),  // Progress
  genData(10, 2.5, 55),  // Target Progress
  genData(5, 3.0, 35),   // Red-Amber threshold
]

function MultiLineChart({ width = 840, height = 320 }: { width?: number; height?: number }) {
  const padL = 48, padR = 24, padT = 24, padB = 36
  const chartW = width - padL - padR
  const chartH = height - padT - padB
  const yTicks = [0, 20, 40, 60, 80, 100]

  const toX = (i: number) => padL + (i / (MONTHS.length - 1)) * chartW
  const toY = (v: number) => padT + chartH - (v / 100) * chartH

  const pathD = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ')

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {/* Grid lines */}
      {yTicks.map(tick => (
        <g key={tick}>
          <line x1={padL} y1={toY(tick)} x2={width - padR} y2={toY(tick)} stroke="rgba(0,0,0,0.07)" strokeWidth={1} />
          <text x={padL - 8} y={toY(tick) + 4} textAnchor="end" fill="#888" fontSize={11}>{tick}%</text>
        </g>
      ))}

      {/* Month labels */}
      {MONTHS.map((m, i) => (
        <text key={m} x={toX(i)} y={height - 6} textAnchor="middle" fill="#888" fontSize={11}>{m}</text>
      ))}

      {/* Series lines */}
      {SERIES_DATA.map((data, si) => (
        <path
          key={si}
          d={pathD(data)}
          fill="none"
          stroke={SERIES[si].color}
          strokeWidth={2}
          strokeDasharray={SERIES[si].dash}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

function LearningJourneyInner() {
  const router = useRouter()
  const [dateFrom, setDateFrom] = useState('12/12/2025')
  const [dateTo, setDateTo] = useState('18/12/2025')
  const [showActual, setShowActual] = useState(false)
  const [showTarget, setShowTarget] = useState(false)
  const [showActivities, setShowActivities] = useState(false)

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1060, ...FF }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>Learning Journey</h1>
      </div>

      {/* Chart card */}
      <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>

        {/* Filters row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          padding: '14px 20px', background: '#f8f9fa', borderBottom: '1px solid rgba(28,28,28,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={font(13, 500)}>Date From:</label>
            <input
              type="text"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={{
                padding: '5px 10px', border: '1px solid rgba(28,28,28,0.2)', borderRadius: 6,
                ...font(13), background: '#fff', width: 110
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={font(13, 500)}>Date To:</label>
            <input
              type="text"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={{
                padding: '5px 10px', border: '1px solid rgba(28,28,28,0.2)', borderRadius: 6,
                ...font(13), background: '#fff', width: 110
              }}
            />
          </div>
          <button style={{
            padding: '5px 16px', background: '#1c1c1c', color: '#fff', border: 'none',
            borderRadius: 6, cursor: 'pointer', ...font(13, 500, '#fff')
          }}>Show</button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
            {[
              { label: 'Show actual progress', val: showActual, set: setShowActual },
              { label: 'Show target progress', val: showTarget, set: setShowTarget },
              { label: 'Show activities', val: showActivities, set: setShowActivities },
            ].map(({ label, val, set }) => (
              <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} style={{ width: 13, height: 13 }} />
                <span style={font(12, 400, '#444')}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', gap: '8px 24px', flexWrap: 'wrap',
          padding: '12px 20px', borderBottom: '1px solid rgba(28,28,28,0.06)'
        }}>
          {SERIES.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width={24} height={10}>
                <line x1={0} y1={5} x2={24} y2={5} stroke={s.color} strokeWidth={2} strokeDasharray={s.dash} />
              </svg>
              <span style={font(11, 400, '#555')}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ padding: '16px 20px 12px' }}>
          <MultiLineChart />
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return <Suspense><LearningJourneyInner /></Suspense>
}
