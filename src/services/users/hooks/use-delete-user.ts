import { UserApiService } from "../api.ts";
import { useToast } from "../../../hooks/use-toast.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeyFactory } from "../../shared/query-key.factory.ts";

export const useDeleteUser = () => {
  const api = new UserApiService();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryKeyFactory = new QueryKeyFactory("users");

  return useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      await api.deleteUser(id);
    },
    onSuccess: async () => {
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeyFactory.all(),
        exact: false,
      });

      await queryClient.refetchQueries({
        queryKey: queryKeyFactory.all(),
        exact: false,
      });

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
        title: "User deletion failed",
        description: error.message,
      });
    },
  });
};
