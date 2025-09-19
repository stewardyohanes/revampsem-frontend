import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../hooks/use-toast.ts";
import { AxiosError } from "axios";
import { CreateEventDTO } from "../dtos";
import { EventApiService } from "../api.ts";

export const useCreateEvent = () => {
  const api = new EventApiService();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (dto: CreateEventDTO) => {
      const user = await api.insertEvent(dto);
      if (!user) {
        throw new Error("Event creation failed");
      }
      return user;
    },
    onSuccess: async () => {
      toast({
        title: "Event created",
        description: "Event has been created successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
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
