import API from "../../networks/api";
import { LoginDTO, LoginDto, LoginResponseDto, AuthCheckResponseDto } from "./dtos";

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
