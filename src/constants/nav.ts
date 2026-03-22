import { ROUTES } from './routes'

export const NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: 'dashboard' },
  { label: 'Tasks', href: ROUTES.TASKS, icon: 'tasks', hasChildren: true },
  { label: 'Learning Activities', href: ROUTES.LEARNING_ACTIVITIES.TIMESHEET, icon: 'learning' },
  { label: 'Leaning Journals', href: '/learning-journals', icon: 'journals' },
  { label: 'Scorecard', href: ROUTES.SCORECARD, icon: 'scorecard' },
  { label: 'Courses', href: ROUTES.COURSES, icon: 'courses' },
  { label: 'Progress', href: ROUTES.PROGRESS_REVIEW, icon: 'progress' },
  { label: 'Resources', href: ROUTES.RESOURCES, icon: 'resources' },
  { label: 'Help Centre', href: '/help', icon: 'help' },
] as const

export const BREADCRUMB_MAP: Record<string, string[]> = {
  '/dashboard': ['Dashboards'],
  '/tasks': ['Dashboards', 'Task'],
  '/learning-activities/timesheet': ['Dashboards', 'Learning Journals', 'Timesheets'],
  '/learning-activities/evidence': ['Dashboards', 'Learning Activities', 'Evidence'],
  '/messages': ['Dashboards', 'Messages'],
  '/scorecard': ['Dashboards', 'Scorecard'],
  '/courses': ['Dashboards', 'Courses'],
  '/progress-review': ['Dashboards', 'Progress Review'],
  '/activity-log': ['Dashboards', 'Activity Log'],
  '/resources': ['Dashboards', 'Resources'],
}
