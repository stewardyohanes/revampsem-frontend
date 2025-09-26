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
  id: number;
  user_id: number;
  activity: string;
  description?: string;
  created_at: string;
  User?: UserDto;
}

export type CreateUserDTO = CreateUserDto;
export type UpdateUserDTO = UpdateUserDto;
