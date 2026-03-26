import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

/**
 * Single RTK Query API instance shared across the whole app.
 * All feature slices use baseApi.injectEndpoints() to add their own endpoints
 * without creating extra reducers or cache stores.
 */
export const baseApi = createApi({
  reducerPath: 'api',

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,

    // Inject the NextAuth access token on every request.
    // The token is synced into Redux by <TokenSync /> in Providers.tsx
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),

  // Global cache tags — each API slice declares which tags its queries provide
  // and which tags its mutations invalidate.
  tagTypes: [
    'Resources',
    'Tasks',
    'Messages',
    'Trainer',
    'Learners',
    'TrainerJournals',
    'ExitReview',
    'LearnerFeedback',
    'LearningSupport',
  ],

  // Endpoints are injected per-slice via injectEndpoints()
  endpoints: () => ({}),
})
