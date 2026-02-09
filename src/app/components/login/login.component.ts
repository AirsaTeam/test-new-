import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  error = '';
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.auth.getAccessToken() && this.auth.getCurrentUserValue()) {
      const role = (this.auth.getCurrentUserValue()?.role ?? '').toLowerCase();
      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  onSubmit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.user) {
          const role = (res.user.role ?? '').toLowerCase();
          if (role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.error = res.error || 'Login failed';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Connection error';
      },
    });
  }
}
