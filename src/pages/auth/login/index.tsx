import { motion } from "framer-motion";
import { Input } from "../../../components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuthLogin } from "../../../services/auth/hooks/use-auth-login.ts";
import { useIsAuth } from "../../../services/auth/hooks/use-is-auth.ts";
import { authSchema } from "../../../services/auth/validators";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { refetch: refetchAuth } = useIsAuth();
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const login = useAuthLogin();

  const onSubmit = async (data: z.infer<typeof authSchema>) => {
    setIsLoading(true);
    try {
      await login.mutateAsync(data);
      await refetchAuth();

      setTimeout(() => {
        const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
        const userLevel = userData?.level;

        if (userLevel === 0) {
          navigate("/superadmin", { replace: true });
        } else if (userLevel === 1) {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="p-8 sm:p-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
              Welcome back
            </h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="john.doe"
                          className="w-full px-4 py-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="********"
                          className="w-full px-4 py-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-orange-600 hover:text-orange-500"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
