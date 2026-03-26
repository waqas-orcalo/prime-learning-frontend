import { baseApi } from './baseApi'

// ── Types (kept in sync with existing Task type in @/types) ───────────────────
export interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  dueDate?: string
  createdAt?: string
  updatedAt?: string
  assignedTo?: string
  createdBy?: string
}

interface PaginatedTasksResponse {
  data: Task[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface TasksParams {
  page?: number
  pageSize?: number
  status?: string
  search?: string
}

function cleanParams(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}

// ── Endpoints ─────────────────────────────────────────────────────────────────
export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getTasks: builder.query<PaginatedTasksResponse, TasksParams | void>({
      query: (params) => ({
        url: '/tasks',
        params: params ? cleanParams(params as Record<string, any>) : undefined,
      }),
      providesTags: ['Tasks'],
    }),

    getTask: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Tasks', id }],
    }),

    createTask: builder.mutation<Task, Partial<Task>>({
      query: (body) => ({ url: '/tasks', method: 'POST', body }),
      invalidatesTags: ['Tasks'],
    }),

    updateTask: builder.mutation<Task, Partial<Task> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/tasks/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Tasks'],
    }),

    deleteTask: builder.mutation<void, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Tasks'],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi
