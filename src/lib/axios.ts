/**
 * ⚠️  DEPRECATED — Axios has been replaced by RTK Query.
 *
 * All API calls now go through RTK Query endpoints defined in:
 *   src/store/api/baseApi.ts        ← fetchBaseQuery config + auth token injection
 *   src/store/api/resourcesApi.ts   ← resources endpoints
 *   src/store/api/trainerApi.ts     ← trainer endpoints
 *   src/store/api/tasksApi.ts       ← tasks endpoints
 *   src/store/api/messagesApi.ts    ← messages endpoints
 *   src/store/api/exitReviewApi.ts  ← exit review form endpoints
 *   src/store/api/learnerFeedbackApi.ts
 *   src/store/api/learningSupportApi.ts
 *
 * Hooks remain in src/hooks/ with identical function names — callers need
 * no changes. Hooks now re-export RTK Query generated hooks with React
 * Query-compatible wrappers for mutations.
 *
 * This file is kept temporarily so any direct `import apiClient from '@/lib/axios'`
 * imports (in use-tasks.ts and use-messages.ts, now migrated) still resolve
 * without a build error. It can be deleted once `axios` is removed from
 * package.json after confirming no remaining usages.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const apiClient = null

export default apiClient
