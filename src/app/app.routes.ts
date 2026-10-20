import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { SettingsComponent } from './settings/settings';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: 'dashboard' },
];
