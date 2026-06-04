const STORAGE_KEY = "vibe_trading_api_auth_key";

// Build-time default so a fresh browser auto-authenticates (judges/demo need no
// manual key entry). A key saved in Settings still overrides this.
const DEFAULT_API_AUTH_KEY =
  ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_AUTH_KEY ?? "").trim();

export function getApiAuthKey(): string {
  return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_API_AUTH_KEY;
}

export function setApiAuthKey(value: string): void {
  const trimmed = value.trim();
  if (trimmed) {
    window.localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

// Current signed-in user id (Clerk). Set once auth resolves; included on every
// request so the backend scopes sessions per user. Empty = anonymous/shared.
let currentUserId = "";
export function setCurrentUserId(id: string): void {
  currentUserId = (id || "").trim();
}

export function authHeaders(): Record<string, string> {
  const key = getApiAuthKey();
  const h: Record<string, string> = key ? { Authorization: `Bearer ${key}` } : {};
  if (currentUserId) h["X-User-Id"] = currentUserId;
  return h;
}

// Fetch a short-lived Clerk session token from the global Clerk instance.
// Returns "" when Clerk is not loaded or no user is signed in.
async function getClerkToken(): Promise<string> {
  try {
    const clerk = (window as unknown as {
      Clerk?: { session?: { getToken: () => Promise<string | null> } };
    }).Clerk;
    const token = clerk?.session ? await clerk.session.getToken() : null;
    return (token || "").trim();
  } catch {
    return "";
  }
}

// Async variant used on the hot request path. Prefers a verified Clerk session
// token; falls back to the static API key (demo bundle / SSE) when signed out.
export async function authHeadersAsync(): Promise<Record<string, string>> {
  const clerkToken = await getClerkToken();
  const bearer = clerkToken || getApiAuthKey();
  const h: Record<string, string> = bearer ? { Authorization: `Bearer ${bearer}` } : {};
  if (currentUserId) h["X-User-Id"] = currentUserId;
  return h;
}

export function authQuerySuffix(): string {
  const key = getApiAuthKey();
  return key ? `api_key=${encodeURIComponent(key)}` : "";
}

export function withAuthQuery(url: string): string {
  const suffix = authQuerySuffix();
  if (!suffix) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${suffix}`;
}
