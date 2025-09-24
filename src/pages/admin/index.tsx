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
import ExcelExportCSV from "./components/export-excel-csv.tsx";
import { ModalForm } from "../../components/modal-form.tsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import FormImportData from "./components/form-import-data.tsx";
import API from "../../networks/api.ts";
import CONFIG from "../../configs/config.ts";
import { EventDto, PresentDto } from "../../services/event/dtos";
import { useEffect } from "react";
import { useFindEvent } from "../../services/event/hooks/use-find-event.ts";
import { useQuerySync } from "../../hooks/use-query-sync.ts";

const addParticipantSchema = z.object({
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
  const [attendeesData, setAttendeesData] = useState<PresentDto[]>([]);
  const { toast } = useToast();
  const { triggerDataUpdate } = useQuerySync();

  // Use React Query for events data
  const { data: eventsData = [] } = useFindEvent();

  const addPesertaForm = useForm<z.infer<typeof addParticipantSchema>>({
    resolver: zodResolver(addParticipantSchema),
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

  // Define columns inside the component so handleApprove is accessible
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
            Name
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
            Phone Number
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

        // If status is 1 (approved), show only "Approved" text
        if (present.status === 1) {
          return (
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Approved
              </span>
            </div>
          );
        }

        // If status is 0 (not approved), show action buttons
        return (
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              className="rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-white"
              onClick={() => handleApprove(present)}
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

  // Remove manual API call since we're using React Query
  // useEffect(() => {
  //   const GET_ALL_EVENTS = async () => {
  //     try {
  //       const response = await API.EVENTS.GET_ALL();
  //       if (response.success && response.data) {
  //         setEventsData(response.data);
  //       }
  //     } catch (error) {
  //       console.error("Error get all events:", error);
  //     }
  //   };

  //   GET_ALL_EVENTS();
  // }, []);

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

  useEffect(() => {
    if (selectedEvent) {
      addPesertaForm.setValue("event_id", selectedEvent.id);
      addPesertaForm.setValue(
        "profit_center_id",
        selectedEvent.profit_center_id || 1
      );
    }
  }, [selectedEvent, addPesertaForm]);

  const handleExportExcel = () => {
    if (!selectedEvent) {
      toast({
        title: "You must select event",
        variant: "destructive",
      });
      return;
    }

    if (attendeesData.length === 0) {
      toast({
        title: "No Data Available",
        description: "No participant data available for export",
        variant: "destructive",
      });
      return;
    }

    const exportData = attendeesData.map((item, index) => ({
      no: index + 1,
      invoice: item.invoice || "",
      nama: item.name,
      email: item.email || "",
      telp: item.no_telp || "",
      attendance: item.status === 1 ? "Hadir" : "Tidak Hadir",
    }));

    const ExcelExportComponent = (
      <ExcelExportXLSX
        data={exportData}
        filename={`Data Peserta ${
          selectedEvent?.event || "Seminar"
        } ${new Date().getFullYear()}.xlsx`}
        text="Export Excel"
        customHeaders={{
          no: "No",
          invoice: "Invoice",
          nama: "Nama",
          email: "Email",
          telp: "Tlp",
          attendance: "Attendance",
        }}
      />
    );

    const tempDiv = document.createElement("div");
    document.body.appendChild(tempDiv);

    import("react-dom/client").then(({ createRoot }) => {
      const root = createRoot(tempDiv);
      root.render(ExcelExportComponent);

      setTimeout(() => {
        const button = tempDiv.querySelector("button");
        if (button) {
          button.click();
        }
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(tempDiv);
        }, 100);
      }, 100);
    });
  };

  const handleSyncDatabase = async () => {
    try {
      toast({
        title: "Synchronization Started",
        description: "Database synchronization process is running...",
      });

      const response = await API.SYNC.SYNC_ALL();

      if (response.message) {
        toast({
          title: "Synchronization Successful",
          description: `${response.message}. ${response.synced_records} records successfully synchronized.`,
        });

        await triggerDataUpdate({
          type: "all",
        });
      }
    } catch (error) {
      console.error("Error syncing database:", error);

      toast({
        title: "Synchronization Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while synchronizing the database",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (present: PresentDto) => {
    try {
      console.log("Approving participant:", present);
      console.log("Present ID:", present.id);
      console.log(
        "API call URL:",
        `${CONFIG.BASE_URL}${CONFIG.API_VERSION}/presents/${present.id}`
      );

      // Update status from 0 to 1 (approved)
      const response = await API.PRESENTS.UPDATE(present.id, {
        status: 1, // Change from 0 to 1 (approved)
      });

      if (response.success) {
        toast({
          title: "Participant Approved",
          description: `${present.name} has been approved successfully`,
        });

        // Fetch updated data from the server
        if (selectedEvent) {
          try {
            const updatedEventResponse = await API.EVENTS.GET_BY_ID(
              selectedEvent.id
            );
            if (
              updatedEventResponse.success &&
              updatedEventResponse.data?.Present
            ) {
              setAttendeesData(updatedEventResponse.data.Present);
            }
          } catch (fetchError) {
            console.error("Error fetching updated data:", fetchError);
            // Fallback to triggerDataUpdate if direct fetch fails
            await triggerDataUpdate({
              eventId: eventID,
              type: "all",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error approving participant:", error);

      let errorMessage = "An error occurred while approving the participant";

      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as {
          response?: { data?: { message?: string }; status?: number };
          message?: string;
        };
        errorMessage =
          apiError.response?.data?.message || apiError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Approval Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const onSubmitAddParticipant = async (
    data: z.infer<typeof addParticipantSchema>
  ) => {
    try {
      const participantData = {
        ...data,
        profit_center_id: data.profit_center_id || 1,
      };

      const response = await API.PRESENTS.CREATE(
        participantData,
        parseInt(eventID)
      );

      if (response.success) {
        addPesertaForm.reset();
        setOpenAddPesertaModal(false);

        toast({
          title: "Participant Created",
          description: "Participant has been added successfully",
        });

        await triggerDataUpdate({
          eventId: eventID,
          type: "all",
        });
      }
    } catch (error) {
      console.error("Error adding participant:", error);

      let errorMessage =
        "Please check and ensure the invoice and email are not duplicates";

      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as {
          response?: { data?: { message?: string }; status?: number };
          message?: string;
        };
        errorMessage =
          apiError.response?.data?.message || apiError.message || "";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (errorMessage) {
        toast({
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
              name: "Name",
              email: "Email",
              no_telp: "Phone Number",
            }}
            disabled={!selectedEvent}
            onClick={() => {
              if (!selectedEvent) {
                toast({
                  title: "You must select event",
                  variant: "destructive",
                });
              }
            }}
          />
          <ModalForm
            open={openImportModal}
            setOpen={setOpenImportModal}
            title={"Import Seminar Data"}
            triggerText={
              <Button
                variant="outline"
                disabled={!selectedEvent}
                onClick={() => {
                  if (!selectedEvent) {
                    toast({
                      title: "You must select event",
                      variant: "destructive",
                    });
                  } else {
                    setOpenImportModal(true);
                  }
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
            }
          >
            <FormImportData />
          </ModalForm>

          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={!selectedEvent}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <ExcelExportCSV
            data={attendeesData.map((item, index) => ({
              no: index + 1,
              invoice: item.invoice || "",
              nama: item.name,
              email: item.email || "",
              telp: item.no_telp || "",
              attendance: item.status === 1 ? "Hadir" : "Tidak Hadir",
            }))}
            filename={`Data Peserta ${
              selectedEvent?.event || "Seminar"
            } ${new Date().getFullYear()}.csv`}
            text="Export CSV"
            customHeaders={{
              no: "No",
              invoice: "Invoice",
              nama: "Nama",
              email: "Email",
              telp: "Tlp",
              attendance: "Attendance",
            }}
            disabled={!selectedEvent}
            onClick={() => {
              if (!selectedEvent) {
                toast({
                  title: "You must select event",
                  variant: "destructive",
                });
              }
            }}
          />
          <Button variant="default" onClick={handleSyncDatabase}>
            <Database className="mr-2 h-4 w-4" />
            Sync Database
          </Button>
        </div>

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

        <DataTable columns={columns} data={attendeesData} />
      </CardContent>
    </Card>
  );
}
