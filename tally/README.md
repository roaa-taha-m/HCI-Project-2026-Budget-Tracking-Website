# Tally: Budget Tracking Website

Tally is a web app for tracking budgets, expenses, income and savings goals, with charts and reports. It was built as the HCI (Human Computer Interaction) course project, 2026.

**Live site:** https://hci-budget-tracking.web.app

## Features

- **Authentication:** register and log in with email and password. Pages are protected by a route guard.
- **Dashboard:** summary cards and charts of your finances.
- **Budgets:** create monthly budgets per category.
- **Expenses:** add, edit and delete expenses, including recurring ones.
- **Income:** track income sources.
- **Goals:** set savings goals with progress and days left.
- **Reports:** income vs expenses, budget variance and savings progress, with a date filter and print/PDF export.

## Tech stack

| Area | Technology |
|---|---|
| Framework | Angular 22 (NgModule-based) |
| Forms | Angular Reactive Forms |
| UI components and charts | PrimeNG, Chart.js |
| Auth and database | Firebase Authentication, Cloud Firestore (via `@angular/fire`) |
| Async data | RxJS |
| Hosting | Firebase Hosting |
| Prototype | Figma: [link] |

## Project structure

```
src/app/
  auth/          login and register pages
  core/
    guards/      route guard (auth.guard.ts)
    models/      Expense, Income, Budget, Goal interfaces
    services/    FirestoreService (generic CRUD), Auth, Expense, Income,
                 Budget, Goal and Report services
  layout/shell/  navigation layout
  pages/         dashboard, budgets, expenses, income, goals, reports
  pipes/         custom pipes (days left)
src/environments/  Firebase configuration
```

All data is stored per user in Firestore under `users/{uid}/...`, and security rules allow users to read and write only their own data.

## Run it locally

Requirements: Node.js (LTS), Git and the Angular CLI (`npm i -g @angular/cli`).

```bash
git clone https://github.com/roaa-taha-m/HCI-Project-2026-Budget-Tracking-Website.git
cd HCI-Project-2026-Budget-Tracking-Website/tally
npm install
ng serve
```

Open http://localhost:4200. The repo includes a `.npmrc` with `legacy-peer-deps=true`, because `@angular/fire` does not yet declare support for Angular 22.

## Build and deploy

```bash
ng build                          # output goes to dist/tally/browser
firebase login                    # first time only
firebase deploy --only hosting
```

The Firebase project is `hci-budget-tracking`. Deploying requires Owner or Editor access to that project.