import { Injectable, inject } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Income } from '../models/income.model';

@Injectable({ providedIn: 'root' })
export class IncomeService {
    private fs = inject(FirestoreService);
    incomes$ = this.fs.getAll<Income>('incomes');

    add(i: Income) { return this.fs.add('incomes', i); }
    update(id: string, i: Partial<Income>) { return this.fs.update('incomes', id, i); }
    delete(id: string) { return this.fs.remove('incomes', id); }
}