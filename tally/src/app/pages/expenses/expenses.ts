import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

interface Expense {
  id: number;
  description: string;
  category: string;
  date: string;
  amount: number;
  recurring: boolean;
}

@Component({
  selector: 'app-expenses',
  standalone: false,
  templateUrl: './expenses.html',
})
export class Expenses {
  categories = ['Food', 'Housing', 'Transport', 'Fun', 'Other'];

  // TODO (Roles 3-5): replace with data from the expenses service / Firebase.
  expenses: Expense[] = [
    { id: 1, description: 'Grocery market', category: 'Food', date: '2026-11-19', amount: 62.4, recurring: false },
    { id: 2, description: 'Metro card top-up', category: 'Transport', date: '2026-11-18', amount: 20, recurring: false },
    { id: 3, description: 'Cinema tickets', category: 'Fun', date: '2026-11-15', amount: 24, recurring: false },
    { id: 4, description: 'Rent', category: 'Housing', date: '2026-11-01', amount: 1100, recurring: true },
    { id: 5, description: 'Phone plan', category: 'Other', date: '2026-11-03', amount: 35, recurring: true },
    { id: 6, description: 'Weekly groceries', category: 'Food', date: '2026-11-12', amount: 78.1, recurring: false },
    { id: 7, description: 'Taxi', category: 'Transport', date: '2026-11-10', amount: 14.5, recurring: false },
  ];
  private nextId = 8;

  form: FormGroup;
  search = new FormControl('');
  filter = new FormControl('All');

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      description: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      category: ['Food', Validators.required],
      date: ['', Validators.required],
      recurring: [false],
    });
  }

  get filtered(): Expense[] {
    const query = (this.search.value ?? '').toLowerCase();
    const category = this.filter.value ?? 'All';
    return this.expenses.filter(
      (e) => (category === 'All' || e.category === category) && e.description.toLowerCase().includes(query),
    );
  }

  get total(): number {
    return this.expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.touched && control.invalid;
  }

  add() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.expenses = [
      { id: this.nextId++, description: v.description, category: v.category, date: v.date, amount: Number(v.amount), recurring: !!v.recurring },
      ...this.expenses,
    ];
    this.form.reset({ description: '', amount: null, category: 'Food', date: '', recurring: false });
  }

  remove(expense: Expense) {
    this.expenses = this.expenses.filter((e) => e.id !== expense.id);
  }
}
