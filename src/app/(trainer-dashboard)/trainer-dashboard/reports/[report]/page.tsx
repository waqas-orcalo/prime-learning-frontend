'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const;
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties);

type ReportConfig = {
  title: string;
  filters: FilterField[];
  columns: Column[];
  sampleRows: Row[];
};

type FilterField = {
  id: string;
  label: string;
  type: 'date' | 'select';
  options?: string[];
};

type Column = {
  key: string;
  label: string;
  isLink?: boolean;
  isProgress?: boolean;
  isDeviation?: boolean;
  width?: string;
};

type Row = {
  [key: string]: string | number | { progress: number; target: number };
};

const REPORT_CONFIGS: Record<string, ReportConfig> = {
  'learners-last-logged-in': {
    title: 'Learners Last Logged In',
    filters: [
      { id: 'dateFrom', label: 'Date From', type: 'date' },
      { id: 'dateTo', label: 'Date To', type: 'date' },
    ],
    columns: [
      { key: 'learner', label: 'Learner', isLink: true },
      { key: 'lastLoggedIn', label: 'Last Logged In' },
    ],
    sampleRows: [{ learner: 'Mr Rakker Joe', lastLoggedIn: '2026-03-20' }],
  },
  'progress-reviews-due': {
    title: 'Progress Reviews Due',
    filters: [
      { id: 'reportGroup', label: 'Report Group', type: 'select', options: ['All', 'Group A', 'Group B'] },
      { id: 'learner', label: 'Learner', type: 'select', options: ['All Learners', 'Hide Archived'] },
      { id: 'cohort', label: 'Cohort', type: 'select', options: ['Show All', 'Cohort 1', 'Cohort 2'] },
      { id: 'workplace', label: 'Workplace', type: 'select', options: ['All', 'Default Placement', 'Workplace A'] },
      { id: 'tutor', label: 'Tutor', type: 'select', options: ['All Tutors', 'Hassan Tahmidul', 'Tutor B'] },
      { id: 'completionDate', label: 'Completion Date', type: 'select', options: ['Show All', 'This Month', 'Next Month'] },
    ],
    columns: [
      { key: 'learner', label: 'Learner', isLink: true },
      { key: 'tutorName', label: 'Tutor Name' },
      { key: 'uln', label: 'ULN' },
      { key: 'scheduledDate', label: 'Scheduled Progress Review Date' },
      { key: 'actualDate', label: 'Actual Progress Review Date', isLink: true },
      { key: 'tutorSignedDate', label: 'Tutor Signed Date' },
      { key: 'learnerSignedDate', label: 'Learner Signed Date' },
      { key: 'employerSignedDate', label: 'Employer Signed Date' },
    ],
    sampleRows: [
      { learner: 'Mr Rakker Joe', tutorName: 'Hassan Tahmidul', uln: 'ULN001', scheduledDate: '2026-03-25', actualDate: '2026-03-22', tutorSignedDate: '2026-03-22', learnerSignedDate: '2026-03-23', employerSignedDate: '2026-03-24' },
      { learner: 'Sarah Smith', tutorName: 'Hassan Tahmidul', uln: 'ULN002', scheduledDate: '2026-04-01', actualDate: '2026-03-28', tutorSignedDate: '2026-03-28', learnerSignedDate: '2026-03-29', employerSignedDate: '2026-03-30' },
      { learner: 'John Davis', tutorName: 'Emma Johnson', uln: 'ULN003', scheduledDate: '2026-04-05', actualDate: '—', tutorSignedDate: '—', learnerSignedDate: '—', employerSignedDate: '—' },
    ],
  },
  'due-to-complete': {
    title: 'Learners Due to Complete next 90 days',
    filters: [
      { id: 'reportGroup', label: 'Report Group', type: 'select', options: ['All', 'Group A', 'Group B'] },
      { id: 'tutor', label: 'Tutor', type: 'select', options: ['All', 'Hassan Tahmidul', 'Emma Johnson'] },
      { id: 'dateFrom', label: 'Date From', type: 'date' },
      { id: 'dateTo', label: 'Date To', type: 'date' },
    ],
    columns: [
      { key: 'learner', label: 'Learner', isLink: true },
      { key: 'cohort', label: 'Cohort' },
      { key: 'workplace', label: 'Workplace' },
      { key: 'tutorName', label: 'Tutor name' },
      { key: 'plannedEndDate', label: 'Planned end date' },
      { key: 'progress', label: 'Progress', isProgress: true },
      { key: 'actualProgress', label: 'Actual Progress(%)' },
      { key: 'expectedProgress', label: 'Expected Progress(%)' },
    ],
    sampleRows: [
      { learner: 'Mr Rakker Joe', cohort: 'Business Admin', workplace: 'Default Placement', tutorName: 'Hassan Tahmidul', plannedEndDate: '2026-06-15', progress: { progress: 12, target: 51 }, actualProgress: '12%', expectedProgress: '51%' },
      { learner: 'Sarah Smith', cohort: 'Business Admin', workplace: 'Workplace A', tutorName: 'Emma Johnson', plannedEndDate: '2026-07-01', progress: { progress: 28, target: 65 }, actualProgress: '28%', expectedProgress: '65%' },
      { learner: 'John Davis', cohort: 'Finance Admin', workplace: 'Default Placement', tutorName: 'Hassan Tahmidul', plannedEndDate: '2026-06-30', progress: { progress: 45, target: 78 }, actualProgress: '45%', expectedProgress: '78%' },
    ],
  },
  'completed-visits': {
    title: 'Completed visit in last 30 Days',
    filters: [
      { id: 'visitType', label: 'Visit Type', type: 'select', options: ['Remote session', 'Face-to-face', 'All'] },
      { id: 'tutor', label: 'Tutor', type: 'select', options: ['All', 'Hassan Tahmidul', 'Emma Johnson'] },
      { id: 'cancelledFilter', label: 'Cancelled Filter', type: 'select', options: ['Hide Cancelled', 'Show all'] },
      { id: 'dateFrom', label: 'Date From', type: 'date' },
      { id: 'dateTo', label: 'Date To', type: 'date' },
    ],
    columns: [
      { key: 'learner', label: 'Learner', isLink: true },
      { key: 'tutorName', label: 'Tutor name' },
      { key: 'visitType', label: 'Visit type' },
      { key: 'date', label: 'Date' },
      { key: 'location', label: 'Location' },
      { key: 'expectedProgress', label: 'Expected Progress(%)' },
    ],
    sampleRows: [
      { learner: 'Mr Rakker Joe', tutorName: 'Hassan Tahmidul', visitType: 'Face-to-face', date: '2026-03-20', location: 'Default Placement', expectedProgress: '51%' },
      { learner: 'Sarah Smith', tutorName: 'Emma Johnson', visitType: 'Remote session', date: '2026-03-18', location: 'Online', expectedProgress: '65%' },
    ],
  },
  'iqa-actions': {
    title: 'IQA Action',
    filters: [
      { id: 'dateFrom', label: 'Date From', type: 'date' },
      { id: 'dateTo', label: 'Date To', type: 'date' },
    ],
    columns: [
      { key: 'actionDescription', label: 'Action Description', isLink: true, width: '70%' },
      { key: 'timesUsed', label: 'Times Used', width: '30%' },
    ],
    sampleRows: [
      { actionDescription: 'Review assessment materials', timesUsed: 12 },
      { actionDescription: 'Verify evidence gathering', timesUsed: 8 },
      { actionDescription: 'Check learner engagement', timesUsed: 15 },
      { actionDescription: 'Audit progress reviews', timesUsed: 6 },
      { actionDescription: 'Validate OTJ hours', timesUsed: 10 },
    ],
  },
  'planned-visits': {
    title: 'Planned visit in next 30 Days',
    filters: [
      { id: 'visitType', label: 'Visit Type', type: 'select', options: ['Remote session', 'Face-to-face', 'All'] },
      { id: 'tutor', label: 'Tutor', type: 'select', options: ['All', 'Hassan Tahmidul', 'Emma Johnson'] },
      { id: 'cancelledFilter', label: 'Cancelled Filter', type: 'select', options: ['Hide Cancelled', 'Show all'] },
      { id: 'dateFrom', label: 'Date From', type: 'date' },
      { id: 'dateTo', label: 'Date To', type: 'date' },
    ],
    columns: [
      { key: 'learner', label: 'Learner', isLink: true },
      { key: 'tutorName', label: 'Tutor name' },
      { key: 'visitType', label: 'Visit type' },
      { key: 'date', label: 'Date' },
      { key: 'location', label: 'Location' },
      { key: 'expectedProgress', label: 'Expected Progress(%)' },
    ],
    sampleRows: [
      { learner: 'Mr Rakker Joe', tutorName: 'Hassan Tahmidul', visitType: 'Face-to-face', date: '2026-04-10', location: 'Default Placement', expectedProgress: '51%' },
      { learner: 'Sarah Smith', tutorName: 'Emma Johnson', visitType: 'Remote session', date: '2026-04-15', location: 'Online', expectedProgress: '65%' },
    ],
  },
  'learners-on-target': {
    title: 'Learners on Target',
    filters: [
      { id: 'reportGroup', label: 'Report Group', type: 'select', options: ['All', 'Group A', 'Group B'] },
      { id: 'tutor', label: 'Tutor', type: 'select', options: ['All', 'Hassan Tahmidul', 'Emma Johnson'] },
      { id: 'targetProgress', label: 'Target Progress', type: 'select', options: ['Any Target', 'On Target', 'Behind', 'Ahead'] },
    ],
    columns: [
      { key: 'learner', label: 'Learner', isLink: true },
      { key: 'cohort', label: 'Cohort' },
      { key: 'workplace', label: 'Workplace' },
      { key: 'tutorName', label: 'Tutor name' },
      { key: 'plannedEndDate', label: 'Planned end date' },
      { key: 'progress', label: 'Progress', isProgress: true },
      { key: 'actualProgress', label: 'Actual Progress(%)' },
      { key: 'expectedProgress', label: 'Expected Progress(%)' },
      { key: 'targetDeviation', label: 'Target Deviation', isDeviation: true },
    ],
    sampleRows: [
      { learner: 'Mr Rakker Joe', cohort: 'Business Admin', workplace: 'Default Placement', tutorName: 'Hassan Tahmidul', plannedEndDate: '2026-06-15', progress: { progress: 12, target: 51 }, actualProgress: '12%', expectedProgress: '51%', targetDeviation: '-52' },
      { learner: 'Sarah Smith', cohort: 'Business Admin', workplace: 'Workplace A', tutorName: 'Emma Johnson', plannedEndDate: '2026-07-01', progress: { progress: 28, target: 65 }, actualProgress: '28%', expectedProgress: '65%', targetDeviation: '-37' },
    ],
  },
  'learners-on-target-otj': {
    title: 'Learners on Target (Off-The-Job)',
    filters: [
      { id: 'reportGroup', label: 'Report Group', type: 'select', options: ['All', 'Group A', 'Group B'] },
      { id: 'tutor', label: 'Tutor', type: 'select', options: ['All', 'Hassan Tahmidul', 'Emma Johnson'] },
      { id: 'cohort', label: 'Cohort', type: 'select', options: ['Show All', 'Cohort 1', 'Cohort 2'] },
      { id: 'workplace', label: 'Workplace', type: 'select', options: ['All', 'Default Placement', 'Workplace A'] },
      { id: 'targetProgress', label: 'Target Progress', type: 'select', options: ['Any Target', 'On Target', 'Behind', 'Ahead'] },
    ],
    columns: [
      { key: 'learner', label: 'Learner', isLink: true },
      { key: 'className', label: 'Class Name' },
      { key: 'placement', label: 'Placement' },
      { key: 'targetOTJHours', label: 'Target OTJ Hours' },
      { key: 'assessorName', label: 'Assessor Name' },
      { key: 'plannedOTJHours', label: 'Planned OTJ Hours' },
      { key: 'actualOTJHours', label: 'Actual OTJ Hours' },
      { key: 'expectedOTJHrs', label: 'Expected OTJ Hrs' },
      { key: 'deviation', label: 'Deviation', isDeviation: true },
      { key: 'targetDeviation', label: 'Target Deviation', isDeviation: true },
    ],
    sampleRows: [
      { learner: 'Mr Rakker Joe', className: 'Business Admin 001', placement: 'Default Placement', targetOTJHours: '100', assessorName: 'Hassan Tahmidul', plannedOTJHours: '100', actualOTJHours: '78', expectedOTJHrs: '90', deviation: '-22', targetDeviation: '-52' },
      { learner: 'Sarah Smith', className: 'Business Admin 002', placement: 'Workplace A', targetOTJHours: '100', assessorName: 'Emma Johnson', plannedOTJHours: '100', actualOTJHours: '85', expectedOTJHrs: '92', deviation: '-15', targetDeviation: '-37' },
    ],
  },
  'no-otj-activity': {
    title: 'Learners with No OTJ Activity',
    filters: [
      { id: 'reportGroup', label: 'Report Group', type: 'select', options: ['All', 'Group A', 'Group B'] },
      { id: 'tutor', label: 'Tutor', type: 'select', options: ['All', 'Hassan Tahmidul', 'Emma Johnson'] },
      { id: 'cohort', label: 'Cohort', type: 'select', options: ['Show All', 'Cohort 1', 'Cohort 2'] },
      { id: 'workplace', label: 'Workplace', type: 'select', options: ['All', 'Default Placement', 'Workplace A'] },
      { id: 'status', label: 'Status', type: 'select', options: ['Over 4 weeks', '1-2 Weeks', '2-3 Weeks', '3-4 Weeks'] },
    ],
    columns: [
      { key: 'learner', label: 'Learner', isLink: true },
      { key: 'uln', label: 'ULN' },
      { key: 'mainLearningAim', label: 'Main Learning Aim' },
      { key: 'learnerStatus', label: 'Learner Status' },
      { key: 'progressGrade', label: 'Progress/Grade' },
      { key: 'lastLearningActivityDate', label: 'Last Learning Activity Date' },
      { key: 'lastLearningActivityPlanDate', label: 'Last Learning Activity Plan Date' },
      { key: 'lastCompletedProgressReviewDate', label: 'Last Completed Progress Review Date' },
      { key: 'lastOTJActivity', label: 'Last OTJ Activity' },
      { key: 'daysSinceOTJActivity', label: 'Days Since OTJ Activity' },
      { key: 'breakInLearning', label: 'Break in Learning' },
    ],
    sampleRows: [
      { learner: 'Mr Rakker Joe', uln: 'ULN001', mainLearningAim: 'Business Administration', learnerStatus: 'Active', progressGrade: 'On Track', lastLearningActivityDate: '2026-03-10', lastLearningActivityPlanDate: '2026-03-15', lastCompletedProgressReviewDate: '2026-03-01', lastOTJActivity: '2026-02-20', daysSinceOTJActivity: 32, breakInLearning: 'No' },
    ],
  },
};

