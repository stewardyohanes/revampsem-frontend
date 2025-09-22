import { UserApiService } from "../api.ts";
import { useToast } from "../../../hooks/use-toast.ts";
import { UpdateUserDTO } from "../dtos";
import { UserEntity } from "../entities/UserEntity.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateUser = (id: number) => {
  const api = new UserApiService();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UserEntity, Error, UpdateUserDTO>({
    mutationFn: async (dto: UpdateUserDTO) => {
      const user = await api.updateUser(id, dto);
      if (!user) {
        throw new Error("User update failed");
      }
      // Convert UserDto to UserEntity
      const userEntity: UserEntity = {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        password: "", // Not returned from API for security
        profit_center_id: user.profit_center_id || 0,
        level: 0, // Default value
        reset_password: user.reset_password || false,
        token: "", // Not returned from update API
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
      return userEntity;
    },
    onSuccess: async () => {
      toast({
        title: "User updated",
        description: "User has been updated successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast({
        title: "User update failed",
        description: error.message,
      });
    },
  });
};
