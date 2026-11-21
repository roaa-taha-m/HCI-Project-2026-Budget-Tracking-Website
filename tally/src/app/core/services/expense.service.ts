import { Injectable, inject } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Expense } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
    private fs = inject(FirestoreService);
    expenses$ = this.fs.getAll<Expense>('expenses');

    add(e: Expense) { return this.fs.add('expenses', e); }
    update(id: string, e: Partial<Expense>) { return this.fs.update('expenses', id, e); }
    delete(id: string) { return this.fs.remove('expenses', id); }
}
