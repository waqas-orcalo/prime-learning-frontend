'use client'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const ICON_BOOK = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none"><rect x="4" y="4" width="32" height="32" rx="4" stroke="#ccc" stroke-width="1.5"/><path d="M12 14h16M12 20h16M12 26h10" stroke="#ccc" stroke-width="1.5" stroke-linecap="round"/></svg>`)

const MOCK_COURSES = [
  { id: '1', title: 'Level 3 Team Leader/Supervisor', learners: 12, status: 'Active',   progress: 68 },
  { id: '2', title: 'Level 5 Operations Management',  learners: 7,  status: 'Active',   progress: 44 },
  { id: '3', title: 'Level 2 Customer Service',       learners: 20, status: 'Active',   progress: 82 },
  { id: '4', title: 'Level 4 Sales Executive',        learners: 5,  status: 'Upcoming', progress: 0  },
]

export default function CoursesPage() {
  return (
    <div style={{ maxWidth: 1100, ...FF }}>
      <h1 style={{ ...font(22, 700), marginBottom: 8 }}>Courses</h1>
      <p style={{ ...font(13, 400, '#666'), marginBottom: 28 }}>Apprenticeship programmes and courses assigned to you.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {MOCK_COURSES.map(course => (
          <div key={course.id} style={{
            border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12, padding: '20px',
            background: '#fff', display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <img src={ICON_BOOK} width={40} height={40} alt="" style={{ flexShrink: 0 }} />
              <div>
                <div style={font(13, 600)}>{course.title}</div>
                <div style={{ ...font(11, 400, '#888'), marginTop: 3 }}>{course.learners} learners enrolled</div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={font(11, 400, '#888')}>Overall Progress</span>
                <span style={font(11, 600)}>{course.progress}%</span>
              </div>
              <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${course.progress}%`, background: '#1c1c1c', borderRadius: 3 }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                padding: '3px 10px', borderRadius: 20,
                background: course.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                color: course.status === 'Active' ? '#15803d' : '#374151',
                ...font(11, 500, course.status === 'Active' ? '#15803d' : '#374151'),
              }}>
                {course.status}
              </span>
              <button style={{
                padding: '5px 14px', background: '#1c1c1c', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer', ...font(11, 500, '#fff'),
              }}>
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ ...font(12, 400, '#aaa'), marginTop: 24, textAlign: 'center' }}>
        Course data will be loaded from your programme management system.
      </p>
    </div>
  )
}
