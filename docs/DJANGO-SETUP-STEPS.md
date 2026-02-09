# راهنمای نصب و راه‌اندازی Django (گام‌به‌گام)

## پیش‌نیازها

- **Python 3.10+** نصب باشد.
- در ترمینال بررسی کن:
  ```bash
  python --version
  ```
  اگر `python` جواب نداد، امتحان کن:
  ```bash
  py --version
  ```

---

## گام ۱: ساخت پوشهٔ بک‌اند

در کنار پروژه Angular (همان پوشهٔ اصلی پروژه):

```bash
cd "c:\Users\Soroush Pc\Downloads\myFile\testclone\test-new-"
mkdir backend
cd backend
```

---

## گام ۲: ساخت محیط مجازی (Virtual Environment)

```bash
python -m venv venv
```

فعال‌سازی محیط مجازی:

- **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Windows (CMD):**
  ```cmd
  venv\Scripts\activate.bat
  ```

بعد از فعال شدن، اول خط ترمینال باید `(venv)` دیده شود.

---

## گام ۳: نصب پکیج‌ها

با محیط مجازی فعال:

```bash
pip install --upgrade pip
pip install "Django>=5.2,<5.3"
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
```

خلاصهٔ هر پکیج:

| پکیج | کاربرد |
|------|--------|
| Django | فریمورک اصلی |
| djangorestframework | ساخت API (ViewSet, Serializer) |
| djangorestframework-simplejwt | احراز هویت با JWT برای Angular |
| django-cors-headers | اجازه درخواست از فرانت (مثلاً localhost:4200) |

ثبت در فایل وابستگی‌ها:

```bash
pip freeze > requirements.txt
```

---

## گام ۴: ساخت پروژه Django

```bash
django-admin startproject config .
```

- `config` = نام پوشهٔ تنظیمات (می‌توانی عوض کنی).
- نقطهٔ `.` یعنی پروژه در همین پوشهٔ `backend` ساخته شود.

ساختار فعلی:

```
backend/
├── manage.py
├── venv/
├── requirements.txt
└── config/
    ├── __init__.py
    ├── settings.py
    ├── urls.py
    └── asgi.py / wsgi.py
```

---

## گام ۵: تنظیمات اولیه (`config/settings.py`)

### ۵.۱ اضافه کردن اپ‌های شخصی و پکیج‌های ثالث

در `INSTALLED_APPS` بعد از اپ‌های پیش‌فرض Django اضافه کن:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Our apps (بعد از ساخت اپ‌ها اضافه می‌کنی)
    # 'apps.accounts',
    # 'apps.bookings',
]
```

### ۵.۲ قرار دادن CORS در اول middleware

در `MIDDLEWARE` اولین آیتم باید باشد:

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # همین الان اول
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### ۵.۳ اجازه دادن به فرانت Angular

در انتهای فایل:

```python
# CORS: اجازه درخواست از Angular در حالت توسعه
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
]
# یا برای تست راحت‌تر موقتاً همه را اجازه بده:
# CORS_ALLOW_ALL_ORIGINS = True
```

### ۵.۴ تنظیم REST Framework و JWT

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}
```

(اگر دوست داری ابتدا بدون لاگین API را تست کنی، می‌توانی موقتاً `IsAuthenticated` را بردار یا برای یک View خاص غیرفعال کنی.)

---

## گام ۶: ساخت اپ‌ها

از داخل پوشهٔ `backend`:

```bash
mkdir apps
# فایل خالی تا پوشه به عنوان پکیج شناخته شود
# در Windows می‌توانی با echo استفاده کنی یا دستی بسازی
```

ساخت اپ accounts:

```bash
python manage.py startapp accounts apps/accounts
```

ساخت اپ bookings:

```bash
python manage.py startapp bookings apps/bookings
```

یک فایل `apps/__init__.py` و در صورت تمایل `apps/accounts/apps.py` و `apps/bookings/apps.py` را چک کن که `name` درست باشد، مثلاً `apps.accounts` و `apps.bookings`.

سپس در `config/settings.py` در `INSTALLED_APPS` اضافه کن:

```python
'apps.accounts',
'apps.bookings',
```

---

## گام ۷: مسیریابی اولیه API

در `config/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.bookings.urls')),  # بعد از نوشتن urls در bookings
    # path('api/auth/', include('apps.accounts.urls')),  # بعد از نوشتن urls در accounts
]
```

---

## گام ۸: اجرای مایگریشن و سرور

```bash
python manage.py migrate
python manage.py runserver
```

در مرورگر برو به: `http://127.0.0.1:8000/admin/`  
اگر صفحهٔ لاگین ادمین دیدی، یعنی Django درست بالا آمده.

ساخت کاربر ادمین (برای ورود به ادمین):

```bash
python manage.py createsuperuser
```
(نام کاربری، ایمیل، رمز را وارد کن.)

---

## گام ۹: تست اتصال فرانت Angular به بک‌اند

- Angular را با `ng serve` اجرا کن (پورت 4200).
- در پروژه از proxy استفاده می‌کنی؛ درخواست‌های `/api` به `http://localhost:8000` می‌روند.
- یک رزرو از فرم Registration ثبت کن؛ در Network تب مرورگر باید درخواست به `http://localhost:4200/api/bookings/` (و از آنجا به 8000) دیده شود.

---

## خلاصه دستورات (کپی-پیست)

```bash
cd "c:\Users\Soroush Pc\Downloads\myFile\testclone\test-new-"
mkdir backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install "Django>=5.2,<5.3" djangorestframework djangorestframework-simplejwt django-cors-headers
pip freeze > requirements.txt
django-admin startproject config .
python manage.py startapp accounts apps/accounts
python manage.py startapp bookings apps/bookings
```

بعد از آن تنظیمات بالا را در `config/settings.py` اعمال کن، سپس:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

اگر خواستی در قدم بعد مدل‌های `Booking` و endpointهای `POST /api/bookings/` را با هم بنویسیم، بگو تا فایل‌های لازم را اضافه کنیم.
