import { UserApiService } from "../api.ts";
import { useToast } from "../../../hooks/use-toast.ts";
import { CreateUserDTO } from "../dtos";
import { UserEntity } from "../entities/UserEntity.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeyFactory } from "../../shared/query-key.factory.ts";

export const useCreateUser = () => {
  const api = new UserApiService();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryKeyFactory = new QueryKeyFactory("users");

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
        password: "",
        profit_center_id: user.profit_center_id || 0,
        level: user.level || 0,
        reset_password: user.reset_password || false,
        token: "",
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
      
      // Invalidate and refetch all users queries using proper query key factory
      await queryClient.invalidateQueries({
        queryKey: queryKeyFactory.all(),
        exact: false,
      });
      
      await queryClient.refetchQueries({
        queryKey: queryKeyFactory.all(),
        exact: false,
      });
      
      // Also invalidate pagination queries specifically
      await queryClient.invalidateQueries({
        queryKey: queryKeyFactory.pagination(),
        exact: false,
      });
      
      await queryClient.refetchQueries({
        queryKey: queryKeyFactory.pagination(),
        exact: false,
      });
    },
    onError: (error) => {
      toast({
        title: "User creation failed",
        description: error.message,
      });
    },
  });
};
