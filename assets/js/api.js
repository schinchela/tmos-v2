import { CONFIG } from "./config.js";

const TOKEN_KEY = "TMOS_TOKEN";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "API request failed");
  }

  return data;
}

export async function login(email, password) {
  const response = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password }
  });

  setToken(response.data.token);
  return response.data;
}

export async function logout() {
  try {
    await apiRequest("/api/auth/logout", {
      method: "POST"
    });
  } finally {
    clearToken();
  }
}

export async function getMe() {
  return apiRequest("/api/auth/me");
}
