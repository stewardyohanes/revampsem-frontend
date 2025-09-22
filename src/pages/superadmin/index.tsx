import {CaretSortIcon, PlusCircledIcon,} from "@radix-ui/react-icons"
import {ColumnDef,} from "@tanstack/react-table"

import {Button} from "../../components/ui/button"
import {Badge} from "../../components/ui/badge"
import {Card, CardContent} from "../../components/ui/card.tsx";
import {DataTable} from "../../components/data-table.tsx";
import {useFindUsers} from "../../services/users/hooks/use-find-users.ts";
import {UserDto} from "../../services/users/dtos";
import {ModalForm} from "../../components/modal-form.tsx";
import {FormCreateUser} from "./components/form-create-user.tsx";
import {useState} from "react";
import {FormEditUser} from "./components/form-edit-user.tsx";
import {KeyRound, Pencil, Trash2} from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "../../components/ui/tooltip.tsx";
import {useDeleteUser} from "../../services/users/hooks/use-delete-user.ts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "../../components/ui/alert-dialog.tsx";



export default function SuperAdminPage() {
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  
  const { data } = useFindUsers()
  const deleteUser = useDeleteUser()
  
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
      )
    },
    cell: ({ row }) => <div className="">{row.index+1}</div>,
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
      )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("username")}</div>,
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
      )
    },
    cell: ({ row }) => <div>{row.getValue("display_name")}</div>,
  },
  {
    accessorKey: "reset_password",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reset Password
          <CaretSortIcon/>
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge variant="secondary" className="bg-zinc-100">
        {row.getValue("reset_password")  ? "Yes Request" : "No Request"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <KeyRound className="h-4 w-4" />
                    <span className="sr-only">Reset Password</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset Password</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ModalForm open={openUpdate} setOpen={setOpenUpdate} title={"Edit User"} triggerText={<Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}><Pencil className="h-4 w-4" /></Button>}>
                    {selectedUser && <FormEditUser setOpen={setOpenUpdate} userId={selectedUser.id} user={selectedUser} />}
                  </ModalForm>
                </TooltipTrigger>
                <TooltipContent>Edit User</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete User</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the account and remove the data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 hover:bg-red-700 hover:text-white" onClick={async () => {await deleteUser.mutateAsync(user.id)}}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TooltipTrigger>
                <TooltipContent>Delete User</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
      )
    },
  },
]
  
  return (
    <Card>
      <CardContent>
        <div className="w-full">
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ModalForm open={openCreate} setOpen={setOpenCreate} title={"Create User"} triggerText={
                  <Button>
                    <PlusCircledIcon className="mr-2 h-4 w-4"/>
                    Add User
                  </Button>}>
                  <FormCreateUser setOpen={setOpenCreate}/>
                </ModalForm>
                <Button variant="secondary">
                  <PlusCircledIcon className="mr-2 h-4 w-4"/>
                  Setup Google Form
                </Button>
              </div>
            </div>
            
            <DataTable columns={columns} data={data || []} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}