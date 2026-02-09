import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.getCurrentUser().pipe(
    take(1),
    switchMap((user) => {
      if (user) return of(user);
      if (auth.getAccessToken()) return auth.restoreUser();
      return of(null);
    }),
    take(1),
    map((user) => {
      const role = user?.role?.toLowerCase?.();
      if (role === 'admin') return true;
      router.navigate(['/dashboard']);
      return false;
    })
  );
};
