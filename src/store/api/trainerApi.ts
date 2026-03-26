import { baseApi } from './baseApi'
import type {
  TrainerDashboardStats,
  TrainerRecentActivity,
  LearnerUser,
  TrainerTask,
  LearningJournal,
  LearnerDetail,
  LearnerPortfolio,
  LearnerProgress,
} from '@/hooks/use-trainer'

// ── Response wrappers ─────────────────────────────────────────────────────────
interface Single<T>     { statusCode: number; message: string; data: T }
interface Paginated<T>  { statusCode: number; message: string; data: T[]; pagination: { total: number; page: number; limit: number; totalPages: number } }

// ── Helper ────────────────────────────────────────────────────────────────────
function cleanParams(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}

// ── Trainer query/mutation params ─────────────────────────────────────────────
export interface TrainerLearnersParams {
  page?: number; limit?: number; search?: string; cohort?: string; programme?: string
}
export interface TrainerTasksParams {
  page?: number; limit?: number; status?: string
}
export interface TrainerJournalsParams {
  page?: number; limit?: number
}
export interface TrainerReportParams {
  type: string; page?: number; limit?: number; cohort?: string; programme?: string; from?: string; to?: string
}
export interface AssignLearnerDto {
  learnerId: string; cohort?: string; programme?: string; employer?: string
}

// ── Endpoints ─────────────────────────────────────────────────────────────────
export const trainerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getTrainerDashboardStats: builder.query<Single<TrainerDashboardStats>, void>({
      query: () => '/trainer/dashboard/stats',
      providesTags: ['Trainer'],
    }),

    getTrainerRecentActivity: builder.query<Single<TrainerRecentActivity>, void>({
      query: () => '/dashboard/recent-activity',
      providesTags: ['Trainer'],
    }),

    getTrainerDashboardCharts: builder.query<any, void>({
      query: () => '/trainer/dashboard/charts',
      providesTags: ['Trainer'],
    }),

    getTrainerLearners: builder.query<Paginated<LearnerUser>, TrainerLearnersParams>({
      query: (params = {}) => ({ url: '/trainer/my-learners', params: cleanParams(params) }),
      providesTags: ['Learners'],
    }),

    getTrainerLearnerDetail: builder.query<Single<LearnerDetail>, string>({
      query: (learnerId) => `/trainer/learner/${learnerId}`,
      providesTags: (_r, _e, id) => [{ type: 'Learners', id }],
    }),

    getTrainerLearnerPortfolio: builder.query<Single<LearnerPortfolio>, string>({
      query: (learnerId) => `/trainer/learner/${learnerId}/portfolio`,
      providesTags: (_r, _e, id) => [{ type: 'Learners', id: `portfolio-${id}` }],
    }),

    getTrainerLearnerProgress: builder.query<Single<LearnerProgress>, string>({
      query: (learnerId) => `/trainer/learner/${learnerId}/progress`,
      providesTags: (_r, _e, id) => [{ type: 'Learners', id: `progress-${id}` }],
    }),

    getTrainerTasks: builder.query<Paginated<TrainerTask>, TrainerTasksParams>({
      query: (params = {}) => ({ url: '/trainer/tasks', params: cleanParams(params) }),
      providesTags: ['Trainer'],
    }),

    getTrainerJournals: builder.query<Paginated<LearningJournal>, TrainerJournalsParams>({
      query: (params = {}) => ({ url: '/learning-journals', params: cleanParams(params) }),
      providesTags: ['TrainerJournals'],
    }),

    getTrainerReport: builder.query<any, TrainerReportParams>({
      query: ({ type, ...params }) => ({
        url: `/trainer/reports/${type}`,
        params: cleanParams(params),
      }),
      providesTags: ['Trainer'],
    }),

    assignLearner: builder.mutation<Single<any>, AssignLearnerDto>({
      query: (body) => ({ url: '/trainer/assign-learner', method: 'POST', body }),
      invalidatesTags: ['Learners'],
    }),

    unassignLearner: builder.mutation<Single<any>, string>({
      query: (learnerId) => ({ url: `/trainer/unassign-learner/${learnerId}`, method: 'DELETE' }),
      invalidatesTags: ['Learners'],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetTrainerDashboardStatsQuery,
  useGetTrainerRecentActivityQuery,
  useGetTrainerDashboardChartsQuery,
  useGetTrainerLearnersQuery,
  useGetTrainerLearnerDetailQuery,
  useGetTrainerLearnerPortfolioQuery,
  useGetTrainerLearnerProgressQuery,
  useGetTrainerTasksQuery,
  useGetTrainerJournalsQuery,
  useGetTrainerReportQuery,
  useAssignLearnerMutation,
  useUnassignLearnerMutation,
} = trainerApi
