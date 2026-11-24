import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { combineLatest } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Income } from '../../core/models/income.model';
import { Expense } from '../../core/models/expense.model';

import { IncomeService } from '../../core/services/income.service';
import { ExpenseService } from '../../core/services/expense.service';

import { Goal } from '../../core/models/goal.model';
import { GoalService } from '../../core/services/goal.service';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
})
export class Dashboard {

  user$ = inject(AuthService).user$;

  currentMonthLabel = new Date().toLocaleDateString('en-US', {month: 'long', year: 'numeric'});

  summary = {balance: 0, income: 0, expenses: 0, savings: 0};

  constructor(private incomeService: IncomeService, private expenseService: ExpenseService, 
    private cdr: ChangeDetectorRef, private goalService: GoalService) {
    combineLatest({
      incomes: this.incomeService.incomes$,
      expenses: this.expenseService.expenses$,
      goals: this.goalService.goals$
    })
      .pipe(takeUntilDestroyed())
      .subscribe(({ incomes, expenses, goals }) => {

        const currentDate = new Date();
        const currentMonth = `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, '0')}`;

        const totalIncome = incomes.reduce(
          (sum, income) => sum + Number(income.amount || 0),
          0
        );

        const totalExpenses = expenses.reduce(
          (sum, expense) => sum + Number(expense.amount || 0),
          0
        );

        const monthlyIncome = incomes
          .filter(income => income.date.slice(0, 7) === currentMonth)
          .reduce((sum, income) => sum + Number(income.amount || 0), 0);

        const monthlyExpenses = expenses
          .filter(expense => expense.date.slice(0, 7) === currentMonth)
          .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

        this.summary = {
          balance: totalIncome - totalExpenses,
          income: monthlyIncome,
          expenses: monthlyExpenses,
          savings: monthlyIncome - monthlyExpenses
        };

        this.goals = goals.map(goal => ({
          name: goal.name,
          saved: Number(goal.savedAmount) || 0,
          target: Number(goal.targetAmount) || 0
        }));

        this.months = this.buildMonthlySummary(incomes, expenses);
        this.categories = this.buildCategorySummary(expenses);

        this.transactions = [
          ...incomes.map(income => ({
            title: income.source,
            category: 'Income',
            date: income.date,
            amount: Number(income.amount) || 0
          })),

          ...expenses.map(expense => ({
            title: expense.title,
            category: expense.category,
            date: expense.date,
            amount: -Math.abs(Number(expense.amount) || 0)
          }))
        ]
          .sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5);

        this.cdr.markForCheck();
      }
    );
  }

  private buildMonthlySummary(incomes: Income[], expenses: Expense[]) {
    const today = new Date();

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - (5 - index),
        1
      );

      return {
        key: `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}`,
        name: date.toLocaleString('en-US', { month: 'short' }),
        income: 0,
        expenses: 0
      };
    });

    incomes.forEach(income => {
      const month = months.find(
        m => m.key === income.date.slice(0, 7)
      );

      if (month) {
        month.income += Number(income.amount) || 0;
      }
    });

    expenses.forEach(expense => {
      const month = months.find(
        m => m.key === expense.date.slice(0, 7)
      );

      if (month) {
        month.expenses += Number(expense.amount) || 0;
      }
    });

    return months.map(({ key, ...month }) => month);
  }

  private buildCategorySummary(expenses: Expense[]) {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const monthlyExpenses = expenses.filter(
      expense => expense.date.slice(0, 7) === currentMonth
    );

    const categoryTotals = new Map<string, number>();

    monthlyExpenses.forEach(expense => {
      const currentAmount = categoryTotals.get(expense.category) || 0;

      categoryTotals.set(
        expense.category,
        currentAmount + (Number(expense.amount) || 0)
      );
    });

    return Array.from(categoryTotals, ([name, amount]) => ({
      name,
      amount
    })).sort((a, b) => b.amount - a.amount);
  }


  months: {
    name: string;
    income: number;
    expenses: number;
  }[] = [];

  categories: {
    name: string;
    amount: number;
  }[] = [];

  goals: {
    name: string;
    saved: number;
    target: number;
  }[] = [];

  transactions: {
    title: string;
    category: string;
    date: string;
    amount: number;
  }[] = [];

  barHeight(value: number): number {
    const max = Math.max(
      ...this.months.flatMap(m => [m.income, m.expenses]),
      1
    );
    return (value / max) * 200;
  }

  goalPercent(goal: { saved: number; target: number }): number {
    if (goal.target <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((goal.saved / goal.target) * 100));
  }

  categoryPercent(amount: number): number {
    if (this.summary.expenses === 0) {
      return 0;
    }

    return Math.round((amount / this.summary.expenses) * 100);
  }
}
