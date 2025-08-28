import type { FlowZenItem, Transaction } from './types';
import { setHours, setMinutes } from 'date-fns';

const today = new Date();

export const initialItems: FlowZenItem[] = [
  {
    id: '1',
    title: 'Project Alpha Deadline',
    date: setMinutes(setHours(new Date(new Date().setDate(today.getDate() + 3)), 17), 0),
    category: 'Work',
    description: 'Final submission of the Project Alpha report.',
    completed: false,
    reminders: [
        { value: 1, unit: 'days' },
        { value: 2, unit: 'hours' },
    ]
  },
  {
    id: '2',
    title: 'Weekly Team Meeting',
    date: setMinutes(setHours(new Date(new Date().setDate(today.getDate() + 1)), 10), 30),
    category: 'Meeting',
    description: 'Sync up on project progress and upcoming sprints.',
    completed: false,
  },
  {
    id: '3',
    title: 'Pay Electricity Bill',
    date: new Date(new Date().setDate(today.getDate() + 5)),
    category: 'Bill',
    description: 'Monthly electricity bill payment.',
    completed: false,
    email: 'user@example.com',
    reminders: [
        { value: 3, unit: 'days' }
    ]
  },
  {
    id: '4',
    title: 'Mid-term Exam Prep',
    date: new Date(new Date().setDate(today.getDate() + 10)),
    category: 'Exam',
    description: 'Start studying for the mid-term exams, focus on chapters 1-5.',
    completed: false,
  },
  {
    id: '5',
    title: 'Submit History Essay',
    date: setMinutes(setHours(new Date(new Date().setDate(today.getDate() - 2)), 23), 59),
    category: 'Assignment',
    description: 'Submit the essay on World War II.',
    completed: true,
  },
  {
    id: '6',
    title: 'Doctor\'s Appointment',
    date: setMinutes(setHours(new Date(new Date().setDate(today.getDate() + 14)), 14), 0),
    category: 'Personal',
    description: 'Annual check-up.',
    completed: false,
  },
];

export const initialTransactions: Transaction[] = [
    {
        id: '1',
        date: new Date(new Date().setDate(today.getDate() - 5)),
        description: 'Part-time job payment',
        amount: 350.00,
        type: 'Income',
        category: 'Professional',
    },
    {
        id: '2',
        date: new Date(new Date().setDate(today.getDate() - 3)),
        description: 'Computer Science Textbook',
        amount: 85.50,
        type: 'Expense',
        category: 'Student',
    },
    {
        id: '3',
        date: new Date(new Date().setDate(today.getDate() - 1)),
        description: 'Monthly Subscription',
        amount: 12.99,
        type: 'Expense',
        category: 'Professional',
    }
];
