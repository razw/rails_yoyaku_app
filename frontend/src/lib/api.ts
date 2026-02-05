import type {
  LoginInput,
  SignupInput,
  UserResponse,
  CsrfTokenResponse,
  ErrorResponse,
  ValidationErrorsResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Store CSRF token in memory
let csrfToken: string | null = null;

/**
 * Fetch CSRF token from the API
 */
export async function fetchCsrfToken(): Promise<string> {
  const response = await fetch(`${API_URL}/csrf`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch CSRF token");
  }

  const data: CsrfTokenResponse = await response.json();
  csrfToken = data.csrf_token;
  return csrfToken;
}

/**
 * Get the current CSRF token, fetching if necessary
 */
export async function getCsrfToken(): Promise<string> {
  if (!csrfToken) {
    return fetchCsrfToken();
  }
  return csrfToken;
}

/**
 * Reset CSRF token (call after logout or on auth errors)
 */
export function resetCsrfToken(): void {
  csrfToken = null;
}

/**
 * Base API request function
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getCsrfToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
      ...options.headers,
    },
  });

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    // Handle CSRF token expiry
    if (response.status === 422 && data.error?.includes("CSRF")) {
      resetCsrfToken();
    }
    throw new ApiError(response.status, data);
  }

  return data as T;
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  status: number;
  data: ErrorResponse | ValidationErrorsResponse;

  constructor(status: number, data: ErrorResponse | ValidationErrorsResponse) {
    const message =
      "error" in data ? data.error : data.errors?.join(", ") || "Unknown error";
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Auth API functions
export const authApi = {
  /**
   * Sign up a new user
   */
  signup: (input: SignupInput): Promise<UserResponse> =>
    apiRequest<UserResponse>("/signup", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /**
   * Log in an existing user
   */
  login: (input: LoginInput): Promise<UserResponse> =>
    apiRequest<UserResponse>("/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /**
   * Log out the current user
   */
  logout: (): Promise<void> =>
    apiRequest<void>("/logout", {
      method: "DELETE",
    }).then(() => {
      resetCsrfToken();
    }),
};
