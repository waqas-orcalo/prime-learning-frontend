import { baseApi } from './baseApi'
import type { ExitReviewForm, CreateExitReviewPayload, ListExitReviewParams } from '@/hooks/use-exit-review'

interface PaginatedResponse {
  statusCode: number; message: string
  data: ExitReviewForm[]
  pagination: { total: number; page: number; limit: number; pages: number }
}
interface SingleResponse {
  statusCode: number; message: string; data: ExitReviewForm
}

function cleanParams(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}

export const exitReviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    listExitReviews: builder.query<PaginatedResponse, ListExitReviewParams>({
      query: (params = {}) => ({ url: '/forms/exit-review', params: cleanParams(params) }),
      providesTags: ['ExitReview'],
    }),

    getExitReview: builder.query<SingleResponse, string>({
      query: (id) => `/forms/exit-review/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'ExitReview', id }],
    }),

    createExitReview: builder.mutation<SingleResponse, CreateExitReviewPayload>({
      query: (body) => ({ url: '/forms/exit-review', method: 'POST', body }),
      invalidatesTags: ['ExitReview'],
    }),

    updateExitReview: builder.mutation<SingleResponse, { id: string } & Partial<CreateExitReviewPayload>>({
      query: ({ id, ...body }) => ({ url: `/forms/exit-review/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['ExitReview'],
    }),

    deleteExitReview: builder.mutation<{ statusCode: number; message: string; data: null }, string>({
      query: (id) => ({ url: `/forms/exit-review/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ExitReview'],
    }),

    signExitReview: builder.mutation<SingleResponse, { id: string; role: 'learner' | 'trainer' }>({
      query: ({ id, role }) => ({ url: `/forms/exit-review/${id}/sign`, method: 'PATCH', body: { role } }),
      invalidatesTags: ['ExitReview'],
    }),

  }),
  overrideExisting: false,
})

export const {
  useListExitReviewsQuery,
  useGetExitReviewQuery,
  useCreateExitReviewMutation,
  useUpdateExitReviewMutation,
  useDeleteExitReviewMutation,
  useSignExitReviewMutation,
} = exitReviewApi
