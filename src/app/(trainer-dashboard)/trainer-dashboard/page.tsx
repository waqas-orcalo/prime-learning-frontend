'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useTrainerLearners } from '@/hooks/use-trainer'

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
                  {learners.map((learner, i) => {
                    const name = `${learner.firstName} ${learner.lastName}`
                    const pct  = 40 + (i * 11) % 55 // demo progress
                    const statuses = ['On Track', 'Behind', 'At Risk']
                    const status = statuses[i % 3]
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

// ── Trainer's Dashboard accordion content ─────────────────────────────────────
function TrainerDashboardContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Row 1: Calendar + 2 donuts */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flexShrink: 0 }}><CalendarCard /></div>
        <DonutCard
          title="Completed Visit in last 30 Days"
          percent={70}
          color="#7B61FF"
          legend={[
            { label: '90%+ visits completed', color: '#43A047', value: '12' },
            { label: '80% - 89% completed',   color: '#f59e0b', value: '4'  },
            { label: '20% - 50% completed',   color: '#ef4444', value: '2'  },
          ]}
        />
        <DonutCard
          title="Planned Visit in next 30 Days"
          percent={70}
          color="#43A047"
          legend={[
            { label: 'Planned',     color: '#43A047', value: '14' },
            { label: 'Unplanned',   color: '#f59e0b', value: '4'  },
            { label: 'Overdue',     color: '#ef4444', value: '2'  },
          ]}
        />
      </div>

      {/* Row 2: Bar chart + Due table + Pie (Last Logged In) */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <BarChartCard />
        <DueTableCard />
        <PieCard
          title="Learners Last Logged In"
          slices={[
            { label: 'Over 30 days',    pct: 20, color: '#ef4444', value: 3 },
            { label: '6–30 days',       pct: 40, color: '#43A047', value: 6 },
            { label: 'Within 7 days',   pct: 40, color: '#f59e0b', value: 6 },
          ]}
        />
      </div>

      {/* Row 3: 3 Pie charts */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <PieCard
          title="Learners on Target"
          slices={[
            { label: 'Behind',    pct: 20, color: '#ef4444', value: 3 },
            { label: 'On Target', pct: 40, color: '#43A047', value: 6 },
            { label: 'Ahead',     pct: 40, color: '#3b82f6', value: 6 },
          ]}
        />
        <PieCard
          title="Learners on Target (OTJ)"
          slices={[
            { label: 'Behind',    pct: 20, color: '#ef4444', value: 3 },
            { label: 'On Target', pct: 40, color: '#43A047', value: 6 },
            { label: 'Ahead',     pct: 40, color: '#3b82f6', value: 6 },
          ]}
        />
        <PieCard
          title="No Off-The-Job Activity"
          slices={[
            { label: 'Over 4 weeks',  pct: 20, color: '#ef4444' },
            { label: '3–4 weeks',     pct: 20, color: '#f59e0b' },
            { label: '2–3 weeks',     pct: 20, color: '#fbbf24' },
            { label: '1–2 weeks',     pct: 20, color: '#3b82f6' },
            { label: 'Learning break',pct: 20, color: '#d1d5db' },
          ]}
        />
      </div>

      {/* Row 4: Progress Reviews Pie + Tasks Due bars */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <PieCard
          title="Progress Review Due"
          slices={[
            { label: 'Overdue',        pct: 13, color: '#ef4444', value: 3  },
            { label: 'Due in 7 days',  pct: 27, color: '#f59e0b', value: 6  },
            { label: 'Due 7–13 days',  pct: 27, color: '#fbbf24', value: 6  },
            { label: 'Due 14–28 days', pct: 33, color: '#43A047', value: 12 },
          ]}
        />
        <TasksDueCard />
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
      {/* Section 1 — Learner's Activity (always visible) */}
      <LearnersActivitySection />

      {/* Section 2 — Trainer's Dashboard (accordion, collapsed by default) */}
      <Accordion title="Trainer's Dashboard">
        <TrainerDashboardContent />
      </Accordion>

      {/* Section 3 — Learner Dashboard (accordion, collapsed by default) */}
      <Accordion title="Learner Dashboard">
        <LearnerDashboardContent />
      </Accordion>

      {/* Section 4 — Forms & Templates (accordion, collapsed by default) */}
      <Accordion title="Forms & Templates">
        <FormsContent />
      </Accordion>
    </div>
  )
}

export default function TrainerDashboardPage() {
  return <Suspense><TrainerDashboardInner /></Suspense>
}
