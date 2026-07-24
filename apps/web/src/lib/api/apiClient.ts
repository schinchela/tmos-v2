import {
  clearAccessToken,
  getAccessToken,
} from "../../modules/auth/authSession";

interface ApiErrorPayload {
  code?: string;
  message?: string;
  details?: unknown;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorPayload | string;
  meta?: {
    requestId?: string;
  };
}

interface ApiRequestOptions extends RequestInit {
  authenticated?: boolean;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly details?: unknown;

  constructor(options: {
    message: string;
    status: number;
    code?: string;
    requestId?: string;
    details?: unknown;
  }) {
    super(options.message);
    this.name = "ApiClientError";
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.details = options.details;
  }
}

const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim();

const API_BASE_URL = (
  configuredApiBaseUrl || "http://localhost:8787"
).replace(/\/+$/, "");

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    authenticated = true,
    ...init
  } = options;

  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");

  if (authenticated) {
    const token = getAccessToken();

    if (!token) {
      throw new ApiClientError({
        message:
          "No TMOS login session is available in this browser.",
        status: 401,
        code: "AUTH_TOKEN_MISSING",
      });
    }

    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  if (
    init.body !== undefined &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiClientError({
      message:
        "TMOS could not connect to the API. Confirm that the Rust Worker is running.",
      status: 0,
      code: "API_UNREACHABLE",
    });
  }

  let payload: ApiEnvelope<T>;

  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiClientError({
      message:
        "The TMOS API returned an unreadable response.",
      status: response.status,
      code: "API_RESPONSE_INVALID",
      requestId:
        response.headers.get("X-Request-ID") ??
        undefined,
    });
  }

  if (!response.ok || !payload.success) {
    if (
      authenticated &&
      response.status === 401
    ) {
      clearAccessToken();

      window.dispatchEvent(
        new CustomEvent("tmos:unauthorized"),
      );
    }

    const envelopeError = payload.error;

    const errorMessage =
      typeof envelopeError === "string"
        ? envelopeError
        : envelopeError?.message;

    throw new ApiClientError({
      message:
        errorMessage ||
        `The request failed with status ${response.status}.`,
      status: response.status,
      code:
        typeof envelopeError === "string"
          ? undefined
          : envelopeError?.code,
      details:
        typeof envelopeError === "string"
          ? undefined
          : envelopeError?.details,
      requestId:
        payload.meta?.requestId ??
        response.headers.get("X-Request-ID") ??
        undefined,
    });
  }

  if (payload.data === undefined) {
    throw new ApiClientError({
      message:
        "The TMOS API completed the request without returning data.",
      status: response.status,
      code: "API_DATA_MISSING",
      requestId: payload.meta?.requestId,
    });
  }

  return payload.data;
}
