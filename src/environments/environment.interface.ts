/**
 * Environment configuration used at build and runtime.
 */
export interface Environment {
  production: boolean;
  /** Base URL for the shipping backend API (no trailing slash). */
  apiBaseUrl: string;
}
