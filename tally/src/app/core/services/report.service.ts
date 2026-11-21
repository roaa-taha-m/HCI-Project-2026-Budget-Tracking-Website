import { Injectable, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { ExpenseService } from './expense.service';
import { IncomeService } from './income.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
    private expenseSvc = inject(ExpenseService);
    private incomeSvc = inject(IncomeService);

    summary$ = combineLatest([this.expenseSvc.expenses$, this.incomeSvc.incomes$]).pipe(
        map(([expenses, incomes]) => {
            const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
            const totalIncomes = incomes.reduce((sum, i) => sum + i.amount, 0);
            return { totalIncomes, totalExpenses, balance: totalIncomes - totalExpenses };
        })
    );

    byCategory$ = this.expenseSvc.expenses$.pipe(
        map(expenses => 
            expenses.reduce((acc, e) => {
                acc[e.category] = (acc[e.category] ?? 0) + e.amount;
                return acc;
            }, {} as Record<string, number>)
        )
    );
}