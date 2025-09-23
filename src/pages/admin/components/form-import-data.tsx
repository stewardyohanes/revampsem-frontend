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
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAttendanceSchema,
  createEventSchema,
} from "../../../services/event/validators";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select.tsx";
import { useFindEvent } from "../../../services/event/hooks/use-find-event.ts";
import { EventDto } from "../../../services/event/dtos";
import { EventApiService } from "../../../services/event/api.ts";
import { useToast } from "../../../hooks/use-toast.ts";
import { useQuerySync } from "../../../hooks/use-query-sync.ts";

export default function FormImportData() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { triggerDataUpdate } = useQuerySync();
  const eventApiService = new EventApiService();

  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      event: "",
      start_date: new Date(),
      end_date: new Date(),
      profit_center_id: null,
    },
  });

  const formAttendance = useForm<z.infer<typeof createAttendanceSchema>>({
    resolver: zodResolver(createAttendanceSchema),
    defaultValues: {
      event_id: "",
    },
  });

  const { data: events } = useFindEvent();

  const onSubmitAttendance = async (
    data: z.infer<typeof createAttendanceSchema>
  ) => {
    setIsLoading(true);
    try {
      if (!data.event_id) {
        toast({
          title: "Error",
          description: "Silakan pilih event atau buat event baru",
          variant: "destructive",
        });
        return;
      }

      if (!data.file) {
        toast({
          title: "Error",
          description: "Silakan pilih file untuk diupload",
          variant: "destructive",
        });
        return;
      }

      const eventId = parseInt(data.event_id);

      if (eventId !== 0) {
        await eventApiService.insertAttendance(eventId.toString(), data.file);

        // Trigger real-time data update
        await triggerDataUpdate({
          eventId: eventId.toString(),
          type: "all",
        });

        toast({
          title: "Berhasil",
          description: "Attendance berhasil diupload ke event yang sudah ada",
        });

        formAttendance.reset();
        form.reset();
      } else {
        const eventValues = form.getValues();

        if (
          !eventValues.event ||
          !eventValues.start_date ||
          !eventValues.end_date
        ) {
          toast({
            title: "Error",
            description: "Data event tidak lengkap untuk membuat event baru",
            variant: "destructive",
          });
          return;
        }

        const newEvent = await eventApiService.insertEvent({
          event: eventValues.event,
          start_date: eventValues.start_date,
          end_date: eventValues.end_date,
          profit_center_id: eventValues.profit_center_id ?? undefined,
        });

        if (newEvent && newEvent.id) {
          await eventApiService.insertAttendance(
            newEvent.id.toString(),
            data.file
          );
        }

        // Trigger real-time data update for new event
        await triggerDataUpdate({
          eventId: newEvent?.id?.toString(),
          type: "all",
        });

        toast({
          title: "Berhasil",
          description:
            "Event baru berhasil dibuat dan attendance berhasil diupload",
        });

        formAttendance.reset();
        form.reset();
      }
    } catch (error) {
      console.error("Error processing attendance:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses attendance",
        variant: "destructive",
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
                name="event"
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
                name="start_date"
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
                            : new Date();
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
                name="end_date"
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
                            : new Date();
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
