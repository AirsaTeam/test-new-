import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  constructor(private router: Router) {}

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
