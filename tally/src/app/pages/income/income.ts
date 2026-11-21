import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface IncomeEntry {
  id: number;
  source: string;
  frequency: string;
  date: string;
  amount: number;
}

@Component({
  selector: 'app-income',
  standalone: false,
  templateUrl: './income.html',
})
export class Income {
  frequencies = ['One-off', 'Weekly', 'Monthly'];

  // TODO (Roles 3-5): replace with data from the income service / Firebase.
  entries: IncomeEntry[] = [
    { id: 1, source: 'Salary', frequency: 'Monthly', date: '2026-11-01', amount: 3500 },
    { id: 2, source: 'Freelance', frequency: 'One-off', date: '2026-11-17', amount: 450 },
    { id: 3, source: 'Tutoring', frequency: 'Weekly', date: '2026-11-15', amount: 125 },
    { id: 4, source: 'Tutoring', frequency: 'Weekly', date: '2026-11-08', amount: 125 },
  ];
  private nextId = 5;

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      source: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      frequency: ['One-off', Validators.required],
      date: ['', Validators.required],
    });
  }

  get total(): number {
    return this.entries.reduce((sum, e) => sum + e.amount, 0);
  }

  /** Totals grouped by source, used for the cards at the top of the page. */
  get bySource(): { source: string; total: number; percent: number }[] {
    const totals = new Map<string, number>();
    for (const e of this.entries) {
      totals.set(e.source, (totals.get(e.source) ?? 0) + e.amount);
    }
    return Array.from(totals, ([source, total]) => ({
      source,
      total,
      percent: this.total ? Math.round((total / this.total) * 100) : 0,
    }));
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
    this.entries = [
      { id: this.nextId++, source: v.source, frequency: v.frequency, date: v.date, amount: Number(v.amount) },
      ...this.entries,
    ];
    this.form.reset({ source: '', amount: null, frequency: 'One-off', date: '' });
  }

  remove(entry: IncomeEntry) {
    this.entries = this.entries.filter((e) => e.id !== entry.id);
  }
}
