'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const inputStyle: React.CSSProperties = {
  ...FF,
  width: '100%',
  boxSizing: 'border-box' as const,
  height: '40px',
  padding: '0 12px',
  border: '1px solid rgba(28,28,28,0.18)',
  borderRadius: '8px',
  backgroundColor: '#fafafa',
  fontSize: '14px',
  color: '#1c1c1c',
  outline: 'none',
}
const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none' as const,
  cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>')}")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: '32px',
}
const labelStyle: React.CSSProperties = {
  ...FF,
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: 'rgba(28,28,28,0.7)',
  marginBottom: '6px',
}
const card: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  boxShadow: '0px 2px 6px rgba(13,10,44,0.08)',
  overflow: 'hidden',
  marginBottom: '20px',
}
const cardHeader: React.CSSProperties = {
  backgroundColor: 'rgba(28,28,28,0.05)',
  height: '45px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 24px',
}
const cardBody: React.CSSProperties = {
  padding: '24px',
}

const METHOD_OPTIONS = [
  'Assignment',
  'FS Prep',
  'Gateway',
  'Observation',
  'Project',
  'Questions',
  'SLC Observation',
  'Teaching and Learning',
]

type LearnerResult = { _id: string; firstName: string; lastName: string; email: string; role: string }

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <rect
        x="1" y="1" width="16" height="16" rx="4"
        stroke={checked ? '#1c1c1c' : 'rgba(28,28,28,0.25)'}
        strokeWidth="1.4"
        fill={checked ? '#1c1c1c' : 'transparent'}
      />
      {checked && (
        <path d="M4.5 9l3 3 6-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(28,28,28,0.08)' }} />
      <span style={font(11, 500, 'rgba(28,28,28,0.4)', { textTransform: 'uppercase', letterSpacing: '0.6px' })}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(28,28,28,0.08)' }} />
    </div>
  )
}

