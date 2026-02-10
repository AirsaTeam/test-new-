# دستورات سمت بک (Django) — کجا و چطور اجرا کنی

همهٔ دستورات زیر را **داخل پوشهٔ `backend`** و با **پایتون محیط مجازی (venv)** اجرا کن.

---

## کجا اجرا کنم؟

**مسیر پروژه:**
```
c:\Users\Soroush Pc\Downloads\myFile\testclone\test-new-\backend
```

**قبل از هر دستور:**
1. یک ترمینال (PowerShell یا CMD) باز کن.
2. برو داخل پوشهٔ بک‌اند:
   ```powershell
   cd "c:\Users\Soroush Pc\Downloads\myFile\testclone\test-new-\backend"
   ```
3. برای اجرای دستورات پایتون/Django از مفسر داخل **venv** استفاده کن:
   ```powershell
   .\venv\Scripts\python.exe
   ```
   یا برای دستورات `manage.py`:
   ```powershell
   .\venv\Scripts\python.exe manage.py ...
   ```

---

## ۱. نصب وابستگی‌ها (اولین بار یا بعد از اضافه شدن پکیج جدید)

**کجا:** داخل `backend`

```powershell
cd "c:\Users\Soroush Pc\Downloads\myFile\testclone\test-new-\backend"
.\venv\Scripts\pip.exe install -r requirements.txt
```

اگر محیط مجازی نداری، اول بسازش و بعد نصب کن:
```powershell
cd "c:\Users\Soroush Pc\Downloads\myFile\testclone\test-new-\backend"
python -m venv venv
.\venv\Scripts\pip.exe install -r requirements.txt
```

---

## ۲. اجرای سرور توسعه (برای کار با فرانت)

**کجا:** داخل `backend`

```powershell
cd "c:\Users\Soroush Pc\Downloads\myFile\testclone\test-new-\backend"
.\venv\Scripts\python.exe manage.py runserver
```

- سرور روی **http://127.0.0.1:8000/** بالا می‌آید.
- فرانت (Angular) با پروکسی به این آدرس درخواست می‌زند.
- برای قطع کردن: در ترمینال `Ctrl+C` بزن.

---

## ۳. مایگریشن (ساخت/اعمال تغییرات دیتابیس)

**کجا:** داخل `backend`

**ساخت فایل مایگریشن بعد از تغییر مدل‌ها:**
```powershell
cd "c:\Users\Soroush Pc\Downloads\myFile\testclone\test-new-\backend"
.\venv\Scripts\python.exe manage.py makemigrations
```

برای یک اپ مشخص:
```powershell
.\venv\Scripts\python.exe manage.py makemigrations accounts
.\venv\Scripts\python.exe manage.py makemigrations bookings
```

**اعمال مایگریشن روی دیتابیس:**
```powershell
.\venv\Scripts\python.exe manage.py migrate
```

---

## ۴. ساخت کاربر ادمین (ورود به پنل ادمین Django)

**کجا:** داخل `backend`

```powershell
cd "c:\Users\Soroush Pc\Downloads\myFile\testclone\test-new-\backend"
.\venv\Scripts\python.exe manage.py createsuperuser
```

- نام کاربری، ایمیل و رمز را وارد کن.
- بعد می‌توانی به **http://127.0.0.1:8000/admin/** بروی و لاگین کنی.

---

## ۵. تنظیم رمز برای یک کاربر با ایمیل

**کجا:** داخل `backend`

```powershell
cd "c:\Users\Soroush Pc\Downloads\myFile\testclone\test-new-\backend"
.\venv\Scripts\python.exe manage.py set_password_by_email EMAIL رمزجدید
```

مثال:
```powershell
.\venv\Scripts\python.exe manage.py set_password_by_email admin@shinas.local admin123
```

---

## ۶. شِل Django (اجرای کد پایتون با دسترسی به مدل‌ها و تنظیمات پروژه)

**کجا:** داخل `backend`

```powershell
cd "c:\Users\Soroush Pc\Downloads\myFile\testclone\test-new-\backend"
.\venv\Scripts\python.exe manage.py shell
```

بعد از باز شدن شِل می‌توانی کد بنویسی، مثلاً:
```python
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.all()
```

برای خروج: `exit()` یا `Ctrl+Z` و Enter (در ویندوز).

---

## ۷. دستورات کمکی

**کجا:** همه داخل `backend`

| کار | دستور |
|-----|--------|
| چک کردن تنظیمات پروژه | `.\venv\Scripts\python.exe manage.py check` |
| لیست دستورات مدیریتی | `.\venv\Scripts\python.exe manage.py help` |
| پاک کردن همهٔ مایگریشن یک اپ (فقط در توسعه؛ خطرناک) | دستی؛ یا حذف فایل‌های داخل `apps/.../migrations/` به‌جز `__init__.py` و بعد `makemigrations` دوباره |

---

## خلاصهٔ مسیر و پیش‌نیاز

| مرحله | مسیر | دستور |
|--------|------|--------|
| ورود به پوشهٔ بک | هر ترمینال | `cd "c:\Users\Soroush Pc\Downloads\myFile\testclone\test-new-\backend"` |
| نصب پکیج‌ها | همانجا | `.\venv\Scripts\pip.exe install -r requirements.txt` |
| مایگریشن | همانجا | `.\venv\Scripts\python.exe manage.py migrate` |
| اجرای سرور | همانجا | `.\venv\Scripts\python.exe manage.py runserver` |
| ساخت سوپریوزر | همانجا | `.\venv\Scripts\python.exe manage.py createsuperuser` |

همهٔ دستورات را **در همین پوشهٔ `backend`** اجرا کن و برای پایتون/پip حتماً از `.\venv\Scripts\python.exe` و `.\venv\Scripts\pip.exe` استفاده کن.
