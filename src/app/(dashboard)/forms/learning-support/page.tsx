'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconPaperClip = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><path d="M11.5 6.5L6.5 11.5a3.5 3.5 0 01-5-5l5.5-5.5a2 2 0 012.83 2.83L5.33 9.33a.5.5 0 01-.7-.7L9 4.27" stroke="#888" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '20px', ...extra } as React.CSSProperties)

const SECTION_HDR: React.CSSProperties = {
  padding: '10px 16px', background: '#f0f0f0', ...font(13, 600),
  borderBottom: '1px solid rgba(28,28,28,0.08)'
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid rgba(28,28,28,0.15)',
  borderRadius: 6, outline: 'none', ...font(13), background: '#fff', boxSizing: 'border-box'
}

const YES_NO_OPTIONS = ['No/False', 'Yes/True']

function SelectInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...INPUT_STYLE, appearance: 'none', paddingRight: 28, cursor: 'pointer' }}
      >
        {YES_NO_OPTIONS.map(o => <option key={o}>{o}</option>)}
      </select>
      <svg width="12" height="12" viewBox="0 0 12 12" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <path d="M2 4.5l4 4 4-4" stroke="#888" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  )
}

interface FormData {
  monthlyReview: string
  threeMonthlyReview: string
  changesNotes: string
  activityTracker: string
  reasonForStopping: string
  tutorConfirmationA: string
  tutorConfirmationB: string
  learnerConfirmation: string
}

const INIT: FormData = {
  monthlyReview: 'No/False',
  threeMonthlyReview: 'No/False',
  changesNotes: '',
  activityTracker: '',
  reasonForStopping: '',
  tutorConfirmationA: 'No/False',
  tutorConfirmationB: 'No/False',
  learnerConfirmation: 'No/False',
}

