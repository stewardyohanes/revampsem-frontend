import { CaretSortIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { DataTable } from "../../components/data-table";
import { useFindUsers } from "../../services/users/hooks/use-find-users";
import { useFindProfitCenters } from "../../services/users/hooks/use-find-profit-centers";
import { UserDto, ProfitCenterDto } from "../../services/users/dtos";
import { ModalForm } from "../../components/modal-form";
import { FormCreateUser } from "./components/form-create-user";
import { useState, useMemo } from "react";
import { FormEditUser } from "./components/form-edit-user";
import { useDeleteUser } from "../../services/users/hooks/use-delete-user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

export default function SuperAdminPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

  const { data: users, isLoading, error, isError } = useFindUsers();
  const { data: profitCenters } = useFindProfitCenters();
  const deleteUser = useDeleteUser();

  const profitCenterMap = useMemo(() => {
    if (!profitCenters) return new Map<number, string>();

    const map = new Map<number, string>();
    profitCenters.forEach((pc: ProfitCenterDto) => {
      map.set(pc.id, pc.profit_center);
    });
    return map;
  }, [profitCenters]);

  const handleUpdateClick = (user: UserDto) => {
    setSelectedUser(user);
    setOpenUpdate(true);
  };

  const handleDeleteClick = (user: UserDto) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      await deleteUser.mutateAsync(selectedUser.id);
      setOpenDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  const columns: ColumnDef<UserDto>[] = [
    {
      accessorKey: "id",
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
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: "username",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Username
            <CaretSortIcon />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("username")}</div>
      ),
    },
    {
      accessorKey: "display_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Display Name
            <CaretSortIcon />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("display_name")}</div>,
    },
    {
      accessorKey: "profit_center",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Profit Center
            <CaretSortIcon />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original;
        if (user.ProfitCenter) {
          if (Array.isArray(user.ProfitCenter)) {
            const profitCenterNames = user.ProfitCenter.map(
              (pc) => pc.profit_center
            )
              .filter(Boolean)
              .join(", ");
            return <div>{profitCenterNames || "No Profit Center"}</div>;
          }

          if (user.ProfitCenter.profit_center) {
            return <div>{user.ProfitCenter.profit_center}</div>;
          }
        }

        if (
          user.profit_center_id &&
          profitCenterMap.has(user.profit_center_id)
        ) {
          const profitCenterName = profitCenterMap.get(user.profit_center_id);
          return <div>{profitCenterName}</div>;
        }

        return <div>No Profit Center</div>;
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              className="w-20 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white"
              onClick={() => handleUpdateClick(user)}
            >
              Update
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="w-20 rounded-2xl"
              onClick={() => handleDeleteClick(user)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Card>
        <CardContent>
          <div className="w-full">
            <div className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ModalForm
                    open={openCreate}
                    setOpen={setOpenCreate}
                    title={"Create User"}
                    triggerText={
                      <Button>
                        <PlusCircledIcon className="mr-2 h-4 w-4" />
                        Add User
                      </Button>
                    }
                  >
                    <FormCreateUser setOpen={setOpenCreate} />
                  </ModalForm>
                  <Button variant="secondary">
                    <PlusCircledIcon className="mr-2 h-4 w-4" />
                    Setup Google Form
                  </Button>
                </div>
              </div>

              {isLoading && <div>Loading users...</div>}
              {isError && <div>Error loading users: {error?.message}</div>}
              {!isLoading && !isError && (
                <DataTable columns={columns} data={users || []} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedUser && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete this user? This action cannot
                  be undone.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Username
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedUser.username}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Display Name
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedUser.display_name}
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

      {/* Edit User Modal */}
      <ModalForm
        open={openUpdate}
        setOpen={setOpenUpdate}
        title={"Edit User"}
        triggerText={null}
      >
        {selectedUser && (
          <FormEditUser
            setOpen={setOpenUpdate}
            userId={selectedUser.id}
            user={selectedUser}
          />
        )}
      </ModalForm>
    </>
  );
}
