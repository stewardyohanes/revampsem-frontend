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
