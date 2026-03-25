'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';

// Font configuration
const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const;
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties);

// Demo data
const demoLearner = {
  id: 'learner-001',
  name: 'Sarah Thompson',
  programme: 'Level 3 Business Administrator',
  employer: 'Acme Corp',
  status: 'On Track' as const,
  startDate: '01/09/2024',
  endDate: '01/09/2025',
  progress: 62,
  avatar: 'ST',
};

const demoEvidence = [
  { id: 1, title: 'Customer Service Report', date: '15/03/2026', status: 'Approved' },
  { id: 2, title: 'Project Management Case Study', date: '12/03/2026', status: 'Pending' },
  { id: 3, title: 'Excel Spreadsheet Analysis', date: '08/03/2026', status: 'Under Review' },
  { id: 4, title: 'Communication Training Notes', date: '01/03/2026', status: 'Approved' },
];

const demoJournalEntries = [
  { id: 1, title: 'First week impressions', date: '05/09/2024', category: 'Reflection' },
  { id: 2, title: 'Team collaboration breakthrough', date: '20/02/2026', category: 'Achievement' },
  { id: 3, title: 'Learning from feedback', date: '18/03/2026', category: 'Development' },
];

const demoReviews = [
  { id: 1, date: '01/03/2026', trainer: 'Mike Johnson', outcome: 'On Track' },
  { id: 2, date: '01/12/2025', trainer: 'Emma Davis', outcome: 'Progressing Well' },
];

const demoKSB = {
  knowledge: { completed: 4, total: 6 },
  skills: { completed: 3, total: 5 },
  behaviours: { completed: 2, total: 3 },
};

// Status badge color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'On Track':
    case 'Approved':
    case 'Progressing Well':
      return '#10b981';
    case 'Behind':
    case 'Pending':
      return '#f59e0b';
    case 'At Risk':
    case 'Under Review':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

// Accordion section component
const AccordionSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: '#f9fafb',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...font(14, 600),
        }}
      >
        <span>{title}</span>
        <span
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            fontSize: '18px',
          }}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
          {children}
        </div>
      )}
    </div>
  );
};

// Evidence item component
const EvidenceItem: React.FC<{ item: typeof demoEvidence[0] }> = ({ item }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      paddingBottom: '12px',
      marginBottom: '12px',
      borderBottom: '1px solid #f3f4f6',
    }}
  >
    <div
      style={{
        fontSize: '20px',
        marginTop: '2px',
      }}
    >
      📄
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ ...font(13, 600), marginBottom: '4px' }}>{item.title}</div>
      <div style={{ ...font(12, 400, '#6b7280') }}>{item.date}</div>
    </div>
    <div
      style={{
        padding: '4px 10px',
        borderRadius: '4px',
        backgroundColor: getStatusColor(item.status),
        ...font(11, 500, '#ffffff'),
      }}
    >
      {item.status}
    </div>
  </div>
);

// Journal entry component
const JournalEntryItem: React.FC<{ entry: typeof demoJournalEntries[0] }> = ({ entry }) => (
  <div
    style={{
      paddingBottom: '12px',
      marginBottom: '12px',
      borderBottom: '1px solid #f3f4f6',
    }}
  >
    <div style={{ ...font(13, 600), marginBottom: '4px' }}>{entry.title}</div>
    <div
      style={{
        display: 'flex',
        gap: '8px',
        ...font(12, 400, '#6b7280'),
      }}
    >
      <span>{entry.date}</span>
      <span>•</span>
      <span
        style={{
          padding: '2px 8px',
          backgroundColor: '#dbeafe',
          color: '#0369a1',
          borderRadius: '3px',
          ...font(11, 500),
        }}
      >
        {entry.category}
      </span>
    </div>
  </div>
);

