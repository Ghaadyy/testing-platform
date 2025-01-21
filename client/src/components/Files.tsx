import { TestFile } from "@/models/TestFile";
import { DataTable } from "./DataTable";
import { ColumnDef, Column } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CopyIcon,
  EditIcon,
  TrashIcon,
  Workflow,
} from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";

import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/components/ui/dropdown-menu";
import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";

async function deleteFile(
  fileId: string,
  token: string,
  onSuccess: () => void
) {
  const rest = await fetch(`${API_URL}/api/tests/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (rest.ok) onSuccess();
}

const sortHeader = (name: string) => {
  return ({ column }: { column: Column<TestFile, unknown> }) => (
    <Button
      variant="ghost"
      className="p-0 hover:bg-transparent"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {name}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

function Actions({ file, onDelete }: { file: TestFile; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to={`/tests/${file.id}/runs`}>
          <DropdownMenuItem>
            <Workflow /> View previous runs
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem disabled>
          <CopyIcon /> Copy
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <EditIcon /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete}>
          <TrashIcon /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Files() {
  const { token } = useContext(UserContext);

  async function getTests(token: string) {
    try {
      const res = await fetch(`${API_URL}/api/tests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const tests: TestFile[] = await res.json();
      setTests(tests);
    } catch (err) {
      console.log(err);
    }
  }

  const [tests, setTests] = useState<TestFile[]>([]);

  const columns: ColumnDef<TestFile>[] = [
    {
      accessorKey: "name",
      header: sortHeader("File Name"),
      cell: ({ row }) => (
        <Link className="hover:underline" to={`/editor/${row.original.id}`}>
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "createdAt",
      header: sortHeader("Created At"),
    },
    { accessorKey: "updatedAt", header: sortHeader("Updated At") },
    {
      id: "actions",
      cell: ({ row }) => {
        const file = row.original;

        return (
          <Actions
            file={file}
            onDelete={() =>
              deleteFile(file.id, token!, () =>
                setTests((prev) => prev.filter((t) => t.id !== file.id))
              )
            }
          />
        );
      },
    },
  ];

  useEffect(() => {
    getTests(token!);
  }, [token]);

  return (
    <DataTable
      columns={columns}
      data={tests.map((file) => ({
        ...file,
        createdAt: new Date(file.createdAt).toLocaleString(),
        updatedAt: new Date(file.updatedAt).toLocaleString(),
      }))}
      key="name"
    />
  );
}

export default Files;
