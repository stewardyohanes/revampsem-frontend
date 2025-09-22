// Event DTOs =====
export interface EventDto {
  id: number;
  event: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  profit_center_id?: number;
  ProfitCenter?: ProfitCenterDto;
  Present?: PresentDto[];
}

export interface CreateEventDto {
  name: string;
  created_by: number;
  modified_by: number;
  profit_center: number;
  event_date_from: string | Date;
  event_date_to: string | Date;
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
  invoice?: string;
  name: string;
  email?: string;
  no_telp?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  profit_center_id: number;
  event_id: number;
  ProfitCenter?: ProfitCenterDto;
  Event?: EventDto;
}

export interface CreatePresentDto {
  invoice?: string;
  name: string;
  email?: string;
  no_telp?: string;
  status?: number;
  profit_center_id: number;
  event_id: number;
}

export interface UpdatePresentDto {
  invoice?: string;
  name?: string;
  email?: string;
  no_telp?: string;
  status?: number;
  profit_center_id?: number;
  event_id?: number;
}

export interface PresentQueryParamsDto {
  event_id?: number;
  profit_center_id?: number;
  invoice?: string;
  name?: string;
  email?: string;
  no_telp?: string;
  status?: number;
  page?: number;
  limit?: number;
}

// Import ProfitCenterDto from users service
import { ProfitCenterDto } from "../../users/dtos";

// Legacy DTOs for backward compatibility
export type CreateEventDTO = CreateEventDto;
export type EventDetailDTO = {
  name: string;
  email: string;
  phone: string;
  created_by?: number;
  modified_by?: number;
  event_id?: number;
  attendance?: boolean;
  file?: File | undefined;
};
