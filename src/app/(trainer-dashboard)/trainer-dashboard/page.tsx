'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTrainerLearners } from '@/hooks/use-trainer'
import { apiFetch } from '@/lib/api-client'

// ── Design tokens ─────────────────────────────────────────────────────────────
const FF  = "'Inter', sans-serif"
const ffs = "'ss01' 1, 'cv01' 1, 'cv11' 1"
const f = (size: number, weight = 400, color = '#1c1c1c'): React.CSSProperties => ({
  fontFamily: FF, fontSize: `${size}px`, fontWeight: weight, color, fontFeatureSettings: ffs, lineHeight: 1.5,
})

// ── Learner avatar colours ─────────────────────────────────────────────────────
const COLORS = ['#1c1c1c','#3b5bdb','#2f9e44','#c92a2a','#e67700','#6741d9','#0c8599']
const avatarBg = (i: number) => COLORS[i % COLORS.length]
const initials = (first: string, last: string) => `${first?.[0]??''}${last?.[0]??''}`.toUpperCase()

// ── SVG chart primitives (same as old project) ────────────────────────────────

function DonutSVG({ percent, color, track = '#F2E9E9', size = 110 }: {
  percent: number; color: string; track?: string; size?: number
}) {
  const r = 40, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  const dash  = (percent / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={track} strokeWidth={12} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={12}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  )
}

