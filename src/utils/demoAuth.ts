const AUTH_STORAGE_KEY = "sg-mcp-demo-auth";

export const DEMO_PASSWORD =
  import.meta.env.VITE_DEMO_PASSWORD ?? "Sourcegr@ph-D3m0";

export function isAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function authenticate(password: string): boolean {
  if (password !== DEMO_PASSWORD) {
    return false;
  }

  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, "1");
  } catch {
    return false;
  }

  return true;
}

export function clearAuthentication(): void {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}
