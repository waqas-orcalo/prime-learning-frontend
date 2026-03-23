'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

/* ── SVG icons ── */
const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const STEPS = [
  'Expert Witness/ Witness',
  'Expert Witness Name & Contact',
  'Expert Witness Status/ Criteria',
  'Authenticating Documents',
  'Declarations',
]

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid rgba(28,28,28,0.2)',
  borderRadius: 8, outline: 'none', boxSizing: 'border-box',
  ...font(13), background: '#fafafa'
}
const LABEL_STYLE: React.CSSProperties = { ...font(12, 500, '#555'), marginBottom: 4, display: 'block' }

interface FormData {
  witnessType: string[]
  title: string
  firstName: string
  lastName: string
  companyName: string
  position: string
  telephone: string
  address: string
  postalCode: string
  email: string
  relationshipToLearner: string
  comment: string
  criteria: {
    hasNOS: boolean
    hasExpertise: boolean
    hasQualification: boolean
    hasProfessionalRole: boolean
    hasBeenInducted: boolean
  }
  authDocuments: string
  declarations: boolean
}

const INITIAL_FORM: FormData = {
  witnessType: [],
  title: '',
  firstName: '',
  lastName: '',
  companyName: '',
  position: '',
  telephone: '',
  address: '',
  postalCode: '',
  email: '',
  relationshipToLearner: '',
  comment: '',
  criteria: {
    hasNOS: false,
    hasExpertise: false,
    hasQualification: false,
    hasProfessionalRole: false,
    hasBeenInducted: false,
  },
  authDocuments: '',
  declarations: false,
}

