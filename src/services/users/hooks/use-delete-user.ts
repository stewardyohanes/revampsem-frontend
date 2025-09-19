import {UserApiService} from "../api.ts";
import {useToast} from "../../../hooks/use-toast.ts";
import {AxiosError} from "axios";
import {useMutation, useQueryClient} from "@tanstack/react-query";

export const useDeleteUser = () => {
   const api = new UserApiService();
   const queryClient = useQueryClient();
   const {toast} = useToast();
   
   return useMutation({
      mutationFn: (id: number) => api.deleteUser(id),
      onSuccess: async () => {
         toast({
            title: "User deleted",
            description: "User has been deleted successfully",
         });
         await queryClient.invalidateQueries({queryKey: ["users"]});
      },
      onError: (error) => {
         if (error instanceof AxiosError) {
            toast({
               title: "User deletion failed",
               description: error.response?.data.message,
            });
         }
      }
   })
   
}