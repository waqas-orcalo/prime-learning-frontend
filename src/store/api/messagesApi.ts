import { baseApi } from './baseApi'
import type { Contact, Message } from '@/types'

// ── Endpoints ─────────────────────────────────────────────────────────────────
export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getContacts: builder.query<Contact[], void>({
      query: () => '/messages/contacts',
      providesTags: ['Messages'],
    }),

    getMessageThread: builder.query<Message[], string>({
      query: (contactId) => `/messages/thread/${contactId}`,
      providesTags: (_r, _e, id) => [{ type: 'Messages', id }],
    }),

    sendMessage: builder.mutation<Message, { receiverId: string; content: string }>({
      query: (body) => ({ url: '/messages/send', method: 'POST', body }),
      // Optimistic update: append to thread + invalidate contact list for ordering
      onQueryStarted: async ({ receiverId }, { dispatch, queryFulfilled }) => {
        try {
          const { data: msg } = await queryFulfilled
          dispatch(
            messagesApi.util.updateQueryData('getMessageThread', receiverId, (draft) => {
              draft.push(msg)
            }),
          )
          dispatch(messagesApi.util.invalidateTags(['Messages']))
        } catch { /* revert handled automatically */ }
      },
    }),

    markMessageRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/messages/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Messages'],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetContactsQuery,
  useGetMessageThreadQuery,
  useSendMessageMutation,
  useMarkMessageReadMutation,
} = messagesApi
