import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const useQuerySync = () => {
  const queryClient = useQueryClient();

  const refreshEvents = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["events"] });
  }, [queryClient]);

  const refreshAttendance = useCallback(
    async (eventId?: string) => {
      if (eventId) {
        await queryClient.invalidateQueries({
          queryKey: ["attendance", "all", eventId],
        });
      } else {
        await queryClient.invalidateQueries({ queryKey: ["attendance"] });
      }
    },
    [queryClient]
  );

  const refreshPresents = useCallback(
    async (eventId?: string) => {
      if (eventId) {
        await queryClient.invalidateQueries({
          queryKey: ["presents", eventId],
        });
      } else {
        await queryClient.invalidateQueries({ queryKey: ["presents"] });
      }
    },
    [queryClient]
  );

  const refreshAll = useCallback(
    async (eventId?: string) => {
      await Promise.all([
        refreshEvents(),
        refreshAttendance(eventId),
        refreshPresents(eventId),
      ]);
    },
    [refreshEvents, refreshAttendance, refreshPresents]
  );

  const triggerDataUpdate = useCallback(
    async (options?: {
      eventId?: string;
      type?: "events" | "attendance" | "presents" | "all";
    }) => {
      const { eventId, type = "all" } = options || {};

      switch (type) {
        case "events":
          await refreshEvents();
          break;
        case "attendance":
          await refreshAttendance(eventId);
          break;
        case "presents":
          await refreshPresents(eventId);
          break;
        case "all":
        default:
          await refreshAll(eventId);
          break;
      }
    },
    [refreshEvents, refreshAttendance, refreshPresents, refreshAll]
  );

  return {
    refreshEvents,
    refreshAttendance,
    refreshPresents,
    refreshAll,
    triggerDataUpdate,
  };
};
