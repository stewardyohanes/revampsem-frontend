import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useToast } from "../../../hooks/use-toast.ts";
import { EventApiService } from "../api.ts";

export const useCreateAttendance = () => {
  const api = new EventApiService();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      event_id,
      file,
    }: {
      event_id: string;
      file: File;
    }) => {
      const result = await api.insertAttendance(event_id, file);
      if (!result) {
        throw new Error("Attendance upload failed");
      }
      return result;
    },
    onSuccess: async () => {
      toast({
        title: "Attendance uploaded",
        description: "Attendance has been uploaded successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["attendance"] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast({
          title: "Attendance upload failed",
          description: error.response?.data.message || error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Attendance upload failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });
};