// Review item component
const ReviewItem: React.FC<{ review: typeof demoReviews[0] }> = ({ review }) => (
  <div
    style={{
      paddingBottom: '12px',
      marginBottom: '12px',
      borderBottom: '1px solid #f3f4f6',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
      <div style={{ ...font(13, 600) }}>Review by {review.trainer}</div>
      <div
        style={{
          padding: '4px 10px',
          borderRadius: '4px',
          backgroundColor: getStatusColor(review.outcome),
          ...font(11, 500, '#ffffff'),
        }}
      >
        {review.outcome}
      </div>
    </div>
    <div style={{ ...font(12, 400, '#6b7280') }}>{review.date}</div>
  </div>
);

// KSB card component
const KSBCard: React.FC<{ label: string; completed: number; total: number }> = ({ label, completed, total }) => {
  const percentage = (completed / total) * 100;

  return (
    <div
      style={{
        flex: 1,
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ ...font(13, 600, '#1c1c1c'), marginBottom: '8px' }}>{label}</div>
      <div style={{ ...font(16, 700, '#10b981'), marginBottom: '8px' }}>
        {completed}/{total}
      </div>
      <div
        style={{
          height: '4px',
          backgroundColor: '#e5e7eb',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: '#10b981',
            width: `${percentage}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};

export default function LearnerPortfolioPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: '24px' }}>
      {/* Back button + title row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px',
        }}
      >
        <button
          onClick={() => window.history.back()}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#1c1c1c',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: '#ffffff',
          }}
          title="Go back"
        >
          ←
        </button>
        <h1 style={{ ...font(22, 700), margin: 0 }}>Learner Portfolio</h1>
      </div>

      {/* Learner Info Card */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...font(18, 600, '#ffffff'),
              flexShrink: 0,
            }}
          >
            {demoLearner.avatar}
          </div>

          {/* Learner details */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h2 style={{ ...font(18, 700), margin: 0 }}>{demoLearner.name}</h2>
              <div
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: getStatusColor(demoLearner.status),
                  ...font(11, 600, '#ffffff'),
                }}
              >
                {demoLearner.status}
              </div>
            </div>
            <div style={{ ...font(13, 400, '#6b7280'), marginBottom: '4px' }}>
              {demoLearner.programme}
            </div>
            <div style={{ ...font(13, 400, '#6b7280'), marginBottom: '12px' }}>
              {demoLearner.employer}
            </div>
            <div style={{ ...font(12, 400, '#6b7280') }}>
              <span style={{ marginRight: '16px' }}>Start: {demoLearner.startDate}</span>
              <span>End: {demoLearner.endDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview Section */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          marginBottom: '32px',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <div style={{ ...font(14, 600) }}>Overall Progress</div>
            <div style={{ ...font(16, 700, '#10b981') }}>{demoLearner.progress}%</div>
          </div>
          <div
            style={{
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: '#10b981',
                width: `${demoLearner.progress}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <div>
            <div style={{ ...font(12, 400, '#6b7280'), marginBottom: '4px' }}>Units Completed</div>
            <div style={{ ...font(16, 700) }}>4/8</div>
          </div>
          <div>
            <div style={{ ...font(12, 400, '#6b7280'), marginBottom: '4px' }}>OTJ Hours</div>
            <div style={{ ...font(16, 700) }}>120/200</div>
          </div>
          <div>
            <div style={{ ...font(12, 400, '#6b7280'), marginBottom: '4px' }}>Reviews Done</div>
            <div style={{ ...font(16, 700) }}>3/4</div>
          </div>
        </div>
      </div>

      {/* Portfolio Sections */}

      {/* Evidence & Assignments */}
      <AccordionSection title="Evidence & Assignments" defaultOpen={true}>
        {demoEvidence.map((item) => (
          <EvidenceItem key={item.id} item={item} />
        ))}
      </AccordionSection>

      {/* Learning Journal Entries */}
      <AccordionSection title="Learning Journal Entries" defaultOpen={false}>
        {demoJournalEntries.map((entry) => (
          <JournalEntryItem key={entry.id} entry={entry} />
        ))}
      </AccordionSection>

      {/* Progress Reviews */}
      <AccordionSection title="Progress Reviews" defaultOpen={false}>
        {demoReviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </AccordionSection>

      {/* KSB Mapping */}
      <AccordionSection title="KSB Mapping" defaultOpen={false}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          <KSBCard label="Knowledge" completed={demoKSB.knowledge.completed} total={demoKSB.knowledge.total} />
          <KSBCard label="Skills" completed={demoKSB.skills.completed} total={demoKSB.skills.total} />
          <KSBCard label="Behaviours" completed={demoKSB.behaviours.completed} total={demoKSB.behaviours.total} />
        </div>
      </AccordionSection>
    </div>
  );
}
