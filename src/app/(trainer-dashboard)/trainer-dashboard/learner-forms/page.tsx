'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const ICON_FILE   = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M4 2h6l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#1c1c1c" stroke-width="1.3"/><path d="M9 2v4h4" stroke="#1c1c1c" stroke-width="1.3" stroke-linejoin="round"/></svg>`)
const ICON_CARET  = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"><path d="M2 4.5l4 4 4-4" stroke="#1c1c1c" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

interface FormTemplate {
  name: string
  desc: string
  href?: string
  updated: string
}

interface Category {
  title: string
  forms: FormTemplate[]
}

const CATEGORIES: Category[] = [
  {
    title: '1. Initial Assessment & Onboarding',
    forms: [
      { name: 'Initial Assessment Form',     desc: 'Assess learner starting point and prior knowledge', updated: '12 Mar 2025' },
      { name: 'Individual Training Plan (ITP)', desc: 'Bespoke training plan tailored to each learner',   updated: '12 Mar 2025' },
      { name: 'Induction Checklist',          desc: 'Ensure all onboarding steps are completed',          updated: '10 Jan 2025' },
    ],
  },
  {
    title: '2. Progress Reviews',
    forms: [
      { name: 'Progress Review Form',         desc: 'Regular review of learner progress against targets', updated: '02 Apr 2025', href: '/forms/progress-review' },
      { name: 'Progress Review Action Plan',  desc: 'Document agreed actions from progress review',       updated: '02 Apr 2025' },
    ],
  },
  {
    title: '3. Off-The-Job Training',
    forms: [
      { name: 'OTJ Training Log',             desc: 'Record off-the-job training hours and activities',   updated: '15 Mar 2025' },
      { name: 'OTJ Training Declaration',     desc: 'Confirm off-the-job training completion',            updated: '15 Mar 2025' },
    ],
  },
  {
    title: '4. Learner Support',
    forms: [
      { name: 'Learning Support Form',        desc: 'Document any additional support requirements',        updated: '20 Feb 2025', href: '/forms/learning-support' },
      { name: 'Learner Feedback Form',        desc: 'Capture learner feedback on the programme',           updated: '20 Feb 2025', href: '/forms/learner-feedback' },
    ],
  },
  {
    title: '5. End Point Assessment',
    forms: [
      { name: 'EPA Readiness Declaration',    desc: 'Confirm learner is ready for end point assessment',  updated: '01 May 2025' },
      { name: 'Gateway Review Checklist',     desc: 'Checklist before progressing to gateway',            updated: '01 May 2025' },
      { name: 'EPA Confirmation Form',        desc: 'Formal confirmation of EPA booking',                 updated: '01 May 2025' },
    ],
  },
  {
    title: '6. Exit & Completion',
    forms: [
      { name: 'Exit Review Form',             desc: 'Programme evaluation on completion',                 updated: '08 Apr 2025', href: '/forms/exit-review' },
      { name: 'Learner Withdrawal Form',      desc: 'Process for learner withdrawal from programme',      updated: '08 Apr 2025' },
    ],
  },
]

function FormRow({ form, router }: { form: FormTemplate; router: ReturnType<typeof useRouter> }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
      borderBottom: '1px solid rgba(28,28,28,0.05)',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
      onMouseLeave={e => (e.currentTarget.style.background = '')}
    >
      <img src={ICON_FILE} width={16} height={16} alt="" style={{ flexShrink: 0, opacity: 0.6 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={font(13, 500)}>{form.name}</div>
        <div style={{ ...font(11, 400, '#888'), marginTop: 2 }}>{form.desc}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span style={{ ...font(11, 400, '#aaa'), whiteSpace: 'nowrap' }}>Updated {form.updated}</span>
        <span style={{
          padding: '2px 8px', borderRadius: 20,
          background: '#dcfce7', color: '#15803d', ...font(11, 500, '#15803d'),
        }}>Available</span>
        {form.href && (
          <button
            onClick={() => router.push(form.href!)}
            style={{
              padding: '5px 14px', background: '#1c1c1c', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer', ...font(11, 500, '#fff'),
            }}
          >
            Open
          </button>
        )}
      </div>
    </div>
  )
}

function CategoryCard({ category, defaultOpen = false, router }: { category: Category; defaultOpen?: boolean; router: ReturnType<typeof useRouter> }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: '#fafafa', border: 'none', cursor: 'pointer', textAlign: 'left',
          borderBottom: open ? '1px solid rgba(28,28,28,0.08)' : 'none',
        }}
      >
        <span style={font(14, 600)}>{category.title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ ...font(12, 400, '#aaa') }}>{category.forms.length} form{category.forms.length !== 1 ? 's' : ''}</span>
          <img src={ICON_CARET} width={12} height={12} alt="" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
        </div>
      </button>
      {open && category.forms.map(form => <FormRow key={form.name} form={form} router={router} />)}
    </div>
  )
}

export default function LearnerFormsPage() {
  const router = useRouter()
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
    <div style={{ maxWidth: 900, ...FF }}>
      <h1 style={{ ...font(22, 700), marginBottom: 8 }}>Learner Forms</h1>
      <p style={{ ...font(13, 400, '#666'), marginBottom: 24 }}>Access, manage and complete all learner-related forms throughout the programme lifecycle.</p>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search forms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: 400, padding: '9px 14px',
            border: '1px solid rgba(28,28,28,0.18)', borderRadius: 8,
            ...font(13), outline: 'none', background: '#fff', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0
          ? <p style={{ ...font(13, 400, '#aaa'), textAlign: 'center', padding: '40px 0' }}>No forms match your search.</p>
          : filtered.map((cat, i) => (
            <CategoryCard key={cat.title} category={cat} defaultOpen={i === 0} router={router} />
          ))
        }
      </div>
    </div>
  )
}
