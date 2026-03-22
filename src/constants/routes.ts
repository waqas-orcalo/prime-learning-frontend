export const ROUTES = {
  // Auth
  LOGIN: '/login',
  LOGOUT: '/logout',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Tasks
  TASKS: '/tasks',

  // Learning Activities
  LEARNING_ACTIVITIES: {
    TIMESHEET: '/learning-activities/timesheet',
    EVIDENCE: '/learning-activities/evidence',
    VISIT: '/learning-activities/visit',
  },

  // Other
  PLAN_OF_ACTIVITY: '/plan-of-activity',
  PROGRESS_REVIEW: '/progress-review',
  ACTIVITY_LOG: '/activity-log',
  SCORECARD: '/scorecard',
  COURSES: '/courses',
  RESOURCES: '/resources',
  MESSAGES: '/messages',
} as const

export type AppRoute = typeof ROUTES[keyof typeof ROUTES]
