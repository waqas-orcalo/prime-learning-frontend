'use client'

import { useState } from 'react'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

interface FaqItem { q: string; a: string }

const FAQS: FaqItem[] = [
  { q: 'How do I review a learner\'s journal entry?', a: 'Go to Learning Journals in the sidebar. You\'ll see all submitted journal entries. Click on any entry to expand it, read the reflection, and then add your feedback or mark it as reviewed.' },
  { q: 'How do I assign a task to a learner?', a: 'Navigate to Tasks and click \'Create Task\'. Fill in the task title, description, due date, priority, and select the learner. Click Save to assign it.' },
  { q: 'What do the learner statuses mean?', a: '\'On Track\' means the learner is progressing as expected. \'Behind\' means they have fallen slightly behind schedule and may need support. \'At Risk\' means they are significantly behind and require immediate intervention.' },
  { q: 'How do I update a learner\'s scorecard?', a: 'Navigate to Scorecard in the sidebar. You\'ll see the KSB assessment grid for each learner. Click the rating dots to update a learner\'s rating for each competency.' },
  { q: 'Can I message all my learners at once?', a: 'Currently, messages are sent per conversation. For group announcements, use your platform administrator or the Resources section to post shared information.' },
  { q: 'How is the \'Overall Progress\' percentage calculated?', a: 'Overall progress reflects the percentage of units marked as completed out of the total required units for the learner\'s programme.' },
]

const RESOURCES = [
  { label: 'Trainer Handbook', desc: 'Complete guide to your role and responsibilities as a trainer.', icon: 'book' },
  { label: 'EPA Guidelines', desc: 'End Point Assessment guidance and preparation materials.', icon: 'book' },
  { label: 'KSB Framework Reference', desc: 'Full Knowledge, Skills & Behaviours framework for all programmes.', icon: 'book' },
  { label: 'Contact Support', desc: 'Reach our helpdesk team for technical or account issues.', icon: 'headset' },
]

function HelpIcon() {
  return (
    <svg viewBox="0 0 40 40" width={40} height={40} fill="none" stroke="white" strokeWidth={1.5} style={{ opacity: 0.8 }}>
      <circle cx="20" cy="20" r="18.5" />
      <path d="M17.5 15c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 1.15-.8 2.15-1.9 2.45v1.05" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="28" r="0.8" fill="white" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20m-2 8v-8m0 8H6.5a2.5 2.5 0 0 1-2.5-2.5V6a2.5 2.5 0 0 1 2.5-2.5h13.5a2.5 2.5 0 0 1 2.5 2.5v11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeadsetIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6M3 18a9 9 0 0 0 18 0M3 18h-2v4a2 2 0 0 0 2 2h2M21 18h2v4a2 2 0 0 1-2 2h-2M9 13a3 3 0 0 0 6 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function FaqItem({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          borderBottom: index < FAQS.length - 1 ? '1px solid rgba(28,28,28,0.08)' : 'none',
        }}
      >
        <span style={font(14, 500)}>{item.q}</span>
        <span style={{ flexShrink: 0, marginLeft: 16, color: '#888', display: 'flex', alignItems: 'center' }}>
          <ChevronIcon open={open} />
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: '16px' }}>
          <p style={{ ...font(14, 400, '#666'), margin: 0, lineHeight: 1.6 }}>{item.a}</p>
        </div>
      )}
    </div>
  )
}

function ResourceItem({ item }: { item: typeof RESOURCES[0] }) {
  const iconColor = '#1c1c1c'
  return (
    <div style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px', cursor: 'pointer', transition: 'background-color 0.2s', userSelect: 'none' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(30,30,45,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: iconColor }}>
        {item.icon === 'book' ? <BookIcon /> : <HeadsetIcon />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={font(14, 600)}>{item.label}</span>
          <span style={{ opacity: 0.5, display: 'flex', alignItems: 'center', color: '#1c1c1c' }}>
            <ExternalLinkIcon />
          </span>
        </div>
        <p style={{ ...font(12, 400, '#999'), margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
      </div>
    </div>
  )
}

export default function HelpCentrePage() {
  return (
    <div style={{ maxWidth: '800px', ...FF }}>
      {/* 1. Hero Card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: '#1c1c1c', padding: '28px', borderRadius: '12px', marginBottom: '32px' }}>
        <div style={{ flexShrink: 0 }}>
          <HelpIcon />
        </div>
        <div>
          <h1 style={{ ...font(20, 700, 'white'), margin: 0, marginBottom: '6px' }}>How can we help you?</h1>
          <p style={{ ...font(14, 400, 'rgba(255,255,255,0.7)'), margin: 0 }}>Browse FAQs, read guides, or contact support below.</p>
        </div>
      </div>

      {/* 2. FAQs Section */}
      <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: '12px', marginBottom: '32px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(28,28,28,0.1)', background: '#fafbfc' }}>
          <h2 style={font(15, 600)}>Frequently Asked Questions</h2>
        </div>
        <div style={{ padding: '0 20px' }}>
          {FAQS.map((item, idx) => (
            <FaqItem key={idx} item={item} index={idx} />
          ))}
        </div>
      </div>

      {/* 3. Resources & Support Section */}
      <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(28,28,28,0.1)', background: '#fafbfc' }}>
          <h2 style={font(15, 600)}>Resources & Support</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: 'rgba(28,28,28,0.1)', gap: '1px' }}>
          {RESOURCES.map((item, idx) => (
            <div key={idx} style={{ background: 'white' }}>
              <ResourceItem item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
