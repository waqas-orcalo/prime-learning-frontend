'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

interface FormTemplate {
  name: string
  desc: string
  updated: string
}

interface Category {
  title: string
  forms: FormTemplate[]
}

const CATEGORIES: Category[] = [
  {
    title: 'Initial Assessment & Onboarding',
    forms: [
      { name: 'Initial Assessment Form', desc: 'Assess learner prior knowledge and skills at start of programme', updated: '01/01/2025' },
      { name: 'Individual Training Plan (ITP)', desc: "Outline the learner's personalised training journey and objectives", updated: '01/01/2025' },
      { name: 'Induction Checklist', desc: 'Verify all induction activities have been completed for the learner', updated: '01/01/2025' },
    ],
  },
  {
    title: 'Progress Reviews',
    forms: [
      { name: 'Progress Review Form', desc: 'Quarterly review of learner progress against KSBs and off-the-job targets', updated: '01/03/2025' },
      { name: 'Progress Review Action Plan', desc: 'Record agreed actions and targets from the progress review meeting', updated: '01/03/2025' },
    ],
  },
  {
    title: 'Off-The-Job Training',
    forms: [
      { name: 'Off-The-Job Training Log', desc: 'Log learner off-the-job training hours and activities', updated: '15/02/2025' },
      { name: 'Off-The-Job Training Declaration', desc: 'Learner\'s declaration confirming recorded OTJ hours are accurate', updated: '15/02/2025' },
    ],
  },
  {
    title: 'End Point Assessment',
    forms: [
      { name: 'EPA Readiness Declaration', desc: 'Confirm learner is ready for End Point Assessment gateway', updated: '10/03/2025' },
      { name: 'Gateway Review Checklist', desc: 'Review all gateway requirements prior to EPA referral', updated: '10/03/2025' },
      { name: 'EPA Confirmation Form', desc: 'Formal confirmation of learner EPA booking and details', updated: '10/03/2025' },
    ],
  },
  {
    title: 'Exit & Completion',
    forms: [
      { name: 'Exit Review Form', desc: 'Conduct final review on programme completion or withdrawal', updated: '01/04/2025' },
      { name: 'Learner Withdrawal Form', desc: 'Record reasons and details for learner programme withdrawal', updated: '01/04/2025' },
    ],
  },
]

function FileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PrinterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function LeftArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function FormRow({ form, router }: { form: FormTemplate; router: ReturnType<typeof useRouter> }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '16px 18px',
      borderBottom: '1px solid rgba(28,28,28,0.08)',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
      onMouseLeave={e => (e.currentTarget.style.background = '')}
    >
      {/* Icon container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 6,
        background: '#e5e5e5',
        color: '#666',
        flexShrink: 0,
      }}>
        <FileIcon />
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={font(14, 600)}>{form.name}</div>
        <div style={{ ...font(12, 400, '#888'), marginTop: 4 }}>{form.desc}</div>
      </div>

      {/* Meta column */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
        flexShrink: 0,
      }}>
        <span style={{
          padding: '4px 10px',
          borderRadius: 16,
          background: '#dcfce7',
          color: '#15803d',
          ...font(11, 500, '#15803d'),
        }}>Available</span>
        <span style={{ ...font(11, 400, '#999') }}>Updated: {form.updated}</span>
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        {/* View button */}
        <button
          onClick={() => { /* Handle view */ }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            background: '#1c1c1c',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#333')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1c1c1c')}
          title="View"
        >
          <EyeIcon />
        </button>

        {/* Print button */}
        <button
          onClick={() => { /* Handle print */ }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            background: '#fff',
            color: '#1c1c1c',
            border: '1px solid rgba(28,28,28,0.18)',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#fafafa'
            e.currentTarget.style.borderColor = 'rgba(28,28,28,0.25)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.borderColor = 'rgba(28,28,28,0.18)'
          }}
          title="Print"
        >
          <PrinterIcon />
        </button>

        {/* Download button */}
        <button
          onClick={() => { /* Handle download */ }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            background: '#fff',
            color: '#1c1c1c',
            border: '1px solid rgba(28,28,28,0.18)',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#fafafa'
            e.currentTarget.style.borderColor = 'rgba(28,28,28,0.25)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.borderColor = 'rgba(28,28,28,0.18)'
          }}
          title="Download"
        >
          <DownloadIcon />
        </button>
      </div>
    </div>
  )
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <div style={{
      border: '1px solid rgba(28,28,28,0.1)',
      borderRadius: 8,
      overflow: 'hidden',
      background: '#fff',
    }}>
      {/* Category header */}
      <div style={{
        padding: '14px 18px',
        background: '#f5f5f5',
        borderBottom: '1px solid rgba(28,28,28,0.08)',
      }}>
        <span style={font(14, 600)}>{category.title}</span>
      </div>

      {/* Form rows */}
      {category.forms.map(form => (
        <FormRow key={form.name} form={form} router={useRouter()} />
      ))}
    </div>
  )
}

export default function LearnerFormsPage() {
  const router = useRouter()
  const [cohort, setCohort] = useState('All Cohorts')
  const [search, setSearch] = useState('')

  const filtered: Category[] = search.trim()
    ? CATEGORIES.map(cat => ({
        ...cat,
        forms: cat.forms.filter(f =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.desc.toLowerCase().includes(search.toLowerCase()),
        ),
      })).filter(cat => cat.forms.length > 0)
    : CATEGORIES

  return (
    <div style={{ ...FF, minHeight: '100vh', background: '#fff' }}>
      {/* Back button and header */}
      <div style={{ padding: '24px 0', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#1c1c1c',
            border: 'none',
            cursor: 'pointer',
            color: '#fff',
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#333')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1c1c1c')}
        >
          <LeftArrowIcon />
        </button>

        <div style={{ flex: 1 }}>
          <h1 style={{ ...font(28, 700), marginBottom: 8 }}>Learner Forms</h1>
          <p style={{ ...font(14, 400, '#666') }}>Access and manage learner forms across the programme lifecycle</p>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        background: '#fff',
        border: '1px solid rgba(28,28,28,0.1)',
        borderRadius: 8,
        marginBottom: 24,
      }}>
        {/* Cohort dropdown */}
        <label style={{ ...font(13, 500), whiteSpace: 'nowrap' }}>Cohort:</label>
        <button
          onClick={() => { /* Handle cohort dropdown */ }}
          style={{
            padding: '8px 12px',
            background: '#fff',
            border: '1px solid rgba(28,28,28,0.18)',
            borderRadius: 6,
            cursor: 'pointer',
            ...font(13, 400),
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
          onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
        >
          {cohort}
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search forms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid rgba(28,28,28,0.18)',
            borderRadius: 6,
            ...font(13),
            outline: 'none',
            background: '#fff',
            boxSizing: 'border-box',
          }}
        />

        {/* Search icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#999', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.length === 0 ? (
          <p style={{ ...font(14, 400, '#aaa'), textAlign: 'center', padding: '60px 20px' }}>
            No forms match your search.
          </p>
        ) : (
          filtered.map(cat => (
            <CategoryCard key={cat.title} category={cat} />
          ))
        )}
      </div>
    </div>
  )
}
