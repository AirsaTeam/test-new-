import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  constructor(private router: Router) {}

  goToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  goToCargo(): void {
    this.router.navigate(['/admin/cargo']);
  }

  goToReports(): void {
    this.router.navigate(['/admin/reports']);
  }
}
