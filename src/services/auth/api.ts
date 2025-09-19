import API from "../../networks/api";
import { LoginDTO } from "./dtos";
import { LoginDto, LoginResponseDto, AuthCheckResponseDto } from "../../types/dto";

export class AuthApiService {
  async login(dto: LoginDTO): Promise<LoginResponseDto> {
    const loginData: LoginDto = {
      username: dto.username,
      password: dto.password,
    };
    
    return await API.AUTH.LOGIN(loginData);
  }

  async isAuth(): Promise<AuthCheckResponseDto> {
    return await API.AUTH.CHECK();
  }
}
