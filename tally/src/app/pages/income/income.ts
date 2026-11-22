import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IncomeService } from '../../core/services/income.service';
import { Income as IncomeModel } from '../../core/models/income.model';

interface IncomeEntry {
  id: string;
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
export class Income implements OnInit, OnDestroy {
  frequencies = ['One-off', 'Weekly', 'Monthly', 'Yearly'];

  entries: IncomeEntry[] = [];
  editingId: string | null = null;
  private sub?: Subscription;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private incomeService: IncomeService,
  ) {
    this.form = this.fb.group({
      source: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      frequency: ['One-off', Validators.required],
      date: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.sub = this.incomeService.incomes$.subscribe((list) => {
      this.entries = list.map((i) => ({
        id: i.id!,
        source: i.source,
        amount: i.amount,
        date: i.date,
        frequency: i.recurring && i.frequency
          ? i.frequency.charAt(0).toUpperCase() + i.frequency.slice(1)
          : 'One-off',
      }));
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
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

  async add() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const recurring = v.frequency !== 'One-off';

    const data: IncomeModel = {
      source: v.source,
      amount: Number(v.amount),
      date: v.date,
      recurring,
      ...(recurring
        ? { frequency: v.frequency.toLowerCase() as 'weekly' | 'monthly' | 'yearly' }
        : {}),
    };

    if (this.editingId) {
      await this.incomeService.update(this.editingId, data);
    } else {
      await this.incomeService.add(data);
    }
    this.cancelEdit();
  }

  edit(entry: IncomeEntry) {
    this.editingId = entry.id;
    this.form.patchValue({
      source: entry.source,
      amount: entry.amount,
      frequency: entry.frequency,
      date: entry.date,
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ source: '', amount: null, frequency: 'One-off', date: '' });
  }

  async remove(entry: IncomeEntry) {
    await this.incomeService.delete(entry.id);
  }
}