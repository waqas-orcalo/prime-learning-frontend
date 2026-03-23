'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconExport = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M8 10V3M5 6l3-3 3 3" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 10v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`)
const iconCalendar = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="#1c1c1c" stroke-width="1.2"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconCaretDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconClose = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="14.5" stroke="#1c1c1c" stroke-width="1.5"/><path d="M11 11l10 10M21 11l-10 10" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round"/></svg>`)
const iconPlus = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M8 3v10M3 8h10" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`)
const iconCheckCircle = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="#22c55e" stroke-width="1.2"/><path d="M6 9l2 2 4-4" stroke="#22c55e" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const CATEGORIES = ['Classroom Delivery', 'Competition', 'Learning Activity (Assignment)', 'Workshop', 'E-Learning', 'Observation', 'Mentoring', 'Self-Directed Study', 'Online Course']
const PER_PAGE_OPTIONS = [10, 25, 50, 100]

interface TimesheetEntry {
  id: string
  spentBy: string
  recordedBy: string
  category: string
  dateFrom: string
  dateTo: string
  description: string
  timeMinutes: number
  offJob: boolean
}

const SEED_ENTRIES: TimesheetEntry[] = [
  { id: '1', spentBy: 'John Doe', recordedBy: 'John Doe', category: 'Classroom Delivery', dateFrom: '2025-02-07', dateTo: '2025-02-08', description: 'Lorem ipsum is a dummy text commonly used in graphic design', timeMinutes: 2040, offJob: true },
  { id: '2', spentBy: 'John Doe', recordedBy: 'John Doe', category: 'Learning Activity (Assignment)', dateFrom: '2025-02-07', dateTo: '2025-02-08', description: 'UI UX Design review session', timeMinutes: 2040, offJob: true },
  { id: '3', spentBy: 'John Doe', recordedBy: 'John Doe', category: 'Competition', dateFrom: '2025-02-07', dateTo: '2025-02-08', description: 'Annual skills competition preparation', timeMinutes: 2040, offJob: true },
  { id: '4', spentBy: 'John Doe', recordedBy: 'John Doe', category: 'Classroom Delivery', dateFrom: '2025-02-10', dateTo: '2025-02-10', description: 'UI Design fundamentals', timeMinutes: 480, offJob: false },
  { id: '5', spentBy: 'John Doe', recordedBy: 'John Doe', category: 'E-Learning', dateFrom: '2025-01-15', dateTo: '2025-01-15', description: 'Data Protection & GDPR online course', timeMinutes: 45, offJob: true },
  { id: '6', spentBy: 'John Doe', recordedBy: 'John Doe', category: 'Workshop', dateFrom: '2025-01-20', dateTo: '2025-01-20', description: 'Business communication workshop', timeMinutes: 120, offJob: false },
]

function fmtDate(iso: string) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

