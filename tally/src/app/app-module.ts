import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Shell } from './layout/shell/shell';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Budgets } from './pages/budgets/budgets';
import { Expenses } from './pages/expenses/expenses';
import { Income } from './pages/income/income';
import { Goals } from './pages/goals/goals';
import { Reports } from './pages/reports/reports';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { DaysLeftPipe } from './pipes/days-left-pipe';

@NgModule({
  declarations: [
    App,
    Shell,
    Login,
    Register,
    Dashboard,
    Budgets,
    Expenses,
    Income,
    Goals,
    Reports,
    DaysLeftPipe,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ],
  bootstrap: [App],
})
export class AppModule {}
