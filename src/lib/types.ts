export type ItemCategory = 'Assignment' | 'Meeting' | 'Bill' | 'Personal' | 'Work' | 'Exam';

export const itemCategories: ItemCategory[] = ['Assignment', 'Meeting', 'Bill', 'Personal', 'Work', 'Exam'];

export interface Reminder {
  value: number;
  unit: 'minutes' | 'hours' | 'days' | 'seconds';
}

export interface FlowZenItem {
  id: string;
  title: string;
  date: Date;
  category: ItemCategory;
  description?: string;
  completed: boolean;
  email?: string;
  reminders?: Reminder[];
}
