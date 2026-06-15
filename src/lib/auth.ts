/**
 * Simple single-login auth for SPECTRA SHG Digital Register.
 * 
 * Fixed credentials:
 *   Email:    admin@spectra.org
 *   Password: spectra2026
 */

const AUTH_KEY = "spectra_shg_auth";

// ─── Fixed Login Credentials ────────────────────────────────
const ADMIN_EMAIL = "admin@spectra.org";
const ADMIN_PASSWORD = "spectra2026";
const ADMIN_NAME = "SPECTRA Admin";

export interface User {
  email: string;
  name: string;
  loggedInAt: string;
}

/** Get currently logged-in user, or null */
export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/** Check if user is logged in */
export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

/** Log in with fixed credentials. Returns true on success, error string on failure. */
export function logIn(email: string, password: string): string | true {
  if (!email || !password) return "ईमेल और पासवर्ड भरें";

  if (email.trim().toLowerCase() !== ADMIN_EMAIL) return "गलत ईमेल आईडी";
  if (password !== ADMIN_PASSWORD) return "गलत पासवर्ड";

  const user: User = {
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return true;
}

/** Log out the current user */
export function logOut(): void {
  localStorage.removeItem(AUTH_KEY);
}
