'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCaretDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconPlus = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M8 3v10M3 8h10" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`)
const iconCheck = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M3 8l4 4 6-7" stroke="#22c55e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconEdit = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><path d="M10 2l2 2-7 7H3v-2l7-7z" stroke="#1c1c1c" stroke-width="1.2" stroke-linejoin="round"/></svg>`)
const iconTrash = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><path d="M2 4h10M5 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M5 4v7a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4" stroke="#ef4444" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconSignature = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><path d="M6 22c2-4 4-8 6-8s3 6 5 6 3-4 5-4 2 1 3 2" stroke="#9291A5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const VISIT_TYPES = ['Observation', 'Progress Review', 'Employer Visit', 'Initial Assessment', 'EPA Readiness', 'Remote Visit']
const TRANSPORT_MODES = ['Car', 'Public Transport', 'Walking', 'Cycling', 'Remote / No Travel']

interface Visit {
  id: string
  visitType: string
  visitDate: string
  durationMinutes: number
  travelTimeMinutes: number
  transportMode: string
  startLocation: string
  endLocation: string
  notes: string
  learnerSigned: boolean
  learnerSignedAt: string
  trainerSigned: boolean
  trainerSignedAt: string
  createdAt: string
}

const SEED_VISITS: Visit[] = [
  {
    id: '1', visitType: 'Observation', visitDate: '2025-01-20', durationMinutes: 90,
    travelTimeMinutes: 30, transportMode: 'Car', startLocation: 'Prime Learning Office', endLocation: 'Learner Workplace',
    notes: 'Observed the learner completing design tasks. Good progress noted on UI fundamentals.',
    learnerSigned: true, learnerSignedAt: '20/01/2025 14:30',
    trainerSigned: true, trainerSignedAt: '20/01/2025 15:00',
    createdAt: '20/01/2025',
  },
]

interface FormState {
  visitType: string
  visitDate: string
  durationMinutes: string
  travelTimeMinutes: string
  transportMode: string
  startLocation: string
  endLocation: string
  notes: string
}
interface FormErrors {
  visitType?: string
  visitDate?: string
  durationMinutes?: string
}

const EMPTY_FORM: FormState = {
  visitType: 'Observation', visitDate: '', durationMinutes: '60',
  travelTimeMinutes: '0', transportMode: 'Car',
  startLocation: '', endLocation: '', notes: '',
}

function VisitTypeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{ border: '1px solid rgba(28,28,28,0.15)', borderRadius: '8px', padding: '9px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(28,28,28,0.02)' }}
      >
        <span style={font(14)}>{value}</span>
        <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 60, overflow: 'hidden' }}>
          {VISIT_TYPES.map(t => (
            <div key={t} onClick={() => { onChange(t); setOpen(false) }}
              style={{ padding: '10px 14px', cursor: 'pointer', ...font(13, value === t ? 600 : 400), backgroundColor: value === t ? 'rgba(28,28,28,0.05)' : '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = value === t ? 'rgba(28,28,28,0.05)' : '#fff')}
            >{t}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function TransportSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{ border: '1px solid rgba(28,28,28,0.15)', borderRadius: '8px', padding: '9px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(28,28,28,0.02)' }}
      >
        <span style={font(14)}>{value}</span>
        <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 60, overflow: 'hidden' }}>
          {TRANSPORT_MODES.map(m => (
            <div key={m} onClick={() => { onChange(m); setOpen(false) }}
              style={{ padding: '10px 14px', cursor: 'pointer', ...font(13, value === m ? 600 : 400), backgroundColor: value === m ? 'rgba(28,28,28,0.05)' : '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = value === m ? 'rgba(28,28,28,0.05)' : '#fff')}
            >{m}</div>
          ))}
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '8px',
  padding: '9px 12px', outline: 'none', backgroundColor: 'rgba(28,28,28,0.02)',
  fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#1c1c1c',
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: '12px',
  boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden', marginBottom: '16px',
}
const cardHeader = (title: string) => (
  <div style={{ backgroundColor: 'rgba(28,28,28,0.03)', padding: '12px 16px', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
    <span style={font(15, 700)}>{title}</span>
  </div>
)

function SignatureBox({ label, signed, signedAt, onSign, onClear }: {
  label: string
  signed: boolean
  signedAt: string
  onSign: () => void
  onClear: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [hasStrokes, setHasStrokes] = useState(false)

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (signed) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setDrawing(true)
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || signed) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = '#1c1c1c'
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'
    ctx.stroke()
    setHasStrokes(true)
  }

  const endDraw = () => setDrawing(false)

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
    onClear()
  }

  return (
    <div>
      <label style={{ ...font(13, 600), display: 'block', marginBottom: '8px' }}>{label}</label>
      <div style={{ border: `2px dashed ${signed ? '#22c55e' : 'rgba(28,28,28,0.2)'}`, borderRadius: '8px', overflow: 'hidden', position: 'relative', backgroundColor: signed ? 'rgba(34,197,94,0.04)' : '#fafafa' }}>
        {signed ? (
          <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}>
            <img src={iconCheck} alt="" style={{ width: '28px', height: '28px' }} />
            <span style={font(12, 600, '#22c55e')}>Signed</span>
            <span style={font(11, 400, 'rgba(28,28,28,0.5)')}>{signedAt}</span>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              width={400}
              height={100}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              style={{ width: '100%', height: '100px', cursor: 'crosshair', display: 'block' }}
            />
            {!hasStrokes && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <img src={iconSignature} alt="" style={{ width: '32px', height: '32px', opacity: 0.3 }} />
                <span style={{ ...font(12, 400, 'rgba(28,28,28,0.35)'), marginLeft: '8px' }}>Draw signature here</span>
              </div>
            )}
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        {!signed && (
          <button
            onClick={onSign}
            disabled={!hasStrokes}
            style={{ backgroundColor: hasStrokes ? '#1c1c1c' : 'rgba(28,28,28,0.25)', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: hasStrokes ? 'pointer' : 'default', ...font(12, 600, '#fff') }}
          >
            Confirm Signature
          </button>
        )}
        {(hasStrokes || signed) && (
          <button
            onClick={handleClear}
            style={{ backgroundColor: 'transparent', border: '1px solid rgba(28,28,28,0.2)', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', ...font(12, 400, '#ef4444') }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

export default function VisitPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken
  const [visits, setVisits] = useState<Visit[]>(SEED_VISITS)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<FormErrors>({})
  const [saved, setSaved] = useState(false)

  // Signature state per-form
  const [learnerSigned, setLearnerSigned] = useState(false)
  const [learnerSignedAt, setLearnerSignedAt] = useState('')
  const [trainerSigned, setTrainerSigned] = useState(false)
  const [trainerSignedAt, setTrainerSignedAt] = useState('')

  const [activityTitle, setActivityTitle] = useState('Learning Activity')
  const [activityId, setActivityId] = useState('')
  const [trainerName, setTrainerName] = useState('Josseme')
  const [learnerName, setLearnerName] = useState('John Doe')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentActivity')
      if (stored) {
        const act = JSON.parse(stored)
        setActivityTitle(act.title || 'Learning Activity')
        setActivityId(act.id || '')
      }
    }
  }, [])

  // Load visits from API
  useEffect(() => {
    const loadVisits = async () => {
      try {
        if (!token) return
        const response = await apiFetch<any>('/learning-activities/visit?limit=100', token)
        const loaded = (response.data.data || []).map((v: any) => ({
          id: v._id,
          visitType: formatVisitType(v.visitType),
          visitDate: v.visitDate,
          durationMinutes: v.durationMinutes,
          travelTimeMinutes: v.travelTimeMinutes,
          transportMode: formatTransport(v.transportMode),
          startLocation: v.startLocation || '',
          endLocation: v.endLocation || '',
          notes: v.notes || '',
          learnerSigned: v.learnerSigned || false,
          learnerSignedAt: v.learnerSignedAt || '',
          trainerSigned: v.trainerSigned || false,
          trainerSignedAt: v.trainerSignedAt || '',
          createdAt: v.createdAt || '',
        }))
        if (loaded.length > 0) setVisits(loaded)
      } catch (err) {
        console.error('Failed to load visits:', err)
      }
    }
    loadVisits()
  }, [token])

  function formatVisitType(type: string): string {
    const map: Record<string, string> = {
      'OBSERVATION': 'Observation',
      'PROGRESS_REVIEW': 'Progress Review',
      'EMPLOYER_VISIT': 'Employer Visit',
      'INITIAL_ASSESSMENT': 'Initial Assessment',
      'EPA_READINESS': 'EPA Readiness',
      'REMOTE_VISIT': 'Remote Visit',
    }
    return map[type] || type
  }

  function formatTransport(mode: string): string {
    const map: Record<string, string> = {
      'CAR': 'Car',
      'PUBLIC_TRANSPORT': 'Public Transport',
      'WALKING': 'Walking',
      'CYCLING': 'Cycling',
      'REMOTE': 'Remote / No Travel',
    }
    return map[mode] || mode
  }

  function mapVisitTypeToEnum(type: string): string {
    const map: Record<string, string> = {
      'Observation': 'OBSERVATION',
      'Progress Review': 'PROGRESS_REVIEW',
      'Employer Visit': 'EMPLOYER_VISIT',
      'Initial Assessment': 'INITIAL_ASSESSMENT',
      'EPA Readiness': 'EPA_READINESS',
      'Remote Visit': 'REMOTE_VISIT',
    }
    return map[type] || type
  }

  function mapTransportToEnum(mode: string): string {
    const map: Record<string, string> = {
      'Car': 'CAR',
      'Public Transport': 'PUBLIC_TRANSPORT',
      'Walking': 'WALKING',
      'Cycling': 'CYCLING',
      'Remote / No Travel': 'REMOTE',
    }
    return map[mode] || mode
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.visitType) e.visitType = 'Required'
    if (!form.visitDate) e.visitDate = 'Required'
    if (!form.durationMinutes || isNaN(Number(form.durationMinutes)) || Number(form.durationMinutes) <= 0) e.durationMinutes = 'Enter valid duration'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    const now = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    try {
      if (editingId) {
        if (token && activityId) {
          await apiFetch<any>(
            `/learning-activities/visit/${editingId}`,
            token,
            {
              method: 'PATCH',
              body: JSON.stringify({
                visitType: mapVisitTypeToEnum(form.visitType),
                visitDate: form.visitDate,
                durationMinutes: Number(form.durationMinutes),
                travelTimeMinutes: Number(form.travelTimeMinutes),
                transportMode: mapTransportToEnum(form.transportMode),
                startLocation: form.startLocation,
                endLocation: form.endLocation,
                notes: form.notes,
              }),
            }
          )
        }
        setVisits(prev => prev.map(v =>
          v.id === editingId
            ? { ...v, visitType: form.visitType, visitDate: form.visitDate, durationMinutes: Number(form.durationMinutes), travelTimeMinutes: Number(form.travelTimeMinutes), transportMode: form.transportMode, startLocation: form.startLocation, endLocation: form.endLocation, notes: form.notes, learnerSigned, learnerSignedAt, trainerSigned, trainerSignedAt }
            : v
        ))
      } else {
        let newId = String(Date.now())
        if (token && activityId) {
          const response = await apiFetch<any>(
            '/learning-activities/visit',
            token,
            {
              method: 'POST',
              body: JSON.stringify({
                learningActivityId: activityId,
                visitType: mapVisitTypeToEnum(form.visitType),
                visitDate: form.visitDate,
                durationMinutes: Number(form.durationMinutes),
                travelTimeMinutes: Number(form.travelTimeMinutes),
                transportMode: mapTransportToEnum(form.transportMode),
                startLocation: form.startLocation,
                endLocation: form.endLocation,
                notes: form.notes,
              }),
            }
          )
          newId = response.data._id
        }
        const newVisit: Visit = {
          id: newId,
          visitType: form.visitType,
          visitDate: form.visitDate,
          durationMinutes: Number(form.durationMinutes),
          travelTimeMinutes: Number(form.travelTimeMinutes),
          transportMode: form.transportMode,
          startLocation: form.startLocation,
          endLocation: form.endLocation,
          notes: form.notes,
          learnerSigned,
          learnerSignedAt,
          trainerSigned,
          trainerSignedAt,
          createdAt: now,
        }
        setVisits(prev => [newVisit, ...prev])
      }
    } catch (err) {
      console.error('Failed to save visit:', err)
    }
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setShowForm(false)
      setEditingId(null)
      resetForm()
    }, 1200)
  }

  const resetForm = () => {
    setForm({ ...EMPTY_FORM })
    setErrors({})
    setLearnerSigned(false)
    setLearnerSignedAt('')
    setTrainerSigned(false)
    setTrainerSignedAt('')
  }

  const openEdit = (visit: Visit) => {
    setForm({
      visitType: visit.visitType,
      visitDate: visit.visitDate,
      durationMinutes: String(visit.durationMinutes),
      travelTimeMinutes: String(visit.travelTimeMinutes),
      transportMode: visit.transportMode,
      startLocation: visit.startLocation,
      endLocation: visit.endLocation,
      notes: visit.notes,
    })
    setLearnerSigned(visit.learnerSigned)
    setLearnerSignedAt(visit.learnerSignedAt)
    setTrainerSigned(visit.trainerSigned)
    setTrainerSignedAt(visit.trainerSignedAt)
    setEditingId(visit.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      if (token) {
        await apiFetch<any>(
          `/learning-activities/visit/${id}`,
          token,
          { method: 'DELETE' }
        )
      }
      setVisits(prev => prev.filter(v => v.id !== id))
    } catch (err) {
      console.error('Failed to delete visit:', err)
    }
  }

  const handleSign = async (who: 'learner' | 'trainer') => {
    const now = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    try {
      if (token && editingId) {
        await apiFetch<any>(
          `/learning-activities/visit/${editingId}/signature`,
          token,
          {
            method: 'PATCH',
            body: JSON.stringify({ type: who, signature: 'signed' }),
          }
        )
      }
      if (who === 'learner') { setLearnerSigned(true); setLearnerSignedAt(now) }
      else { setTrainerSigned(true); setTrainerSignedAt(now) }
    } catch (err) {
      console.error('Failed to save signature:', err)
    }
  }

  const fmtDate = (iso: string) => {
    if (!iso) return '—'
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src={iconBack} alt="Back" style={{ width: '32px', height: '32px' }} />
          </button>
          <div>
            <h1 style={{ ...font(22, 700), margin: 0 }}>Visits</h1>
            <span style={{ ...font(13, 400, 'rgba(28,28,28,0.5)') }}>{activityTitle}</span>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setEditingId(null); setShowForm(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}
          >
            <img src={iconPlus} alt="" style={{ width: '14px', height: '14px' }} />
            <span style={font(14, 600, '#fff')}>Record Visit</span>
          </button>
        )}
      </div>

      {/* Visit Form */}
      {showForm && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Visit Details */}
            <div style={cardStyle}>
              {cardHeader('Visit Details')}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ ...font(13, 600), display: 'block', marginBottom: '5px' }}>Visit Type *</label>
                  <VisitTypeSelect value={form.visitType} onChange={v => set('visitType', v)} />
                  {errors.visitType && <p style={{ ...font(11, 400, '#ef4444'), margin: '3px 0 0' }}>{errors.visitType}</p>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ ...font(13, 600), display: 'block', marginBottom: '5px' }}>Visit Date *</label>
                    <input type="date" value={form.visitDate} onChange={e => set('visitDate', e.target.value)} style={{ ...inputStyle, border: `1px solid ${errors.visitDate ? '#ef4444' : 'rgba(28,28,28,0.15)'}` }} />
                    {errors.visitDate && <p style={{ ...font(11, 400, '#ef4444'), margin: '3px 0 0' }}>{errors.visitDate}</p>}
                  </div>
                  <div>
                    <label style={{ ...font(13, 600), display: 'block', marginBottom: '5px' }}>Duration (minutes) *</label>
                    <input
                      type="number" min="1" value={form.durationMinutes} onChange={e => set('durationMinutes', e.target.value)}
                      style={{ ...inputStyle, border: `1px solid ${errors.durationMinutes ? '#ef4444' : 'rgba(28,28,28,0.15)'}` }}
                    />
                    {errors.durationMinutes && <p style={{ ...font(11, 400, '#ef4444'), margin: '3px 0 0' }}>{errors.durationMinutes}</p>}
                  </div>
                </div>
                <div>
                  <label style={{ ...font(13, 600), display: 'block', marginBottom: '5px' }}>Trainer / Assessor</label>
                  <input value={trainerName} readOnly style={{ ...inputStyle, backgroundColor: 'rgba(28,28,28,0.05)', cursor: 'default' }} />
                </div>
                <div>
                  <label style={{ ...font(13, 600), display: 'block', marginBottom: '5px' }}>Learner</label>
                  <input value={learnerName} readOnly style={{ ...inputStyle, backgroundColor: 'rgba(28,28,28,0.05)', cursor: 'default' }} />
                </div>
              </div>
            </div>

            {/* Right column */}
            <div>
              {/* Travel */}
              <div style={cardStyle}>
                {cardHeader('Travel Time')}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ ...font(13, 600), display: 'block', marginBottom: '5px' }}>Travel Time (minutes)</label>
                      <input type="number" min="0" value={form.travelTimeMinutes} onChange={e => set('travelTimeMinutes', e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ ...font(13, 600), display: 'block', marginBottom: '5px' }}>Mode of Transport</label>
                      <TransportSelect value={form.transportMode} onChange={v => set('transportMode', v)} />
                    </div>
                  </div>
                  <div>
                    <label style={{ ...font(13, 600), display: 'block', marginBottom: '5px' }}>Start Location</label>
                    <input value={form.startLocation} onChange={e => set('startLocation', e.target.value)} placeholder="e.g. Prime Learning Office" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ ...font(13, 600), display: 'block', marginBottom: '5px' }}>End Location</label>
                    <input value={form.endLocation} onChange={e => set('endLocation', e.target.value)} placeholder="e.g. Learner Workplace" style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={cardStyle}>
                {cardHeader('Visit Notes')}
                <div style={{ padding: '20px' }}>
                  <textarea
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    placeholder="Add any notes about this visit..."
                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', lineHeight: '1.5' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div style={cardStyle}>
            {cardHeader('Signatures')}
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <SignatureBox
                label={`Learner Signature — ${learnerName}`}
                signed={learnerSigned}
                signedAt={learnerSignedAt}
                onSign={() => handleSign('learner')}
                onClear={() => { setLearnerSigned(false); setLearnerSignedAt('') }}
              />
              <SignatureBox
                label={`Trainer Signature — ${trainerName}`}
                signed={trainerSigned}
                signedAt={trainerSignedAt}
                onSign={() => handleSign('trainer')}
                onClear={() => { setTrainerSigned(false); setTrainerSignedAt('') }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '24px' }}>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); resetForm() }}
              style={{ background: 'none', border: '1px solid rgba(28,28,28,0.2)', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', ...font(14, 500) }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{ backgroundColor: saved ? '#22c55e' : '#1c1c1c', border: 'none', borderRadius: '8px', padding: '9px 24px', cursor: 'pointer', ...font(14, 600, '#fff'), display: 'flex', alignItems: 'center', gap: '6px', transition: 'background-color 0.3s' }}
            >
              {saved && <img src={iconCheck} alt="" style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} />}
              {saved ? 'Saved!' : editingId ? 'Update Visit' : 'Save Visit'}
            </button>
          </div>
        </>
      )}

      {/* Visits List */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.03)', padding: '12px 20px', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
          <span style={font(15, 700)}>Visit Records</span>
          <span style={{ ...font(13, 400, 'rgba(28,28,28,0.5)'), marginLeft: '10px' }}>{visits.length} record{visits.length !== 1 ? 's' : ''}</span>
        </div>

        {visits.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>No visits recorded yet.</div>
        ) : (
          <div style={{ padding: '0 20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                  {['Visit Type', 'Date', 'Duration', 'Travel Time', 'Transport', 'Notes', 'Signatures', 'Actions'].map((h, i) => (
                    <th key={h} style={{ ...font(12, 500, 'rgba(28,28,28,0.5)'), padding: '12px 8px', textAlign: i === 7 ? 'right' : 'left', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visits.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
                    <td style={{ ...font(13, 500), padding: '13px 8px', whiteSpace: 'nowrap' }}>{v.visitType}</td>
                    <td style={{ ...font(13), padding: '13px 8px', whiteSpace: 'nowrap' }}>{fmtDate(v.visitDate)}</td>
                    <td style={{ ...font(13), padding: '13px 8px', whiteSpace: 'nowrap' }}>{v.durationMinutes} min</td>
                    <td style={{ ...font(13), padding: '13px 8px', whiteSpace: 'nowrap' }}>{v.travelTimeMinutes} min</td>
                    <td style={{ ...font(13), padding: '13px 8px' }}>{v.transportMode}</td>
                    <td style={{ ...font(12, 400, 'rgba(28,28,28,0.7)'), padding: '13px 8px', maxWidth: '200px' }}>
                      {v.notes ? (v.notes.length > 60 ? v.notes.slice(0, 60) + '…' : v.notes) : <span style={{ opacity: 0.4 }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 8px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '12px', backgroundColor: v.learnerSigned ? 'rgba(34,197,94,0.12)' : 'rgba(28,28,28,0.06)', ...font(11, 500, v.learnerSigned ? '#16a34a' : 'rgba(28,28,28,0.5)') }}>
                          L {v.learnerSigned ? '✓' : '—'}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '12px', backgroundColor: v.trainerSigned ? 'rgba(34,197,94,0.12)' : 'rgba(28,28,28,0.06)', ...font(11, 500, v.trainerSigned ? '#16a34a' : 'rgba(28,28,28,0.5)') }}>
                          T {v.trainerSigned ? '✓' : '—'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 8px' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEdit(v)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(28,28,28,0.06)', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', ...font(12, 500) }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.1)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.06)')}
                        >
                          <img src={iconEdit} alt="" style={{ width: '13px', height: '13px' }} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fef2f2', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', ...font(12, 500, '#ef4444') }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                        >
                          <img src={iconTrash} alt="" style={{ width: '13px', height: '13px' }} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
