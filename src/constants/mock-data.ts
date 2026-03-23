import type { Task, Contact, LearningEntry, JournalEntry } from '@/types'

export const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Complete onboarding module', dueDate: '2024-08-15', priority: 'high', status: 'in_progress', assignedBy: 'Sarah Connor', description: '', createdAt: '2024-07-01', updatedAt: '2024-07-10' },
  { id: '2', title: 'Submit evidence for Unit 3', dueDate: '2024-08-20', priority: 'high', status: 'pending', assignedBy: 'John Smith', description: '', createdAt: '2024-07-05', updatedAt: '2024-07-05' },
  { id: '3', title: 'Attend workplace assessment', dueDate: '2024-08-10', priority: 'medium', status: 'completed', assignedBy: 'Sarah Connor', description: '', createdAt: '2024-06-20', updatedAt: '2024-08-10' },
  { id: '4', title: 'Review learning journal', dueDate: '2024-07-28', priority: 'low', status: 'overdue', assignedBy: 'Mike Johnson', description: '', createdAt: '2024-07-01', updatedAt: '2024-07-01' },
  { id: '5', title: 'Complete progress review form', dueDate: '2024-09-01', priority: 'medium', status: 'pending', assignedBy: 'Sarah Connor', description: '', createdAt: '2024-07-15', updatedAt: '2024-07-15' },
]

export const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'X-AE-A-13b', lastMessage: 'Enter your message description here...', lastMessageTime: '12:25', unreadCount: 12, statusColor: '#22c55e', online: true },
  { id: '2', name: 'Pippins McGray', lastMessage: 'Please call me back on 08193843...', lastMessageTime: '12:25', unreadCount: 0, statusColor: '#cbd5e1', online: false },
  { id: '3', name: 'McKinsey Vermillion', lastMessage: 'Enter your message description here...', lastMessageTime: '12:25', unreadCount: 8, statusColor: '#22c55e', online: true },
]

export const MOCK_LEARNING_ENTRIES: LearningEntry[] = [
  { id: '1', title: 'Workplace Observation', category: 'On the Job', dateFrom: '2024-07-01', dateTo: '2024-07-01', duration: 120, offTheJob: false, activityType: 'on_job', reflection: 'Observed key workflows', recordedBy: 'John Doe', createdAt: '2024-07-01' },
  { id: '2', title: 'Online Training Course', category: 'Off the Job', dateFrom: '2024-07-05', dateTo: '2024-07-05', duration: 180, offTheJob: true, activityType: 'off_job', reflection: 'Completed module 3', recordedBy: 'John Doe', createdAt: '2024-07-05' },
  { id: '3', title: 'Mentor Meeting', category: 'On the Job', dateFrom: '2024-07-10', dateTo: '2024-07-10', duration: 60, offTheJob: false, activityType: 'on_job', reflection: 'Discussed progress', recordedBy: 'Sarah Connor', createdAt: '2024-07-10' },
]

export let MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: '1', title: 'Development task 1', category: 'Competition',
    date: '2024-12-27', timeHH: '10', timeMM: '22', amPm: 'AM',
    durationHH: '21', durationMM: '20',
    offJob: false, onJob: true,
    reflection: 'Completed the initial development tasks for the UI components.',
    privacy: 'only_me', files: [],
    createdAt: '2024-12-27T10:22:00Z', updatedAt: '2024-12-27T10:22:00Z',
  },
  {
    id: '2', title: 'Research on best practices', category: 'Research',
    date: '2024-12-24', timeHH: '09', timeMM: '00', amPm: 'AM',
    durationHH: '02', durationMM: '30',
    offJob: true, onJob: false,
    reflection: 'Researched industry best practices for UX design.',
    privacy: 'everyone', files: [],
    createdAt: '2024-12-24T09:00:00Z', updatedAt: '2024-12-24T09:00:00Z',
  },
]
