import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-panel',
  standalone: false,
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css',
})
export class AdminPanelComponent implements OnInit {
  users: User[] = [];
  loading = true;
  editingId: string | null = null;
  editForm: Partial<User> = {};
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.auth.listUsers().subscribe({
      next: (list) => {
        this.users = list;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  startEdit(u: User): void {
    this.editingId = u.id != null ? String(u.id) : null;
    this.editForm = {
      displayName: u.displayName,
      username: u.username,
      email: u.email,
      role: u.role,
    };
    this.error = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm = {};
    this.error = '';
  }

  saveEdit(): void {
    if (this.editingId == null) return;
    this.error = '';
    this.auth.updateUser(this.editingId, {
      displayName: this.editForm.displayName,
      username: this.editForm.username,
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadUsers();
          this.cancelEdit();
        } else {
          this.error = res.error || 'Update failed';
        }
      },
      error: () => {
        this.error = 'Update failed';
      },
    });
  }

  deleteUser(u: User): void {
    if (!confirm(`Delete user "${u.displayName || u.email}"?`)) return;
    this.auth.deleteUser(u.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadUsers();
          if (this.editingId != null && String(this.editingId) === String(u.id)) this.cancelEdit();
        } else {
          this.error = res.error || 'Delete failed';
        }
      },
      error: () => {
        this.error = 'Delete failed';
      },
    });
  }

  back(): void {
    this.router.navigate(['/admin']);
  }
}
