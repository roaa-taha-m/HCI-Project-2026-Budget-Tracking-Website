import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GoalService } from '../../core/services/goal.service';
import { Goal as GoalModel } from '../../core/models/goal.model';

interface Goal {
  id: string;
  name: string;
  saved: number;
  target: number;
  deadline: string;
}

@Component({
  selector: 'app-goals',
  standalone: false,
  templateUrl: './goals.html',
})
export class Goals implements OnInit, OnDestroy {
  goals: Goal[] = [];
  editingId: string | null = null;
  private sub?: Subscription;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private goalService: GoalService,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      target: [null, [Validators.required, Validators.min(1)]],
      saved: [0, [Validators.min(0)]],
      deadline: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.sub = this.goalService.goals$.subscribe((list) => {
      this.goals = list.map((g) => ({
        id: g.id!,
        name: g.name,
        target: g.targetAmount,
        saved: g.savedAmount,
        deadline: g.deadline,
      }));
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  percent(goal: Goal): number {
    return goal.target
      ? Math.min(100, Math.round((goal.saved / goal.target) * 100))
      : 0;
  }

  /** A circular progress ring drawn with a CSS conic gradient. */
  ring(goal: Goal): string {
    return `conic-gradient(#0B6B5D ${this.percent(goal) * 3.6}deg, #E3F3EF 0)`;
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
    const data: GoalModel = {
      name: v.name,
      targetAmount: Number(v.target),
      savedAmount: Number(v.saved ?? 0),
      deadline: v.deadline,
    };

    if (this.editingId) {
      await this.goalService.update(this.editingId, data);
    } else {
      await this.goalService.add(data);
    }
    this.cancelEdit();
  }

  edit(goal: Goal) {
    this.editingId = goal.id;
    this.form.patchValue({
      name: goal.name,
      target: goal.target,
      saved: goal.saved,
      deadline: goal.deadline,
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ name: '', target: null, saved: 0, deadline: '' });
  }

  async addFunds(goal: Goal, amount = 100) {
    await this.goalService.update(goal.id, {
      savedAmount: Math.min(goal.target, goal.saved + amount),
    });
  }

  async remove(goal: Goal) {
    if (confirm('Delete this goal?')) {
      await this.goalService.delete(goal.id);
    }
  }
}