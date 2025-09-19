export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details: string;
  };
}

export interface ProfitCenter {
  id: number;
  profit_center: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  display_name: string;
  profit_center_id?: number;
  created_at: string;
  updated_at: string;
  reset_password: boolean;
  ProfitCenter?: ProfitCenter;
}

export interface CreateUser {
  username: string;
  display_name: string;
  password: string;
  password_confirmation?: string;
  profit_center_id?: number;
}

export interface UpdateUser {
  username?: string;
  display_name?: string;
  password?: string;
}

export interface LogActivity {
  id: number;
  activity: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  User: User;
}

export interface Login {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

export interface AuthCheck {
  user: User;
}

export interface Event {
  id: number;
  event: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  profit_center_id?: number;
  ProfitCenter?: ProfitCenter;
}

export interface CreateEvent {
  name: string;
  created_by: number;
  modified_by: number;
  profit_center: number;
  event_date_from: string;
  event_date_to: string;
}

export interface Present {
  id: number;
  user_id: number;
  event_id: number;
  created_at: string;
  updated_at: string;
  User: User;
  Event: Event;
}

export interface CreatePresent {
  user_id: number;
  event_id: number;
}

export interface UpdatePresent {
  user_id?: number;
  event_id?: number;
}

export interface PresentQueryParams {
  event_id?: number;
  user_id?: number;
  profit_center_id?: number;
  page?: number;
  limit?: number;
}

export interface Sync {
  file: File;
}

export interface SyncResult {
  message: string;
  processed_records?: number;
  errors?: string[];
}

export interface SyncStatus {
  is_syncing: boolean;
  last_sync?: string;
  total_records?: number;
  processed_records?: number;
  errors?: string[];
}

export interface HealthCheck {
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

export interface ConnectionTest {
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

export interface SyncStats {
  total_events: number;
  total_users: number;
  total_presents: number;
  last_sync_date?: string;
  sync_status: "idle" | "running" | "error";
  error_count: number;
}

export interface SyncData {
  message: string;
  synced_records: number;
  failed_records: number;
  errors?: string[];
  sync_duration?: number;
}

export interface UploadAttendance {
  message: string;
  uploaded_count: number;
  failed_count: number;
  errors?: string[];
  event_id: number;
}