const MiniBar: React.FC<{ progress: number; target: number }> = ({ progress, target }) => (
  <div style={{ marginBottom: '8px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <span style={font(12, 400, '#666')}>Progress:</span>
      <div style={{ flex: 1, height: '6px', backgroundColor: '#E8E8E8', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', backgroundColor: '#4A90D9', width: `${progress}%` }} />
      </div>
      <span style={font(12, 400, '#666')}>{progress}%</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={font(12, 400, '#666')}>Target:</span>
      <div style={{ flex: 1, height: '6px', backgroundColor: '#E8E8E8', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', backgroundColor: '#C6C7F8', width: `${target}%` }} />
      </div>
      <span style={font(12, 400, '#666')}>{target}%</span>
    </div>
  </div>
);

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportSlug = params.report as string;

  const config = REPORT_CONFIGS[reportSlug];
  const [recordsPerPage, setRecordsPerPage] = useState(25);
  const [filters, setFilters] = useState<Record<string, string>>({});

  if (!config) {
    return (
      <div style={font(16, 400)}>
        <button
          onClick={() => router.push('/trainer-dashboard/reports')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            marginBottom: '16px',
            color: '#1c1c1c',
          }}
        >
          ← Back
        </button>
        <p>Report not found.</p>
      </div>
    );
  }

  const totalRecords = config.sampleRows.length;
  const startRecord = 1;
  const endRecord = Math.min(recordsPerPage, totalRecords);

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff' }}>
      {/* Back Button */}
      <button
        onClick={() => router.push('/trainer-dashboard/reports')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          marginBottom: '20px',
          color: '#1c1c1c',
          padding: 0,
        }}
      >
        ← Back
      </button>

      {/* Top Bar: Title + Records per page */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={font(22, 700)}>{config.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={font(14, 400)}>Records per page:</label>
          <select
            value={recordsPerPage}
            onChange={(e) => setRecordsPerPage(parseInt(e.target.value))}
            style={{
              ...font(14, 400),
              padding: '8px 12px',
              border: '1px solid #d0d0d0',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: '#fff',
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Select Report Criteria Panel */}
      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          backgroundColor: '#fafafa',
        }}
      >
        <h2 style={font(14, 600, '#1c1c1c', { marginBottom: '16px' })}>Select Report Criteria</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          {config.filters.map((filter) => (
            <div key={filter.id}>
              <label style={font(12, 500, '#666', { display: 'block', marginBottom: '6px' })}>{filter.label}</label>
              {filter.type === 'date' ? (
                <input
                  type="date"
                  value={filters[filter.id] || ''}
                  onChange={(e) => setFilters({ ...filters, [filter.id]: e.target.value })}
                  style={{
                    ...font(14, 400),
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <select
                  value={filters[filter.id] || ''}
                  onChange={(e) => setFilters({ ...filters, [filter.id]: e.target.value })}
                  style={{
                    ...font(14, 400),
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select {filter.label}</option>
                  {filter.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
        <button
          style={{
            ...font(14, 600, '#fff'),
            backgroundColor: '#3b5bdb',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
      </div>

      {/* Results Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={font(14, 400, '#666')}>
          Showing {startRecord} - {endRecord} of {totalRecords} records
        </span>
        <button
          style={{
            ...font(14, 600, '#3b5bdb'),
            backgroundColor: 'transparent',
            border: '1px solid #3b5bdb',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ↓ Export
        </button>
      </div>

      {/* Data Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
              {config.columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...font(12, 600, '#666'),
                    padding: '12px',
                    textAlign: 'left',
                    width: col.width || 'auto',
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {config.sampleRows.slice(0, recordsPerPage).map((row, rowIdx) => (
              <tr key={rowIdx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                {config.columns.map((col) => {
                  const value = row[col.key];
                  let cellContent: React.ReactNode = typeof value === 'object' ? String(value) : value;

                  if (col.isLink) {
                    cellContent = (
                      <span style={{ color: '#3b5bdb', cursor: 'pointer', fontWeight: 500 }}>
                        {String(value)}
                      </span>
                    );
                  } else if (col.isProgress && typeof value === 'object' && value !== null && 'progress' in value) {
                    const progValue = value as { progress: number; target: number };
                    cellContent = <MiniBar progress={progValue.progress} target={progValue.target} />;
                  } else if (col.isDeviation && typeof value === 'string') {
                    const isNegative = value.startsWith('-');
                    cellContent = (
                      <span style={{ color: isNegative ? '#E53935' : '#1c1c1c', fontWeight: isNegative ? 600 : 400 }}>
                        {value}
                      </span>
                    );
                  }

                  return (
                    <td key={col.key} style={{ ...font(14, 400), padding: '12px' }}>
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
