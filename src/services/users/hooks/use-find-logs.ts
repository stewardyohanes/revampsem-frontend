import { useQuery } from "@tanstack/react-query";
import { UserApiService } from "../api";
import { QueryKeyFactory } from "../../shared/query-key.factory.ts";
import { LogActivityDto } from "../dtos";

export const useFindLogs = () => {
  const api = new UserApiService();
  const queryKeyFactory = new QueryKeyFactory("logs");

  return useQuery<LogActivityDto[]>({
    queryKey: queryKeyFactory.all(),
    queryFn: () => api.getLogs(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
