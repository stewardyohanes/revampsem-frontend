import { UserApiService } from "../api.ts";
import { useToast } from "../../../hooks/use-toast.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserEntity } from "../entities/UserEntity.ts";
import { CreateUserDTO } from "../dtos";
import { AxiosError } from "axios";

export const useCreateUser = () => {
  const api = new UserApiService();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UserEntity, Error, CreateUserDTO>({
    mutationFn: async (dto: CreateUserDTO) => {
      const user = await api.createUser(dto);
      if (!user) {
        throw new Error("User creation failed");
      }
      // Convert UserDto to UserEntity
      const userEntity: UserEntity = {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        password: "", // Not returned from API for security
        profit_center_id: user.profit_center_id || 0,
        level: 0, // Default value
        reset_password: user.reset_password,
        token: "", // Not returned from create API
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
      return userEntity;
    },
    onSuccess: async () => {
      toast({
        title: "User created",
        description: "User has been created successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast({
          title: "User creation failed",
          description: error.response?.data.message,
        });
      } else {
        toast({
          title: "User creation failed",
          description: error.message,
        });
      }
    },
  });
};
