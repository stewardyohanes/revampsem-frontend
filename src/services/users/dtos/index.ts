// User DTOs
export interface UserDto {
  id: number;
  username: string;
  display_name: string;
  profit_center_id?: number;
  level: number;
  reset_password?: boolean;
  created_at: string;
  updated_at: string;
  ProfitCenter?: ProfitCenterDto;
}

export interface CreateUserDto {
  username: string;
  display_name: string;
  password: string;
  password_confirmation?: string;
  profit_center_id?: number;
  level: number;
}

export interface UpdateUserDto {
  username?: string;
  display_name?: string;
  password?: string;
  password_confirmation?: string;
  profit_center_id?: number;
}

export interface ProfitCenterDto {
  id: number;
  profit_center: string;
  created_at: string;
  updated_at: string;
}

export interface LogActivityDto {
  id: string;
  timestamp: string;
  userId: number;
  username: string;
  actionType: string;
  actionDetail: string;
  ipAddress: string;
  userAgent: string;
  additionalData?: {
    targetUsername?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
  formattedDate: string;
  action: string;
  user: string;
}

export type CreateUserDTO = CreateUserDto;
export type UpdateUserDTO = UpdateUserDto;
