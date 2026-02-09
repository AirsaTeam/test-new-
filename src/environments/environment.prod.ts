import type { Environment } from './environment.interface';

/**
 * Production environment.
 * Set apiBaseUrl to your deployed Django backend (e.g. https://api.shinasport.example.com/api).
 * Using relative path assumes the Angular app is served from the same origin as the API.
 */
export const environment: Environment = {
  production: true,
  // در محیط واقعی حتماً از HTTPS استفاده کن، مثلاً:
  // apiBaseUrl: 'https://api.your-domain.com/api',
  // اگر فرانت و بک روی یک دامنه هستند، می‌توانی '/api' بگذاری و SSL را روی وب‌سرور (Nginx/Apache) فعال کنی.
  apiBaseUrl: '/api',
};
