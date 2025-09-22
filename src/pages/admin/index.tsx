import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { Button } from "../../components/ui/button.tsx";
import { Database, FileSpreadsheet, Plus, Upload } from "lucide-react";
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
import { CaretSortIcon } from "@radix-ui/react-icons";
import ExcelExportXLSX from "./components/export-excel-xlsx.tsx";
import { ModalForm } from "../../components/modal-form.tsx";

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

export default function AdminPage() {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [openImportModal, setOpenImportModal] = useState(false);
  const [eventID, setEventID] = useState("");
  const [eventsData, setEventsData] = useState<EventDto[]>([]);
  const [attendeesData, setAttendeesData] = useState<PresentDto[]>([]);

  // Fetch events data dengan Present
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await API.EVENTS.GET_ALL();
        if (response.success && response.data) {
          setEventsData(response.data);
          console.log("Events loaded:", response.data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // Update attendees data ketika eventID berubah
  useEffect(() => {
    if (eventID && eventsData.length > 0) {
      const selectedEvent = eventsData.find(
        (event) => event.id.toString() === eventID
      );
      if (selectedEvent && selectedEvent.Present) {
        setAttendeesData(selectedEvent.Present);
        console.log(
          `Present data for event ${eventID}:`,
          selectedEvent.Present
        );
      } else {
        setAttendeesData([]);
      }
    } else {
      setAttendeesData([]);
    }
  }, [eventID, eventsData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <ExcelExportXLSX
            data={attendeesData.map((item) => ({
              invoice: item.invoice || "",
              name: item.name,
              email: item.email || "",
              no_telp: item.no_telp || "",
              event: item.Event?.event || "",
              status: item.status,
              createdAt: item.createdAt,
            }))}
            filename={`Template Seminar ${new Date().getFullYear()}.xlsx`}
            text={"Download Template"}
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
                  return;
                }
                setEventID(
                  event?.id?.toString() === eventID
                    ? ""
                    : event?.id?.toString() || ""
                );
              }}
            />
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="default">
            <Plus className="mr-2 h-4 w-4" />
            Add Peserta
          </Button>
        </div>

        {/* DataTable */}
        <DataTable columns={columns} data={attendeesData} />
      </CardContent>
    </Card>
  );
}
