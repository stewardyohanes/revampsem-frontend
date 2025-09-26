import API from "../../networks/api.ts";
import {
  CreateUserDTO,
  UpdateUserDTO,
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  ProfitCenterDto,
} from "./dtos";
import { ApiResponseDto } from "../../types/dto";

export class UserApiService {
  async getUsers(): Promise<UserDto[]> {
    try {
      const response = await API.USERS.GET_ALL();
      if (Array.isArray(response)) {
        return response;
      }

      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("UserApiService - Error in getUsers:", error);
      return [];
    }
  }

  async getUser(id: number): Promise<UserDto | undefined> {
    const response = await API.USERS.GET_BY_ID(id);
    return response.data;
  }

  async createUser(dto: CreateUserDTO): Promise<UserDto | undefined> {
    const createData: CreateUserDto = {
      username: dto.username,
      display_name: dto.display_name,
      password: dto.password,
      password_confirmation: dto.password_confirmation,
      profit_center_id: dto.profit_center_id,
    };

    const response = await API.USERS.CREATE(createData);
    return response.data;
  }

  async updateUser(
    id: number,
    dto: UpdateUserDTO
  ): Promise<ApiResponseDto<UserDto>> {
    const updateData: UpdateUserDto = {
      username: dto.username,
      display_name: dto.display_name,
      password: dto.password,
      password_confirmation: dto.password_confirmation,
    };

    const response = await API.USERS.UPDATE(id, updateData);
    return response;
  }

  async deleteUser(id: number): Promise<void> {
    await API.USERS.DELETE(id);
  }

  async getProfitCenters(): Promise<ProfitCenterDto[]> {
    const response = await API.USERS.GET_PROFIT_CENTERS();
    return response.data || [];
  }
}
