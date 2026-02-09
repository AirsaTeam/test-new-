import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
    private router: Router
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // در نسخهٔ جدید، ایمیل در بک‌اند هم‌زمان با ثبت‌نام تأیید می‌شود،
    // بنابراین این صفحه فقط جنبهٔ نمایشی دارد و کاربر را به صفحهٔ لاگین می‌برد.
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/login']);
    }, 500);
  }
}
