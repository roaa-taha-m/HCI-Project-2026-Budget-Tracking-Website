import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Income } from '../../core/models/income.model';
import { Expense } from '../../core/models/expense.model';

import { Budget } from '../../core/models/budget.model';
import { BudgetService } from '../../core/services/budget.service';

import { IncomeService } from '../../core/services/income.service';
import { ExpenseService } from '../../core/services/expense.service';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.html',
})
export class Reports {

  reportType = new FormControl('income-expenses');
  from = new FormControl('');
  to = new FormControl('');

  currentMonthLabel = new Date().toLocaleString('en-US', {month: 'long', year: 'numeric'});

  private allIncomes: Income[] = [];
  private allExpenses: Expense[] = [];
  private allBudgets: Budget[] = [];

  constructor(private incomeService: IncomeService, 
    private expenseService: ExpenseService, private budgetService: BudgetService) {

    combineLatest({
      incomes: this.incomeService.incomes$,
      expenses: this.expenseService.expenses$,
      budgets: this.budgetService.budget$
    })
      .pipe(takeUntilDestroyed())
      .subscribe(({ incomes, expenses, budgets }) => {
          this.allIncomes = incomes;
          this.allExpenses = expenses;
          this.allBudgets = budgets;

          this.updateReports();
      });

    merge(this.from.valueChanges, this.to.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateReports());
  }

  private buildMonthlySummary(incomes: Income[], expenses: Expense[]) {
    const fromDate = this.from.value;
    const toDate = this.to.value;

    const allDates = [
      ...incomes.map(i => i.date),
      ...expenses.map(e => e.date)
    ].filter(Boolean).sort();

    let startDate: Date;
    let endDate: Date;

    if (fromDate) {
      startDate = new Date(fromDate + 'T00:00:00');
    } 
    else if (toDate && allDates.length > 0) {
      startDate = new Date(allDates[0] + 'T00:00:00');
    } 
    else {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 5);
    }

    if (toDate) {
      endDate = new Date(toDate + 'T00:00:00');
    } 
    else {
      endDate = new Date();
    }

