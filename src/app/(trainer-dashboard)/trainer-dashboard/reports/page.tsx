'use client'

import { useRouter } from 'next/navigation'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const CHART_ICON = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"><rect x="3" y="12" width="4" height="9" rx="1" fill="#1c1c1c" opacity=".3"/><rect x="10" y="7" width="4" height="14" rx="1" fill="#1c1c1c" opacity=".5"/><rect x="17" y="3" width="4" height="18" rx="1" fill="#1c1c1c" opacity=".8"/></svg>`)

const BASE = '/trainer-dashboard'

const REPORT_CARDS = [
  [
    { label: 'Tasks Due',                      href: `${BASE}/tasks`,                              desc: 'View all tasks with upcoming due dates'           },
    { label: 'Learners on Target',             href: `${BASE}/reports/learners-on-target`,         desc: 'Learners meeting their programme targets'         },
    { label: 'Learners Last Logged In',        href: `${BASE}/reports/learners-last-logged-in`,    desc: 'Track learner login activity'                     },
    { label: 'Progress Reviews Due',           href: `${BASE}/reports/progress-reviews-due`,       desc: 'Upcoming progress review sessions'                },
  ],
  [
    { label: 'Due to Complete (90 days)',       href: `${BASE}/reports/due-to-complete`,            desc: 'Learners completing in the next 90 days'         },
    { label: 'Completed Visits (Last 30 Days)', href: `${BASE}/reports/completed-visits`,           desc: 'Visit records completed in the last month'       },
    { label: 'IQA Actions',                    href: `${BASE}/reports/iqa-actions`,                desc: 'Outstanding IQA actions and observations'        },
  ],
  [
    { label: 'Planned Visits (Next 30 Days)',   href: `${BASE}/reports/planned-visits`,             desc: 'Upcoming planned trainer visits'                 },
    { label: 'Learners On Target (OTJ)',        href: `${BASE}/reports/learners-on-target-otj`,     desc: 'Off-the-job training target progress'            },
    { label: 'No OTJ Activity',                href: `${BASE}/reports/no-otj-activity`,            desc: 'Learners with no recent off-the-job activity'    },
  ],
]

function ReportCard({ label, desc, href }: { label: string; desc: string; href: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(href)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: '20px', background: '#fff',
        border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12,
        cursor: 'pointer', textAlign: 'left',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(28,28,28,0.25)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(28,28,28,0.1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={CHART_ICON} width={24} height={24} alt="" />
        <span style={font(14, 600)}>{label}</span>
      </div>
      <p style={{ ...font(12, 400, '#888'), margin: 0 }}>{desc}</p>
    </button>
  )
}

export default function ReportsPage() {
  return (
    <div style={{ maxWidth: 1100, ...FF }}>
      <h1 style={{ ...font(22, 700), marginBottom: 8 }}>Reports</h1>
      <p style={{ ...font(13, 400, '#666'), marginBottom: 28 }}>View detailed insights across all your learners and programmes.</p>

      {REPORT_CARDS.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: 16, marginBottom: 16 }}>
          {row.map(card => <ReportCard key={card.href} label={card.label} desc={card.desc} href={card.href} />)}
        </div>
      ))}
    </div>
  )
}