function LearningSupportFormInner() {
  const router = useRouter()
  const { data: session } = useSession()
  const [form, setForm] = useState<FormData>(INIT)
  const [saving, setSaving] = useState(false)

  const set = (k: keyof FormData) => (val: string) => setForm(f => ({ ...f, [k]: val }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = (session?.user as any)?.accessToken
      if (token) await apiFetch('/forms/learning-support', token, { method: 'POST', body: JSON.stringify(form) }).catch(() => {})
      router.push('/dashboard')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 860, ...FF }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>5.Learning Support Form</h1>
      </div>

      <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>

        {/* ── Section 1: Learning Support Documents ── */}
        <div style={SECTION_HDR}>1) Learning Support Documents</div>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', background: '#fafafa', border: '1px dashed rgba(28,28,28,0.15)', borderRadius: 8 }}>
            <img src={iconPaperClip} width={14} height={14} alt="" />
            <span style={font(12, 400, '#888')}>Nothing is attached. Please Attach Learning Support Plan</span>
            <label style={{ marginLeft: 'auto', padding: '5px 14px', background: '#1c1c1c', color: '#fff', borderRadius: 6, cursor: 'pointer', ...font(12, 500, '#fff') }}>
              <input type="file" style={{ display: 'none' }} accept=".pdf,.doc,.docx" />
              Attach file
            </label>
          </div>
        </div>

        {/* ── Section 2: When will the support plan be reviewed? ── */}
        <div style={SECTION_HDR}>2) When will the support plan be reviewed?</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
          <div style={{ padding: '0 0 12px', borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
            <p style={{ ...font(12, 400, '#555'), margin: '0 0 4px', lineHeight: '18px' }}>Regular Learning Support reviews to take place with the learner</p>
            <p style={{ ...font(12, 400, '#555'), margin: '0 0 4px', lineHeight: '18px' }}>Normal expectation would be to update the learning support plan on a monthly basis if support is being provided.</p>
            <p style={{ ...font(12, 400, '#555'), margin: 0, lineHeight: '18px' }}>If a learner refuses additional Learning Support then the plan will need to be reviewed every three month to take into account any changes in the learners circumstances.</p>
          </div>
          <div>
            <label style={{ ...font(12, 500), display: 'block', marginBottom: 6 }}>Monthly support review</label>
            <SelectInput value={form.monthlyReview} onChange={set('monthlyReview')} />
          </div>
          <div>
            <label style={{ ...font(12, 500), display: 'block', marginBottom: 6 }}>3 monthly support review</label>
            <SelectInput value={form.threeMonthlyReview} onChange={set('threeMonthlyReview')} />
          </div>
        </div>

        {/* ── Section 3: Monthly Support Review ── */}
        <div style={SECTION_HDR}>3) Monthly Support Review</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
          <div>
            <label style={{ ...font(12, 500), display: 'block', marginBottom: 6 }}>Have there been any changes too the plan?</label>
            <input
              value={form.changesNotes}
              onChange={e => setForm(f => ({ ...f, changesNotes: e.target.value }))}
              style={INPUT_STYLE}
              placeholder=""
            />
          </div>
          <div>
            <p style={{ ...font(12, 400, '#555'), margin: '0 0 4px', lineHeight: '18px' }}>Additional Learning Support given to learners must be logged below on the Activity Tracker</p>
            <p style={{ ...font(12, 400, '#555'), margin: '0 0 8px', lineHeight: '18px' }}>To use the tracker, click on the green + button to add a new entry</p>
            <label style={{ ...font(12, 500), display: 'block', marginBottom: 6 }}>Activity Tracker</label>
            <input
              value={form.activityTracker}
              onChange={e => setForm(f => ({ ...f, activityTracker: e.target.value }))}
              style={INPUT_STYLE}
              placeholder=""
            />
          </div>
          <div>
            <label style={{ ...font(12, 500), display: 'block', marginBottom: 6 }}>Reason for stopping support</label>
            <input
              value={form.reasonForStopping}
              onChange={e => setForm(f => ({ ...f, reasonForStopping: e.target.value }))}
              style={INPUT_STYLE}
              placeholder=""
            />
          </div>
        </div>

        {/* ── Section 4: Tutor Confirmation ── */}
        <div style={SECTION_HDR}>4) Tutor Confirmation of the plan</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16, borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
          <div>
            <p style={{ ...font(12, 400, '#555'), margin: '0 0 8px', lineHeight: '18px' }}>
              a) I am satisfied the adjustments made to the learner's programme are required and deemed reasonable in order to address their barriers to learning and that there is a delivery cost in providing these. Without the support above it is thought the learner would be unlikely to achieve or would face significant difficulties achieving or remaining on programme. Learning Support Funding (LSF) to be claimed
            </p>
            <SelectInput value={form.tutorConfirmationA} onChange={set('tutorConfirmationA')} />
          </div>
          <div>
            <p style={{ ...font(12, 400, '#555'), margin: '0 0 8px', lineHeight: '18px' }}>
              b) I am satisfied that the planned adjustments would be beneficial to the learner though these will not result in additional costs being incurred and / or the needs affected would not have material impact on ability to successfully engage in learning day to day. LSF Funding will not be claimed.
            </p>
            <SelectInput value={form.tutorConfirmationB} onChange={set('tutorConfirmationB')} />
          </div>
        </div>

        {/* ── Section 5: Learner Confirmation ── */}
        <div style={SECTION_HDR}>5) Learner confirmation of the plan</div>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
          <p style={{ ...font(12, 400, '#555'), margin: '0 0 8px', lineHeight: '18px' }}>
            I agree that the adjustments identified are necessary and without which I believe the completion of my apprenticeship would be at risk and that the activities identified are reasonable in order to address my barriers to learning. I agree that this information can be shared with The Prime College and my Employer.
          </p>
          <SelectInput value={form.learnerConfirmation} onChange={set('learnerConfirmation')} />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: 12 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '9px 22px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', ...font(13, 500, '#fff') }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => router.back()}
            style={{ padding: '9px 22px', background: '#fff', color: '#1c1c1c', border: '1px solid rgba(28,28,28,0.25)', borderRadius: 8, cursor: 'pointer', ...font(13, 500) }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Page() { return <Suspense><LearningSupportFormInner /></Suspense> }
