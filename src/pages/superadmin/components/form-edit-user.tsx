import {Button} from "../../../components/ui/button.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "../../../components/ui/form.tsx";
import {Input} from "../../../components/ui/input.tsx";
import {Loader2} from "lucide-react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {updateUserSchema} from "../../../services/users/validators";
import {useUpdateUser} from "../../../services/users/hooks/use-update-user.ts";
import {UserDto} from "../../../types/dto";

export function FormEditUser({setOpen, userId, user}: {setOpen: (open: boolean) => void, userId:number, user: UserDto}) {
   const [isLoading, setIsLoading] = useState(false)
   const form = useForm<z.infer<typeof updateUserSchema>>({
     resolver: zodResolver(updateUserSchema),
     defaultValues: {
        username: user.username,
        display_name: user.display_name,
        password: "",
        password_confirmation: "",
     }
  })
   const updateUser = useUpdateUser(userId)

   
   const onSubmit = async (data: z.infer<typeof updateUserSchema>) => {
     setIsLoading(true)
     try {
        await updateUser.mutateAsync(data)
        setOpen(false)
     } finally {
        setIsLoading(false)
     }
  }
   
   return (
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <FormField control={form.control} name="username" render={({field}) => (
               <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Username</FormLabel>
                  <FormControl>
                     <Input {...field} type="text" placeholder="john_doe"
                            className="w-full px-4 py-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" disabled={isLoading}/>
                  </FormControl>
                  <FormMessage/>
               </FormItem>
             )}/>
             <FormField control={form.control} name="display_name" render={({field}) => (
               <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Display Name</FormLabel>
                  <FormControl>
                     <Input {...field} type="text" placeholder="John Doe"
                            className="w-full px-4 py-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" disabled={isLoading}/>
                  </FormControl>
                  <FormMessage/>
               </FormItem>
             )}/>
             <FormField control={form.control} name="password" render={({field}) => (
               <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Password</FormLabel>
                  <FormControl>
                     <Input {...field} type="password" placeholder="********"
                            className="w-full px-4 py-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" disabled={isLoading}/>
                  </FormControl>
                  <FormMessage/>
               </FormItem>
             )}/>
             <FormField control={form.control} name="password_confirmation" render={({field}) => (
               <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Password Confirmation</FormLabel>
                  <FormControl>
                     <Input {...field} type="password" placeholder="********"
                            className="w-full px-4 py-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" disabled={isLoading}/>
                  </FormControl>
                  <FormMessage/>
               </FormItem>
             )}/>
             
             <Button type="submit" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500" disabled={isLoading}>
                   {isLoading ? (
                     <Loader2 className="animate-spin h-5 w-5"/>
                   ) : (
                     <span>
                        Save
                     </span>
                   )}
             </Button>

          </form>
      </Form>
   )
}