import {AuthApiService} from "../api";
import {useQuery} from "@tanstack/react-query";
import {AuthCheckResponseDto} from "../dtos";
import {getAuthToken} from "../../../lib/token-manager";

export const useIsAuth = () => {
   const api = new AuthApiService();
   const token = getAuthToken();
   
   return useQuery<AuthCheckResponseDto>({
      queryKey: ["isAuth"],
      queryFn: () => api.isAuth(),
      retry: 1,
      enabled: !!token, // Only run query if token exists
      staleTime: 5 * 60 * 1000, // 5 minutes
   });
};