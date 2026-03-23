'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack  = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCal   = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><rect x="1" y="2" width="12" height="11" rx="1.5" stroke="#888" stroke-width="1.2"/><path d="M1 5.5h12M4.5 1v2M9.5 1v2" stroke="#888" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconCaret = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"><path d="M2 4.5l4 4 4-4" stroke="#1c1c1c" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconPlus  = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"><path d="M6 1v10M1 6h10" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`)
const iconFile  = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M4 2h6l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#1c1c1c" stroke-width="1.3"/><path d="M9 2v4h4" stroke="#1c1c1c" stroke-width="1.3" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '20px', ...extra } as React.CSSProperties)

const FORM_OPTIONS = ['Exit review and Programme Evaluation']
const TH: React.CSSProperties = { padding: '10px 14px', ...font(12, 500, '#555'), textAlign: 'left', borderBottom: '1px solid rgba(28,28,28,0.1)', background: '#fafafa', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '12px 14px', ...font(12), borderBottom: '1px solid rgba(28,28,28,0.07)', verticalAlign: 'middle' }

interface FormInstance { _id: string; formName: string; learnerName: string; instanceName: string; dateCreated: string; dateModified: string; signed: boolean }

const MOCK: FormInstance[] = [
  { _id: '1', formName: 'Learner feedback from teach sessions', learnerName: 'John Doe', instanceName: 'John doe - Exit review and Programme Evaluation - 11/02/2025', dateCreated: '07/02/25 08:15', dateModified: '08/02/25 18:15', signed: false },
  { _id: '2', formName: 'Learner feedback from teach sessions', learnerName: 'John Doe', instanceName: 'John doe - Exit review and Programme Evaluation - 11/02/2025', dateCreated: '07/02/25 08:15', dateModified: '08/02/25 18:15', signed: false },
  { _id: '3', formName: 'Learner feedback from teach sessions', learnerName: 'John Doe', instanceName: 'John doe - Exit review and Programme Evaluation - 11/02/2025', dateCreated: '07/02/25 08:15', dateModified: '08/02/25 18:15', signed: false },
  { _id: '4', formName: 'Learner feedback from teach sessions', learnerName: 'John Doe', instanceName: 'John doe - Exit review and Programme Evaluation - 11/02/2025', dateCreated: '07/02/25 08:15', dateModified: '08/02/25 18:15', signed: false },
]

function ExitReviewInner() {
  const router = useRouter()
  const { data: session } = useSession()
  const [instances, setInstances] = useState<FormInstance[]>([])
  const [loading, setLoading]     = useState(true)
  const [dateFrom, setDateFrom]   = useState('12/12/2025')
  const [dateTo, setDateTo]       = useState('18/12/2025')
  const [formFilter, setFormFilter] = useState(FORM_OPTIONS[0])
  const [dropOpen, setDropOpen]   = useState(false)

  useEffect(() => {
    const token = (session?.user as any)?.accessToken
    if (!token) return
    apiFetch<any>('/forms/exit-review', token)
      .then(r => { const d = r?.data?.data ?? r?.data ?? []; setInstances(Array.isArray(d) && d.length ? d : MOCK) })
      .catch(() => setInstances(MOCK))
      .finally(() => setLoading(false))
  }, [session])

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, ...FF }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>Exit review and Programme Evaluation</h1>
      </div>

      <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
          <span style={font(14, 600)}>Instances</span>
          <button onClick={() => router.push('/forms/exit-review/create')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', ...font(12, 500, '#fff') }}>
            <img src={iconPlus} width={12} height={12} alt="" />Create New Instances +
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderBottom: '1px solid rgba(28,28,28,0.06)', flexWrap: 'wrap' }}>
          {[{ label: 'Date From:', val: dateFrom, set: setDateFrom }, { label: 'Date To:', val: dateTo, set: setDateTo }].map(({ label, val, set }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={font(12, 500)}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid rgba(28,28,28,0.18)', borderRadius: 6, padding: '4px 8px', background: '#fff' }}>
                <input value={val} onChange={e => set(e.target.value)} style={{ border: 'none', outline: 'none', ...font(12), background: 'transparent', width: 90 }} />
                <img src={iconCal} width={14} height={14} alt="" />
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={font(12, 500)}>Form:</span>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', border: '1px solid rgba(28,28,28,0.18)', borderRadius: 6, background: '#fff', cursor: 'pointer', ...font(12) }}>
                {formFilter}<img src={iconCaret} width={12} height={12} alt="" />
              </button>
              {dropOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, marginTop: 4, background: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 280 }}>
                  {FORM_OPTIONS.map(o => <button key={o} onClick={() => { setFormFilter(o); setDropOpen(false) }} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', ...font(12, formFilter === o ? 600 : 400) }}>{o}</button>)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Form Name</th><th style={TH}>Learner Name</th><th style={TH}>Instance Name</th>
                <th style={TH}>Date Created</th><th style={TH}>Date Modified</th>
                <th style={{ ...TH, textAlign: 'center' }}>Signatures</th>
                <th style={{ ...TH, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ ...TD, textAlign: 'center', color: '#aaa', padding: '32px' }}>Loading…</td></tr>
              ) : instances.map((row, i) => (
                <tr key={row._id || i} onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td style={TD}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><img src={iconFile} width={14} height={14} alt="" />{row.formName}</span></td>
                  <td style={TD}>{row.learnerName}</td>
                  <td style={{ ...TD, maxWidth: 260 }}><span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{row.instanceName}</span></td>
                  <td style={TD}>{row.dateCreated}</td>
                  <td style={TD}>{row.dateModified}</td>
                  <td style={{ ...TD, textAlign: 'center' }}><input type="checkbox" checked={row.signed} onChange={() => {}} style={{ width: 14, height: 14 }} /></td>
                  <td style={{ ...TD, textAlign: 'center' }}>
                    <button onClick={() => router.push(`/forms/exit-review/${row._id}`)} style={{ padding: '5px 18px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', ...font(12, 500, '#fff') }}>Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function Page() { return <Suspense><ExitReviewInner /></Suspense> }
