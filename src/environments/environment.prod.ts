import type { Environment } from './environment.interface';

/**
 * Production environment.
 * Set apiBaseUrl to your deployed Django backend (e.g. https://api.shinasport.example.com/api).
 * Using relative path assumes the Angular app is served from the same origin as the API.
 */
export const environment: Environment = {
  production: true,
  apiBaseUrl: '/api',
};
