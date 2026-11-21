import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Goal {
  id: number;
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
export class Goals {
  // TODO (Roles 3-5): replace with data from the goals service / Firebase.
  goals: Goal[] = [
    { id: 1, name: 'Summer trip', saved: 1800, target: 3000, deadline: '2027-06-01' },
    { id: 2, name: 'Emergency fund', saved: 2400, target: 5000, deadline: '2027-12-01' },
    { id: 3, name: 'Pay off card', saved: 900, target: 1200, deadline: '2027-03-01' },
  ];
  private nextId = 4;

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      target: [null, [Validators.required, Validators.min(1)]],
      saved: [0, [Validators.min(0)]],
      deadline: ['', Validators.required],
    });
  }

  percent(goal: Goal): number {
    return Math.min(100, Math.round((goal.saved / goal.target) * 100));
  }

  /** A circular progress ring drawn with a CSS conic gradient. */
  ring(goal: Goal): string {
    return `conic-gradient(#0B6B5D ${this.percent(goal) * 3.6}deg, #E3F3EF 0)`;
  }

  invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.touched && control.invalid;
  }

  add() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.goals = [
      ...this.goals,
      { id: this.nextId++, name: v.name, target: Number(v.target), saved: Number(v.saved ?? 0), deadline: v.deadline },
    ];
    this.form.reset({ name: '', target: null, saved: 0, deadline: '' });
  }

  addFunds(goal: Goal, amount = 100) {
    goal.saved = Math.min(goal.target, goal.saved + amount);
  }

  remove(goal: Goal) {
    this.goals = this.goals.filter((g) => g.id !== goal.id);
  }
}
