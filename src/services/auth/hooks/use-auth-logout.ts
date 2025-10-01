import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { clearAuthData } from "../../../lib/token-manager";
import { useToast } from "../../../hooks/use-toast";

export const useAuthLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      try {
        // Clear authentication data from localStorage
        clearAuthData();
        
        // Clear all React Query cache
        queryClient.clear();
        
        // Additional security: clear any potential session storage
        sessionStorage.clear();
        
        return Promise.resolve();
      } catch (error) {
        console.error("Error during logout:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Show success message
      toast({
        title: "Logout Successful",
        description: "You have successfully logged out of the system",
      });
      
      // Redirect to login page with replace to prevent back navigation
      navigate("/auth/login", { replace: true });
      
      // Force page reload to ensure complete state reset
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 100);
    },
    onError: (error) => {
      // Even if logout fails, still clear data and redirect for security
      clearAuthData();
      queryClient.clear();
      
      toast({
        title: "Logout Failed",
        description: error instanceof Error ? error.message : "An error occurred during logout",
        variant: "destructive",
      });
      
      // Still redirect to login for security
      navigate("/auth/login", { replace: true });
    },
  });
};