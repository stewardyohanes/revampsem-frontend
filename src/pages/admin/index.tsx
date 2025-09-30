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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select.tsx";
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

const updateParticipantSchema = z.object({
  invoice: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        const validTLDs = [
          ".com",
          ".org",
          ".net",
          ".id",
          ".co.id",
          ".edu",
          ".gov",
          ".mil",
          ".int",
          ".info",
          ".biz",
        ];

        if (!emailRegex.test(val)) return false;

        return validTLDs.some((tld) => val.toLowerCase().endsWith(tld));
      },
      {
        message:
          "Invalid email format. Please use valid TLD formats such as: .com, .org, .net, .id, .co.id",
      }
    ),
  no_telp: z.string().optional(),
});

export default function AdminPage() {
  const [openImportModal, setOpenImportModal] = useState(false);
  const [openAddPesertaModal, setOpenAddPesertaModal] = useState(false);
  const [openUpdatePesertaModal, setOpenUpdatePesertaModal] = useState(false);
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [openApprovedDialog, setOpenApprovedDialog] = useState(false);
  const [openNotAttendDialog, setOpenNotAttendDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<PresentDto | null>(null);
  const [selectedParticipantForApproval, setSelectedParticipantForApproval] =
    useState<PresentDto | null>(null);
  const [eventID, setEventID] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
  const [attendeesData, setAttendeesData] = useState<PresentDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const { triggerDataUpdate } = useQuerySync();

  const { data: eventsData = [] } = useFindEvent();

  const addParticipantForm = useForm<z.infer<typeof addParticipantSchema>>({
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

  const updatePesertaForm = useForm<z.infer<typeof updateParticipantSchema>>({
    resolver: zodResolver(updateParticipantSchema),
    defaultValues: {
      invoice: "",
      name: "",
      email: "",
      no_telp: "",
    },
  });

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

        if (present.status === 1) {
          return (
            <div className="flex justify-center">
              <Button
                size="sm"
                className="w-20 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs font-medium"
                onClick={() => handleApprovedClick(present)}
              >
                Approved
              </Button>
            </div>
          );
        }

        if (present.status === -1) {
          return (
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                className="w-20 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-medium"
                onClick={() => handleNotAttendClick(present)}
              >
                Not Attend
              </Button>
              <Button
                size="sm"
                className="w-20 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white"
                onClick={() => handleUpdateClick(present)}
              >
                Update
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="w-20 rounded-2xl"
                onClick={() => handleDeleteClick(present)}
              >
                Delete
              </Button>
            </div>
          );
        }

        return (
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              className="w-20 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-white"
              onClick={() => handleApprove(present)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              className="w-20 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white"
              onClick={() => handleUpdateClick(present)}
            >
              Update
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="w-20 rounded-2xl"
              onClick={() => handleDeleteClick(present)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

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
      addParticipantForm.setValue("event_id", selectedEvent.id);
      addParticipantForm.setValue(
        "profit_center_id",
        selectedEvent.profit_center_id || 1
      );
    }
  }, [selectedEvent, addParticipantForm]);

  const filteredAttendeesData = attendeesData.filter((attendee) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pending") return attendee.status === 0;
    if (statusFilter === "approved") return attendee.status === 1;
    if (statusFilter === "not_attend") return attendee.status === -1;
    return true;
  });

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

  const handleDownloadTemplate = () => {
    let templateData;
    let filename;

    if (!selectedEvent || attendeesData.length === 0) {
      templateData = [
        {
          no: "",
          invoice: "",
          name: "",
          email: "",
          no_telp: "",
        },
      ];
      filename = `Template Seminar ${new Date().getFullYear()}.xlsx`;
    } else {
      templateData = attendeesData.map((item, index) => ({
        no: index + 1,
        invoice: item.invoice || "",
        name: item.name,
        email: item.email || "",
        no_telp: item.no_telp || "",
      }));
      filename = `Template ${
        selectedEvent.event || "Seminar"
      } ${new Date().getFullYear()}.xlsx`;
    }

    const ExcelExportComponent = (
      <ExcelExportXLSX
        data={templateData}
        filename={filename}
        text="Download Template"
        customHeaders={{
          no: "No",
          invoice: "Invoice",
          name: "Name",
          email: "Email",
          no_telp: "Phone Number",
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

  const handleApprove = (present: PresentDto) => {
    setSelectedParticipantForApproval(present);
    setOpenApprovalDialog(true);
  };

  const handleApprovedClick = (present: PresentDto) => {
    setSelectedParticipantForApproval(present);
    setOpenApprovedDialog(true);
  };

  const handleNotAttendClick = (present: PresentDto) => {
    setSelectedParticipantForApproval(present);
    setOpenNotAttendDialog(true);
  };

  const handleDeleteClick = (present: PresentDto) => {
    setSelectedParticipant(present);
    setOpenDeleteDialog(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedParticipantForApproval) return;

    try {
      const response = await API.PRESENTS.UPDATE(
        selectedParticipantForApproval.id,
        {
          status: 1,
        }
      );

      if (response.success) {
        toast({
          title: "Participant Approved",
          description: `${selectedParticipantForApproval.name} has been approved successfully`,
        });

        setOpenApprovalDialog(false);
        setOpenNotAttendDialog(false);
        setSelectedParticipantForApproval(null);

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

  const handleCancelApproved = async () => {
    if (!selectedParticipantForApproval) return;

    try {
      const response = await API.PRESENTS.UPDATE(
        selectedParticipantForApproval.id,
        {
          status: 0,
        }
      );

      if (response.success) {
        toast({
          title: "Approval Cancelled",
          description: `${selectedParticipantForApproval.name}'s approval has been cancelled`,
        });

        setOpenApprovedDialog(false);
        setSelectedParticipantForApproval(null);

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
            await triggerDataUpdate({
              eventId: eventID,
              type: "all",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error cancelling approval:", error);

      let errorMessage = "An error occurred while cancelling the approval";

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
        title: "Cancel Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleNotAttend = async () => {
    if (!selectedParticipantForApproval) return;

    try {
      const response = await API.PRESENTS.UPDATE(
        selectedParticipantForApproval.id,
        {
          status: -1,
        }
      );

      if (response.success) {
        toast({
          title: "Status Updated",
          description: `${selectedParticipantForApproval.name} marked as not attending`,
        });

        setOpenApprovalDialog(false);
        setOpenApprovedDialog(false);
        setSelectedParticipantForApproval(null);

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
            await triggerDataUpdate({
              eventId: eventID,
              type: "all",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);

      let errorMessage = "An error occurred while updating the status";

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
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCancelNotAttend = async () => {
    if (!selectedParticipantForApproval) return;

    try {
      const response = await API.PRESENTS.UPDATE(
        selectedParticipantForApproval.id,
        {
          status: 0,
        }
      );

      if (response.success) {
        toast({
          title: "Status Updated",
          description: `${selectedParticipantForApproval.name}'s status changed back to pending approval`,
        });

        setOpenNotAttendDialog(false);
        setSelectedParticipantForApproval(null);

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
            await triggerDataUpdate({
              eventId: eventID,
              type: "all",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);

      let errorMessage = "An error occurred while updating the status";

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
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleUpdateClick = (present: PresentDto) => {
    setSelectedParticipant(present);
    updatePesertaForm.setValue("invoice", present.invoice || "");
    updatePesertaForm.setValue("name", present.name);
    updatePesertaForm.setValue("email", present.email || "");
    updatePesertaForm.setValue("no_telp", present.no_telp || "");
    setOpenUpdatePesertaModal(true);
  };

  const onSubmitUpdateParticipant = async (
    data: z.infer<typeof updateParticipantSchema>
  ) => {
    if (!selectedParticipant) return;

    try {
      const response = await API.PRESENTS.UPDATE(selectedParticipant.id, {
        invoice: data.invoice,
        name: data.name,
        email: data.email,
        no_telp: data.no_telp,
      });

      if (response.success) {
        toast({
          title: "Participant Updated",
          description: `${data.name} has been updated successfully`,
        });

        setAttendeesData((prevData) =>
          prevData.map((item) =>
            item.id === selectedParticipant.id ? { ...item, ...data } : item
          )
        );

        setOpenUpdatePesertaModal(false);
        updatePesertaForm.reset();
        setSelectedParticipant(null);

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
            await triggerDataUpdate({
              eventId: eventID,
              type: "all",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error updating participant:", error);

      let errorMessage = "An error occurred while updating the participant";

      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as {
          response?: { data?: { message?: string }; status?: number };
          message?: string;
        };
        errorMessage =
          apiError.response?.data?.message || apiError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;

        if (
          errorMessage.toLowerCase().includes("email") ||
          errorMessage.toLowerCase().includes("invalid email")
        ) {
          errorMessage =
            "Invalid email format. Please use valid TLD formats such as: .com, .org, .net, .id, .co.id";
        }
      }

      toast({
        title: "Update Failed",
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
        addParticipantForm.reset();
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

  const handleConfirmDelete = async () => {
    if (!selectedParticipant) return;

    try {
      const response = await API.PRESENTS.DELETE(selectedParticipant.id);

      if (response.success) {
        toast({
          title: "Participant Deleted",
          description: `${selectedParticipant.name} has been deleted successfully`,
        });

        setOpenDeleteDialog(false);
        setSelectedParticipant(null);

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
            await triggerDataUpdate({
              eventId: eventID,
              type: "all",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error deleting participant:", error);

      let errorMessage = "An error occurred while deleting the participant";

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
        title: "Delete Failed",
        description: errorMessage,
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
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <ModalForm
            open={openImportModal}
            setOpen={setOpenImportModal}
            title={"Import Seminar Data"}
            triggerText={
              <Button variant="outline">
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
          <Button variant="default" disabled onClick={handleSyncDatabase}>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="not_attend">Not Attend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog
            open={openAddPesertaModal}
            onOpenChange={setOpenAddPesertaModal}
          >
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="bg-black hover:bg-gray-800 text-white"
                disabled={!selectedEvent}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Participant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Participant Data</DialogTitle>
              </DialogHeader>
              <Form {...addParticipantForm}>
                <form
                  onSubmit={addParticipantForm.handleSubmit(
                    onSubmitAddParticipant
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={addParticipantForm.control}
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
                    control={addParticipantForm.control}
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
                    control={addParticipantForm.control}
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
                    control={addParticipantForm.control}
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

        <Dialog
          open={openUpdatePesertaModal}
          onOpenChange={setOpenUpdatePesertaModal}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Participant Data</DialogTitle>
            </DialogHeader>
            <Form {...updatePesertaForm}>
              <form
                onSubmit={updatePesertaForm.handleSubmit(
                  onSubmitUpdateParticipant
                )}
                className="space-y-4"
              >
                <FormField
                  control={updatePesertaForm.control}
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
                  control={updatePesertaForm.control}
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
                  control={updatePesertaForm.control}
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
                  control={updatePesertaForm.control}
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
                    Update
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={openApprovalDialog} onOpenChange={setOpenApprovalDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Approve Participant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedParticipantForApproval && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Invoice
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedParticipantForApproval.invoice || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Name
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedParticipantForApproval.name}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Email
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedParticipantForApproval.email || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phone Number
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedParticipantForApproval.no_telp || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleConfirmApprove()}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleNotAttend()}
                  variant="outline"
                  className="flex-1"
                >
                  Not Attend
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={openApprovedDialog} onOpenChange={setOpenApprovedDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Approved Participant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedParticipantForApproval && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Invoice
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedParticipantForApproval.invoice || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Name
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedParticipantForApproval.name}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Email
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedParticipantForApproval.email || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phone Number
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedParticipantForApproval.no_telp || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleCancelApproved()}
                  variant="destructive"
                  className="flex-1"
                >
                  Cancel Approved
                </Button>
                <Button
                  onClick={() => handleNotAttend()}
                  variant="outline"
                  className="flex-1"
                >
                  Not Attend
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={openNotAttendDialog}
          onOpenChange={setOpenNotAttendDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Not Attend Participant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedParticipantForApproval && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Invoice
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedParticipantForApproval.invoice || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Name
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedParticipantForApproval.name}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Email
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedParticipantForApproval.email || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phone Number
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedParticipantForApproval.no_telp || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleConfirmApprove()}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  Approved
                </Button>
                <Button
                  onClick={() => handleCancelNotAttend()}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel Not Attend
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Confirm Delete</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedParticipant && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete this participant? This
                    action cannot be undone.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Invoice
                        </label>
                        <p className="text-sm font-semibold">
                          {selectedParticipant.invoice || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Name
                        </label>
                        <p className="text-sm font-semibold">
                          {selectedParticipant.name}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Email
                        </label>
                        <p className="text-sm font-semibold">
                          {selectedParticipant.email || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Phone Number
                        </label>
                        <p className="text-sm font-semibold">
                          {selectedParticipant.no_telp || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setOpenDeleteDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleConfirmDelete()}
                  variant="destructive"
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <DataTable columns={columns} data={filteredAttendeesData} />
      </CardContent>
    </Card>
  );
}
