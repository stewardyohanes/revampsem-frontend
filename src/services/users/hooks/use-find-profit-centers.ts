import { UserApiService } from "../api.ts";
import { QueryKeyFactory } from "../../shared/query-key.factory.ts";
import { useQuery } from "@tanstack/react-query";

export const useFindProfitCenters = () => {
  const api = new UserApiService();
  const queryKeyFactory = new QueryKeyFactory("profit-centers");

  return useQuery({
    queryKey: queryKeyFactory.pagination(),
    queryFn: () => api.getProfitCenters(),
  });
};