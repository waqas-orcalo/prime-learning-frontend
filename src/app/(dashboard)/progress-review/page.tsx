'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBook = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#888" stroke-width="1.4"/><path d="M8 7h8M8 11h8M8 15h5" stroke="#888" stroke-width="1.3" stroke-linecap="round"/></svg>`)
const iconCaret = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"><path d="M2 4.5l4 4 4-4" stroke="#1c1c1c" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

// Fixed qualification units for Business Administration apprenticeship
const QUALIFICATION_UNITS = [
  { id: 'u1', name: 'Business Administrator Gateway to End Point' },
  { id: 'u2', name: '~ Business Administrator End Point Assessment' },
  { id: 'u3', name: 'Business Administrator Apprenticeship Standard' },
  { id: 'u4', name: 'NCFE Level 2 Functional Skills Qualification in English (September 2019)' },
  { id: 'u5', name: 'NCFE Level 2 Functional Skills Qualification in Math (September 2019)' },
]

interface Activity {
  _id: string
  title: string
  status: string
  method?: string
  activityDate?: string
}

interface UnitData {
  id: string
  name: string
  actual: number
  total: number
  progress: number
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ width: '100%', height: 7, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: '#818cf8', borderRadius: 4, transition: 'width 0.4s' }} />
    </div>
  )
}

function UnitCard({ unit, onClick }: { unit: UnitData; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#f9f9f9' : '#fff',
        border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12,
        padding: '16px', cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'background 0.15s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <img src={iconBook} width={24} height={24} alt="" style={{ flexShrink: 0, marginTop: 2 }} />
        <span style={{ ...font(13, 500), lineHeight: '20px' }}>{unit.name}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <p style={{ ...font(11, 400, '#888'), margin: '0 0 4px' }}>Completed / Total</p>
          <p style={{ ...font(16, 600), margin: 0 }}>{unit.actual} <span style={{ ...font(13, 400, '#aaa') }}>/ {unit.total}</span></p>
        </div>
        <div>
          <p style={{ ...font(11, 400, '#888'), margin: '0 0 6px' }}>Overall Progress</p>
          <ProgressBar value={unit.progress} />
          <p style={{ ...font(11, 700, '#6366f1'), margin: '4px 0 0', textAlign: 'right' }}>{unit.progress}%</p>
        </div>
      </div>
    </button>
  )
}

function ProgressReviewInner() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken

  const [includePending, setIncludePending] = useState(false)
  const [showDetailed, setShowDetailed] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(1)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])
  const [units, setUnits] = useState<UnitData[]>([])
  const [overallProgress, setOverallProgress] = useState(0)

  useEffect(() => {
    if (!token) { setLoading(false); return }

    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch all learning activities (high limit to get all)
        const resp = await apiFetch<any>('/learning-activities?limit=200&page=1', token)
        const acts: Activity[] = resp?.data?.data ?? resp?.data ?? []
        setActivities(acts)

        const total = acts.length
        const completed = acts.filter((a: Activity) => a.status === 'COMPLETED').length
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0
        setOverallProgress(pct)

        // Since activities are not linked to specific units in the DB,
        // each unit card shows the overall completion stats
        setUnits(QUALIFICATION_UNITS.map((u) => ({
          ...u,
          actual: completed,
          total,
          progress: pct,
        })))
      } catch (err) {
        console.error('Failed to fetch progress data:', err)
        // Fallback to static structure with 0 progress
        setUnits(QUALIFICATION_UNITS.map(u => ({ ...u, actual: 0, total: 0, progress: 0 })))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, includePending])

  const displayUnits = units.length > 0 ? units : QUALIFICATION_UNITS.map(u => ({ ...u, actual: 0, total: 0, progress: 0 }))

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1060, ...FF }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={font(15, 500)}>Over all Progress:</span>
          {loading ? (
            <span style={{ padding: '3px 10px', borderRadius: 12, background: '#f3f4f6', ...font(13, 400, '#888') }}>
              Loading...
            </span>
          ) : (
            <span style={{ padding: '3px 10px', borderRadius: 12, background: '#dcfce7', ...font(13, 700, '#16a34a') }}>
              {overallProgress}%
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={includePending} onChange={e => setIncludePending(e.target.checked)} style={{ width: 13, height: 13 }} />
            <span style={font(12)}>Include pending learning activities</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={showDetailed} onChange={e => setShowDetailed(e.target.checked)} style={{ width: 13, height: 13 }} />
            <span style={font(12)}>Show detailed view</span>
          </label>
        </div>
      </div>

      {/* Summary stats row */}
      {!loading && activities.length > 0 && (
        <div style={{
          display: 'flex', gap: 16, marginBottom: 20,
          padding: '12px 16px', background: '#f8f9fa', borderRadius: 10,
          border: '1px solid rgba(28,28,28,0.08)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={font(11, 400, '#888')}>Total Activities</span>
            <span style={font(18, 700)}>{activities.length}</span>
          </div>
          <div style={{ width: 1, background: 'rgba(28,28,28,0.1)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={font(11, 400, '#888')}>Completed</span>
            <span style={font(18, 700, '#16a34a')}>{activities.filter(a => a.status === 'COMPLETED').length}</span>
          </div>
          <div style={{ width: 1, background: 'rgba(28,28,28,0.1)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={font(11, 400, '#888')}>In Progress</span>
            <span style={font(18, 700, '#f59e0b')}>{activities.filter(a => a.status === 'IN_PROGRESS').length}</span>
          </div>
          <div style={{ width: 1, background: 'rgba(28,28,28,0.1)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={font(11, 400, '#888')}>Pending</span>
            <span style={font(18, 700, '#6366f1')}>{activities.filter(a => a.status === 'PENDING').length}</span>
          </div>
        </div>
      )}

      {/* Unit selector bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px',
        background: '#f8f9fa', borderRadius: 10, marginBottom: 20,
        border: '1px solid rgba(28,28,28,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={font(13, 500)}>Unit: {selectedUnit}</span>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedUnit}
              onChange={e => setSelectedUnit(Number(e.target.value))}
              style={{ padding: '3px 24px 3px 8px', border: '1px solid rgba(28,28,28,0.2)', borderRadius: 6, ...font(12), background: '#fff', appearance: 'none', cursor: 'pointer' }}
            >
              {displayUnits.map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
            </select>
            <img src={iconCaret} width={10} height={10} alt="" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
        <button
          onClick={() => router.push(`/progress-review/${displayUnits[selectedUnit - 1]?.id ?? 'u1'}`)}
          style={{ ...font(12, 500, '#6366f1'), background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          View more
        </button>
      </div>

      {/* Unit cards grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', ...font(14, 400, '#888') }}>
          Loading progress data...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {displayUnits.map(unit => (
            <UnitCard key={unit.id} unit={unit} onClick={() => router.push(`/progress-review/${unit.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <Suspense><ProgressReviewInner /></Suspense>
}
// progress-timestamp: 1774401037
