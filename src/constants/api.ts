export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // Tasks
  TASKS: {
    LIST: '/tasks',
    BY_ID: (id: string) => `/tasks/${id}`,
    CREATE: '/tasks',
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
  },

  // Messages
  MESSAGES: {
    CONTACTS: '/messages/contacts',
    THREAD: (contactId: string) => `/messages/thread/${contactId}`,
    SEND: '/messages/send',
    MARK_READ: (id: string) => `/messages/${id}/read`,
  },

  // Learning Activities
  LEARNING: {
    ENTRIES: '/learning/entries',
    BY_ID: (id: string) => `/learning/entries/${id}`,
    CREATE: '/learning/entries',
    UPDATE: (id: string) => `/learning/entries/${id}`,
    DELETE: (id: string) => `/learning/entries/${id}`,
    TIMESHEET_SUMMARY: '/learning/timesheet/summary',
    OTJ_STATS: '/learning/otj/stats',
  },
} as const
