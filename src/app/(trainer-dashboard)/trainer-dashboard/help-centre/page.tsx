'use client'

import { useState } from 'react'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

interface FaqItem { q: string; a: string }

const FAQS: { section: string; items: FaqItem[] }[] = [
  {
    section: 'Getting Started',
    items: [
      { q: 'How do I set up a new learner?', a: 'Navigate to the Learners section, click "Add Learner", and complete the onboarding form. The learner will receive an invitation email to create their account.' },
      { q: 'How do I assign tasks to learners?', a: 'Go to the Tasks section, click "Create Task", select the learner from the dropdown, set a due date, and describe the task. The learner will be notified immediately.' },
    ],
  },
  {
    section: 'Progress Reviews',
    items: [
      { q: 'How often should progress reviews be conducted?', a: 'ESFA guidelines recommend a minimum of every 12 weeks. Progress reviews should be documented in the Progress Review Form within the Learner Forms section.' },
      { q: 'What happens if a learner is falling behind?', a: 'Flag the learner as "At Risk" in their profile, schedule a catch-up session, document an action plan in the Progress Review, and consider contacting the employer if necessary.' },
    ],
  },
  {
    section: 'Off-The-Job Training',
    items: [
      { q: 'How do I record OTJ hours?', a: 'OTJ activities are logged by learners in the Learning Activities section. As a trainer you can verify entries and use the OTJ Training Log in Learner Forms to maintain records.' },
      { q: 'What counts as off-the-job training?', a: 'Any learning activity undertaken outside of normal working duties that contributes to the apprenticeship standard. This includes training courses, shadowing, mentoring, and relevant industry events.' },
    ],
  },
  {
    section: 'End Point Assessment',
    items: [
      { q: 'When is a learner ready for EPA?', a: 'A learner is ready for EPA when they have completed all mandatory off-the-job training hours, all knowledge, skills and behaviours (KSBs) are assessed as achieved, and a gateway review has been completed.' },
      { q: 'How do I complete the Gateway Review?', a: 'Access the Gateway Review Checklist in Learner Forms, complete all sections with the learner and their employer present, then submit to the relevant awarding organisation.' },
    ],
  },
  {
    section: 'Platform Support',
    items: [
      { q: 'How do I reset a learner\'s password?', a: 'You can request a password reset from the learner\'s profile page. Alternatively, the learner can use the "Forgot password" option on the login page.' },
      { q: 'Who do I contact for technical issues?', a: 'For technical platform issues, contact the support team at support@prime-learning.co.uk or use the live chat feature in the bottom-right of the screen.' },
    ],
  },
]

function FaqItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: '1px solid rgba(28,28,28,0.08)', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          borderBottom: open ? '1px solid rgba(28,28,28,0.08)' : 'none',
        }}
      >
        <span style={font(14, 500)}>{item.q}</span>
        <span style={{ fontSize: 18, color: '#888', fontWeight: 300, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none', flexShrink: 0, marginLeft: 12 }}>+</span>
      </button>
      {open && (
        <div style={{ padding: '12px 18px 14px' }}>
          <p style={{ ...font(13, 400, '#444'), margin: 0, lineHeight: 1.7 }}>{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpCentrePage() {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? FAQS.map(s => ({
        ...s,
        items: s.items.filter(i =>
          i.q.toLowerCase().includes(search.toLowerCase()) ||
          i.a.toLowerCase().includes(search.toLowerCase()),
        ),
      })).filter(s => s.items.length > 0)
    : FAQS

  return (
    <div style={{ maxWidth: 800, ...FF }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ ...font(28, 700), marginBottom: 8 }}>Help Centre</h1>
        <p style={font(14, 400, '#666')}>Find answers to common questions about using the trainer platform.</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 32 }}>
        <input
          type="text"
          placeholder="Search help articles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px',
            border: '1px solid rgba(28,28,28,0.18)', borderRadius: 10,
            ...font(14), outline: 'none', background: '#fff', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* FAQ sections */}
      {filtered.length === 0
        ? <p style={{ ...font(14, 400, '#aaa'), textAlign: 'center', padding: '40px 0' }}>No results found for "{search}".</p>
        : filtered.map(section => (
          <div key={section.section} style={{ marginBottom: 28 }}>
            <h2 style={{ ...font(16, 600), marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
              {section.section}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {section.items.map(item => <FaqItem key={item.q} item={item} />)}
            </div>
          </div>
        ))
      }

      {/* Contact support */}
      <div style={{ marginTop: 40, padding: '24px', background: '#f7f9fb', border: '1px solid rgba(28,28,28,0.08)', borderRadius: 12, textAlign: 'center' }}>
        <p style={font(14, 600)}>Still need help?</p>
        <p style={{ ...font(13, 400, '#666'), margin: '6px 0 14px' }}>Our support team is available Monday to Friday, 9am – 5pm.</p>
        <a href="mailto:support@prime-learning.co.uk" style={{
          display: 'inline-block', padding: '9px 22px', background: '#1c1c1c', color: '#fff',
          borderRadius: 8, textDecoration: 'none', ...font(13, 500, '#fff'),
        }}>
          Contact Support
        </a>
      </div>
    </div>
  )
}
