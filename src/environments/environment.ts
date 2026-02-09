import type { Environment } from './environment.interface';

/**
 * Development environment.
 * With ng serve, use relative /api so the dev server proxy (proxy.conf.json) forwards to Django at http://localhost:8000.
 */
export const environment: Environment = {
  production: false,
  apiBaseUrl: '/api',
};
