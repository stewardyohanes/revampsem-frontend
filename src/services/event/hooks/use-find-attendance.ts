import {EventApiService} from "../api.ts";
import {QueryKeyFactory} from "../../shared/query-key.factory.ts";
import {useQuery} from "@tanstack/react-query";

export const useFindAttendance = (eventId: string) => {
   const api = new EventApiService();
   const queryKeyFactory = new QueryKeyFactory("attendance");
   
   return useQuery({
      queryKey: [...queryKeyFactory.all(), eventId],
      queryFn: () => api.getEventAttendees(eventId),
      enabled: !!eventId && eventId.trim() !== ""
   })
}