const ACCESS_TOKEN_KEY = "tmos_access_token";

export function getAccessToken(): string | null {
  const token = window.localStorage
    .getItem(ACCESS_TOKEN_KEY)
    ?.trim();

  return token || null;
}

export function setAccessToken(token: string): void {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    throw new Error("The access token cannot be empty.");
  }

  window.localStorage.setItem(
    ACCESS_TOKEN_KEY,
    normalizedToken,
  );
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function hasAccessToken(): boolean {
  return getAccessToken() !== null;
}
