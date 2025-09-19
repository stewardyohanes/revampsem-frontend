/**
 * Data Transfer Objects (DTOs) for API Communication
 * Defines the structure of data sent to and received from API endpoints
 */

// ===== Authentication DTOs =====
export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: UserDto;
}

export interface AuthCheckResponseDto {
  user: UserDto;
}

// ===== User DTOs =====
export interface UserDto {
  id: number;
  username: string;
  display_name: string;
  profit_center_id?: number;
  created_at: string;
  updated_at: string;
  reset_password: boolean;
  ProfitCenter?: ProfitCenterDto;
}

export interface CreateUserDto {
  username: string;
  display_name: string;
  password: string;
  password_confirmation?: string;
  profit_center_id?: number;
}

export interface UpdateUserDto {
  username?: string;
  display_name?: string;
  password?: string;
}

export interface ProfitCenterDto {
  id: number;
  profit_center: string;
  created_at: string;
  updated_at: string;
}

export interface LogActivityDto {
  id: number;
  activity: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  User: UserDto;
}

// ===== Event DTOs =====
export interface EventDto {
  id: number;
  event: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  profit_center_id?: number;
  ProfitCenter?: ProfitCenterDto;
}

export interface CreateEventDto {
  name: string;
  created_by: number;
  modified_by: number;
  profit_center: number;
  event_date_from: string;
  event_date_to: string;
}

export interface UploadAttendanceDto {
  message: string;
  uploaded_count: number;
  failed_count: number;
  errors?: string[];
  event_id: number;
}

// ===== Present DTOs =====
export interface PresentDto {
  id: number;
  user_id: number;
  event_id: number;
  created_at: string;
  updated_at: string;
  User: UserDto;
  Event: EventDto;
}

export interface CreatePresentDto {
  user_id: number;
  event_id: number;
}

export interface UpdatePresentDto {
  user_id?: number;
  event_id?: number;
}

export interface PresentQueryParamsDto {
  event_id?: number;
  user_id?: number;
  profit_center_id?: number;
  page?: number;
  limit?: number;
}

// ===== Sync DTOs =====
export interface SyncDto {
  file: File;
}

export interface SyncResultDto {
  message: string;
  processed_records?: number;
  errors?: string[];
}

export interface SyncStatusDto {
  is_syncing: boolean;
  last_sync?: string;
  total_records?: number;
  processed_records?: number;
  errors?: string[];
}

export interface HealthCheckDto {
  status: string;
  timestamp: string;
  database?: {
    connected: boolean;
    latency?: number;
  };
  external_services?: {
    [serviceName: string]: {
      connected: boolean;
      latency?: number;
    };
  };
}

export interface ConnectionTestDto {
  database: {
    connected: boolean;
    message: string;
  };
  external_apis: {
    [apiName: string]: {
      connected: boolean;
      message: string;
    };
  };
}

export interface SyncStatsDto {
  total_events: number;
  total_users: number;
  total_presents: number;
  last_sync_date?: string;
  sync_status: "idle" | "running" | "error";
  error_count: number;
}

export interface SyncDataDto {
  message: string;
  synced_records: number;
  failed_records: number;
  errors?: string[];
  sync_duration?: number;
}

// ===== Common DTOs =====
export interface ApiResponseDto<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details: string;
  };
}

export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponseDto<T = unknown> extends ApiResponseDto<T> {
  pagination?: PaginationDto;
}

// ===== Error DTOs =====
export interface ErrorDto {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
}

export interface ValidationErrorDto extends ErrorDto {
  field_errors: {
    [field: string]: string[];
  };
}