function PieSVG({ slices, size = 110 }: { slices: { pct: number; color: string }[]; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 6
  let cum = 0
  const toRad = (d: number) => (d * Math.PI) / 180
  const paths = slices.map((s, i) => {
    const start = (cum / 100) * 360 - 90
    cum += s.pct
    const end = (cum / 100) * 360 - 90
    const x1 = cx + r * Math.cos(toRad(start)), y1 = cy + r * Math.sin(toRad(start))
    const x2 = cx + r * Math.cos(toRad(end)),   y2 = cy + r * Math.sin(toRad(end))
    return <path key={i} d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${s.pct > 50 ? 1 : 0} 1 ${x2} ${y2}Z`} fill={s.color} />
  })
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{paths}</svg>
}

// ── Calendar (current month) ───────────────────────────────────────────────────
function CalendarCard() {
  const now    = new Date()
  const year   = now.getFullYear()
  const month  = now.getMonth()
  const today  = now.getDate()
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const DAYS   = ['Mo','Tu','We','Th','Fr','Sa','Su']

  // build weeks
  const first = new Date(year, month, 1)
  const startDow = (first.getDay() + 6) % 7 // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(startDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  // highlight a range (next 6 days from today for demo)
  const highlighted = Array.from({ length: 6 }, (_, i) => (today + i <= daysInMonth ? today + i : null)).filter(Boolean)

  return (
    <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 10, padding: '14px 16px', background: '#fff', minWidth: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={f(12, 600)}>{MONTHS[month]} {year}</span>
        <span style={f(10, 400, '#888')}>{today} {MONTHS[month]}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
        {DAYS.map(d => <div key={d} style={{ ...f(9, 600, '#aaa'), textAlign: 'center', padding: '2px 0' }}>{d}</div>)}
        {weeks.flat().map((day, i) => {
          const isToday  = day === today
          const isHighlighted = day !== null && highlighted.includes(day)
          return (
            <div key={i} style={{
              textAlign: 'center', padding: '3px 2px', borderRadius: 4,
              ...f(10, isToday ? 700 : 400, isToday ? '#fff' : isHighlighted ? '#7B61FF' : day ? '#1c1c1c' : 'transparent'),
              background: isToday ? '#7B61FF' : isHighlighted ? 'rgba(123,97,255,0.1)' : 'transparent',
            }}>
              {day ?? ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Donut chart card ───────────────────────────────────────────────────────────
function DonutCard({ title, percent, color, legend }: {
  title: string; percent: number; color: string;
  legend: { label: string; color: string; value: string }[]
}) {
  return (
    <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 10, padding: '14px 16px', background: '#fff', flex: '1 1 160px' }}>
      <div style={{ ...f(11, 600), marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <DonutSVG percent={percent} color={color} size={90} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={f(14, 700)}>{percent}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {legend.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
              <span style={f(10, 400, '#555')}>{l.label}</span>
              <span style={{ ...f(10, 600), marginLeft: 'auto', paddingLeft: 6 }}>{l.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Pie chart card ─────────────────────────────────────────────────────────────
function PieCard({ title, slices }: { title: string; slices: { label: string; pct: number; color: string; value?: number }[] }) {
  return (
    <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 10, padding: '14px 16px', background: '#fff', flex: '1 1 160px' }}>
      <div style={{ ...f(11, 600), marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flexShrink: 0 }}>
          <PieSVG slices={slices.map(s => ({ pct: s.pct, color: s.color }))} size={80} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {slices.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={f(10, 400, '#555')}>{s.label}</span>
              {s.value !== undefined && <span style={{ ...f(10, 600), marginLeft: 'auto', paddingLeft: 6 }}>{s.value}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── IQA bar chart ──────────────────────────────────────────────────────────────
function BarChartCard() {
  const bars = [
    { label: 'Week 1', value: 65 }, { label: 'Week 2', value: 40 },
    { label: 'Week 3', value: 80 }, { label: 'Week 4', value: 55 },
    { label: 'Week 5', value: 30 },
  ]
  return (
    <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 10, padding: '14px 16px', background: '#fff', flex: '1 1 160px' }}>
      <div style={{ ...f(11, 600), marginBottom: 12 }}>IQA Action</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
        {bars.map(b => (
          <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
            <div style={{ width: '100%', height: `${b.value}%`, background: '#7B61FF', borderRadius: '3px 3px 0 0' }} />
            <span style={f(8, 400, '#aaa')}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Due-to-complete table card ─────────────────────────────────────────────────
function DueTableCard() {
  const rows = [
    { name: 'John Doe',       days: -7  },
    { name: 'Rashid Joe',     days: 13  },
    { name: 'Rusty Thorburn', days: 45  },
  ]
  return (
    <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 10, padding: '14px 16px', background: '#fff', flex: '1 1 180px' }}>
      <div style={{ ...f(11, 600), marginBottom: 10 }}>Learners Due to Complete (90 days)</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...f(10, 600, '#aaa'), textAlign: 'left', padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>Name</th>
            <th style={{ ...f(10, 600, '#aaa'), textAlign: 'right', padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>Days Remaining</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.name}>
              <td style={{ ...f(11), padding: '6px 0', borderBottom: '1px solid #f8f8f8' }}>{r.name}</td>
              <td style={{ ...f(11, 600, r.days < 0 ? '#ef4444' : '#1c1c1c'), textAlign: 'right', padding: '6px 0', borderBottom: '1px solid #f8f8f8' }}>
                {r.days < 0 ? `${Math.abs(r.days)} Days Overdue` : `${r.days} Days`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Progress bars card (Tasks Due) ────────────────────────────────────────────
function TasksDueCard() {
  const rows = [
    { label: 'Immediately', value: 25, color: '#ef4444' },
    { label: 'This week',   value: 50, color: '#f59e0b' },
    { label: 'Next week',   value: 70, color: '#3b82f6' },
    { label: 'In two weeks',value: 40, color: '#10b981' },
  ]
  return (
    <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 10, padding: '14px 16px', background: '#fff', flex: '1 1 200px' }}>
      <div style={{ ...f(11, 600), marginBottom: 12 }}>Tasks Due</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map(r => (
          <div key={r.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={f(10, 400, '#555')}>{r.label}</span>
              <span style={f(10, 600)}>{r.value}%</span>
            </div>
            <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${r.value}%`, background: r.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Accordion wrapper ──────────────────────────────────────────────────────────
function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: '#fafafa', border: 'none', cursor: 'pointer', textAlign: 'left',
          borderBottom: open ? '1px solid rgba(28,28,28,0.08)' : 'none',
        }}
      >
        <span style={f(14, 600)}>{title}</span>
        <span style={{ fontSize: 18, color: '#888', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>
      {open && <div style={{ padding: '18px' }}>{children}</div>}
    </div>
  )
}

// ── Learner's Activity section ─────────────────────────────────────────────────
function LearnersActivitySection() {
  const [showPortfolio, setShowPortfolio] = useState(false)
  const [selectedLearner, setSelectedLearner] = useState<any>(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useTrainerLearners({ limit: 50, search: search || undefined })
  const learners = data?.data ?? []

  return (
    <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(28,28,28,0.08)', background: '#fafafa' }}>
        <span style={f(14, 600)}>Learner's Activity</span>
      </div>

      <div style={{ padding: '14px 18px' }}>
        {/* Filters row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <label style={f(12, 500, '#555')}>Cohort:</label>
          <select style={{ padding: '5px 10px', border: '1px solid rgba(28,28,28,0.18)', borderRadius: 6, ...f(12), background: '#fff' }}>
            <option>Any cohort</option>
          </select>
          <label style={f(12, 500, '#555')}>Learner:</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search a learner"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '5px 10px 5px 30px', border: '1px solid rgba(28,28,28,0.18)', borderRadius: 6, ...f(12), background: '#fff', outline: 'none' }}
            />
            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#aaa' }}>🔍</span>
          </div>
          <button
            onClick={() => { setShowPortfolio(p => { if (p) setSelectedLearner(null); return !p }) }}
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', background: '#1c1c1c', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer', ...f(12, 500, '#fff'),
            }}
          >
            {showPortfolio ? 'Close Portfolio' : 'View Portfolio'} →
          </button>
        </div>

        {/* Portfolio */}
        {showPortfolio && (
          <div style={{ marginTop: 8 }}>
            {isLoading && <p style={f(12, 400, '#aaa')}>Loading learners…</p>}

            {/* Learner selector grid */}
            {!isLoading && !selectedLearner && (
              <div>
                <div style={{ ...f(13, 600), marginBottom: 12 }}>Select a learner to view their portfolio</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {learners.length === 0 && <p style={f(12, 400, '#aaa')}>No learners found.</p>}
                  {learners.map((learner: any, i: number) => {
                    const name = `${learner.firstName} ${learner.lastName}`
                    const pct  = learner.stats?.progressPercent ?? 0
                    const status = pct >= 60 ? 'On Track' : pct >= 30 ? 'Behind' : 'At Risk'
                    const statusColor = status === 'On Track' ? '#43A047' : status === 'Behind' ? '#FB8C00' : '#E53935'
                    const statusBg    = status === 'On Track' ? '#E8F5E9' : status === 'Behind' ? '#FFF3E0' : '#FFEBEE'
                    return (
                      <div
                        key={learner._id}
                        onClick={() => setSelectedLearner(learner)}
                        style={{
                          border: '1px solid rgba(28,28,28,0.12)', borderRadius: 10, padding: '12px 14px',
                          cursor: 'pointer', background: '#fafafa', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F0EFFE'; (e.currentTarget as HTMLElement).style.borderColor = '#7B61FF' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fafafa'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(28,28,28,0.12)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarBg(i), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={f(13, 700, '#fff')}>{initials(learner.firstName, learner.lastName)}</span>
                          </div>
                          <div>
                            <div style={f(12, 600)}>{name}</div>
                            <div style={f(10, 400, '#888')}>{learner.email.split('@')[0]}</div>
                          </div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={f(10, 400, '#aaa')}>Progress</span>
                            <span style={f(10, 600)}>{pct}%</span>
                          </div>
                          <div style={{ height: 5, background: '#E8E8E8', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: avatarBg(i), borderRadius: 3 }} />
                          </div>
                        </div>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, background: statusBg, color: statusColor, ...f(10, 600, statusColor) }}>
                          {status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Selected learner detail */}
            {!isLoading && selectedLearner && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f5f5f5', borderRadius: 8, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#7B61FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={f(12, 700, '#fff')}>{initials(selectedLearner.firstName, selectedLearner.lastName)}</span>
                    </div>
                    <div>
                      <div style={f(13, 600)}>{selectedLearner.firstName} {selectedLearner.lastName}</div>
                      <div style={f(11, 400, '#888')}>{selectedLearner.email}</div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLearner(null)} style={{ ...f(12, 500, '#7B61FF'), background: 'none', border: 'none', cursor: 'pointer' }}>
                    ← Change Learner
                  </button>
                </div>
                <div style={{ padding: '16px', border: '1px solid rgba(28,28,28,0.08)', borderRadius: 10, background: '#fafafa' }}>
                  <p style={f(12, 400, '#888')}>Learner portfolio details will appear here when connected to the full apprenticeship management system.</p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                    {['Learning Activities', 'Progress Reviews', 'Off-The-Job', 'Evidence', 'Scorecard'].map(item => (
                      <div key={item} style={{ padding: '8px 14px', border: '1px solid rgba(28,28,28,0.12)', borderRadius: 8, background: '#fff', ...f(12) }}>{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Dashboard Stats types ──────────────────────────────────────────────────────
interface DashboardStats {
  learners:   { total: number }
  tasks:      { total: number; pending: number; inProgress: number; completed: number; completionRate: number }
  activities: { total: number }
  messages:   { unread: number }
  courses:    { total: number }
}

// ── Dashboard Charts types ─────────────────────────────────────────────────────
interface DashboardCharts {
  completedVisits:     { aboveNinety: number; eightyToNinety: number; belowEighty: number; total: number; percent: number }
  plannedVisits:       { aboveNinety: number; eightyToNinety: number; belowEighty: number; total: number; percent: number }
  iqaActions:          { count: number }
  learnersDue90:       { _id: string; firstName: string; lastName: string; daysRemaining: number }[]
  learnersLoggedIn:    { within7Days: number; eightTo30Days: number; over30Days: number }
  learnersOnTarget:    { behind: number; onTarget: number; ahead: number }
  learnersOnTargetOTJ: { behind: number; onTarget: number; ahead: number }
  noOTJActivity:       { over4Weeks: number; threeToFour: number; twoToThree: number; oneToTwo: number; learningBreak: number }
  progressReviewDue:   { overdue: number; within7Days: number; sevenTo14Days: number; fourteenTo28Days: number }
  tasksDue:            { immediately: number; thisWeek: number; nextWeek: number; inTwoWeeks: number }
}

// ── Figma chart colours ────────────────────────────────────────────────────────
const CG = '#4CAF50'  // green
const CO = '#FF9800'  // orange
const CR = '#F44336'  // red
const CB = '#2196F3'  // blue
const CA = '#FFC107'  // amber
const CT = '#009688'  // teal
const CP = '#9C27B0'  // purple

// ── Stat card header ───────────────────────────────────────────────────────────
function StatCardHeader({ type = 'Statistics', title }: { type?: string; title: string }) {
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <div style={f(10, 400, '#9291A5')}>{type}</div>
        <div style={f(15, 700, '#1E1B39')}>{title}</div>
      </div>
      <div style={{ height: 1, background: '#E8E8ED', margin: '0 -16px 14px' }} />
    </>
  )
}

// ── Legend dot item ────────────────────────────────────────────────────────────
function Dot({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={f(11, 400, '#1c1c1c')}>{label}:</span>
      <span style={f(11, 700, '#1c1c1c')}>{value}</span>
    </div>
  )
}

// ── Ring / donut chart ─────────────────────────────────────────────────────────
function RingChart({ percent }: { percent: number }) {
  const size = 170, r = 60, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  const good = Math.min(Math.max(percent, 0), 100)
  const goodDash = (good / 100) * circ
  const badDash  = ((100 - good) / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FCE4E4" strokeWidth={16} />
        {good > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={CG} strokeWidth={16}
            strokeDasharray={`${goodDash} ${circ - goodDash}`} strokeLinecap="round" />
        )}
        {good < 100 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={CR} strokeWidth={16}
            strokeDasharray={`${badDash} ${circ - badDash}`}
            strokeDashoffset={-goodDash} strokeLinecap="round" />
        )}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <span style={f(11, 400, '#9291A5')}>Total Progress</span>
        <span style={f(22, 700, '#1E1B39')}>{percent}%</span>
      </div>
    </div>
  )
}

// ── Filled pie chart ───────────────────────────────────────────────────────────
function FigmaPie({ slices, size = 170 }: { slices: { value: number; color: string }[]; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 6
  const total = slices.reduce((s, x) => s + x.value, 0) || 1
  const toRad = (d: number) => (d * Math.PI) / 180
  let cum = 0
  const paths = slices.map((s, i) => {
    if (s.value === 0) return null
    const startDeg = (cum / total) * 360 - 90
    cum += s.value
    const endDeg = (cum / total) * 360 - 90
    const large = s.value / total > 0.5 ? 1 : 0
    const x1 = cx + r * Math.cos(toRad(startDeg)), y1 = cy + r * Math.sin(toRad(startDeg))
    const x2 = cx + r * Math.cos(toRad(endDeg)),   y2 = cy + r * Math.sin(toRad(endDeg))
    return <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}Z`} fill={s.color} />
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {total === 0 ? <circle cx={cx} cy={cy} r={r} fill="#E8E8ED" /> : paths}
    </svg>
  )
}

// ── Horizontal bar chart ───────────────────────────────────────────────────────
function HBar({ rows, maxVal }: { rows: { label: string; value: number; color: string }[]; maxVal?: number }) {
  const max = maxVal ?? Math.max(...rows.map(r => r.value), 1)
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...f(11, 400, '#1c1c1c'), width: 82, flexShrink: 0, textAlign: 'right' }}>{row.label}</span>
          <div style={{ flex: 1, height: 12, background: '#F0F0F5', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(row.value / max) * 100}%`, background: row.color, borderRadius: 6, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 90 }}>
        {Array.from({ length: 5 }, (_, i) => Math.round((max / 4) * i)).map((v, i) => (
          <span key={i} style={f(10, 400, '#9291A5')}>{v}</span>
        ))}
      </div>
    </div>
  )
}

// ── Navigable calendar ─────────────────────────────────────────────────────────
function NavCalendar() {
  const [offset, setOffset] = useState(0)
  const now   = new Date()
  const base  = new Date(now.getFullYear(), now.getMonth() + offset)
  const year  = base.getFullYear()
  const month = base.getMonth()
  const today = offset === 0 ? now.getDate() : -1
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const DAYS   = ['Mo','Tu','We','Th','Fr','Sa','Su']
  const first  = new Date(year, month, 1)
  const startDow = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(startDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7) cells.push(null)

  return (
    <div style={{ border: '1px solid #E8E8ED', borderRadius: 12, padding: '14px 16px', background: '#fff' }}>
      <div style={{ marginBottom: 6 }}>
        <div style={f(10, 400, '#9291A5')}>Calendar</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={f(18, 700, '#1E1B39')}>{MONTHS[month]} {year}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { dir: -1, path: 'M6 1L1 5l5 4' },
            { dir:  1, path: 'M1 1l5 4-5 4' },
          ].map(({ dir, path }) => (
            <button key={dir} onClick={() => setOffset(o => o + dir)}
              style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #E8E8ED', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="7" height="10" viewBox="0 0 7 10"><path d={path} stroke="#1E1B39" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 1, background: '#E8E8ED', margin: '0 -16px 10px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '1px' }}>
        {DAYS.map(d => <div key={d} style={{ ...f(10, 600, '#9291A5'), textAlign: 'center', paddingBottom: 4 }}>{d}</div>)}
        {cells.map((d, i) => {
          const isToday = d === today
          return (
            <div key={i} style={{ textAlign: 'center', padding: '4px 2px', borderRadius: 6, background: isToday ? '#1E1B39' : 'transparent' }}>
              <span style={f(11, isToday ? 700 : 400, isToday ? '#fff' : d ? '#1c1c1c' : 'transparent')}>
                {d ?? ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Trainer's Dashboard accordion content ─────────────────────────────────────
function TrainerDashboardContent() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  const [charts, setCharts] = useState<DashboardCharts | null>(null)
  const [stats,  setStats]  = useState<DashboardStats  | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true); setError('')
      const [chartsRes, statsRes] = await Promise.all([
        apiFetch<{ data: DashboardCharts }>('/trainer/dashboard/charts', token),
        apiFetch<{ data: DashboardStats  }>('/trainer/dashboard/stats',  token),
      ])
      setCharts(chartsRes.data)
      setStats(statsRes.data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { if (token) load() }, [load, token])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 28, height: 28, border: '3px solid #E8E8ED', borderTopColor: '#1E1B39', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <div style={{ padding: '12px 16px', background: 'rgba(244,67,54,0.08)', borderRadius: 8, ...f(13, 400, CR) }}>{error}</div>
  )

  if (!charts || !stats) return null

  const c = charts
  const s = stats
  const CARD: React.CSSProperties = { border: '1px solid #E8E8ED', borderRadius: 12, padding: '14px 16px', background: '#fff', display: 'flex', flexDirection: 'column' }

  // ── Summary stat widget configs ──────────────────────────────────────────────
  const statWidgets = [
    {
      label: 'My Learners',
      value: s.learners.total,
      sub: 'total assigned',
      accent: '#3b5bdb',
      bg: '#EEF2FF',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      label: 'Total Tasks',
      value: s.tasks.total,
      sub: 'across all learners',
      accent: '#6741d9',
      bg: '#F3F0FF',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6741d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="4" rx="1"/><path d="M5 4h2a2 2 0 0 1 2 2v1h6V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
          <path d="m9 14 2 2 4-4"/>
        </svg>
      ),
    },
    {
      label: 'Completed',
      value: s.tasks.completed,
      sub: `${s.tasks.completionRate}% completion rate`,
      accent: '#2f9e44',
      bg: '#EBFBEE',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2f9e44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
        </svg>
      ),
    },
    {
      label: 'In Progress',
      value: s.tasks.inProgress,
      sub: 'tasks active',
      accent: '#e67700',
      bg: '#FFF9DB',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e67700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      label: 'Pending Tasks',
      value: s.tasks.pending,
      sub: 'awaiting action',
      accent: '#c92a2a',
      bg: '#FFF5F5',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c92a2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    },
    {
      label: 'Activities',
      value: s.activities.total,
      sub: 'learning activities',
      accent: '#0c8599',
      bg: '#E3FAFC',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c8599" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
    },
    {
      label: 'Unread Messages',
      value: s.messages.unread,
      sub: 'in your inbox',
      accent: '#9c36b5',
      bg: '#F8F0FC',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9c36b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
    },
    {
      label: 'My Courses',
      value: s.courses?.total ?? 0,
      sub: 'courses assigned',
      accent: '#1971c2',
      bg: '#E7F5FF',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1971c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Summary stat widgets ──────────────────────────────────────────────── */}
      <div className="t-stat-grid">
        {statWidgets.map((w) => (
          <div key={w.label} style={{
            background: w.bg, borderRadius: 12, padding: '14px 14px 12px',
            display: 'flex', flexDirection: 'column', gap: 8,
            border: `1px solid ${w.accent}22`,
          }}>
            {/* icon row */}
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 1px 4px ${w.accent}33` }}>
              {w.icon}
            </div>
            {/* value */}
            <div style={{ ...f(26, 700, w.accent), lineHeight: 1 }}>{w.value}</div>
            {/* label */}
            <div style={{ ...f(12, 600, '#1E1B39'), lineHeight: 1.3 }}>{w.label}</div>
            {/* sub */}
            <div style={{ ...f(10, 400, '#9291A5'), lineHeight: 1.3 }}>{w.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Row 1: Calendar · Completed Visits · Planned Visits ─────────────── */}
      <div className="t-grid-3">

        <NavCalendar />

        {/* Completed visits last 30 days */}
        <div style={CARD}>
          <StatCardHeader title="Completed visit in last 30 Days" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <RingChart percent={c.completedVisits.percent} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center' }}>
              <Dot color={CG} label="90% or above"  value={c.completedVisits.aboveNinety} />
              <Dot color={CR} label="Less than 80%" value={c.completedVisits.belowEighty} />
              <Dot color={CO} label="80%–90%"       value={c.completedVisits.eightyToNinety} />
            </div>
          </div>
        </div>

        {/* Planned visits next 30 days */}
        <div style={CARD}>
          <StatCardHeader title="Planned visit in next 30 Days" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <RingChart percent={c.plannedVisits.percent} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center' }}>
              <Dot color={CG} label="90% or above"  value={c.plannedVisits.aboveNinety} />
              <Dot color={CR} label="Less than 80%" value={c.plannedVisits.belowEighty} />
              <Dot color={CO} label="80%–90%"       value={c.plannedVisits.eightyToNinety} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: IQA Action · Learners Due · Last Logged In ───────────────── */}
      <div className="t-grid-3">

        {/* IQA Action */}
        <div style={CARD}>
          <StatCardHeader title="IQA Action" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
            <HBar rows={[{ label: 'IQA Action', value: c.iqaActions.count, color: CG }]} maxVal={Math.max(c.iqaActions.count, 4)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: CG }} />
              <span style={f(12, 400, '#1c1c1c')}>IQA action required: <strong>{c.iqaActions.count}</strong></span>
            </div>
          </div>
        </div>

        {/* Learners due to complete next 90 days */}
        <div style={CARD}>
          <StatCardHeader type="Data" title="Learners Due to Complete next 90 days" />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {c.learnersDue90.length === 0 ? (
              <div style={{ ...f(12, 400, '#9291A5'), textAlign: 'center', padding: '20px 0' }}>No learners due in 90 days</div>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ ...f(12, 600, '#1c1c1c'), textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #E8E8ED' }}>Name</th>
                      <th style={{ ...f(12, 600, '#1c1c1c'), textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #E8E8ED' }}>Days Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.learnersDue90.map((l, i) => (
                      <tr key={i}>
                        <td style={{ ...f(12, 400, '#1c1c1c'), padding: '8px 8px', borderBottom: '1px solid #F5F5FA' }}>{l.firstName} {l.lastName}</td>
                        <td style={{ ...f(12, 600, l.daysRemaining < 0 ? CR : '#1c1c1c'), textAlign: 'right', padding: '8px 8px', borderBottom: '1px solid #F5F5FA' }}>
                          {l.daysRemaining} Days
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ ...f(10, 400, '#9291A5'), marginTop: 8, lineHeight: 1.5 }}>
                  Student with negative days count are overdue to complete the task and with positive days count are on track
                </div>
              </>
            )}
          </div>
        </div>

        {/* Learners last logged in */}
        <div style={CARD}>
          <StatCardHeader title="Learners Last Logged In" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <FigmaPie size={170} slices={[
              { value: c.learnersLoggedIn.over30Days,    color: CR     },
              { value: c.learnersLoggedIn.eightTo30Days, color: CO     },
              { value: c.learnersLoggedIn.within7Days,   color: CG     },
            ]} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center' }}>
              <Dot color={CR} label="Over 30 days"       value={c.learnersLoggedIn.over30Days} />
              <Dot color={CO} label="8 – 30 days"        value={c.learnersLoggedIn.eightTo30Days} />
              <Dot color={CG} label="Within last 7 Days" value={c.learnersLoggedIn.within7Days} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: On Target · On Target OTJ · No OTJ Activity ──────────────── */}
      <div className="t-grid-3">

        {/* Learners on Target */}
        <div style={CARD}>
          <StatCardHeader title="Learners on Target" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <FigmaPie size={170} slices={[
              { value: c.learnersOnTarget.behind,   color: CR },
              { value: c.learnersOnTarget.onTarget, color: CO },
              { value: c.learnersOnTarget.ahead,    color: CG },
            ]} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center' }}>
              <Dot color={CR} label="Behind target"  value={c.learnersOnTarget.behind} />
              <Dot color={CO} label="On target"      value={c.learnersOnTarget.onTarget} />
              <Dot color={CG} label="Ahead of target" value={c.learnersOnTarget.ahead} />
            </div>
          </div>
        </div>

        {/* Learners on Target OTJ */}
        <div style={CARD}>
          <StatCardHeader title="Learners on Target (Off-The-Job)" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <FigmaPie size={170} slices={[
              { value: c.learnersOnTargetOTJ.behind,   color: CR },
              { value: c.learnersOnTargetOTJ.onTarget, color: CO },
              { value: c.learnersOnTargetOTJ.ahead,    color: CG },
            ]} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center' }}>
              <Dot color={CR} label="Behind target"   value={c.learnersOnTargetOTJ.behind} />
              <Dot color={CO} label="On target"       value={c.learnersOnTargetOTJ.onTarget} />
              <Dot color={CG} label="Ahead of target" value={c.learnersOnTargetOTJ.ahead} />
            </div>
          </div>
        </div>

        {/* No OTJ Activity */}
        <div style={CARD}>
          <StatCardHeader title="No Off-The-Job Activity" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <FigmaPie size={170} slices={[
              { value: c.noOTJActivity.over4Weeks,    color: CG },
              { value: c.noOTJActivity.oneToTwo,      color: CB },
              { value: c.noOTJActivity.threeToFour,   color: CO },
              { value: c.noOTJActivity.learningBreak, color: CB },
              { value: c.noOTJActivity.twoToThree,    color: CA },
            ]} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', justifyContent: 'center' }}>
              <Dot color={CG} label="Over 4 Weeks"   value={c.noOTJActivity.over4Weeks} />
              <Dot color={CB} label="1 to 2 Weeks"   value={c.noOTJActivity.oneToTwo} />
              <Dot color={CO} label="3 to 4 Weeks"   value={c.noOTJActivity.threeToFour} />
              <Dot color={CB} label="Learning Break" value={c.noOTJActivity.learningBreak} />
              <Dot color={CA} label="2 to 3 Weeks"   value={c.noOTJActivity.twoToThree} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Progress Review Due · Task Due ────────────────────────────── */}
      <div className="t-grid-2">

        {/* Progress review due */}
        <div style={CARD}>
          <StatCardHeader title="Progress review due" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <FigmaPie size={170} slices={[
              { value: c.progressReviewDue.overdue,          color: CO },
              { value: c.progressReviewDue.within7Days,      color: CG },
              { value: c.progressReviewDue.sevenTo14Days,    color: CA },
              { value: c.progressReviewDue.fourteenTo28Days, color: CT },
            ]} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center' }}>
              <Dot color={CO} label="Overdue"                value={c.progressReviewDue.overdue} />
              <Dot color={CG} label="Due in next 7 Days"     value={c.progressReviewDue.within7Days} />
              <Dot color={CA} label="Due between 7-14 days"  value={c.progressReviewDue.sevenTo14Days} />
              <Dot color={CT} label="Due between 14-28 days" value={c.progressReviewDue.fourteenTo28Days} />
            </div>
          </div>
        </div>

        {/* Task Due */}
        <div style={CARD}>
          <StatCardHeader title="Task Due" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
            <HBar rows={[
              { label: 'Immediately', value: c.tasksDue.immediately, color: CP },
              { label: 'This week',   value: c.tasksDue.thisWeek,   color: CT },
              { label: 'Next week',   value: c.tasksDue.nextWeek,   color: CA },
              { label: 'In two weeks', value: c.tasksDue.inTwoWeeks, color: CG },
            ]} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
              <Dot color={CP} label="Immediately"  value={c.tasksDue.immediately} />
              <Dot color={CT} label="This week"    value={c.tasksDue.thisWeek} />
              <Dot color={CA} label="Next week"    value={c.tasksDue.nextWeek} />
              <Dot color={CG} label="In two weeks" value={c.tasksDue.inTwoWeeks} />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

// ── Learner Dashboard table (accordion content) ───────────────────────────────
const LEARNER_ROWS = [
  { name: 'John Doe',  aim: 'Business Administrator Apprenticeship', progress: 12, target: 51, endDate: '19/04/2026', deviation: '+31%', devRed: false, review: 'None Scheduled', reviewRed: false, units: '0/7', tasks: 3 },
  { name: 'Sarah Ali', aim: 'Business Administrator Apprenticeship', progress: 12, target: 51, endDate: '19/04/2026', deviation: '-41%', devRed: true,  review: '19/04/2025',      reviewRed: true,  units: '0/7', tasks: 2 },
  { name: 'Mike Ross', aim: 'Business Administrator Apprenticeship', progress: 12, target: 51, endDate: '19/04/2026', deviation: '-41%', devRed: true,  review: '14/04/2025',      reviewRed: true,  units: '0/7', tasks: 1 },
]

const TH: React.CSSProperties = { padding: '8px 10px', ...f(10, 600, '#888') as object, textAlign: 'left', borderBottom: '2px solid #f0f0f0', whiteSpace: 'nowrap', background: '#fafafa' }
const TD: React.CSSProperties = { padding: '10px 10px', ...f(11) as object, borderBottom: '1px solid #f8f8f8', verticalAlign: 'middle' }

function LearnerDashboardContent() {
  const [showMine, setShowMine] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <select style={{ padding: '6px 10px', border: '1px solid rgba(28,28,28,0.18)', borderRadius: 6, ...f(12), background: '#fff' }}>
          <option>Any cohort</option>
        </select>
        <input type="date" style={{ padding: '5px 10px', border: '1px solid rgba(28,28,28,0.18)', borderRadius: 6, ...f(12) }} />
        <div style={{ position: 'relative' }}>
          <input placeholder="Search learners..." style={{ padding: '6px 10px 6px 28px', border: '1px solid rgba(28,28,28,0.18)', borderRadius: 6, ...f(12), outline: 'none' }} />
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#aaa' }}>🔍</span>
        </div>
        <button style={{ padding: '6px 14px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', ...f(12, 500, '#fff') }}>Apply Filter</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <input type="checkbox" checked={showMine} onChange={e => setShowMine(e.target.checked)} />
          <span style={f(11)}>Show my learners only</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
          <span style={f(11)}>Show Archived learners</span>
        </label>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={TH}>Learner</th>
              <th style={TH}>Learning Aim</th>
              <th style={TH}>Progress %</th>
              <th style={TH}>Target %</th>
              <th style={TH}>Planned End Date</th>
              <th style={TH}>Target Deviation</th>
              <th style={TH}>Next Review Date</th>
              <th style={TH}>Units Signed Off</th>
              <th style={TH}>Tasks</th>
            </tr>
          </thead>
          <tbody>
            {LEARNER_ROWS.map((row, i) => (
              <tr key={i}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <td style={TD}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: avatarBg(i), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={f(10, 700, '#fff')}>{row.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <span style={f(12, 500)}>{row.name}</span>
                  </div>
                </td>
                <td style={{ ...TD, maxWidth: 160, ...f(11, 400, '#555') as object }}>
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{row.aim}</span>
                </td>
                <td style={TD}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 80 }}>
                    <div style={{ flex: 1, height: 5, background: '#f0f0f0', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${row.progress}%`, background: '#7B61FF', borderRadius: 3 }} />
                    </div>
                    <span style={f(10, 600)}>{row.progress}%</span>
                  </div>
                </td>
                <td style={TD}><span style={f(11)}>{row.target}%</span></td>
                <td style={TD}>{row.endDate}</td>
                <td style={TD}><span style={{ color: row.devRed ? '#ef4444' : '#16a34a', ...f(11, 600, row.devRed ? '#ef4444' : '#16a34a') }}>{row.deviation}</span></td>
                <td style={TD}><span style={{ color: row.reviewRed ? '#ef4444' : '#1c1c1c', ...f(11, 400, row.reviewRed ? '#ef4444' : '#1c1c1c') }}>{row.review}</span></td>
                <td style={TD}>{row.units}</td>
                <td style={TD}>
                  <span style={{ padding: '2px 8px', borderRadius: 20, background: '#f0effe', color: '#7B61FF', ...f(11, 600, '#7B61FF') }}>
                    {row.tasks}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Forms & Templates accordion content ───────────────────────────────────────
const FORMS_ITEMS = [
  { label: 'Learner Forms',                     path: '/trainer-dashboard/learner-forms'            },
  { label: 'Learning Activity Templates',        path: '/trainer-dashboard/learning-activity-templates' },
  { label: 'Plan Of Activity/Action Templates',  path: '/trainer-dashboard/plan-of-activity-templates' },
  { label: 'Written Question Forms',             path: '/trainer-dashboard/written-question-forms'  },
]

function FormsContent() {
  const router = useRouter()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {FORMS_ITEMS.map(item => (
        <button
          key={item.path}
          onClick={() => router.push(item.path)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', background: '#fafafa', border: '1px solid rgba(28,28,28,0.08)',
            borderRadius: 8, cursor: 'pointer', textAlign: 'left',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f0effe')}
          onMouseLeave={e => (e.currentTarget.style.background = '#fafafa')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>📄</span>
            <span style={f(13, 500)}>{item.label}</span>
          </div>
          <span style={f(14, 400, '#888')}>›</span>
        </button>
      ))}
    </div>
  )
}

// ── Main Dashboard Page ────────────────────────────────────────────────────────
function TrainerDashboardInner() {
  return (
    <div style={{ maxWidth: 1200, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
        <div style={{
          width: '100%', display: 'flex', alignItems: 'center',
          padding: '14px 18px', background: '#fafafa',
          borderBottom: '1px solid rgba(28,28,28,0.08)',
        }}>
          <span style={f(14, 600)}>Trainer's Dashboard</span>
        </div>
        <div style={{ padding: '18px' }}>
          <TrainerDashboardContent />
        </div>
      </div>
    </div>
  )
}

export default function TrainerDashboardPage() {
  return <Suspense><TrainerDashboardInner /></Suspense>
}