/* ── Step components ── */
function StepTypeSelection({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const toggle = (val: string) => {
    setForm(f => ({
      ...f,
      witnessType: f.witnessType.includes(val)
        ? f.witnessType.filter(v => v !== val)
        : [...f.witnessType, val],
    }))
  }
  return (
    <div>
      <h2 style={font(16, 600)}>Expert Witness/ Witness</h2>
      <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '20px', marginTop: 16, border: '1px solid rgba(28,28,28,0.1)' }}>
        <p style={{ ...font(14), marginBottom: 16 }}>What kind of actor are you going to present?</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Expert Witness', 'Witness'].map(opt => (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.witnessType.includes(opt)}
                onChange={() => toggle(opt)}
                style={{ width: 15, height: 15 }}
              />
              <span style={font(14)}>{opt}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepNameContact({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div>
      <h2 style={font(16, 600)}>Expert Witness Name &amp; Contact</h2>
      <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '20px', marginTop: 16, border: '1px solid rgba(28,28,28,0.1)', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Row 1: Title + First name + Last name */}
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: 12 }}>
          <div>
            <label style={LABEL_STYLE}>Title</label>
            <select value={form.title} onChange={set('title')} style={{ ...INPUT_STYLE }}>
              <option value="">Select</option>
              {['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL_STYLE}>First name*</label>
            <input placeholder="Text" value={form.firstName} onChange={set('firstName')} style={INPUT_STYLE} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Last name*</label>
            <input placeholder="Text" value={form.lastName} onChange={set('lastName')} style={INPUT_STYLE} />
          </div>
        </div>

        {/* Row 2: Company + Position + Telephone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={LABEL_STYLE}>Company name*</label>
            <input placeholder="Text" value={form.companyName} onChange={set('companyName')} style={INPUT_STYLE} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Position*</label>
            <input placeholder="Text" value={form.position} onChange={set('position')} style={INPUT_STYLE} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Telephone*</label>
            <input placeholder="Text" value={form.telephone} onChange={set('telephone')} style={INPUT_STYLE} />
          </div>
        </div>

        {/* Row 3: Address + Postal Code + Email */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={LABEL_STYLE}>Address*</label>
            <input placeholder="Text" value={form.address} onChange={set('address')} style={INPUT_STYLE} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Postal Code</label>
            <input placeholder="Text" value={form.postalCode} onChange={set('postalCode')} style={INPUT_STYLE} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Email*</label>
            <input placeholder="Text" type="email" value={form.email} onChange={set('email')} style={INPUT_STYLE} />
          </div>
        </div>

      </div>
    </div>
  )
}

function StepStatusCriteria({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const setCriteria = (k: keyof FormData['criteria']) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, criteria: { ...f.criteria, [k]: e.target.checked } }))

  const CRITERIA = [
    { key: 'hasNOS' as const, label: 'The expert witness MUST *', desc: 'Have a working knowledge of National Occupational Standards for the units which they will be providing a testimony for' },
    { key: 'hasExpertise' as const, label: 'AND*', desc: 'Have current expertise and occupational competence i.e. within the last two years either as a practitioner or manager' },
    { key: 'hasQualification' as const, label: 'AND the expert witness MUST EITHER*', desc: 'Have either a qualification in learning activity of workplace performance eg D32/33, A1/A2 or L20' },
    { key: 'hasProfessionalRole' as const, label: 'OR', desc: 'Have a professional work role which involves evaluating the everyday practice of staff working in this sector' },
    { key: 'hasBeenInducted' as const, label: 'AND the expert witness MUST *', desc: "Have been inducted by the centre so they are familiar with the standards for which they will provide a testimony and understand the centre's recording requirements" },
  ]

  return (
    <div>
      <h2 style={font(16, 600)}>Expert Witness Status/ Criteria</h2>
      <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '20px', marginTop: 16, border: '1px solid rgba(28,28,28,0.1)', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div>
          <label style={LABEL_STYLE}>Relationship to learner*</label>
          <input
            placeholder="Text"
            value={form.relationshipToLearner}
            onChange={e => setForm(f => ({ ...f, relationshipToLearner: e.target.value }))}
            style={INPUT_STYLE}
          />
        </div>

        <div>
          <label style={LABEL_STYLE}>Comment</label>
          <input
            placeholder="Text"
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            style={INPUT_STYLE}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
          {CRITERIA.map(({ key, label, desc }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '12px 14px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: 8, background: '#fff' }}>
              <input
                type="checkbox"
                checked={form.criteria[key]}
                onChange={setCriteria(key)}
                style={{ width: 15, height: 15, marginTop: 2, flexShrink: 0 }}
              />
              <div>
                <p style={{ ...font(13, 600), margin: 0, marginBottom: 2 }}>{label}</p>
                <p style={{ ...font(12, 400, '#555'), margin: 0, lineHeight: '18px' }}>{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepAuthDocuments({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  return (
    <div>
      <h2 style={font(16, 600)}>Authenticating Documents</h2>
      <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '20px', marginTop: 16, border: '1px solid rgba(28,28,28,0.1)' }}>
        <p style={{ ...font(14, 400, '#555'), marginBottom: 16, lineHeight: '22px' }}>
          Please provide any supporting documents that authenticate the expert witness&rsquo;s credentials and qualifications.
        </p>
        <div>
          <label style={LABEL_STYLE}>Document reference or notes</label>
          <textarea
            placeholder="Enter notes or references to supporting documents..."
            value={form.authDocuments}
            onChange={e => setForm(f => ({ ...f, authDocuments: e.target.value }))}
            rows={5}
            style={{ ...INPUT_STYLE, resize: 'vertical', height: 120 }}
          />
        </div>
      </div>
    </div>
  )
}

function StepDeclarations({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  return (
    <div>
      <h2 style={font(16, 600)}>Declarations</h2>
      <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '20px', marginTop: 16, border: '1px solid rgba(28,28,28,0.1)' }}>
        <p style={{ ...font(14, 400, '#555'), marginBottom: 16, lineHeight: '22px' }}>
          By submitting this form, you confirm that the information provided is accurate and that the expert witness meets the required criteria.
        </p>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.declarations}
            onChange={e => setForm(f => ({ ...f, declarations: e.target.checked }))}
            style={{ width: 15, height: 15, marginTop: 3, flexShrink: 0 }}
          />
          <span style={{ ...font(14, 500), lineHeight: '22px' }}>
            I confirm that I have read and understood the requirements for an Expert Witness/ Witness and that the person named above meets these requirements. I declare that the information provided is true and accurate to the best of my knowledge.
          </span>
        </label>
      </div>
    </div>
  )
}

function CreateExpertWitnessInner() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const token = (session?.user as any)?.accessToken
      // TODO: wire to API when endpoint is available
      await new Promise(r => setTimeout(r, 800))
      router.push('/learning-activities/expert-witnesses')
    } catch (e: any) {
      setError(e.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const STEP_COMPONENTS = [
    <StepTypeSelection key={0} form={form} setForm={setForm} />,
    <StepNameContact key={1} form={form} setForm={setForm} />,
    <StepStatusCriteria key={2} form={form} setForm={setForm} />,
    <StepAuthDocuments key={3} form={form} setForm={setForm} />,
    <StepDeclarations key={4} form={form} setForm={setForm} />,
  ]

  const isLastStep = currentStep === STEPS.length - 1

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, ...FF }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, flexShrink: 0 }}
        >
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>Create Expert/ Witnesses</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
        {/* Sidebar */}
        <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, padding: '16px 0', height: 'fit-content' }}>
          <p style={{ ...font(12, 600, '#888'), padding: '0 16px 12px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Information &amp; Options
          </p>
          {STEPS.map((step, i) => {
            const isActive = i === currentStep
            const isDone = i < currentStep
            return (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 16px',
                  background: isActive ? '#1c1c1c' : 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderRadius: isActive ? 0 : 0,
                }}
              >
                {/* Step circle indicator */}
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? '#fff' : isDone ? '#22c55e' : 'transparent',
                  border: isActive ? '2px solid #fff' : isDone ? 'none' : '1.5px solid rgba(28,28,28,0.3)',
                  fontSize: 10, fontWeight: 600,
                  color: isActive ? '#1c1c1c' : isDone ? '#fff' : '#888',
                }}>
                  {isDone ? '✓' : i + 1}
                </span>
                <span style={font(13, isActive ? 500 : 400, isActive ? '#fff' : isDone ? '#1c1c1c' : '#555')}>
                  {step}
                </span>
                {/* Arrow indicator */}
                <span style={{ marginLeft: 'auto', color: isActive ? '#fff' : '#aaa', fontSize: 16 }}>›</span>
              </button>
            )
          })}
        </div>

        {/* Step content */}
        <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, padding: '24px' }}>
          {STEP_COMPONENTS[currentStep]}

          {error && (
            <p style={{ ...font(13, 400, '#e53e3e'), marginTop: 16 }}>{error}</p>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button
              onClick={() => isLastStep ? handleSubmit() : handleNext()}
              disabled={submitting}
              style={{
                background: submitting ? '#555' : '#1c1c1c', color: '#fff',
                border: 'none', borderRadius: 8, padding: '10px 24px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                ...font(14, 500, '#fff')
              }}
            >
              {submitting ? 'Submitting…' : isLastStep ? 'Submit' : 'Next'}
            </button>
            <button
              onClick={() => router.push('/learning-activities/expert-witnesses')}
              style={{
                background: '#fff', color: '#1c1c1c',
                border: '1px solid rgba(28,28,28,0.3)', borderRadius: 8,
                padding: '10px 24px', cursor: 'pointer', ...font(14, 500)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <CreateExpertWitnessInner />
    </Suspense>
  )
}
