// Import UserDto from users service
import { UserDto } from "../../users/dtos";

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

// Legacy DTO for backward compatibility
export type LoginDTO = LoginDto;