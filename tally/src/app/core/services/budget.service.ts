import { Injectable, inject } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Budget } from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
    private fs = inject(FirestoreService);
    budget$ = this.fs.getAll<Budget>('budget');

    add(b: Budget) { return this.fs.add('budget', b); }
    update(id: string, b: Partial<Budget>) { return this.fs.update('budget', id, b); }
    delete(id: string) { return this.fs.remove('budget', id); }
}