import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { CargoListComponent } from './components/cargo-list/cargo-list.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { AdminCargoComponent } from './components/admin-cargo/admin-cargo.component';
import { AdminReportsComponent } from './components/admin-reports/admin-reports.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profile' },
      { path: 'profile', component: ProfileComponent },
      { path: 'registration', component: BookingFormComponent },
      { path: 'cargo-list', component: CargoListComponent },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', pathMatch: 'full', component: AdminDashboardComponent },
      { path: 'users', component: AdminPanelComponent },
      { path: 'cargo', component: AdminCargoComponent },
      { path: 'reports', component: AdminReportsComponent },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
