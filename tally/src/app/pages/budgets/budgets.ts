import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetService } from '../../core/services/budget.service'; 
import { Budget } from '../../core/models/budget.model';

@Component({
  selector: 'app-budgets',
  standalone: false,
  templateUrl: './budgets.html',
})
export class Budgets {
  private fb = inject(FormBuilder);
  public budgetService = inject(BudgetService);

  budget$ = this.budgetService.budget$;
  budgets: Budget[] = [];

  categoryOptions = ['Housing', 'Food', 'Transport', 'Fun', 'Other', 'Health', 'Education', 'Savings', 'Shopping', 'Bills'];
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      category: [this.categoryOptions[0], Validators.required],
      limit: [null, [Validators.required, Validators.min(1)]],
      repeat: [false]
    });

    this.budget$.subscribe(data => {
      this.budgets = data;
    });
  }

  get totalLimit(): number {
    return this.budgets.reduce((sum, b) => sum + Number(b.limit), 0);
  }

  get totalSpent(): number {
    return this.budgets.reduce((sum, b) => sum + 0, 0); 
  }

  get remaining(): number {
    return this.totalLimit - this.totalSpent;
  }

  get usedPercent(): number {
    return this.totalLimit ? Math.min(100, Math.round((this.totalSpent / this.totalLimit) * 100)) : 0;
  }

  percent(b: Budget): number {
    const spent = 0; 
    return Math.min(100, Math.round((spent / b.limit) * 100));
  }

  status(b: Budget): 'ok' | 'warn' | 'over' {
    const spent = 0; 
    const ratio = spent / b.limit;
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
    
    const newBudget: Budget = {
      category: this.form.value.category,
      limit: Number(this.form.value.limit),
      month: new Date().toISOString().slice(0, 7)
    };
    
    this.budgetService.add(newBudget).then(() => {
      this.form.reset({ category: this.categoryOptions[0], limit: null, repeat: false });
    });
  }

  remove(b: Budget) {
    // We check if b.id exists first to satisfy TypeScript
    if (b.id) {
      this.budgetService.delete(b.id);
    }
  }
}