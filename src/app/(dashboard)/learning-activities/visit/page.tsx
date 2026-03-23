'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

/* ── SVG helpers ── */
const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCalendar = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="#1c1c1c" stroke-width="1.2"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconCaretDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconPlus = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><path d="M7 2v10M2 7h10" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`)
const iconClose = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="14.5" stroke="#1c1c1c" stroke-width="1.5"/><path d="M11 11l10 10M21 11l-10 10" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

/* ── Visit type maps ── */
const VISIT_TYPE_LABELS: Record<string, string> = {
  OBSERVATION: 'Observation',
  PROGRESS_REVIEW: 'Progress Review',
  EMPLOYER_VISIT: 'Employer Visit',
  INITIAL_ASSESSMENT: 'Initial Assessment',
  EPA_READINESS: 'EPA Readiness',
  REMOTE_VISIT: 'Remote Visit',
}
const VISIT_TYPE_OPTIONS = ['All Visit Types', ...Object.values(VISIT_TYPE_LABELS)]
const VISIT_TYPE_ENUM_OPTIONS = Object.entries(VISIT_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))
const TRANSPORT_MODE_OPTIONS = [
  { value: 'CAR', label: 'Car' },
  { value: 'PUBLIC_TRANSPORT', label: 'Public Transport' },
  { value: 'WALKING', label: 'Walking' },
  { value: 'CYCLING', label: 'Cycling' },
  { value: 'REMOTE', label: 'Remote / No Travel' },
]

function mapVisitType(val: string): string {
  return VISIT_TYPE_LABELS[val] || val.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

function toDateStr(val: string | undefined): string {
  if (!val) return ''
  return val.substring(0, 10)
}

function fmtDateTime(isoDate: string, durationMinutes = 0): string {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  const pad = (n: number) => String(n).padStart(2, '0')
  const startH = pad(d.getHours()), startM = pad(d.getMinutes())
  const end = new Date(d.getTime() + durationMinutes * 60 * 1000)
  const endH = pad(end.getHours()), endM = pad(end.getMinutes())
  const day = pad(d.getDate()), mon = pad(d.getMonth() + 1), yr = d.getFullYear()
  return `${day}/${mon}/${yr} ${startH}:${startM} - ${endH}:${endM}`
}

function fmtDate(iso: string) {
  if (!iso) return '—'
  const [y, m, d] = iso.substring(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function getLocation(v: any): string {
  if (v.transportMode === 'REMOTE' || v.visitType === 'REMOTE_VISIT') return 'Remote'
  return v.endLocation || v.startLocation || 'On-site'
}

/* ── interfaces ── */
interface VisitEntry {
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
  trainerSigned: boolean
}

interface ScheduleForm {
  visitType: string
  visitDate: string
  durationMinutes: string
  travelTimeMinutes: string
  transportMode: string
  startLocation: string
  endLocation: string
  notes: string
}

const EMPTY_FORM: ScheduleForm = {
  visitType: '',
  visitDate: '',
  durationMinutes: '',
  travelTimeMinutes: '',
  transportMode: '',
  startLocation: '',
  endLocation: '',
  notes: '',
}

/* ── Schedule Appointment Modal ── */
function ScheduleModal({ onSave, onClose, saving }: {
  onSave: (form: ScheduleForm) => void
  onClose: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<ScheduleForm>({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<Partial<Record<keyof ScheduleForm, string>>>({})
  const [typeOpen, setTypeOpen] = useState(false)
  const [transportOpen, setTransportOpen] = useState(false)

  const set = <K extends keyof ScheduleForm>(k: K, v: ScheduleForm[K]) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  const validate = () => {
    const e: Partial<Record<keyof ScheduleForm, string>> = {}
    if (!form.visitType) e.visitType = 'Required'
    if (!form.visitDate) e.visitDate = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const labelInput = (label: string, key: keyof ScheduleForm, type = 'text', placeholder = '') => (
    <div>
      <label style={{ ...font(12, 500, 'rgba(28,28,28,0.6)'), display: 'block', marginBottom: '5px' }}>{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${errors[key] ? '#ef4444' : 'rgba(28,28,28,0.15)'}`, borderRadius: '8px', padding: '9px 12px', ...font(13, 400, '#1c1c1c'), outline: 'none', backgroundColor: 'rgba(28,28,28,0.02)' }}
      />
      {errors[key] && <p style={{ ...font(11, 400, '#ef4444'), margin: '3px 0 0' }}>{errors[key]}</p>}
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '540px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(28,28,28,0.08)', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
          <span style={font(17, 700)}>Schedule an Appointment</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src={iconClose} alt="Close" style={{ width: '28px', height: '28px' }} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Visit Type */}
          <div>
            <label style={{ ...font(12, 500, 'rgba(28,28,28,0.6)'), display: 'block', marginBottom: '5px' }}>Visit Type *</label>
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setTypeOpen(v => !v)}
                style={{ border: `1px solid ${errors.visitType ? '#ef4444' : 'rgba(28,28,28,0.15)'}`, borderRadius: '8px', padding: '9px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(28,28,28,0.02)' }}
              >
                <span style={font(14, 400, form.visitType ? '#1c1c1c' : 'rgba(28,28,28,0.4)')}>
                  {form.visitType ? mapVisitType(form.visitType) : 'Select visit type'}
                </span>
                <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
              </div>
              {typeOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 60, overflow: 'hidden' }}>
                  {VISIT_TYPE_ENUM_OPTIONS.map(opt => (
                    <div key={opt.value} onClick={() => { set('visitType', opt.value); setTypeOpen(false) }}
                      style={{ padding: '10px 14px', cursor: 'pointer', ...font(13, form.visitType === opt.value ? 600 : 400), backgroundColor: form.visitType === opt.value ? 'rgba(28,28,28,0.05)' : '#fff' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = form.visitType === opt.value ? 'rgba(28,28,28,0.05)' : '#fff')}
                    >{opt.label}</div>
                  ))}
                </div>
              )}
            </div>
            {errors.visitType && <p style={{ ...font(11, 400, '#ef4444'), margin: '3px 0 0' }}>{errors.visitType}</p>}
          </div>

          {/* Date + Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ ...font(12, 500, 'rgba(28,28,28,0.6)'), display: 'block', marginBottom: '5px' }}>Visit Date *</label>
              <div style={{ border: `1px solid ${errors.visitDate ? '#ef4444' : 'rgba(28,28,28,0.15)'}`, borderRadius: '8px', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(28,28,28,0.02)' }}>
                <img src={iconCalendar} alt="" style={{ width: '13px', height: '13px', opacity: 0.5 }} />
                <input type="date" value={form.visitDate} onChange={e => set('visitDate', e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', ...font(13, 400, '#1c1c1c'), flex: 1 }} />
              </div>
              {errors.visitDate && <p style={{ ...font(11, 400, '#ef4444'), margin: '3px 0 0' }}>{errors.visitDate}</p>}
            </div>
            {labelInput('Duration (minutes)', 'durationMinutes', 'number', 'e.g. 60')}
          </div>

          {/* Transport + Travel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ ...font(12, 500, 'rgba(28,28,28,0.6)'), display: 'block', marginBottom: '5px' }}>Transport Mode</label>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setTransportOpen(v => !v)}
                  style={{ border: '1px solid rgba(28,28,28,0.15)', borderRadius: '8px', padding: '9px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(28,28,28,0.02)' }}
                >
                  <span style={font(13, 400, form.transportMode ? '#1c1c1c' : 'rgba(28,28,28,0.4)')}>
                    {form.transportMode ? TRANSPORT_MODE_OPTIONS.find(t => t.value === form.transportMode)?.label : 'Select transport'}
                  </span>
                  <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
                </div>
                {transportOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 60, overflow: 'hidden' }}>
                    {TRANSPORT_MODE_OPTIONS.map(opt => (
                      <div key={opt.value} onClick={() => { set('transportMode', opt.value); setTransportOpen(false) }}
                        style={{ padding: '10px 14px', cursor: 'pointer', ...font(13, form.transportMode === opt.value ? 600 : 400), backgroundColor: form.transportMode === opt.value ? 'rgba(28,28,28,0.05)' : '#fff' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = form.transportMode === opt.value ? 'rgba(28,28,28,0.05)' : '#fff')}
                      >{opt.label}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {labelInput('Travel Time (minutes)', 'travelTimeMinutes', 'number', 'e.g. 30')}
          </div>

          {/* Locations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {labelInput('Start Location', 'startLocation', 'text', 'e.g. Office')}
            {labelInput('End Location', 'endLocation', 'text', 'e.g. Learner Workplace')}
          </div>

          {/* Notes */}
          <div>
            <label style={{ ...font(12, 500, 'rgba(28,28,28,0.6)'), display: 'block', marginBottom: '5px' }}>Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any notes about this visit..."
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '8px', padding: '9px 12px', ...font(13, 400, '#1c1c1c'), minHeight: '80px', resize: 'vertical', outline: 'none', backgroundColor: 'rgba(28,28,28,0.02)' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(28,28,28,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '8px', position: 'sticky', bottom: 0, backgroundColor: '#fff' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 20px', ...font(14, 500) }}>Cancel</button>
          <button
            onClick={() => { if (validate()) onSave(form) }}
            disabled={saving}
            style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 24px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, ...font(14, 600, '#fff') }}
          >
            {saving ? 'Saving…' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Visit Type filter dropdown ── */
function VisitTypeFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={font(13, 400, 'rgba(28,28,28,0.7)')}>Visit Type:</span>
      <div style={{ position: 'relative' }}>
        <div
          onClick={() => setOpen(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', backgroundColor: '#fff', minWidth: '150px', justifyContent: 'space-between' }}
        >
          <span style={font(13, 400, '#1c1c1c')}>{value}</span>
          <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
        </div>
        {open && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden', minWidth: '190px' }}>
            {VISIT_TYPE_OPTIONS.map(opt => (
              <div key={opt} onClick={() => { onChange(opt); setOpen(false) }}
                style={{ padding: '10px 14px', cursor: 'pointer', ...font(13, value === opt ? 600 : 400), backgroundColor: value === opt ? 'rgba(28,28,28,0.05)' : '#fff' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = value === opt ? 'rgba(28,28,28,0.05)' : '#fff')}
              >{opt}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main inner page ── */
function VisitsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activityId = searchParams.get('id') || ''
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken

  const [visits, setVisits] = useState<VisitEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  /* filters */
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [visitTypeFilter, setVisitTypeFilter] = useState('All Visit Types')

  /* ── load visits ── */
  const loadVisits = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      let raw: any[] = []
      if (activityId) {
        const resp = await apiFetch<any>(`/learning-activities/visit/activity/${activityId}`, token)
        raw = Array.isArray(resp.data) ? resp.data : []
      } else {
        const resp = await apiFetch<any>('/learning-activities/visit/list?page=1&limit=200', token)
        raw = Array.isArray(resp.data) ? resp.data : (resp.data?.data ?? [])
      }
      const mapped: VisitEntry[] = raw.map((v: any) => ({
        id: v._id,
        visitType: v.visitType || '',
        visitDate: v.visitDate || '',
        durationMinutes: v.durationMinutes || 0,
        travelTimeMinutes: v.travelTimeMinutes || 0,
        transportMode: v.transportMode || '',
        startLocation: v.startLocation || '',
        endLocation: v.endLocation || '',
        notes: v.notes || '',
        learnerSigned: !!v.learnerSignature,
        trainerSigned: !!v.trainerSignature,
      }))
      setVisits(mapped)
    } catch (err) {
      console.error('Failed to load visits:', err)
      setVisits([])
    } finally {
      setLoading(false)
    }
  }, [token, activityId])

  useEffect(() => { loadVisits() }, [loadVisits])

  /* ── create visit ── */
  const handleSave = async (form: ScheduleForm) => {
    setSaving(true)
    try {
      const body: any = {
        visitType: form.visitType,
        visitDate: form.visitDate,
        ...(form.durationMinutes ? { durationMinutes: Number(form.durationMinutes) } : {}),
        ...(form.travelTimeMinutes ? { travelTimeMinutes: Number(form.travelTimeMinutes) } : {}),
        ...(form.transportMode ? { transportMode: form.transportMode } : {}),
        ...(form.startLocation ? { startLocation: form.startLocation } : {}),
        ...(form.endLocation ? { endLocation: form.endLocation } : {}),
        ...(form.notes ? { notes: form.notes } : {}),
      }
      if (activityId) body.learningActivityId = activityId

      const resp = await apiFetch<any>('/learning-activities/visit', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const v = resp.data
      const newVisit: VisitEntry = {
        id: v._id,
        visitType: v.visitType || form.visitType,
        visitDate: v.visitDate || form.visitDate,
        durationMinutes: v.durationMinutes || Number(form.durationMinutes) || 0,
        travelTimeMinutes: v.travelTimeMinutes || Number(form.travelTimeMinutes) || 0,
        transportMode: v.transportMode || form.transportMode,
        startLocation: v.startLocation || form.startLocation,
        endLocation: v.endLocation || form.endLocation,
        notes: v.notes || form.notes,
        learnerSigned: false,
        trainerSigned: false,
      }
      setVisits(prev => [newVisit, ...prev])
      setShowModal(false)
    } catch (err) {
      console.error('Failed to schedule appointment:', err)
    } finally {
      setSaving(false)
    }
  }

  /* ── filtered visits ── */
  const filteredVisits = visits.filter(v => {
    const dateStr = toDateStr(v.visitDate)
    if (filterFrom && dateStr < filterFrom) return false
    if (filterTo && dateStr > filterTo) return false
    if (visitTypeFilter !== 'All Visit Types') {
      const label = mapVisitType(v.visitType)
      if (label !== visitTypeFilter) return false
    }
    return true
  })

  const TH = ({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) => (
    <th style={{ ...font(12, 500, 'rgba(28,28,28,0.5)'), padding: '12px 16px', textAlign: align, fontWeight: 500, whiteSpace: 'nowrap', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
      {children}
    </th>
  )

  return (
    <div>
      {showModal && (
        <ScheduleModal
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          saving={saving}
        />
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
          <img src={iconBack} alt="Back" style={{ width: '32px', height: '32px' }} />
        </button>
        <h1 style={{ ...font(24, 700), margin: 0 }}>Visits</h1>
      </div>

      {/* Schedules Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', backgroundColor: 'rgba(28,28,28,0.02)', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
          <span style={font(16, 700)}>Schedules</span>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}
          >
            <span style={font(13, 600, '#fff')}>Schedule an Appointment</span>
            <img src={iconPlus} alt="" style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '14px 20px', borderBottom: '1px solid rgba(28,28,28,0.06)', flexWrap: 'wrap' }}>
          {/* Date From */}
          {([['Date From:', filterFrom, setFilterFrom], ['Date To:', filterTo, setFilterTo]] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={font(13, 400, 'rgba(28,28,28,0.7)')}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '6px 10px', backgroundColor: '#fff' }}>
                <img src={iconCalendar} alt="" style={{ width: '13px', height: '13px', opacity: 0.5 }} />
                <input
                  type="date"
                  value={val}
                  onChange={e => setter(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', ...font(13, 400, '#1c1c1c') }}
                />
              </div>
            </div>
          ))}

          {/* Visit Type */}
          <VisitTypeFilter value={visitTypeFilter} onChange={setVisitTypeFilter} />

          {/* Clear */}
          {(filterFrom || filterTo || visitTypeFilter !== 'All Visit Types') && (
            <button
              onClick={() => { setFilterFrom(''); setFilterTo(''); setVisitTypeFilter('All Visit Types') }}
              style={{ background: 'none', border: '1px solid rgba(28,28,28,0.2)', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', ...font(12, 400) }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
            Loading visits…
          </div>
        ) : filteredVisits.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ ...font(14, 500, 'rgba(28,28,28,0.5)'), marginBottom: '8px' }}>No visits found</div>
            <div style={font(13, 400, 'rgba(28,28,28,0.35)')}>
              {visits.length === 0
                ? 'Schedule your first appointment to get started.'
                : 'Try adjusting the date range or visit type filter.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <TH>Date / Time</TH>
                  <TH>Location</TH>
                  <TH>Planned Activities</TH>
                  <TH>Actual Activities</TH>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((v, i) => (
                  <tr key={v.id} style={{ borderBottom: i < filteredVisits.length - 1 ? '1px solid rgba(28,28,28,0.06)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.015)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Date / Time */}
                    <td style={{ ...font(13, 400), padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      {fmtDateTime(v.visitDate, v.durationMinutes)}
                    </td>

                    {/* Location */}
                    <td style={{ ...font(13, 400), padding: '14px 16px' }}>
                      {getLocation(v)}
                    </td>

                    {/* Planned Activities = visit type */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ ...font(13, 500, '#615E83'), cursor: 'default' }}>
                        {mapVisitType(v.visitType)}
                      </span>
                    </td>

                    {/* Actual Activities = notes truncated */}
                    <td style={{ ...font(13, 400, 'rgba(28,28,28,0.6)'), padding: '14px 16px', maxWidth: '260px' }}>
                      {v.notes
                        ? <span title={v.notes}>{v.notes.length > 60 ? v.notes.slice(0, 60) + '…' : v.notes}</span>
                        : <span style={{ color: 'rgba(28,28,28,0.3)' }}>—</span>
                      }
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

/* ── Export with Suspense ── */
export default function VisitsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Inter, sans-serif', color: 'rgba(28,28,28,0.4)' }}>Loading…</div>}>
      <VisitsPageInner />
    </Suspense>
  )
}
