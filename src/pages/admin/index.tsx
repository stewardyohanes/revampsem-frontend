import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { Button } from "../../components/ui/button.tsx";
import { Database, FileSpreadsheet, Plus, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form.tsx";
import { Input } from "../../components/ui/input.tsx";
import { DataTable } from "../../components/data-table.tsx";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { SearchableEventSelect } from "../../components/searchable-event-select.tsx";
import { useToast } from "../../hooks/use-toast.ts";
import { CaretSortIcon } from "@radix-ui/react-icons";
import ExcelExportXLSX from "./components/export-excel-xlsx.tsx";
import { ModalForm } from "../../components/modal-form.tsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import FormImportData from "./components/form-import-data.tsx";
import API from "../../networks/api.ts";
import { EventDto, PresentDto } from "../../services/event/dtos";
import { useEffect } from "react";

const columns: ColumnDef<PresentDto>[] = [
  {
    id: "no",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No
          <CaretSortIcon />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-center">{row.index + 1}</div>;
    },
  },
  {
    accessorKey: "invoice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Invoice
          <CaretSortIcon />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.getValue("invoice") || "-"}</div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama
          <CaretSortIcon />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">{row.getValue("name")}</div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <CaretSortIcon />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-left">{row.getValue("email") || "-"}</div>;
    },
  },
  {
    accessorKey: "no_telp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No Telepon
          <CaretSortIcon />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.getValue("no_telp") || "-"}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <CaretSortIcon />
        </Button>
      );
    },
    cell: ({ row }) => {
      const present = row.original;
      return (
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            className="rounded-2xl bg-green-500 hover:bg-green-400 text-white"
            onClick={() => console.log("Approve present:", present)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            className="rounded-2xl bg-blue-500 hover:bg-blue-400 text-white"
            onClick={() => console.log("Update present:", present)}
          >
            Update
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="rounded-2xl"
            onClick={() => console.log("Delete present:", present)}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];

// Schema for Add Participant form
const addPesertaSchema = z.object({
  invoice: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  no_telp: z.string().optional(),
  status: z.number().default(0),
  profit_center_id: z.number(),
  event_id: z.number(),
});

export default function AdminPage() {
  const [openImportModal, setOpenImportModal] = useState(false);
  const [openAddPesertaModal, setOpenAddPesertaModal] = useState(false);
  const [eventID, setEventID] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
  const [eventsData, setEventsData] = useState<EventDto[]>([]);
  const [attendeesData, setAttendeesData] = useState<PresentDto[]>([]);
  const { toast } = useToast();

  // Form for Add Participant
  const addPesertaForm = useForm<z.infer<typeof addPesertaSchema>>({
    resolver: zodResolver(addPesertaSchema),
    defaultValues: {
      invoice: "",
      name: "",
      email: "",
      no_telp: "",
      status: 0,
      profit_center_id: 1,
      event_id: 0,
    },
  });

  // Fetch events data dengan Present
  useEffect(() => {
    const GET_ALL_EVENTS = async () => {
      try {
        const response = await API.EVENTS.GET_ALL();
        if (response.success && response.data) {
          setEventsData(response.data);
        }
      } catch (error) {
        console.error("Error get all events:", error);
      }
    };

    GET_ALL_EVENTS();
  }, []);

  // Update attendees data ketika eventID berubah
  useEffect(() => {
    if (eventID && eventsData.length > 0) {
      const selectedEventData = eventsData.find(
        (event) => event.id.toString() === eventID
      );
      if (selectedEventData && selectedEventData.Present) {
        setAttendeesData(selectedEventData.Present);
      } else {
        setAttendeesData([]);
      }
    } else {
      setAttendeesData([]);
    }
  }, [eventID, eventsData]);

  // Update form values ketika event dipilih
  useEffect(() => {
    if (selectedEvent) {
      addPesertaForm.setValue("event_id", selectedEvent.id);
      addPesertaForm.setValue(
        "profit_center_id",
        selectedEvent.profit_center_id || 1
      );
    }
  }, [selectedEvent, addPesertaForm]);

  // Handler for Add Participant form submission
  const onSubmitAddParticipant = async (
    data: z.infer<typeof addPesertaSchema>
  ) => {
    try {
      console.log("Add Participant Data:", data);

      // Prepare data for API call
      const participantData = {
        ...data,
        profit_center_id: data.profit_center_id || 1,
      };

      // Call API to create participant
      const response = await API.PRESENTS.CREATE(
        participantData,
        parseInt(eventID)
      );

      if (response.success) {
        // Reset form and close modal
        addPesertaForm.reset();
        setOpenAddPesertaModal(false);

        // Show success toast
        toast({
          title: "Participant Created",
          description: "Participant has been added successfully",
        });

        // Refresh attendees data
        if (eventID) {
          const updatedResponse = await API.EVENTS.GET_ALL();
          if (updatedResponse.success && updatedResponse.data) {
            setEventsData(updatedResponse.data);
            const selectedEvent = updatedResponse.data.find(
              (event) => event.id.toString() === eventID
            );
            if (selectedEvent && selectedEvent.Present) {
              setAttendeesData(selectedEvent.Present);
            }
          }
        }

        console.log("Participant created successfully");
      }
    } catch (error) {
      console.error("Error adding participant:", error);

      // Show error toast
      toast({
        title: "Failed to Create Participant",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while creating the participant",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <ExcelExportXLSX
            data={attendeesData.map((item, index) => ({
              no: index + 1,
              invoice: item.invoice || "",
              name: item.name,
              email: item.email || "",
              no_telp: item.no_telp || "",
            }))}
            filename={`Template Seminar ${new Date().getFullYear()}.xlsx`}
            text={"Download Template"}
            customHeaders={{
              no: "No",
              invoice: "Invoice",
              name: "Nama",
              email: "Email",
              no_telp: "No Telepon",
            }}
          />
          <ModalForm
            open={openImportModal}
            setOpen={setOpenImportModal}
            title={"Import Data Seminar"}
            triggerText={
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
            }
          >
            <FormImportData />
          </ModalForm>

          <Button variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="default">
            <Database className="mr-2 h-4 w-4" />
            Sync Database
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-1 gap-4 flex-wrap">
            <SearchableEventSelect
              onSelect={(event) => {
                if (!event) {
                  setEventID("");
                  setSelectedEvent(null);
                  return;
                }
                setEventID(
                  event?.id?.toString() === eventID
                    ? ""
                    : event?.id?.toString() || ""
                );
                setSelectedEvent(event);
              }}
            />
          </div>
          <Dialog
            open={openAddPesertaModal}
            onOpenChange={setOpenAddPesertaModal}
          >
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Participant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Participant Data</DialogTitle>
              </DialogHeader>
              <Form {...addPesertaForm}>
                <form
                  onSubmit={addPesertaForm.handleSubmit(onSubmitAddParticipant)}
                  className="space-y-4"
                >
                  <FormField
                    control={addPesertaForm.control}
                    name="invoice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter invoice" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addPesertaForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addPesertaForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addPesertaForm.control}
                    name="no_telp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      Add
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* DataTable */}
        <DataTable columns={columns} data={attendeesData} />
      </CardContent>
    </Card>
  );
}
