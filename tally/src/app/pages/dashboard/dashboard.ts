import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
})
export class Dashboard {
  // TODO (Roles 3-5): replace this sample data with data from the shared services.
  summary = { balance: 6480, income: 4200, expenses: 2850, savings: 1350 };

  months = [
    { name: 'Jun', income: 3900, expenses: 3100 },
    { name: 'Jul', income: 3900, expenses: 2900 },
    { name: 'Aug', income: 4100, expenses: 3400 },
    { name: 'Sep', income: 4000, expenses: 3000 },
    { name: 'Oct', income: 4300, expenses: 3300 },
    { name: 'Nov', income: 4200, expenses: 2850 },
  ];

  categories = [
    { name: 'Housing', amount: 1100 },
    { name: 'Food', amount: 640 },
    { name: 'Transport', amount: 380 },
    { name: 'Fun', amount: 290 },
    { name: 'Other', amount: 440 },
  ];

  goals = [
    { name: 'Summer trip', saved: 1800, target: 3000 },
    { name: 'Emergency fund', saved: 2400, target: 5000 },
    { name: 'Pay off card', saved: 900, target: 1200 },
  ];

  transactions = [
    { title: 'Grocery market', category: 'Food', date: '2026-11-19', amount: -62.4 },
    { title: 'Metro card top-up', category: 'Transport', date: '2026-11-18', amount: -20 },
    { title: 'Freelance payment', category: 'Income', date: '2026-11-17', amount: 450 },
    { title: 'Cinema tickets', category: 'Fun', date: '2026-11-15', amount: -24 },
  ];

  barHeight(value: number): number {
    return (value / 5000) * 200;
  }

  goalPercent(goal: { saved: number; target: number }): number {
    return Math.round((goal.saved / goal.target) * 100);
  }

  categoryPercent(amount: number): number {
    return Math.round((amount / this.summary.expenses) * 100);
  }
}
