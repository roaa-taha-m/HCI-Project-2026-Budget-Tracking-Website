import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.html',
})
export class Reports {
  // Report filters (Role 5 will wire these to real data and date ranges).
  reportType = new FormControl('income-expenses');
  from = new FormControl('');
  to = new FormControl('');

  // TODO (Role 5): replace with data from the shared services.
  months = [
    { name: 'Jun', income: 3900, expenses: 3100 },
    { name: 'Jul', income: 3900, expenses: 2900 },
    { name: 'Aug', income: 4100, expenses: 3400 },
    { name: 'Sep', income: 4000, expenses: 3000 },
    { name: 'Oct', income: 4300, expenses: 3300 },
    { name: 'Nov', income: 4200, expenses: 2850 },
  ];

  variance = [
    { category: 'Housing', budgeted: 1200, actual: 1100 },
    { category: 'Food', budgeted: 600, actual: 640 },
    { category: 'Transport', budgeted: 450, actual: 380 },
    { category: 'Fun', budgeted: 400, actual: 290 },
    { category: 'Other', budgeted: 650, actual: 440 },
  ];

  get savings() {
    return this.months.map((m) => ({ name: m.name, amount: m.income - m.expenses }));
  }

  get totalSavings(): number {
    return this.savings.reduce((sum, s) => sum + s.amount, 0);
  }

  get totalBudgeted(): number {
    return this.variance.reduce((sum, v) => sum + v.budgeted, 0);
  }

  get totalActual(): number {
    return this.variance.reduce((sum, v) => sum + v.actual, 0);
  }

  barHeight(value: number, max = 5000): number {
    return (value / max) * 200;
  }

  print() {
    window.print();
  }
}
