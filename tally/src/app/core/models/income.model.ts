export interface Income {
  id?: string;
  source: string;
  amount: number;
  date: string;
  recurring: boolean;
  frequency?: 'weekly' | 'monthly' | 'yearly';
}