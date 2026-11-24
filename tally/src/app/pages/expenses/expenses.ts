import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../../core/services/expense.service'; 
import { Expense } from '../../core/models/expense.model';

@Component({
  selector: 'app-expenses',
  standalone: false,
  templateUrl: './expenses.html',
})
export class Expenses {
  private fb = inject(FormBuilder);
  public expenseService = inject(ExpenseService);

  categories = ['Food', 'Housing', 'Transport', 'Fun', 'Other', 'Utilities', 'Health'];

 
  expense$ = this.expenseService.expenses$;
  
  
  expenses: Expense[] = [];

  form: FormGroup;
  search = new FormControl('');
  filter = new FormControl('All');

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      category: ['Food', Validators.required],
      date: [new Date().toISOString().slice(0, 10), Validators.required],
      recurring: [false],
      frequency: ['monthly'],
      notes: ['']
    });

    this.expense$.subscribe(data => {
      this.expenses = data;
    });
  }

  get filtered(): Expense[] {
    const query = (this.search.value ?? '').toLowerCase();
    const category = this.filter.value ?? 'All';
    return this.expenses.filter(
      (e) => (category === 'All' || e.category === category) && e.title.toLowerCase().includes(query),
    );
  }

  get total(): number {
    return this.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
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
    
    
    const newExpense: any = {
      title: v.title,
      category: v.category,
      date: v.date,
      amount: Number(v.amount),
      recurring: !!v.recurring,
      notes: v.notes || '' 
    };

   
    if (v.recurring) {
      newExpense.frequency = v.frequency;
    }

    try {
      await this.expenseService.add(newExpense);
      
      console.log('Expense added successfully!');
      
     
      this.form.reset({ 
        title: '', 
        amount: null, 
        category: 'Food', 
        date: new Date().toISOString().slice(0, 10), 
        recurring: false,
        frequency: 'monthly',
        notes: ''
      });
      
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      alert('Failed to save the expense. Please check the browser console (F12) for details.');
    }
  }

  remove(expense: Expense) {
    if (expense.id) {
      this.expenseService.delete(expense.id);
    }
  }
}