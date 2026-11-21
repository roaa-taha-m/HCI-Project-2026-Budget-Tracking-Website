import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Budget {
  category: string;
  limit: number;
  spent: number;
}

@Component({
  selector: 'app-budgets',
  standalone: false,
  templateUrl: './budgets.html',
})
export class Budgets {
  // TODO (Roles 3-5): replace with data from the budgets service.
  budgets: Budget[] = [
    { category: 'Housing', limit: 1200, spent: 1100 },
    { category: 'Food', limit: 600, spent: 640 },
    { category: 'Transport', limit: 450, spent: 380 },
    { category: 'Fun', limit: 400, spent: 290 },
    { category: 'Other', limit: 650, spent: 440 },
  ];

  categoryOptions = ['Health', 'Education', 'Savings', 'Shopping', 'Bills'];
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      category: [this.categoryOptions[0], Validators.required],
      limit: [null, [Validators.required, Validators.min(1)]],
      repeat: [false],
    });
  }

  get totalLimit(): number {
    return this.budgets.reduce((sum, b) => sum + b.limit, 0);
  }

  get totalSpent(): number {
    return this.budgets.reduce((sum, b) => sum + b.spent, 0);
  }

  get remaining(): number {
    return this.totalLimit - this.totalSpent;
  }

  get usedPercent(): number {
    return this.totalLimit ? Math.min(100, Math.round((this.totalSpent / this.totalLimit) * 100)) : 0;
  }

  percent(b: Budget): number {
    return Math.min(100, Math.round((b.spent / b.limit) * 100));
  }

  status(b: Budget): 'ok' | 'warn' | 'over' {
    const ratio = b.spent / b.limit;
    if (ratio > 1) return 'over';
    if (ratio >= 0.85) return 'warn';
    return 'ok';
  }

  statusLabel(b: Budget): string {
    const s = this.status(b);
    return s === 'over' ? 'Over budget' : s === 'warn' ? 'Near limit' : 'On track';
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
    const value = this.form.value;
    this.budgets.push({ category: value.category, limit: Number(value.limit), spent: 0 });
    this.form.reset({ category: this.categoryOptions[0], limit: null, repeat: false });
  }

  remove(budget: Budget) {
    this.budgets = this.budgets.filter((b) => b !== budget);
  }
}
