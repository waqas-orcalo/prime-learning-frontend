import { baseApi } from './baseApi'
import type { LearningSupportForm, CreateLearningSupportPayload, ListLearningSupportParams } from '@/hooks/use-learning-support'

interface PaginatedResponse {
  statusCode: number; message: string
  data: LearningSupportForm[]
  pagination: { total: number; page: number; limit: number; pages: number }
}
interface SingleResponse {
  statusCode: number; message: string; data: LearningSupportForm
}

function cleanParams(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}

export const learningSupportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    listLearningSupport: builder.query<PaginatedResponse, ListLearningSupportParams>({
      query: (params = {}) => ({ url: '/forms/learning-support', params: cleanParams(params) }),
      providesTags: ['LearningSupport'],
    }),

    getLearningSupport: builder.query<SingleResponse, string>({
      query: (id) => `/forms/learning-support/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'LearningSupport', id }],
    }),

    createLearningSupport: builder.mutation<SingleResponse, CreateLearningSupportPayload>({
      query: (body) => ({ url: '/forms/learning-support', method: 'POST', body }),
      invalidatesTags: ['LearningSupport'],
    }),

    updateLearningSupport: builder.mutation<SingleResponse, { id: string } & Partial<CreateLearningSupportPayload>>({
      query: ({ id, ...body }) => ({ url: `/forms/learning-support/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['LearningSupport'],
    }),

    deleteLearningSupport: builder.mutation<{ statusCode: number; message: string; data: null }, string>({
      query: (id) => ({ url: `/forms/learning-support/${id}`, method: 'DELETE' }),
      invalidatesTags: ['LearningSupport'],
    }),

    signLearningSupport: builder.mutation<SingleResponse, { id: string; role: 'learner' | 'trainer' }>({
      query: ({ id, role }) => ({ url: `/forms/learning-support/${id}/sign`, method: 'PATCH', body: { role } }),
      invalidatesTags: ['LearningSupport'],
    }),

  }),
  overrideExisting: false,
})

export const {
  useListLearningSupportQuery,
  useGetLearningSupportQuery,
  useCreateLearningSupportMutation,
  useUpdateLearningSupportMutation,
  useDeleteLearningSupportMutation,
  useSignLearningSupportMutation,
} = learningSupportApi
