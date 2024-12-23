import { TestFile } from "@/models/TestFile";
import { FilesTable } from "./FilesTable";
import { ColumnDef, Column } from "@tanstack/react-table";
import { ArrowUpDown, CopyIcon, EditIcon, TrashIcon } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { useEffect, useState } from "react";
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

async function deleteFile(fileName: string, onSuccess: () => void) {
  const rest = await fetch(`http://localhost:5064/api/tests/${fileName}`, {
    method: "DELETE",
  });
  if (rest.ok) onSuccess();
}

const sortHeader = (name: string) => {
  return ({ column }: { column: Column<TestFile, unknown> }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {name}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

function Files() {
  async function getTests() {
    try {
      const res = await fetch("http://localhost:5064/api/tests");
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
        <Link
          className="hover:underline"
          to={`/editor/${row.getValue("name")}`}
        >
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
              <DropdownMenuItem disabled>
                <CopyIcon /> Copy
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <EditIcon /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  deleteFile(file.name, () =>
                    setTests((prev) => prev.filter((t) => t.name !== file.name))
                  )
                }
              >
                <TrashIcon /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    getTests();
  }, []);

  return (
    <FilesTable
      columns={columns}
      data={tests.map((file) => ({
        ...file,
        createdAt: new Date(file.createdAt).toLocaleString(),
        updatedAt: new Date(file.updatedAt).toLocaleString(),
      }))}
    />
  );
}

export default Files;