export default function AssignTaskPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  // Step tracking
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1 — user lookup (learner or trainer)
  const [emailInput, setEmailInput] = useState('james.miller@prime.com')
  const [searching, setSearching] = useState(false)
  const [learner, setLearner] = useState<LearnerResult | null>(null)
  const [lookupError, setLookupError] = useState('')

  // Step 2 — task form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')   // "Details of Planned Assessment"
  const [reference, setReference] = useState('')
  const [primaryMethod, setPrimaryMethod] = useState('Assignment')
  const [secondaryMethods, setSecondaryMethods] = useState<string[]>([])
  const [priority, setPriority] = useState('MEDIUM')
  const [dueDate, setDueDate] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  const toggleSecondaryMethod = (method: string) => {
    setSecondaryMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method],
    )
  }

  const handleFindLearner = async () => {
    if (!emailInput.trim()) return
    setLookupError('')
    setLearner(null)
    setSearching(true)
    try {
      const res = await apiFetch<any>(
        `/users/by-email/${encodeURIComponent(emailInput.trim())}`,
        token,
      )
      const u = res?.data
      if (!u) throw new Error('User not found')
      setLearner(u)
      setStep(2)
    } catch (err: any) {
      setLookupError(err?.message ?? 'User not found for that email')
    } finally {
      setSearching(false)
    }
  }

  const handleAssign = async () => {
    if (!title.trim() || !learner) return
    setSubmitError('')
    setSubmitting(true)
    try {
      await apiFetch('/tasks', token, {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          reference: reference.trim() || undefined,
          primaryMethod: primaryMethod || undefined,
          secondaryMethods: secondaryMethods.length > 0 ? secondaryMethods : undefined,
          priority,
          dueDate: dueDate || undefined,
          assignedTo: learner._id,
        }),
      })
      setSuccess(true)
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSuccess(false)
    setStep(1)
    setTitle('')
    setDescription('')
    setReference('')
    setPrimaryMethod('Assignment')
    setSecondaryMethods([])
    setPriority('MEDIUM')
    setDueDate('')
    setLearner(null)
    setEmailInput('')
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div>
        <h1 style={{ ...font(22, 700), letterSpacing: '-0.44px', marginBottom: '28px' }}>Assign Task</h1>
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ ...cardBody, padding: '48px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: '#dcfce7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M5 14l6 6 12-12" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div style={font(18, 600, '#1c1c1c', { marginBottom: '8px' })}>Task assigned successfully!</div>
            <div style={font(14, 400, 'rgba(28,28,28,0.6)', { marginBottom: '6px' })}>
              <strong>"{title}"</strong> has been assigned to {learner!.firstName} {learner!.lastName}
            </div>
            <div style={font(13, 400, 'rgba(28,28,28,0.45)', { marginBottom: '28px' })}>
              {learner!.email}
            </div>
            {/* Summary chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '28px' }}>
              {primaryMethod && (
                <span style={{
                  backgroundColor: '#e5ecf6', borderRadius: '6px', padding: '4px 10px',
                  ...font(12, 500, '#1c1c1c'),
                }}>
                  {primaryMethod}
                </span>
              )}
              {reference && (
                <span style={{
                  backgroundColor: '#f0fdf4', borderRadius: '6px', padding: '4px 10px',
                  ...font(12, 500, '#16a34a'),
                }}>
                  Ref: {reference}
                </span>
              )}
              {dueDate && (
                <span style={{
                  backgroundColor: 'rgba(28,28,28,0.06)', borderRadius: '6px', padding: '4px 10px',
                  ...font(12, 500, '#1c1c1c'),
                }}>
                  Due: {new Date(dueDate).toLocaleDateString('en-GB')}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={resetForm}
                style={{ ...font(14, 500, '#1c1c1c'), border: '1px solid rgba(28,28,28,0.2)', borderRadius: '8px', padding: '8px 20px', height: '36px', backgroundColor: 'transparent', cursor: 'pointer' }}
              >
                Assign Another
              </button>
              <button
                onClick={() => router.push('/tasks')}
                style={{ ...font(14, 500, '#fff'), backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', height: '36px', cursor: 'pointer' }}
              >
                View Tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '780px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button
          onClick={() => router.push('/tasks')}
          style={{ ...font(14, 400, '#1c1c1c'), background: 'none', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '8px', padding: '4px 12px', height: '28px', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <h1 style={{ ...font(22, 700), letterSpacing: '-0.44px', margin: 0 }}>Assign Task</h1>
      </div>

      {/* Progress steps */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
        {[
          { num: 1, label: 'Find User' },
          { num: 2, label: 'Task Details' },
        ].map((s, i) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: step === s.num ? '#1c1c1c' : step > s.num ? '#22c55e' : 'rgba(28,28,28,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {step > s.num ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3.5 3.5 6.5-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span style={{ ...font(12, 600, step === s.num ? '#fff' : 'rgba(28,28,28,0.5)') }}>{s.num}</span>
                )}
              </div>
              <span style={font(14, step === s.num ? 600 : 400, step === s.num ? '#1c1c1c' : 'rgba(28,28,28,0.5)')}>
                {s.label}
              </span>
            </div>
            {i < 1 && (
              <div style={{ width: '48px', height: '1px', backgroundColor: step > 1 ? '#22c55e' : 'rgba(28,28,28,0.15)', margin: '0 12px' }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Find User ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div style={card}>
          <div style={cardHeader}>
            <span style={font(16, 600, '#1c1c1c')}>Find User by Email</span>
          </div>
          <div style={cardBody}>
            <div style={{ ...font(13, 400, 'rgba(28,28,28,0.5)'), marginBottom: '24px' }}>
              Enter the email address of the learner or trainer to assign a task to them.
            </div>
            <label style={labelStyle}>Email Address</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFindLearner()}
                placeholder="e.g. james.miller@prime.com"
                style={{ ...inputStyle, flex: 1 }}
                autoFocus
              />
              <button
                onClick={handleFindLearner}
                disabled={searching || !emailInput.trim()}
                style={{
                  ...font(14, 500, '#fff'),
                  backgroundColor: searching ? 'rgba(28,28,28,0.4)' : '#1c1c1c',
                  border: 'none', borderRadius: '8px',
                  padding: '0 20px', height: '40px',
                  cursor: searching ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                {searching ? 'Searching…' : 'Find User'}
              </button>
            </div>
            {lookupError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.4"/>
                  <path d="M8 5v3.5" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round"/>
                  <circle cx="8" cy="11" r="0.8" fill="#ef4444"/>
                </svg>
                <span style={font(13, 400, '#dc2626')}>{lookupError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2: Task Details ───────────────────────────────────────────── */}
      {step === 2 && learner && (
        <>
          {/* Learner info banner */}
          <div style={{
            ...card,
            boxShadow: 'none',
            border: '1px solid #bbf7d0',
            backgroundColor: '#f0fdf4',
            marginBottom: '16px',
          }}>
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: '#1c1c1c',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={font(16, 600, '#fff')}>{learner.firstName[0].toUpperCase()}</span>
              </div>
              <div>
                <div style={font(14, 600, '#1c1c1c')}>{learner.firstName} {learner.lastName}</div>
                <div style={font(13, 400, 'rgba(28,28,28,0.6)')}>{learner.email} · {learner.role}</div>
              </div>
              <button
                onClick={() => setStep(1)}
                style={{ ...font(13, 400, 'rgba(28,28,28,0.5)'), marginLeft: 'auto', background: 'none', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', height: '28px' }}
              >
                Change
              </button>
            </div>
          </div>

          {/* ── Task Overview card (matches learner view) ─────────────────── */}
          <div style={card}>
            <div style={cardHeader}>
              <span style={font(18, 700, '#000', { letterSpacing: '-0.36px' })}>Task Overview</span>
            </div>
            <div style={{ ...cardBody, display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Title */}
              <div>
                <label style={labelStyle}>
                  Task Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Complete Unit 01 workbook"
                  style={inputStyle}
                  autoFocus
                />
              </div>

              {/* Details of Planned Assessment */}
              <div>
                <label style={labelStyle}>Details of Planned Assessment</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what the learner needs to do for this assessment activity..."
                  rows={3}
                  style={{
                    ...inputStyle,
                    height: 'auto',
                    padding: '10px 12px',
                    resize: 'vertical' as const,
                    lineHeight: '1.5',
                  }}
                />
              </div>

              <SectionDivider label="Assessment Fields" />

              {/* Primary Method + Due Date + Reference row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Primary Method</label>
                  <select value={primaryMethod} onChange={e => setPrimaryMethod(e.target.value)} style={selectStyle}>
                    {METHOD_OPTIONS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Reference</label>
                  <input
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    placeholder="e.g. FSE1"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Secondary Methods — checkboxes */}
              <div>
                <label style={{ ...labelStyle, marginBottom: '12px' }}>Secondary Methods</label>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  backgroundColor: 'rgba(28,28,28,0.02)',
                  border: '1px solid rgba(28,28,28,0.1)',
                  borderRadius: '10px',
                  padding: '16px',
                }}>
                  {METHOD_OPTIONS.map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => toggleSecondaryMethod(method)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '4px 0', textAlign: 'left',
                      }}
                    >
                      <CheckboxIcon checked={secondaryMethods.includes(method)} />
                      <span style={font(13, secondaryMethods.includes(method) ? 500 : 400)}>
                        {method}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <SectionDivider label="Priority" />

              {/* Priority */}
              <div style={{ width: '50%' }}>
                <label style={labelStyle}>Task Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} style={selectStyle}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              {/* Error */}
              {submitError && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.4"/>
                    <path d="M8 5v3.5" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="8" cy="11" r="0.8" fill="#ef4444"/>
                  </svg>
                  <span style={font(13, 400, '#dc2626')}>{submitError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setStep(1)}
              style={{ ...font(14, 400, '#1c1c1c'), backgroundColor: 'transparent', border: '1px solid rgba(28,28,28,0.2)', borderRadius: '8px', padding: '8px 20px', height: '36px', cursor: 'pointer' }}
            >
              Back
            </button>
            <button
              onClick={handleAssign}
              disabled={submitting || !title.trim()}
              style={{
                ...font(14, 500, '#fff'),
                backgroundColor: submitting || !title.trim() ? 'rgba(28,28,28,0.35)' : '#1c1c1c',
                border: 'none', borderRadius: '8px',
                padding: '8px 24px', height: '36px',
                cursor: submitting || !title.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Assigning…' : `Assign Task to ${learner.firstName}`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