function fmtMinutes(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

interface EntryFormState {
  category: string
  dateFrom: string
  dateTo: string
  description: string
  timeMinutes: string
  offJob: boolean
}

const EMPTY_FORM: EntryFormState = { category: '', dateFrom: '', dateTo: '', description: '', timeMinutes: '', offJob: false }

function EntryModal({ entry, onSave, onClose }: {
  entry?: TimesheetEntry | null
  onSave: (data: EntryFormState) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<EntryFormState>(
    entry
      ? { category: entry.category, dateFrom: entry.dateFrom, dateTo: entry.dateTo, description: entry.description, timeMinutes: String(entry.timeMinutes), offJob: entry.offJob }
      : { ...EMPTY_FORM }
  )
  const [errors, setErrors] = useState<Partial<Record<keyof EntryFormState, string>>>({})
  const [catOpen, setCatOpen] = useState(false)

  const set = <K extends keyof EntryFormState>(k: K, v: EntryFormState[K]) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  const validate = () => {
    const e: Partial<Record<keyof EntryFormState, string>> = {}
    if (!form.category) e.category = 'Required'
    if (!form.dateFrom) e.dateFrom = 'Required'
    if (!form.dateTo) e.dateTo = 'Required'
    if (!form.description.trim()) e.description = 'Required'
    if (!form.timeMinutes || isNaN(Number(form.timeMinutes)) || Number(form.timeMinutes) <= 0) e.timeMinutes = 'Enter valid minutes'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '520px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
          <span style={font(17, 700)}>{entry ? 'Edit Entry' : 'Add Timesheet Entry'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src={iconClose} alt="Close" style={{ width: '28px', height: '28px' }} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Category */}
          <div>
            <label style={{ ...font(12, 500, 'rgba(28,28,28,0.6)'), display: 'block', marginBottom: '5px' }}>Category *</label>
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setCatOpen(v => !v)}
                style={{ border: `1px solid ${errors.category ? '#ef4444' : 'rgba(28,28,28,0.15)'}`, borderRadius: '8px', padding: '9px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(28,28,28,0.02)' }}
              >
                <span style={font(14, 400, form.category ? '#1c1c1c' : 'rgba(28,28,28,0.4)')}>{form.category || 'Select category'}</span>
                <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
              </div>
              {catOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 60, overflow: 'hidden', maxHeight: '220px', overflowY: 'auto' }}>
                  {CATEGORIES.map(c => (
                    <div key={c} onClick={() => { set('category', c); setCatOpen(false) }}
                      style={{ padding: '10px 14px', cursor: 'pointer', ...font(13, form.category === c ? 600 : 400), backgroundColor: form.category === c ? 'rgba(28,28,28,0.05)' : '#fff' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = form.category === c ? 'rgba(28,28,28,0.05)' : '#fff')}
                    >{c}</div>
                  ))}
                </div>
              )}
            </div>
            {errors.category && <p style={{ ...font(11, 400, '#ef4444'), margin: '3px 0 0' }}>{errors.category}</p>}
          </div>

          {/* Date row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {([['dateFrom', 'Date From *'], ['dateTo', 'Date To *']] as [keyof EntryFormState, string][]).map(([key, label]) => (
              <div key={key}>
                <label style={{ ...font(12, 500, 'rgba(28,28,28,0.6)'), display: 'block', marginBottom: '5px' }}>{label}</label>
                <div style={{ border: `1px solid ${errors[key] ? '#ef4444' : 'rgba(28,28,28,0.15)'}`, borderRadius: '8px', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(28,28,28,0.02)' }}>
                  <img src={iconCalendar} alt="" style={{ width: '13px', height: '13px', opacity: 0.5 }} />
                  <input
                    type="date"
                    value={form[key] as string}
                    onChange={e => set(key, e.target.value)}
                    style={{ border: 'none', outline: 'none', background: 'transparent', ...font(13, 400, '#1c1c1c'), flex: 1 }}
                  />
                </div>
                {errors[key] && <p style={{ ...font(11, 400, '#ef4444'), margin: '3px 0 0' }}>{errors[key]}</p>}
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <label style={{ ...font(12, 500, 'rgba(28,28,28,0.6)'), display: 'block', marginBottom: '5px' }}>Description *</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe the activity..."
              style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${errors.description ? '#ef4444' : 'rgba(28,28,28,0.15)'}`, borderRadius: '8px', padding: '9px 12px', ...font(13, 400, '#1c1c1c'), minHeight: '80px', resize: 'vertical', outline: 'none', backgroundColor: 'rgba(28,28,28,0.02)' }}
            />
            {errors.description && <p style={{ ...font(11, 400, '#ef4444'), margin: '3px 0 0' }}>{errors.description}</p>}
          </div>

          {/* Time + Off-job row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ ...font(12, 500, 'rgba(28,28,28,0.6)'), display: 'block', marginBottom: '5px' }}>Time (minutes) *</label>
              <input
                type="number"
                min="1"
                value={form.timeMinutes}
                onChange={e => set('timeMinutes', e.target.value)}
                placeholder="e.g. 60"
                style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${errors.timeMinutes ? '#ef4444' : 'rgba(28,28,28,0.15)'}`, borderRadius: '8px', padding: '9px 12px', ...font(13, 400, '#1c1c1c'), outline: 'none', backgroundColor: 'rgba(28,28,28,0.02)' }}
              />
              {errors.timeMinutes && <p style={{ ...font(11, 400, '#ef4444'), margin: '3px 0 0' }}>{errors.timeMinutes}</p>}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingBottom: '2px' }}>
              <input
                type="checkbox"
                checked={form.offJob}
                onChange={e => set('offJob', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#1c1c1c', cursor: 'pointer' }}
              />
              <span style={font(13, 500)}>Off-the-job</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(28,28,28,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 20px', ...font(14, 500) }}>Cancel</button>
          <button onClick={() => { if (validate()) onSave(form) }} style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 24px', cursor: 'pointer', ...font(14, 600, '#fff') }}>
            {entry ? 'Update' : 'Add Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TimesheetPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken
  const [entries, setEntries] = useState<TimesheetEntry[]>(SEED_ENTRIES)
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [appliedFrom, setAppliedFrom] = useState('')
  const [appliedTo, setAppliedTo] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(50)
  const [perPageOpen, setPerPageOpen] = useState(false)
  const [pageOpen, setPageOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null | undefined>(undefined) // undefined = closed, null = new
  const [activityTitle, setActivityTitle] = useState('Learning Activity')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentActivity')
      if (stored) {
        const act = JSON.parse(stored)
        setActivityTitle(act.title || 'Learning Activity')
      }
    }
  }, [])

  // Load timesheets from API
  useEffect(() => {
    const loadTimesheets = async () => {
      try {
        if (!token) return
        const response = await apiFetch<any>('/learning-activities/timesheet?limit=100', token)
        const loaded = (response.data.data || []).map((t: any) => ({
          id: t._id,
          spentBy: 'John Doe',
          recordedBy: 'John Doe',
          category: formatCategory(t.category),
          dateFrom: t.dateFrom,
          dateTo: t.dateTo,
          description: t.description,
          timeMinutes: t.timeMinutes,
          offJob: t.offJob,
        }))
        if (loaded.length > 0) setEntries(loaded)
      } catch (err) {
        console.error('Failed to load timesheets:', err)
      }
    }
    loadTimesheets()
  }, [token])

  function formatCategory(cat: string): string {
    return cat
      .split('_')
      .map(w => w.charAt(0) + w.slice(1).toLowerCase())
      .join(' ')
  }

  function mapCategoryToEnum(label: string): string {
    const map: Record<string, string> = {
      'Classroom Delivery': 'CLASSROOM_DELIVERY',
      'Competition': 'COMPETITION',
      'Learning Activity (Assignment)': 'LEARNING_ACTIVITY',
      'Workshop': 'WORKSHOP',
      'E-Learning': 'E_LEARNING',
      'Observation': 'OBSERVATION',
      'Mentoring': 'MENTORING',
      'Self-Directed Study': 'SELF_DIRECTED_STUDY',
      'Online Course': 'ONLINE_COURSE',
    }
    return map[label] || label
  }

  const filteredEntries = useMemo(() => {
    if (!appliedFrom && !appliedTo) return entries
    return entries.filter(e => {
      const from = appliedFrom ? e.dateFrom >= appliedFrom : true
      const to = appliedTo ? e.dateTo <= appliedTo : true
      return from && to
    })
  }, [entries, appliedFrom, appliedTo])

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / perPage))
  const pagedEntries = filteredEntries.slice((page - 1) * perPage, page * perPage)

  const summaryData = useMemo(() => {
    const map: Record<string, { offJob: number; total: number }> = {}
    filteredEntries.forEach(e => {
      if (!map[e.category]) map[e.category] = { offJob: 0, total: 0 }
      map[e.category].total += e.timeMinutes
      if (e.offJob) map[e.category].offJob += e.timeMinutes
    })
    return Object.entries(map).map(([cat, v]) => ({ category: cat, offJob: v.offJob, total: v.total }))
  }, [filteredEntries])

  const totalOffJob = filteredEntries.filter(e => e.offJob).reduce((s, e) => s + e.timeMinutes, 0)
  const totalAll = filteredEntries.reduce((s, e) => s + e.timeMinutes, 0)

  const handleSave = async (form: EntryFormState) => {
    if (editingEntry === null) {
      // new
      try {
        if (token) {
          const response = await apiFetch<any>(
            '/learning-activities/timesheet',
            token,
            {
              method: 'POST',
              body: JSON.stringify({
                category: mapCategoryToEnum(form.category),
                dateFrom: form.dateFrom,
                dateTo: form.dateTo,
                description: form.description,
                timeMinutes: Number(form.timeMinutes),
                offJob: form.offJob,
              }),
            }
          )
          const newEntry: TimesheetEntry = {
            id: response.data._id,
            spentBy: 'John Doe',
            recordedBy: 'John Doe',
            category: form.category,
            dateFrom: form.dateFrom,
            dateTo: form.dateTo,
            description: form.description,
            timeMinutes: Number(form.timeMinutes),
            offJob: form.offJob,
          }
          setEntries(prev => [newEntry, ...prev])
        } else {
          // Fallback to local
          const newEntry: TimesheetEntry = {
            id: String(Date.now()),
            spentBy: 'John Doe',
            recordedBy: 'John Doe',
            category: form.category,
            dateFrom: form.dateFrom,
            dateTo: form.dateTo,
            description: form.description,
            timeMinutes: Number(form.timeMinutes),
            offJob: form.offJob,
          }
          setEntries(prev => [newEntry, ...prev])
        }
      } catch (err) {
        console.error('Failed to save timesheet:', err)
      }
    } else if (editingEntry) {
      try {
        if (token) {
          await apiFetch<any>(
            `/learning-activities/timesheet/${editingEntry.id}`,
            token,
            {
              method: 'PATCH',
              body: JSON.stringify({
                category: mapCategoryToEnum(form.category),
                dateFrom: form.dateFrom,
                dateTo: form.dateTo,
                description: form.description,
                timeMinutes: Number(form.timeMinutes),
                offJob: form.offJob,
              }),
            }
          )
        }
        setEntries(prev => prev.map(e => e.id === editingEntry.id ? { ...e, category: form.category, dateFrom: form.dateFrom, dateTo: form.dateTo, description: form.description, timeMinutes: Number(form.timeMinutes), offJob: form.offJob } : e))
      } catch (err) {
        console.error('Failed to update timesheet:', err)
      }
    }
    setEditingEntry(undefined)
    setPage(1)
  }

  const handleDelete = async (id: string) => {
    try {
      if (token) {
        await apiFetch<any>(
          `/learning-activities/timesheet/${id}`,
          token,
          { method: 'DELETE' }
        )
      }
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      console.error('Failed to delete timesheet:', err)
    }
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div>
      {editingEntry !== undefined && (
        <EntryModal
          entry={editingEntry}
          onSave={handleSave}
          onClose={() => setEditingEntry(undefined)}
        />
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <img src={iconBack} alt="Back" style={{ width: '32px', height: '32px' }} />
          </button>
          <div>
            <h1 style={{ ...font(22, 700), margin: 0 }}>Timesheets</h1>
            <span style={{ ...font(13, 400, 'rgba(28,28,28,0.5)') }}>{activityTitle}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setEditingEntry(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}
          >
            <img src={iconPlus} alt="" style={{ width: '14px', height: '14px' }} />
            <span style={font(14, 600, '#fff')}>Add Entry</span>
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
            <span style={font(14, 600, '#fff')}>Export</span>
            <img src={iconExport} alt="" style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>

      {/* Off The Job Stats */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.03)', padding: '12px 20px', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
          <span style={font(15, 700)}>Off The Job</span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total OTJ Time:', value: fmtMinutes(totalOffJob) },
              { label: 'Total All Time:', value: fmtMinutes(totalAll) },
              { label: 'OTJ % of Total:', value: totalAll > 0 ? `${Math.round((totalOffJob / totalAll) * 100)}%` : '—' },
              { label: 'Total Entries:', value: String(entries.length) },
              { label: 'OTJ Entries:', value: String(entries.filter(e => e.offJob).length) },
              { label: 'Planned OTJ (Hrs):', value: 'Not Set' },
              { label: 'Minimum OTJ (Hrs):', value: 'Not Set' },
            ].map((stat, i) => (
              <div key={i} style={{ flex: '1 1 auto', minWidth: '120px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
                <div style={{ ...font(12, 400, '#9291A5'), marginBottom: '4px', lineHeight: '16px' }}>{stat.label}</div>
                <div style={font(14, 700)}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.03)', padding: '12px 20px', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
          <span style={font(15, 700)}>Summary by Category</span>
        </div>

        {/* Date filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: '1px solid rgba(28,28,28,0.06)', flexWrap: 'wrap' }}>
          {([['Date From:', filterFrom, setFilterFrom], ['Date To:', filterTo, setFilterTo]] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={font(13, 400, 'rgba(28,28,28,0.7)')}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '6px 10px', backgroundColor: '#fff' }}>
                <img src={iconCalendar} alt="" style={{ width: '13px', height: '13px', opacity: 0.5 }} />
                <input type="date" value={val} onChange={e => setter(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', ...font(13, 400, '#1c1c1c') }} />
              </div>
            </div>
          ))}
          <button
            onClick={() => { setAppliedFrom(filterFrom); setAppliedTo(filterTo); setPage(1) }}
            style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '6px', padding: '7px 20px', cursor: 'pointer', ...font(13, 600, '#fff') }}
          >
            Apply
          </button>
          {(appliedFrom || appliedTo) && (
            <button
              onClick={() => { setFilterFrom(''); setFilterTo(''); setAppliedFrom(''); setAppliedTo(''); setPage(1) }}
              style={{ background: 'none', border: '1px solid rgba(28,28,28,0.2)', borderRadius: '6px', padding: '7px 16px', cursor: 'pointer', ...font(13, 400) }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          {summaryData.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', ...font(13, 400, 'rgba(28,28,28,0.4)') }}>No data for this period.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                  {['Category', 'Off-the-job', 'Total'].map((h, i) => (
                    <th key={h} style={{ ...font(12, 500, 'rgba(28,28,28,0.5)'), padding: '12px 8px', textAlign: i === 0 ? 'left' : 'right', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summaryData.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
                    <td style={{ ...font(13, 400), padding: '12px 8px' }}>{row.category}</td>
                    <td style={{ ...font(13, 400), padding: '12px 8px', textAlign: 'right' }}>{row.offJob > 0 ? fmtMinutes(row.offJob) : 'None'}</td>
                    <td style={{ ...font(13, 400), padding: '12px 8px', textAlign: 'right' }}>{fmtMinutes(row.total)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid rgba(28,28,28,0.1)' }}>
                  <td style={{ ...font(13, 700), padding: '12px 8px' }}>Total</td>
                  <td style={{ ...font(13, 700), padding: '12px 8px', textAlign: 'right' }}>{fmtMinutes(totalOffJob)}</td>
                  <td style={{ ...font(13, 700), padding: '12px 8px', textAlign: 'right' }}>{fmtMinutes(totalAll)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Entries Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
        {/* Entries header with pagination */}
        <div style={{ backgroundColor: 'rgba(28,28,28,0.03)', padding: '12px 20px', borderBottom: '1px solid rgba(28,28,28,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={font(15, 700)}>Entries</span>
            <span style={font(13, 400, 'rgba(28,28,28,0.5)')}>{filteredEntries.length} record{filteredEntries.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Page selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={font(13, 400, 'rgba(28,28,28,0.6)')}>Page:</span>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setPageOpen(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '4px 10px', backgroundColor: '#fff', cursor: 'pointer', minWidth: '52px', justifyContent: 'space-between' }}
                >
                  <span style={font(13)}>{page}</span>
                  <img src={iconCaretDown} alt="" style={{ width: '12px', height: '12px' }} />
                </div>
                {pageOpen && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden', maxHeight: '180px', overflowY: 'auto', minWidth: '60px' }}>
                    {pageNumbers.map(p => (
                      <div key={p} onClick={() => { setPage(p); setPageOpen(false) }}
                        style={{ padding: '8px 14px', cursor: 'pointer', ...font(13, page === p ? 600 : 400), backgroundColor: page === p ? 'rgba(28,28,28,0.05)' : '#fff' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = page === p ? 'rgba(28,28,28,0.05)' : '#fff')}
                      >{p}</div>
                    ))}
                  </div>
                )}
              </div>
              <span style={font(13, 400, 'rgba(28,28,28,0.5)')}>of {totalPages}</span>
            </div>

            {/* Per page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={font(13, 400, 'rgba(28,28,28,0.6)')}>Per page:</span>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setPerPageOpen(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '4px 10px', backgroundColor: '#fff', cursor: 'pointer' }}
                >
                  <span style={font(13)}>{perPage}</span>
                  <img src={iconCaretDown} alt="" style={{ width: '12px', height: '12px' }} />
                </div>
                {perPageOpen && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden', minWidth: '80px' }}>
                    {PER_PAGE_OPTIONS.map(n => (
                      <div key={n} onClick={() => { setPerPage(n); setPage(1); setPerPageOpen(false) }}
                        style={{ padding: '8px 14px', cursor: 'pointer', ...font(13, perPage === n ? 600 : 400), backgroundColor: perPage === n ? 'rgba(28,28,28,0.05)' : '#fff' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = perPage === n ? 'rgba(28,28,28,0.05)' : '#fff')}
                      >{n}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px 24px' }}>
          {pagedEntries.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>No entries found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                  {['Spent by', 'Recorded by', 'Category', 'Date from', 'Date to', 'Description', 'Time (min)', 'Off-the-job', 'Actions'].map((h, i) => (
                    <th key={i} style={{ ...font(12, 500, 'rgba(28,28,28,0.5)'), padding: '12px 8px', textAlign: i === 8 ? 'right' : 'left', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedEntries.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
                    <td style={{ ...font(13), padding: '12px 8px', whiteSpace: 'nowrap' }}>{row.spentBy}</td>
                    <td style={{ ...font(13), padding: '12px 8px', whiteSpace: 'nowrap' }}>{row.recordedBy}</td>
                    <td style={{ ...font(13), padding: '12px 8px', maxWidth: '140px' }}>{row.category}</td>
                    <td style={{ ...font(13), padding: '12px 8px', whiteSpace: 'nowrap' }}>{fmtDate(row.dateFrom)}</td>
                    <td style={{ ...font(13), padding: '12px 8px', whiteSpace: 'nowrap' }}>{fmtDate(row.dateTo)}</td>
                    <td style={{ ...font(13), padding: '12px 8px', maxWidth: '200px' }}>{row.description}</td>
                    <td style={{ ...font(13), padding: '12px 8px', textAlign: 'center' }}>{row.timeMinutes}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      {row.offJob && <img src={iconCheckCircle} alt="✓" style={{ width: '18px', height: '18px' }} />}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setEditingEntry(row)}
                          style={{ backgroundColor: 'rgba(28,28,28,0.06)', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', ...font(12, 500) }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.1)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.06)')}
                        >Edit</button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          style={{ backgroundColor: '#fef2f2', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', ...font(12, 500, '#ef4444') }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(28,28,28,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '6px 12px', cursor: page === 1 ? 'default' : 'pointer', backgroundColor: '#fff', opacity: page === 1 ? 0.4 : 1, ...font(13) }}
            >← Prev</button>
            {pageNumbers.slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{ border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', backgroundColor: p === page ? '#1c1c1c' : '#fff', ...font(13, p === page ? 600 : 400, p === page ? '#fff' : '#1c1c1c') }}
              >{p}</button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '6px 12px', cursor: page === totalPages ? 'default' : 'pointer', backgroundColor: '#fff', opacity: page === totalPages ? 0.4 : 1, ...font(13) }}
            >Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
