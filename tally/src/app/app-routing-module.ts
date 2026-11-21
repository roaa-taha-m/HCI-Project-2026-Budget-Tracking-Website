import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Budgets } from './pages/budgets/budgets';
import { Expenses } from './pages/expenses/expenses';
import { Income } from './pages/income/income';
import { Goals } from './pages/goals/goals';
import { Reports } from './pages/reports/reports';

const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    // Role 2: add canActivate guards on this route later
    path: '',
    component: Shell,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'budgets', component: Budgets },
      { path: 'expenses', component: Expenses },
      { path: 'income', component: Income },
      { path: 'goals', component: Goals },
      { path: 'reports', component: Reports },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
