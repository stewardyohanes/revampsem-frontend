import { AuthApiService } from "../api";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { UserEntity } from "../../users/entities/UserEntity";
import { LoginDTO } from "../dtos";
import { useToast } from "../../../hooks/use-toast";
import { AxiosError } from "axios";
import { LoginResponseDto } from "../dtos";
import { setUserData } from "../../../lib/token-manager";

export const useAuthLogin = (): UseMutationResult<
  UserEntity,
  Error,
  LoginDTO
> => {
  const api = new AuthApiService();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UserEntity, Error, LoginDTO>({
    mutationFn: async (dto: LoginDTO) => {
      const response: LoginResponseDto = await api.login(dto);
      const { token, user: userData } = response;

      if (!token) {
        throw new Error("No authentication token received from server");
      }

      if (!userData) {
        throw new Error("No user data received from server");
      }

      return {
        id: userData.id,
        username: userData.username,
        display_name: userData.display_name,
        password: "",
        profit_center_id: userData.profit_center_id || 0,
        level: userData.level || 0,
        reset_password: userData.reset_password || false,
        token,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      };
    },
    onSuccess: async (userEntity) => {
      setUserData({
        id: userEntity.id,
        username: userEntity.username,
        display_name: userEntity.display_name,
        profit_center_id: userEntity.profit_center_id,
        level: userEntity.level,
        reset_password: userEntity.reset_password,
        created_at: userEntity.created_at,
        updated_at: userEntity.updated_at,
      });

      toast({
        title: "Login Successful",
        description: "You have successfully logged into the system",
      });

      // Wait for query invalidation to complete before allowing redirect
      await queryClient.invalidateQueries({ queryKey: ["isAuth"] });
    },
    onError: (error) => {
      const message =
        error instanceof AxiosError
          ? error.response?.data.message
          : error.message;

      toast({
        title: "Login Failed",
        description: message || "An error occurred during login",
        variant: "destructive",
      });
    },
  });
};
