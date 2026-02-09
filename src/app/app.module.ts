import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { BookingSummaryComponent } from './components/booking-summary/booking-summary.component';
import { BarcodeComponent } from './components/barcode/barcode.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CargoListComponent } from './components/cargo-list/cargo-list.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { AdminCargoComponent } from './components/admin-cargo/admin-cargo.component';
import { AdminReportsComponent } from './components/admin-reports/admin-reports.component';

@NgModule({
  declarations: [
    AppComponent,
    BookingFormComponent,
    BookingSummaryComponent,
    BarcodeComponent,
    LoginComponent,
    SignupComponent,
    VerifyEmailComponent,
    DashboardComponent,
    ProfileComponent,
    CargoListComponent,
    AdminPanelComponent,
    AdminLayoutComponent,
    AdminDashboardComponent,
    AdminCargoComponent,
    AdminReportsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
