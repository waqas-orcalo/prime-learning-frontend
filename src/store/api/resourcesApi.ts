import { baseApi } from './baseApi'
import type {
  Resource,
  ListResourcesParams,
} from '@/hooks/use-resources'

// ── Response shapes ───────────────────────────────────────────────────────────

interface PaginatedResourcesResponse {
  statusCode: number
  message: string
  data: Resource[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

interface ResourceResponse {
  statusCode: number
  message: string
  data: Resource
}

// ── Helper: strip undefined/empty values from query params ───────────────────
function cleanParams(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}

// ── Endpoints ─────────────────────────────────────────────────────────────────
export const resourcesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getResources: builder.query<PaginatedResourcesResponse, ListResourcesParams>({
      query: (params = {}) => ({
        url: '/resources',
        params: cleanParams(params),
      }),
      providesTags: ['Resources'],
    }),

    getResource: builder.query<ResourceResponse, string>({
      query: (id) => `/resources/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Resources', id }],
    }),

    createResource: builder.mutation<ResourceResponse, Partial<Resource>>({
      query: (body) => ({ url: '/resources', method: 'POST', body }),
      invalidatesTags: ['Resources'],
    }),

    updateResource: builder.mutation<ResourceResponse, { id: string } & Partial<Resource>>({
      query: ({ id, ...body }) => ({ url: `/resources/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Resources'],
    }),

    deleteResource: builder.mutation<{ statusCode: number; message: string; data: null }, string>({
      query: (id) => ({ url: `/resources/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Resources'],
    }),

    toggleBookmark: builder.mutation<ResourceResponse, string>({
      query: (id) => ({ url: `/resources/${id}/bookmark`, method: 'POST' }),
      invalidatesTags: ['Resources'],
    }),

    toggleFeatured: builder.mutation<ResourceResponse, string>({
      query: (id) => ({ url: `/resources/${id}/featured`, method: 'PATCH' }),
      invalidatesTags: ['Resources'],
    }),

    recordView: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/resources/${id}/view`, method: 'POST' }),
    }),

    recordDownload: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/resources/${id}/download`, method: 'POST' }),
    }),

    shareResource: builder.mutation<{ statusCode: number; message: string; data: Resource }, { id: string; userIds: string[] }>({
      query: ({ id, userIds }) => ({ url: `/resources/${id}/share`, method: 'POST', body: { userIds } }),
      invalidatesTags: ['Resources'],
    }),

    revokeShare: builder.mutation<{ statusCode: number; message: string; data: Resource }, { resourceId: string; userId: string }>({
      query: ({ resourceId, userId }) => ({ url: `/resources/${resourceId}/share/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Resources'],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetResourcesQuery,
  useGetResourceQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useToggleBookmarkMutation,
  useToggleFeaturedMutation,
  useRecordViewMutation,
  useRecordDownloadMutation,
  useShareResourceMutation,
  useRevokeShareMutation,
} = resourcesApi
