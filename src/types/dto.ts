import { EventDto, PresentDto } from "@/networks/api";

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

export interface QRCodeDto {
  id: number;
  token: string;
  used_at: string | null;
  expired_at: string;
  status_email: boolean;
  status_whatsapp: boolean;
  created_at: string;
  updated_at: string;
  present_id: number;
  Present?: PresentDto;
}

export interface QRCodeInfoDto {
  token: string;
  expires_at: string;
  is_used: boolean;
  used_at: string | null;
}

export interface QRCodeCheckInDto {
  token: string;
}

export interface QRCodeCheckInResponseDto {
  success: boolean;
  message: string;
  data: {
    present: PresentDto;
    event: EventDto;
    checked_in_at: string;
  };
}

export interface QRCodeValidateResponseDto {
  success: boolean;
  message: string;
  data: {
    token: string;
    present: PresentDto;
    event: EventDto;
    expires_at: string;
    is_used: boolean;
    used_at: string | null;
  };
}

export interface QRCodeByPresentResponseDto {
  success: boolean;
  message: string;
  data: {
    token: string;
    expires_at: string;
    is_used: boolean;
    used_at: string | null;
    present: PresentDto;
    event: EventDto;
  };
}

export interface RegenerateQRCodeDto {
  present_id: number;
}

export interface RegenerateQRCodeResponseDto {
  success: boolean;
  message: string;
  data: {
    token: string;
    expires_at: string;
    present: PresentDto;
  };
}

export interface RegenerateAllQRCodeDto {
  event_id: number;
}

export interface RegenerateAllQRCodeResponseDto {
  success: boolean;
  message: string;
  data: {
    totalPresents: number;
    regenerated: number;
    failed: number;
    errors: string[];
  };
}

export interface RegenerateAndSendAllQRCodeDto {
  event_id: number;
  customMessage?: string;
}

export interface RegenerateAndSendAllQRCodeResponseDto {
  success: boolean;
  message: string;
  data: {
    totalPresents: number;
    regenerated: number;
    emailSent: number;
    failed: number;
    errors: string[];
  };
}

export interface SendQRCodeEmailDto {
  present_id: number;
  customMessage?: string;
  recipientEmail?: string;
}

export interface SendQRCodeEmailResponseDto {
  success: boolean;
  message: string;
  data?: {
    present_id: number;
    customMessage: string | null;
    recipientEmail: string | null;
  };
}

export interface SendQRCodeToAllDto {
  event_id: number;
  customMessage?: string;
}

export interface SendQRCodeToAllResponseDto {
  success: boolean;
  message: string;
  data: {
    totalPresents: number;
    emailSent: number;
    failed: number;
    errors: string[];
  };
}

export interface QRCodeErrorResponseDto {
  success: false;
  message: string;
  error?: string;
}
