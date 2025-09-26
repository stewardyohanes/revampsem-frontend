import { UserApiService } from "../api.ts";
import { QueryKeyFactory } from "../../shared/query-key.factory.ts";
import { useQuery } from "@tanstack/react-query";

export const useFindProfitCenter = () => {
  const api = new UserApiService();
  const queryKeyFactory = new QueryKeyFactory("profit-center");

  return useQuery({
    queryKey: queryKeyFactory.all(),
    queryFn: () => api.getProfitCenters(),
  });
};
