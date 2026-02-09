import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';

const STORAGE_ACCESS = 'shinas_access_token';

/**
 * به همهٔ درخواست‌های HTTP به مسیر /api/ هدر Authorization با توکن JWT اضافه می‌کند
 * تا پنل ادمین (لیست/ویرایش/حذف کاربر) و سایر APIهای محافظت‌شده کار کنند.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    const token = localStorage.getItem(STORAGE_ACCESS);
    if (token && req.url.includes('/api/')) {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}
