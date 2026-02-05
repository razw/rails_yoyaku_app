// User types
export interface User {
  id: number;
  name: string;
  email: string;
}

// API Request types
export interface SignupInput {
  user: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

// API Response types
export interface UserResponse {
  user: User;
}

export interface CsrfTokenResponse {
  csrf_token: string;
}

export interface ErrorResponse {
  error: string;
}

export interface ValidationErrorsResponse {
  errors: string[];
}
