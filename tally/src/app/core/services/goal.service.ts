import { Injectable, inject } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Goal } from '../models/goal.model';

@Injectable({ providedIn: 'root' })
export class GoalService {
    private fs = inject(FirestoreService);
    goals$ = this.fs.getAll<Goal>('goals');

    add(g: Goal)                         { return this.fs.add('goals', g); }
    update(id: string, g: Partial<Goal>) { return this.fs.update('goals', id, g); }
    delete(id: string)                   { return this.fs.remove('goals', id); }
}