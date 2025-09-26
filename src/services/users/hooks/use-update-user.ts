import { UserApiService } from "../api.ts";
import { useToast } from "../../../hooks/use-toast.ts";
import { UpdateUserDTO } from "../dtos";
import { UserEntity } from "../entities/UserEntity.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeyFactory } from "../../shared/query-key.factory.ts";

export const useUpdateUser = (id: number) => {
  const api = new UserApiService();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryKeyFactory = new QueryKeyFactory("users");

  return useMutation<UserEntity, Error, UpdateUserDTO>({
    mutationFn: async (dto: UpdateUserDTO) => {
      const response = await api.updateUser(id, dto);

      if (!response) {
        throw new Error("No response received from server");
      }

      if (response.message && response.message.includes("successfully")) {
        const userEntity: UserEntity = {
          id: id,
          username: dto.username ?? "",
          display_name: dto.display_name ?? "",
          password: "",
          profit_center_id: 0,
          level: 0,
          reset_password: false,
          token: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return userEntity;
      }

      if (response.success === false) {
        throw new Error(response.message || "User update failed");
      }

      const user = response.data;
      if (!user) {
        throw new Error("User data not found in response");
      }

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
        title: "User updated",
        description: "User has been updated successfully",
      });

      // Invalidate and refetch users queries
      await queryClient.invalidateQueries({
        queryKey: queryKeyFactory.all(),
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeyFactory.pagination(),
      });

      // Also invalidate profit centers queries to refresh the mapping
      const profitCenterQueryKey = new QueryKeyFactory("profit-centers");
      await queryClient.invalidateQueries({
        queryKey: profitCenterQueryKey.pagination(),
      });

      // Force refetch to ensure immediate update
      await queryClient.refetchQueries({
        queryKey: queryKeyFactory.pagination(),
      });
    },
    onError: (error) => {
      toast({
        title: "User update failed",
        description: error.message,
      });
    },
  });
};
