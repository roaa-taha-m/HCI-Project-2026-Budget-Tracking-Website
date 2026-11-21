export interface Expense {
  id?: string;
  title: string;
  amount: number;
  category: string;
  date: string;                       // ISO string
  recurring: boolean;
  frequency?: 'weekly' | 'monthly' | 'yearly';
  notes?: string;
}