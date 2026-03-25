'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconPlus = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"><path d="M6 1v10M1 6h10" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`)
const iconCaret = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"><path d="M2 4.5l4 4 4-4" stroke="#1c1c1c" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const GROWTH_DATA = [2, 2.5, 3.2, 3.5, 3.4, 3.8, 4.5, 6.0, 6.8, 6.4, 6.7, 4.2]

function GrowthChart({ width = 400, height = 220 }: { width?: number; height?: number }) {
  const padL = 32, padR = 16, padT = 20, padB = 36
  const chartW = width - padL - padR
  const chartH = height - padT - padB
  const maxVal = 8
  const toX = (i: number) => padL + (i / (MONTHS.length - 1)) * chartW
  const toY = (v: number) => padT + chartH - (v / maxVal) * chartH
  const pathD = GROWTH_DATA.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ')
  const areaD = `${pathD} L ${toX(MONTHS.length - 1)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`
  const yTicks = [0, 2, 4, 6, 8]
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="gcg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1c1c" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#1c1c1c" stopOpacity={0} />
        </linearGradient>
      </defs>
      {yTicks.map(t => (
        <g key={t}>
          <line x1={padL} y1={toY(t)} x2={width - padR} y2={toY(t)} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />
          <text x={padL - 6} y={toY(t) + 4} textAnchor="end" fill="#aaa" fontSize={10}>{t}</text>
        </g>
      ))}
      {MONTHS.map((m, i) => (
        <text key={m} x={toX(i)} y={height - 8} textAnchor="middle" fill="#aaa" fontSize={10}>{m}</text>
      ))}
      <path d={areaD} fill="url(#gcg)" />
      <path d={pathD} fill="none" stroke="#1c1c1c" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {GROWTH_DATA.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill="#fff" stroke="#1c1c1c" strokeWidth={1.5} />
      ))}
    </svg>
  )
}

interface Scorecard { _id: string; title: string; date: string; submitted: boolean }

function ScorecardInner() {
  const router = useRouter()
  const { data: session } = useSession()
  const [scorecards, setScorecards] = useState<Scorecard[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateRange, setDateRange] = useState('Date range')
  const [showUnits, setShowUnits] = useState('Show units')

  const loadScorecards = (from?: string) => {
    const token = (session?.user as any)?.accessToken
    if (!token) return
    setLoading(true)
    const params = new URLSearchParams({ limit: '50' })
    if (from) params.set('dateFrom', from)
    apiFetch<any>(`/scorecard?${params}`, token)
      .then(resp => {
        const data = Array.isArray(resp?.data) ? resp.data : (resp?.data?.data ?? [])
        setScorecards(data)
      })
      .catch(() => setScorecards([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadScorecards() }, [session])

  return (
    <div style={{ padding: '24px 28px', ...FF }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 1060 }}>

        {/* Left: Scorecards list */}
        <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', background: '#fafafa', borderBottom: '1px solid rgba(28,28,28,0.08)'
          }}>
            <span style={font(14, 600)}>Scorecards</span>
            <button
              onClick={() => router.push('/scorecard/create')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', background: '#1c1c1c', color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer', ...font(12, 500, '#fff')
              }}
            >
              <img src={iconPlus} width={12} height={12} alt="" />
              Create New Scorecard +
            </button>
          </div>

          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={font(13)}>Date From:</span>
              <input
                type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                style={{ padding: '5px 8px', border: '1px solid rgba(28,28,28,0.2)', borderRadius: 6, ...font(12) }}
              />
              <button
                onClick={() => loadScorecards(dateFrom || undefined)}
                style={{ padding: '5px 14px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', ...font(12, 500, '#fff') }}
              >
                Submit
              </button>
            </div>
            {loading ? (
              <p style={font(13, 400, '#888')}>Loading…</p>
            ) : scorecards.length === 0 ? (
              <p style={font(13, 400, '#888')}>There are no records to display</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {scorecards.map(sc => (
                  <button
                    key={sc._id}
                    onClick={() => router.push(`/scorecard/${sc._id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', border: '1px solid rgba(28,28,28,0.1)',
                      borderRadius: 8, background: '#fff', cursor: 'pointer', width: '100%', textAlign: 'left'
                    }}
                  >
                    <div>
                      <p style={{ ...font(13, 500), margin: 0 }}>{sc.title}</p>
                      <p style={{ ...font(11, 400, '#888'), margin: '2px 0 0' }}>{sc.date ? new Date(sc.date).toLocaleDateString('en-GB') : ''}</p>
                    </div>
                    <span style={{
                      ...font(11, 500, sc.submitted ? '#16a34a' : '#92400e'),
                      padding: '2px 8px', borderRadius: 12,
                      background: sc.submitted ? '#dcfce7' : '#fef3c7'
                    }}>
                      {sc.submitted ? 'Submitted' : 'Draft'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Learning Growth */}
        <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', background: '#fafafa', borderBottom: '1px solid rgba(28,28,28,0.08)'
          }}>
            <span style={font(14, 600)}>Learning Growth</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { val: dateRange, set: setDateRange, opts: ['Date range', 'Last 3 months', 'Last 6 months', 'This year', 'Last year'] },
                { val: showUnits, set: setShowUnits, opts: ['Show units', 'All units', 'Skills', 'Knowledge', 'Behaviours'] },
              ].map(({ val, set, opts }) => (
                <div key={val} style={{ position: 'relative' }}>
                  <select
                    value={val} onChange={e => set(e.target.value)}
                    style={{
                      padding: '5px 28px 5px 10px', border: '1px solid rgba(28,28,28,0.2)',
                      borderRadius: 6, ...font(12), background: '#fff', cursor: 'pointer',
                      appearance: 'none'
                    }}
                  >
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <img src={iconCaret} width={12} height={12} alt="" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <GrowthChart />
          </div>
        </div>

      </div>
    </div>
  )
}

export default function Page() {
  return <Suspense><ScorecardInner /></Suspense>
}
