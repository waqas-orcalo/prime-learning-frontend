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
  progress: number
  category?: string
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 24, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: '#818cf8', borderRadius: 6, transition: 'width 0.4s' }} />
      <span style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...font(12, 700, '#fff'),
      }}>
        {value}%
      </span>
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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={iconBook} width={20} height={20} alt="" />
        </div>
        <span style={{ ...font(13, 600), lineHeight: '20px' }}>{unit.name}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, alignItems: 'end' }}>
        <div>
          <p style={{ ...font(11, 400, '#888'), margin: '0 0 4px' }}>Actual:</p>
          <p style={{ ...font(22, 700), margin: 0 }}>{unit.progress}%</p>
        </div>
        <div>
          <p style={{ ...font(11, 400, '#888'), margin: '0 0 6px' }}>Unit Progress</p>
          <ProgressBar value={unit.progress} />
        </div>
      </div>
    </button>
  )
}

function ProgressReviewInner() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const token = (session?.user as any)?.accessToken

  const [includePending, setIncludePending] = useState(false)
  const [showDetailed, setShowDetailed] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(1)
  const [loading, setLoading] = useState(true)
  const [units, setUnits] = useState<UnitData[]>([])
  const [overallProgress, setOverallProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!token) { setLoading(false); return }

    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch both in parallel
        const [actResp, courseResp] = await Promise.all([
          apiFetch<any>('/learning-activities?limit=200&page=1', token),
          apiFetch<any>('/courses?limit=20&page=1', token),
        ])

        if (cancelled) return

        // Parse activities
        const rawActs = actResp?.data
        const acts: Activity[] = Array.isArray(rawActs) ? rawActs : (rawActs?.data ?? [])

        // Parse courses — each becomes one unit card
        const rawCourses = courseResp?.data
        const courseList: Array<{ _id: string; title: string; category?: string }> =
          Array.isArray(rawCourses) ? rawCourses : (rawCourses?.data ?? [])

        // Calculate overall progress from activities
        const total = acts.length
        const completedActs = acts.filter((a: Activity) => a.status === 'COMPLETED')
        const pendingActs = acts.filter((a: Activity) => a.status === 'PENDING')
        const countForProgress = includePending ? total : (total - pendingActs.length)
        const pct = countForProgress > 0 ? Math.round((completedActs.length / countForProgress) * 100) : 0
        setOverallProgress(pct)

        // Map each course to a unit card; use index-based slug (u1, u2…) for routing
        setUnits(courseList.map((c, i) => ({
          id: `u${i + 1}`,
          name: c.title,
          category: c.category,
          progress: pct,
        })))
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to fetch progress data:', err)
          setError('Could not load progress data.')
        }
        if (!cancelled) setUnits([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [token, includePending, status])

  const displayUnits = units

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

      {/* Error banner */}
      {error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, marginBottom: 16, ...font(13, 400, '#dc2626') }}>
          {error}
        </div>
      )}

      {/* Unit cards grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px', ...font(14, 400, '#888') }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
            <circle cx="12" cy="12" r="10" stroke="#d1d5db" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          Loading progress data...
        </div>
      ) : (
        <div className="l-grid-3">
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
// progress-timestamp: 1774401038
