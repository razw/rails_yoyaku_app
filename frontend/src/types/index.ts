// User types
export interface User {
  id: number;
  name: string;
  email: string;
  admin: boolean;
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

export interface CurrentUserResponse {
  user: User | null;
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

// Space types
export interface Space {
  id: number;
  name: string;
  description: string | null;
  capacity: number | null;
  price: string | null;
  address: string | null;
}

export interface SpaceWithStatus extends Space {
  status: 'available' | 'occupied';
  occupied_until: string | null;
  next_event_at: string | null;
  current_event: EventSummary | null;
}

// Event types
export interface Event {
  id: number;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  space: {
    id: number;
    name: string;
  };
  is_organizer: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export interface EventSummary {
  id: number;
  name: string;
  starts_at: string;
  ends_at: string;
}

// Timeline event with participation status
export interface TimelineEvent {
  id: number;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  space: {
    id: number;
    name: string;
  };
  organizer: {
    id: number;
    name: string;
  };
  is_organizer: boolean;
  is_participant: boolean;
  user_involved: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

// My event (for home page table, not date-filtered)
export interface MyEvent {
  id: number;
  name: string;
  starts_at: string;
  ends_at: string;
  space: {
    id: number;
    name: string;
  };
  is_organizer: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

// Home page response
export interface HomeResponse {
  spaces: SpaceWithStatus[];
  timeline_events: TimelineEvent[];
  my_events: MyEvent[];
  current_time: string;
  target_date: string;
}

// Event creation input
export interface CreateEventInput {
  event: {
    name: string;
    description: string | null;
    starts_at: string;
    ends_at: string;
    space_id: number;
  };
}

// Event response
export interface EventResponse {
  event: {
    id: number;
    name: string;
    description: string | null;
    starts_at: string;
    ends_at: string;
    space_id: number;
    space: {
      id: number;
      name: string;
    };
    organizer: {
      id: number;
      name: string;
    };
    is_organizer: boolean;
    status: 'pending' | 'approved' | 'rejected';
  };
}

// Spaces list response
export interface SpacesResponse {
  spaces: Space[];
}
