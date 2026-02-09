import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: false,
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmailComponent implements OnInit {
  form: FormGroup;
  email = '';
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || '';
  }

  onSubmit(): void {
    this.error = '';
    if (!this.email || this.form.invalid) {
      this.form.markAllAsTouched();
      if (!this.email) this.error = 'Email is required';
      return;
    }
    this.loading = true;
    this.auth.verifyEmail({ email: this.email, code: this.form.get('code')?.value }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = res.error || 'Verification failed';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Connection error';
      },
    });
  }
}
