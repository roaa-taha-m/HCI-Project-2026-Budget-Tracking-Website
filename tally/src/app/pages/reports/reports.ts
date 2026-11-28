import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Income } from '../../core/models/income.model';
import { Expense } from '../../core/models/expense.model';
import { Budget } from '../../core/models/budget.model';
import { MonthRow, ReportService, VarianceRow } from '../../core/services/report.service';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.html',
})
export class Reports {
  reportType = new FormControl('income-expenses');
  from = new FormControl('');
  to = new FormControl('');

  private allIncomes: Income[] = [];
  private allExpenses: Expense[] = [];
  private allBudgets: Budget[] = [];

  months: MonthRow[] = [];
  variance: VarianceRow[] = [];

  incomeExpensesData: any = { labels: [], datasets: [] };
  budgetVarianceData: any = { labels: [], datasets: [] };
  savingsData: any = { labels: [], datasets: [] };

  incomeExpensesOptions = this.buildOptions(false);
  budgetVarianceOptions = this.buildOptions(true);
  savingsOptions = this.buildOptions(false);

  constructor(private report: ReportService) {
    this.report.data$.pipe(takeUntilDestroyed()).subscribe(({ incomes, expenses, budgets }) => {
      this.allIncomes = incomes;
      this.allExpenses = expenses;
      this.allBudgets = budgets;
      this.updateReports();
    });

    merge(this.from.valueChanges, this.to.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateReports());
  }

  private updateReports(): void {
    const from = this.from.value ?? '';
    const to = this.to.value ?? '';

    const incomes = this.report.filterByRange(this.allIncomes, from, to);
    const expenses = this.report.filterByRange(this.allExpenses, from, to);

    // Income vs expenses + savings
    this.months = this.report.buildMonthlySummary(incomes, expenses, from, to);

    this.incomeExpensesData = {
      labels: this.months.map(m => m.name),
      datasets: [
        { label: 'Income', data: this.months.map(m => m.income), backgroundColor: '#3B9B80', borderRadius: 5 },
        { label: 'Expenses', data: this.months.map(m => m.expenses), backgroundColor: '#E58A57', borderRadius: 5 },
      ],
    };

    this.savingsData = {
      labels: this.months.map(m => m.name),
      datasets: [
        {
          label: 'Monthly savings',
          data: this.months.map(m => m.income - m.expenses),
          borderColor: '#3B9B80',
          backgroundColor: 'rgba(59, 155, 128, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };

    // Budget variance
    this.variance = this.report.buildBudgetVariance(this.allBudgets, this.allExpenses, from, to);

    this.budgetVarianceData = {
      labels: this.variance.map(v => v.category),
      datasets: [
        { label: 'Budgeted', data: this.variance.map(v => v.budgeted), backgroundColor: '#3B9B80', borderRadius: 5 },
        { label: 'Actual', data: this.variance.map(v => v.actual), backgroundColor: '#E58A57', borderRadius: 5 },
      ],
    };
  }

  private buildOptions(horizontal: boolean) {
    const tick = { color: '#444444', font: { family: 'Arial, sans-serif', size: 13 } };
    const money = (value: string | number) => '$' + value;

    return {
      indexAxis: horizontal ? ('y' as const) : ('x' as const),
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: '#333333',
            font: { family: 'Arial, sans-serif', size: 14, weight: 'bold' as const },
            padding: 20,
          },
        },
      },
      scales: {
        x: horizontal
          ? { beginAtZero: true, ticks: { ...tick, callback: money } }
          : { ticks: tick, grid: { display: false } },
        y: horizontal
          ? { ticks: { ...tick, autoSkip: false }, grid: { display: false } }
          : { beginAtZero: true, ticks: { ...tick, callback: money } },
      },
    };
  }

  get rangeLabel(): string {
    const from = this.from.value;
    const to = this.to.value;
    if (from && to) return `${from} to ${to}`;
    if (from) return `From ${from}`;
    if (to) return `Up to ${to}`;
    return 'All time';
  }

  get totalSavings(): number {
    return this.months.reduce((sum, m) => sum + (m.income - m.expenses), 0);
  }

  get totalBudgeted(): number {
    return this.variance.reduce((sum, v) => sum + v.budgeted, 0);
  }

  get totalActual(): number {
    return this.variance.reduce((sum, v) => sum + v.actual, 0);
  }

  print() {
    window.print();
  }
}