    if (!fromDate && toDate && allDates.length === 0) {
      startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 5);
    }

    const months: {
      key: string;
      name: string;
      income: number;
      expenses: number;
    }[] = [];

    const current = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1
    );

    const last = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      1
    );

    while (current <= last) {
      months.push({
        key: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
        name: current.toLocaleString('en-US', {
          month: 'short',
          year: 'numeric'
        }),
        income: 0,
        expenses: 0
      });

      current.setMonth(current.getMonth() + 1);
    }

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

  private isWithinDateRange(date: string): boolean {
    const fromDate = this.from.value;
    const toDate = this.to.value;

    if (fromDate && date < fromDate) {
      return false;
    }

    if (toDate && date > toDate) {
      return false;
    }

    return true;
  }


  private updateReports(): void {
    const filteredIncomes = this.allIncomes.filter(
      income => this.isWithinDateRange(income.date)
    );

    const filteredExpenses = this.allExpenses.filter(
      expense => this.isWithinDateRange(expense.date)
    );

    this.months = this.buildMonthlySummary(
      filteredIncomes,
      filteredExpenses
    );

    this.incomeExpensesData = {
      labels: this.months.map(m => m.name),
      datasets: [
        {
          label: 'Income',
          data: this.months.map(m => m.income),
          backgroundColor: '#3B9B80',
          borderRadius: 5
        },
        {
          label: 'Expenses',
          data: this.months.map(m => m.expenses),
          backgroundColor: '#E58A57',
          borderRadius: 5
        }
      ]
    };

    this.variance = this.buildBudgetVariance(
      this.allBudgets,
      filteredExpenses
    );

    this.budgetVarianceData = {
      labels: this.variance.map(v => v.category),
      datasets: [
        {
          label: 'Budgeted',
          data: this.variance.map(v => v.budgeted),
          backgroundColor: '#3B9B80',
          borderRadius: 5
        },
        {
          label: 'Actual',
          data: this.variance.map(v => v.actual),
          backgroundColor: '#E58A57',
          borderRadius: 5
        }
      ]
    };

    this.savingsData = {
      ...this.savingsData,
      labels: this.savings.map(s => s.name),
      datasets: [
        {
          ...this.savingsData.datasets[0],
          data: this.savings.map(s => s.amount)
        }
      ]
    };
  }


  private buildBudgetVariance(budgets: Budget[], expenses: Expense[]) {
    const fromDate = this.from.value;
    const toDate = this.to.value;

    const allMonths = new Set([
      ...budgets.map(b => b.month),
      ...expenses.map(e => e.date.slice(0, 7))
    ]);

    const selectedMonths = Array.from(allMonths).filter(month => {
      const monthStart = month + '-01';

      if (fromDate && month < fromDate.slice(0, 7)) {
        return false;
      }

      if (toDate && month > toDate.slice(0, 7)) {
        return false;
      }

      return true;
    });

    const monthlyBudgets = budgets.filter(
      budget => selectedMonths.includes(budget.month)
    );

    const monthlyExpenses = expenses.filter(
      expense => this.isWithinDateRange(expense.date)
    );

    const categories = new Set([
      ...monthlyBudgets.map(b => b.category),
      ...monthlyExpenses.map(e => e.category)
    ]);

    return Array.from(categories).map(category => {

      const budgeted = monthlyBudgets
        .filter(b => b.category === category)
        .reduce((sum, b) => sum + Number(b.limit || 0), 0);

      const actual = monthlyExpenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      return {
        category,
        budgeted,
        actual
      };
    });
  }


  months: {
    name: string;
    income: number;
    expenses: number;
  }[] = [];

  //PrimeNG income vs expenses chart
  incomeExpensesData = {
    labels: this.months.map(m => m.name),
    datasets: [
      {
        label: 'Income',
        data: this.months.map(m => m.income),
        backgroundColor: '#3B9B80',
        borderRadius: 5
      },
      {
        label: 'Expenses',
        data: this.months.map(m => m.expenses),
        backgroundColor: '#E58A57',
        borderRadius: 5
      }
    ]
  };

  incomeExpensesOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#333333',
          font: {
            family: 'Arial, sans-serif',
            size: 14,
            weight: 'bold' as const
          },
          padding: 20
        }
      }
    },

    scales: {
      x: {
        ticks: {
          color: '#444444',
          font: {
            family: 'Arial, sans-serif',
            size: 13
          }
        },
        grid: {
          display: false
        }
      },

      y: {
        beginAtZero: true,
        ticks: {
          color: '#444444',
          font: {
            family: 'Arial, sans-serif',
            size: 13
          },
          callback: (value: string | number) => '$' + value
        }
      }
    }
  };

  variance: {
    category: string;
    budgeted: number;
    actual: number;
  }[] = [];
  

  //PrimeNG budget variance chart
  budgetVarianceData = {
    labels: this.variance.map(v => v.category),
    datasets: [
      {
        label: 'Budgeted',
        data: this.variance.map(v => v.budgeted),
        backgroundColor: '#3B9B80',
        borderRadius: 5
      },
      {
        label: 'Actual',
        data: this.variance.map(v => v.actual),
        backgroundColor: '#E58A57',
        borderRadius: 5
      }
    ]
  };

  budgetVarianceOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#333333',
          font: {
            family: 'Arial, sans-serif',
            size: 14,
            weight: 'bold' as const
          },
          padding: 20
        }
      }
    },

    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: '#444444',
          font: {
            family: 'Arial, sans-serif',
            size: 13
          },
          callback: (value: string | number) => '$' + value
        }
      },

      y: {
        ticks: {
          autoSkip: false,
          color: '#444444',
          font: {
            family: 'Arial, sans-serif',
            size: 13
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  //PrimeNG savings progress chart
  savingsData = {
    labels: this.savings.map(s => s.name),
    datasets: [
      {
        label: 'Monthly savings',
        data: this.savings.map(s => s.amount),
        borderColor: '#3B9B80',
        backgroundColor: 'rgba(59, 155, 128, 0.15)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  savingsOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#333333',
          font: {
            family: 'Arial, sans-serif',
            size: 14,
            weight: 'bold' as const
          },
          padding: 20
        }
      }
    },

    scales: {
      x: {
        ticks: {
          color: '#444444',
          font: {
            family: 'Arial, sans-serif',
            size: 13
          }
        },
        grid: {
          display: false
        }
      },

      y: {
        beginAtZero: true,
        ticks: {
          color: '#444444',
          font: {
            family: 'Arial, sans-serif',
            size: 13
          },
          callback: (value: string | number) => '$' + value
        }
      }
    }
  };


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
