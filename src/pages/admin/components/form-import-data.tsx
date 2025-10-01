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
import {
  processExcelFile,
  createCleanedExcelFile,
} from "../../../utils/excel-processor.ts";
import API from "../../../networks/api.ts";

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

  const handleQRCodeGeneration = async (eventId: number) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Processing QR Codes",
        description: "Regenerating QR codes and sending emails...",
      });

      const result = await API.QRCODE.REGENERATE_AND_SEND_ALL({
        event_id: eventId,
        customMessage:
          "Your QR code for event attendance. Please scan this code to check-in.",
      });

      if (result.success) {
        // Handle response dengan atau tanpa data property
        const responseData = result.data || {};
        const regenerated = responseData.regenerated || 0;
        const emailSent = responseData.emailSent || 0;
        const failed = responseData.failed || 0;
        const errors = responseData.errors || [];

        toast({
          title: "QR Codes Regenerated and Sent Successfully",
          description: result.data
            ? `QR codes regenerated for ${regenerated} participants and sent to ${emailSent} participants.${
                failed > 0 ? ` ${failed} failed to process.` : ""
              }`
            : result.message ||
              "QR codes have been successfully regenerated and sent.",
        });

        if (errors.length > 0) {
          console.warn("QR Code regeneration and sending errors:", errors);
        }
      } else {
        throw new Error(
          result.message || "Failed to regenerate and send QR codes"
        );
      }
    } catch (error) {
      console.error("Error regenerating and sending QR codes:", error);
      toast({
        title: "QR Code Regeneration Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to regenerate and send QR codes",
        variant: "destructive",
      });
    }
  };

  const onSubmitAttendance = async (
    data: z.infer<typeof createAttendanceSchema>
  ) => {
    setIsLoading(true);
    try {
      if (!data.event_id) {
        toast({
          title: "Error",
          description: "Please select an event or create a new event",
          variant: "destructive",
        });
        return;
      }

      if (!data.file) {
        toast({
          title: "Error",
          description: "Please select a file to upload",
          variant: "destructive",
        });
        return;
      }

      let processedFile = data.file;

      if (data.file.name.endsWith(".xlsx") || data.file.name.endsWith(".xls")) {
        try {
          toast({
            title: "Processing",
            description: "Cleaning Excel data...",
          });

          const processingResult = await processExcelFile(data.file);

          if (processingResult.data.length === 0) {
            toast({
              title: "Error",
              description: "No valid data found in Excel file",
              variant: "destructive",
            });
            return;
          }

          const cleanedFileName = `cleaned_${data.file.name}`;
          processedFile = createCleanedExcelFile(
            processingResult.data,
            cleanedFileName
          );

          toast({
            title: "Success",
            description: `Processed ${processingResult.processedRows} rows from ${processingResult.totalRows} total rows`,
          });
        } catch (processingError) {
          console.error("Error processing Excel file:", processingError);
          toast({
            title: "Warning",
            description:
              "Could not preprocess Excel file, uploading original file",
            variant: "destructive",
          });
        }
      }

      const eventId = parseInt(data.event_id);
      let finalEventId = eventId;

      if (eventId !== 0) {
        await eventApiService.insertAttendance(
          eventId.toString(),
          processedFile
        );

        await triggerDataUpdate({
          eventId: eventId.toString(),
          type: "all",
        });

        toast({
          title: "Success",
          description: "Attendance successfully uploaded to existing event",
        });

        await handleQRCodeGeneration(eventId);

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
            description: "Event data is incomplete to create a new event",
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
          finalEventId = newEvent.id;

          // Insert attendance data
          await eventApiService.insertAttendance(
            finalEventId.toString(),
            processedFile
          );

          // Update data after attendance insertion
          await triggerDataUpdate({
            eventId: finalEventId.toString(),
            type: "all",
          });

          toast({
            title: "Success",
            description:
              "New event successfully created and attendance successfully uploaded",
          });

          // Generate and send QR codes after attendance is fully inserted
          await handleQRCodeGeneration(finalEventId);
        }

        formAttendance.reset();
        form.reset();
      }
    } catch (error) {
      console.error("Error processing attendance:", error);
      toast({
        title: "Error",
        description: "An error occurred while processing attendance",
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
