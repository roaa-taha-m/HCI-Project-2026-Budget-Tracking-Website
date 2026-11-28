import { Injectable, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { ExpenseService } from './expense.service';
import { IncomeService } from './income.service';
import { BudgetService } from './budget.service';
import { Budget } from '../models/budget.model';
import { Expense } from '../models/expense.model';
import { Income } from '../models/income.model';

export interface MonthRow {
    name: string;
    income: number;
    expenses: number;
}

export interface VarianceRow {
    category: string;
    budgeted: number;
    actual: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
    private expenseSvc = inject(ExpenseService);
    private incomeSvc = inject(IncomeService);
    private budgetSvc = inject(BudgetService);

    data$ = combineLatest({
        incomes: this.incomeSvc.incomes$,
        expenses: this.expenseSvc.expenses$,
        budgets: this.budgetSvc.budget$,
    });

    summary$ = combineLatest([this.expenseSvc.expenses$, this.incomeSvc.incomes$]).pipe(
        map(([expenses, incomes]) => {
            const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const totalIncomes = incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
            return { totalIncomes, totalExpenses, balance: totalIncomes - totalExpenses };
        })
    );

    byCategory$ = this.expenseSvc.expenses$.pipe(
        map(expenses => 
            expenses.reduce((acc, e) => {
                acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount || 0);
                return acc;
            }, {} as Record<string, number>)
        )
    );

    filterByRange<T extends { date: string }>(items: T[], from: string, to: string): T[] {
        return items.filter(item => {
            if (from && item.date < from) return false;
            if (to && item.date > to) return false;
            return true;
        });
    }

    buildMonthlySummary(income: Income[], expenses: Expense[], from: string, to: string): MonthRow[] {
        const dates = [...income.map(i => i.date), ...expenses.map(e => e.date)]
            .filter(Boolean)
            .sort();

        const end = to ? new Date(to + 'T00:00:00') : new Date();
        let start: Date;
        if (from) {
            start = new Date(from + 'T00:00:00');
        } else if (to && dates.length > 0) {
            start = new Date(dates[0] + 'T00:00:00');
        } else {
            start = new Date(end.getFullYear(), end.getMonth() - 5, 1);
        }

        const rows = new Map<string, MonthRow>();
        const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
        const last = new Date(end.getFullYear(), end.getMonth(), 1);

        while (cursor <= last) {
            const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
            rows.set(key, {
                name: cursor.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
                income: 0,
                expenses: 0,
            });
            cursor.setMonth(cursor.getMonth() + 1);
        }

        income.forEach(i => {
            const row = rows.get(i.date.slice(0, 7));
            if (row) row.income += Number(i.amount) || 0;
        });
        expenses.forEach(e => {
            const row = rows.get(e.date.slice(0, 7));
            if (row) row.expenses += Number(e.amount) || 0;
        });
        return Array.from(rows.values());
    }

    buildBudgetVariance(budgets: Budget[], expenses: Expense[], from: string, to: string): VarianceRow[] {
        const monthlyBudgets = budgets.filter(b => {
            if (from && b.month < from.slice(0, 7)) return false;
            if (to && b.month > to.slice(0, 7)) return false;
            return true;
        });

        const monthlyExpenses = this.filterByRange(expenses, from, to);

        const categories = new Set([
            ...monthlyBudgets.map(b => b.category),
            ...monthlyExpenses.map(e => e.category),
        ]);

        return Array.from(categories).map(category => ({
            category,
            budgeted: monthlyBudgets
                .filter(b => b.category === category)
                .reduce((sum, b) => sum + Number(b.limit || 0), 0),
            actual: monthlyExpenses
                .filter(e => e.category === category)
                .reduce((sum, e) => sum + Number(e.amount || 0), 0),
        }));
    }
}