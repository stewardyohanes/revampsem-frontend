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
      const event = await api.insertAttendance(event_id, file);
      if (!event) {
        throw new Error("Event creation failed");
      }
      return event;
    },
    onSuccess: async () => {
      toast({
        title: "Event created",
        description: "Event has been created successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast({
          title: "Event creation failed",
          description: error.response?.data.message,
        });
      } else {
        toast({
          title: "Event creation failed",
          description: error.message,
        });
      }
    },
  });
};
