import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  user$!: Observable<User | null>;
  message = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      displayName: [''],
      avatarUrl: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
    });
  }

  ngOnInit(): void {
    this.user$ = this.auth.getCurrentUser();
    this.user$.subscribe((u) => {
      if (u) {
        this.form.patchValue({ displayName: u.displayName, avatarUrl: u.avatarUrl || '' });
      }
    });
  }

  onSubmit(): void {
    this.message = '';
    const user = this.auth.getCurrentUserValue();
    if (!user) return;
    const newPwd = this.form.get('newPassword')?.value;
    const confirm = this.form.get('confirmPassword')?.value;
    if (newPwd && newPwd !== confirm) {
      this.message = 'Passwords do not match';
      return;
    }
    this.loading = true;
    const req: { displayName?: string; avatarUrl?: string; password?: string } = {
      displayName: this.form.get('displayName')?.value || user.displayName,
      avatarUrl: this.form.get('avatarUrl')?.value || undefined,
    };
    if (newPwd) req.password = newPwd;
    this.auth.updateUser(user.id, req).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.message = 'Profile updated.';
          this.form.patchValue({ newPassword: '', confirmPassword: '' });
        } else {
          this.message = res.error || 'Update failed';
        }
      },
      error: () => {
        this.loading = false;
        this.message = 'Update failed';
      },
    });
  }
}
