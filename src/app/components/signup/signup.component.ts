import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  form: FormGroup;
  error = '';
  loading = false;
  success = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      displayName: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  onSubmit(): void {
    this.error = '';
    if (this.form.invalid) {
      if (this.form.get('password')?.value !== this.form.get('confirmPassword')?.value) {
        this.error = 'Passwords do not match';
      }
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.get('password')?.value !== this.form.get('confirmPassword')?.value) {
      this.error = 'Passwords do not match';
      return;
    }
    this.loading = true;
    const { confirmPassword: _, ...req } = this.form.value;
    this.auth.register(req).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.success = true;
          // ایمیل در بک‌اند به‌صورت پیش‌فرض تأیید شده در نظر گرفته می‌شود،
          // بنابراین بعد از ثبت‌نام مستقیم به صفحهٔ لاگین می‌رویم.
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        } else {
          this.error = res.error || 'Registration failed';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Connection error';
      },
    });
  }
}
