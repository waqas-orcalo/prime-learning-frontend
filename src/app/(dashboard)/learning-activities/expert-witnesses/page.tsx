'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

/* ── SVG icons ── */
const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconPlus = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"><path d="M6 1v10M1 6h10" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

interface ExpertWitness {
  _id: string
  name: string
  company: string
  relationshipToLearner: string
  type: 'Expert Witness' | 'Witness'
  actionRequiredBy: string
}

const TH_STYLE: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left', ...font(13, 500, '#555'),
  borderBottom: '1px solid rgba(28,28,28,0.1)', background: '#fafafa',
  whiteSpace: 'nowrap'
}
const TD_STYLE: React.CSSProperties = {
  padding: '12px 16px', ...font(13), borderBottom: '1px solid rgba(28,28,28,0.07)'
}

/* ── mock data used when API not available ── */
const MOCK_DATA: ExpertWitness[] = [
  { _id: '1', name: 'Rakker Joe', company: 'Prime Collage', relationshipToLearner: 'Trainer', type: 'Expert Witness', actionRequiredBy: 'Trainer' },
  { _id: '2', name: 'Rakker Joe', company: 'Prime Collage', relationshipToLearner: 'Trainer', type: 'Expert Witness', actionRequiredBy: 'Trainer' },
  { _id: '3', name: 'Rakker Joe', company: 'Prime Collage', relationshipToLearner: 'Trainer', type: 'Expert Witness', actionRequiredBy: 'Trainer' },
  { _id: '4', name: 'Rakker Joe', company: 'Prime Collage', relationshipToLearner: 'Trainer', type: 'Expert Witness', actionRequiredBy: 'Trainer' },
  { _id: '5', name: 'Rakker Joe', company: 'Prime Collage', relationshipToLearner: 'Trainer', type: 'Expert Witness', actionRequiredBy: 'Trainer' },
]

function ExpertWitnessesInner() {
  const router = useRouter()
  const { data: session } = useSession()
  const [witnesses, setWitnesses] = useState<ExpertWitness[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = (session?.user as any)?.accessToken
    if (!token) return

    apiFetch<any>('/learning-activities/expert-witnesses/list', token)
      .then(resp => {
        const data = Array.isArray(resp?.data) ? resp.data : (resp?.data?.data ?? [])
        setWitnesses(data.length > 0 ? data : MOCK_DATA)
      })
      .catch(() => setWitnesses(MOCK_DATA))
      .finally(() => setLoading(false))
  }, [session])

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, ...FF }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, flexShrink: 0 }}
        >
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>Expert/ Witnesses</h1>
      </div>

      {/* Create button */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => router.push('/learning-activities/expert-witnesses/create')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8,
            padding: '9px 18px', cursor: 'pointer', ...font(13, 500, '#fff')
          }}
        >
          <img src={iconPlus} width={12} height={12} alt="" />
          Create New Witness +
        </button>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid rgba(28,28,28,0.15)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={TH_STYLE}>Expert/Witness Name</th>
              <th style={TH_STYLE}>Company</th>
              <th style={TH_STYLE}>Relationship to Learner</th>
              <th style={TH_STYLE}>Type</th>
              <th style={TH_STYLE}>Action Required By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ ...TD_STYLE, textAlign: 'center', color: '#888', padding: '32px 16px' }}>
                  Loading…
                </td>
              </tr>
            ) : witnesses.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...TD_STYLE, textAlign: 'center', color: '#888', padding: '32px 16px' }}>
                  No expert witnesses found. Click &ldquo;Create New Witness +&rdquo; to add one.
                </td>
              </tr>
            ) : (
              witnesses.map((w, i) => (
                <tr
                  key={w._id || i}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9f9f9')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={TD_STYLE}>{w.name}</td>
                  <td style={TD_STYLE}>{w.company}</td>
                  <td style={TD_STYLE}>{w.relationshipToLearner}</td>
                  <td style={TD_STYLE}>{w.type}</td>
                  <td style={TD_STYLE}>{w.actionRequiredBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <ExpertWitnessesInner />
    </Suspense>
  )
}
