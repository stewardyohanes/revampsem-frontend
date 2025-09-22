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
      event_date_from: "",
      event_date_to: "",
      profit_center: 0,
    },
  });

  const formAttendance = useForm<z.infer<typeof createAttendanceSchema>>({
    resolver: zodResolver(createAttendanceSchema),
    defaultValues: {
      event_id: "",
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
      let eventId = data.event_id;

      // Validasi jika tidak ada event yang dipilih
      if (!eventId) {
        throw new Error("Please select an event or create a new one");
      }

      // Jika user memilih "Create New Event", buat event baru terlebih dahulu
      if (data.event_id === "0") {
        const formData = form.getValues();

        // Validasi data event baru
        if (
          !formData.name ||
          !formData.event_date_from ||
          !formData.event_date_to
        ) {
          throw new Error("Please fill all required fields for new event");
        }

        const eventData = {
          name: formData.name,
          created_by: 1, // TODO: Get from auth context
          modified_by: 1, // TODO: Get from auth context
          profit_center: formData.profit_center || 1,
          event_date_from: formData.event_date_from,
          event_date_to: formData.event_date_to,
        };

        const createdEvent = await createEvent.mutateAsync(eventData);
        eventId = createdEvent.id.toString();
      }

      // Validasi file
      if (!data.file) {
        throw new Error("Please select a file to upload");
      }

      // Upload attendance dengan event_id yang sudah ada atau baru dibuat
      await createAttendance.mutateAsync({
        event_id: eventId,
        file: data.file,
      });

      // Reset form setelah berhasil
      formAttendance.reset();
      form.reset();
    } catch (error) {
      console.error("Error submitting attendance:", error);
      // Handle error appropriately - you might want to show a toast or error message
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
                Event
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Event" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
        {formAttendance.watch("event_id") === "0" && (
          <Form {...form}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                      Add New Event
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter event name"
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
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="w-full px-4 py-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={(e) => {
                          const dateValue = e.target.value
                            ? new Date(e.target.value)
                            : "";
                          field.onChange(dateValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="event_date_to"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="w-full px-4 py-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={(e) => {
                          const dateValue = e.target.value
                            ? new Date(e.target.value)
                            : "";
                          field.onChange(dateValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => field.onChange(e.target.files?.[0] || null)}
                  value=""
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
