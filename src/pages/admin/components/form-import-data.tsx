import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form.tsx";
import { Input } from "../../../components/ui/input.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAttendanceSchema,
  createEventSchema,
} from "../../../services/event/validators";
import { useCreateEvent } from "../../../services/event/hooks/use-create-event.ts";
import { useFindProfitCenter } from "../../../services/users/hooks/use-find-profit-center.ts";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover.tsx";
import { cn } from "../../../lib/utils.ts";
import { Calendar } from "../../../components/ui/calendar.tsx";
import { format } from "date-fns";
import { useFindEvent } from "../../../services/event/hooks/use-find-event.ts";
import { EventDto } from "../../../services/event/dtos";
import { useCreateAttendance } from "../../../services/event/hooks/use-create-attendance.ts";

export default function FormImportData() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "",
      event_date_from: undefined,
      event_date_to: undefined,
      profit_center: 0,
      file: null,
    },
  });

  const formAttendance = useForm<z.infer<typeof createAttendanceSchema>>({
    resolver: zodResolver(createAttendanceSchema),
    defaultValues: {
      event_id: "",
      file: null,
    },
  });

  const createEvent = useCreateEvent();
  const createAttendance = useCreateAttendance();
  const { data: profitCenter } = useFindProfitCenter();
  const { data: events } = useFindEvent();

  const onSubmit = async (data: z.infer<typeof createEventSchema>) => {
    setIsLoading(true);
    try {
      const eventData = {
        ...data,
        created_by: 1, // TODO: Get from auth context
        modified_by: 1, // TODO: Get from auth context
        profit_center: data.profit_center || 1,
      };
      await createEvent.mutateAsync(eventData);
      form.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitAttendance = async (
    data: z.infer<typeof createAttendanceSchema>
  ) => {
    setIsLoading(true);
    try {
      await createAttendance.mutateAsync({
        event_id: data.event_id,
        file: data.file,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...formAttendance}>
      <form
        onSubmit={formAttendance.handleSubmit(onSubmitAttendance)}
        className="space-y-6"
      >
        <FormField
          control={formAttendance.control}
          name="event_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                Profit Center
              </FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Event" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Select Event</SelectItem>
                  <SelectItem value="0">Create New Event</SelectItem>
                  {events?.map((event: EventDto) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.event}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("profit_center") === "0" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Event
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="john_doe"
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
                name="event_date_from"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="event_date_to"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profit_center"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                      Profit Center
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a verified email to display" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {profitCenter?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.profit_center}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
        <FormField
          control={formAttendance.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                Excel File
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="file"
                  className="w-full px-4 py-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <span>Save</span>
          )}
        </Button>
      </form>
    </Form>
  );
}
