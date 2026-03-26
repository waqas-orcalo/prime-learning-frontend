import { baseApi } from './baseApi'
import type { LearnerFeedbackForm, CreateLearnerFeedbackPayload, ListLearnerFeedbackParams } from '@/hooks/use-learner-feedback'

interface PaginatedResponse {
  statusCode: number; message: string
  data: LearnerFeedbackForm[]
  pagination: { total: number; page: number; limit: number; pages: number }
}
interface SingleResponse {
  statusCode: number; message: string; data: LearnerFeedbackForm
}

function cleanParams(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}

export const learnerFeedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    listLearnerFeedback: builder.query<PaginatedResponse, ListLearnerFeedbackParams>({
      query: (params = {}) => ({ url: '/forms/learner-feedback', params: cleanParams(params) }),
      providesTags: ['LearnerFeedback'],
    }),

    getLearnerFeedback: builder.query<SingleResponse, string>({
      query: (id) => `/forms/learner-feedback/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'LearnerFeedback', id }],
    }),

    createLearnerFeedback: builder.mutation<SingleResponse, CreateLearnerFeedbackPayload>({
      query: (body) => ({ url: '/forms/learner-feedback', method: 'POST', body }),
      invalidatesTags: ['LearnerFeedback'],
    }),

    updateLearnerFeedback: builder.mutation<SingleResponse, { id: string } & Partial<CreateLearnerFeedbackPayload>>({
      query: ({ id, ...body }) => ({ url: `/forms/learner-feedback/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['LearnerFeedback'],
    }),

    deleteLearnerFeedback: builder.mutation<{ statusCode: number; message: string; data: null }, string>({
      query: (id) => ({ url: `/forms/learner-feedback/${id}`, method: 'DELETE' }),
      invalidatesTags: ['LearnerFeedback'],
    }),

    signLearnerFeedback: builder.mutation<SingleResponse, { id: string; role: 'learner' | 'trainer' }>({
      query: ({ id, role }) => ({ url: `/forms/learner-feedback/${id}/sign`, method: 'PATCH', body: { role } }),
      invalidatesTags: ['LearnerFeedback'],
    }),

  }),
  overrideExisting: false,
})

export const {
  useListLearnerFeedbackQuery,
  useGetLearnerFeedbackQuery,
  useCreateLearnerFeedbackMutation,
  useUpdateLearnerFeedbackMutation,
  useDeleteLearnerFeedbackMutation,
  useSignLearnerFeedbackMutation,
} = learnerFeedbackApi
