import { UserApiService } from "../api.ts";
import { QueryKeyFactory } from "../../shared/query-key.factory.ts";
import { useQuery } from "@tanstack/react-query";

export const useFindUsers = () => {
  const api = new UserApiService();
  const queryKeyFactory = new QueryKeyFactory("users");

  return useQuery({
    queryKey: queryKeyFactory.pagination(),
    queryFn: () => api.getUsers(),
  });
};
