'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconCaretDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCalendar = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="#1c1c1c" stroke-width="1.2"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const METHODS = [
  { value: 'ASSIGNMENT', label: 'Assignment' },
  { value: 'CLASSROOM_DELIVERY', label: 'Classroom Delivery' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'SELF_DIRECTED_STUDY', label: 'Self-Directed Study' },
  { value: 'COMPETITION', label: 'Competition' },
  { value: 'OBSERVATION', label: 'Observation' },
  { value: 'MENTORING', label: 'Mentoring' },
  { value: 'E_LEARNING', label: 'E-Learning' },
  { value: 'ONLINE_COURSE', label: 'Online Course' },
]

interface FormState {
  method: string
  date: string
  title: string
  holistic: boolean
  separate: boolean
}

interface Errors {
  method?: string
  date?: string
  title?: string
  evidenceRecording?: string
}

export default function NewActivityPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken
  const [form, setForm] = useState<FormState>({ method: '', date: '', title: '', holistic: false, separate: false })
  const [errors, setErrors] = useState<Errors>({})
  const [methodOpen, setMethodOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  const validate = (): boolean => {
    const e: Errors = {}
    if (!form.method) e.method = 'Please select a method'
    if (!form.date) e.date = 'Please pick a date'
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.holistic && !form.separate) e.evidenceRecording = 'Please select at least one evidence recording type'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleStart = async () => {
    if (!validate()) return
    setSubmitting(true)

    try {
      let activityId = 'LA' + Date.now()
      let activityData = {
        id: activityId,
        ref: 'LA' + String(Date.now()).slice(-3),
        title: form.title,
        method: METHODS.find(m => m.value === form.method)?.label || form.method,
        date: new Date(form.date).toLocaleDateString('en-GB').replace(/\//g, '/'),
        trainerTime: 0,
        learnerTime: 0,
        plan: 'None',
        actionRequiredBy: 'Learner',
        status: 'PENDING',
        addToShowcase: false,
        evidenceRecording: form.holistic && form.separate ? 'BOTH' : form.holistic ? 'HOLISTIC' : 'SEPARATE',
      }

      // Try API call if token exists
      if (token) {
        try {
          const response = await apiFetch<any>(
            '/learning-activities',
            token,
            {
              method: 'POST',
              body: JSON.stringify({
                title: form.title,
                method: form.method,
                activityDate: form.date,
                evidenceRecording: form.holistic && form.separate ? 'BOTH' : form.holistic ? 'HOLISTIC' : 'SEPARATE',
                status: 'PENDING',
              }),
            }
          )
          activityId = response.data._id
          activityData.id = activityId
          activityData.ref = response.data.ref || activityData.ref
        } catch (apiErr) {
          console.error('API call failed, falling back to localStorage:', apiErr)
        }
      }

      // Always store in localStorage as fallback
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('activities') || '[]')
        existing.unshift(activityData)
        localStorage.setItem('activities', JSON.stringify(existing))
        localStorage.setItem('currentActivityId', activityId)
        localStorage.setItem('currentActivity', JSON.stringify(activityData))
      }

      setSubmitting(false)
      router.push(`/learning-activities/evidence?id=${activityId}`)
    } catch (err) {
      console.error('Error starting activity:', err)
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', padding: '0 20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ ...font(15, 700) }}>Start New Learning Activity</span>
        </div>

        <div style={{ padding: '24px 20px' }}>
          {/* Fields Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '28px' }}>

            {/* Primary Method */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setMethodOpen(v => !v)}
                style={{
                  backgroundColor: 'rgba(28,28,28,0.05)',
                  border: `1px solid ${errors.method ? '#ef4444' : 'rgba(28,28,28,0.1)'}`,
                  borderRadius: '8px', padding: '12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}
              >
                <div style={{ ...font(11, 400, 'rgba(28,28,28,0.6)'), marginBottom: '4px' }}>Primary Method:*</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ ...font(14, 400, form.method ? '#1c1c1c' : 'rgba(28,28,28,0.4)'), flex: 1 }}>
                    {form.method ? METHODS.find(m => m.value === form.method)?.label : 'Select a method'}
                  </span>
                  <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
                </div>
              </div>
              {methodOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
                  {METHODS.map(m => (
                    <div
                      key={m.value}
                      onClick={() => { set('method', m.value); setMethodOpen(false) }}
                      style={{ padding: '10px 14px', cursor: 'pointer', ...font(14, form.method === m.value ? 600 : 400), backgroundColor: form.method === m.value ? 'rgba(28,28,28,0.05)' : '#fff' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = form.method === m.value ? 'rgba(28,28,28,0.05)' : '#fff')}
                    >
                      {m.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.method && <p style={{ ...font(11, 400, '#ef4444'), margin: '4px 0 0' }}>{errors.method}</p>}
            </div>

            {/* Date */}
            <div>
              <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: `1px solid ${errors.date ? '#ef4444' : 'rgba(28,28,28,0.1)'}`, borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ ...font(11, 400, 'rgba(28,28,28,0.6)'), marginBottom: '4px' }}>Date*</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={iconCalendar} alt="" style={{ width: '14px', height: '14px', opacity: 0.6 }} />
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => set('date', e.target.value)}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', ...font(14, 400, form.date ? '#1c1c1c' : 'rgba(28,28,28,0.4)') }}
                  />
                </div>
              </div>
              {errors.date && <p style={{ ...font(11, 400, '#ef4444'), margin: '4px 0 0' }}>{errors.date}</p>}
            </div>

            {/* Title */}
            <div>
              <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: `1px solid ${errors.title ? '#ef4444' : 'rgba(28,28,28,0.1)'}`, borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ ...font(11, 400, 'rgba(28,28,28,0.6)'), marginBottom: '4px' }}>Title*</div>
                <input
                  type="text"
                  placeholder="Enter activity title"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', ...font(14, 400, '#1c1c1c'), width: '100%' }}
                />
              </div>
              {errors.title && <p style={{ ...font(11, 400, '#ef4444'), margin: '4px 0 0' }}>{errors.title}</p>}
            </div>
          </div>

          {/* Evidence Recording */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ ...font(13, 500), marginBottom: '10px' }}>How will the evidence be recorded?*</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.holistic}
                  onChange={e => { set('holistic', e.target.checked); setErrors(prev => ({ ...prev, evidenceRecording: undefined })) }}
                  style={{ width: '16px', height: '16px', accentColor: '#1c1c1c', cursor: 'pointer' }}
                />
                <span style={{ ...font(13) }}>Holistically against multiple criteria</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.separate}
                  onChange={e => { set('separate', e.target.checked); setErrors(prev => ({ ...prev, evidenceRecording: undefined })) }}
                  style={{ width: '16px', height: '16px', accentColor: '#1c1c1c', cursor: 'pointer' }}
                />
                <span style={{ ...font(13) }}>Separately against individual criteria</span>
              </label>
            </div>
            {errors.evidenceRecording && <p style={{ ...font(11, 400, '#ef4444'), margin: '6px 0 0' }}>{errors.evidenceRecording}</p>}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleStart}
              disabled={submitting}
              style={{ backgroundColor: submitting ? 'rgba(28,28,28,0.4)' : '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 24px', cursor: submitting ? 'not-allowed' : 'pointer', ...font(14, 600, '#fff') }}
            >
              {submitting ? 'Starting…' : 'Start'}
            </button>
            <button
              onClick={() => router.back()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 20px', ...font(14, 500) }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
