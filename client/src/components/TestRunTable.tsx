import { TestRun } from "@/models/TestRun";
import { Button } from "@/shadcn/components/ui/button";
import { ScrollArea } from "@/shadcn/components/ui/scroll-area";
import { DataTable } from "./DataTable";
import { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

type Props = { testRuns: TestRun[]; onRerun: (id: number) => void };

const sortHeader = (name: string) => {
  return ({ column }: { column: Column<TestRun, unknown> }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {name}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

// return (
//   <FilesTable
//     columns={columns}
//     data={tests.map((file) => ({
//       ...file,
//       createdAt: new Date(file.createdAt).toLocaleString(),
//       updatedAt: new Date(file.updatedAt).toLocaleString(),
//     }))}
//   />

function TestRunTable({ testRuns, onRerun }: Props) {
  const columns: ColumnDef<TestRun>[] = [
    {
      accessorKey: "duration",
      header: sortHeader("Duration"),
      cell: ({ row }) => `${row.original.duration.toString()}ms`,
    },
    {
      accessorKey: "ranAt",
      header: sortHeader("Ran At"),
      cell: ({ row }) => new Date(row.original.ranAt).toLocaleString(),
    },
    {
      accessorKey: "passed",
      header: sortHeader("Passed"),
      cell: ({ row }) => (row.original.passed ? "Passed" : "Failed"),
    },
    {
      id: "rerun",
      cell: ({ row }) => {
        const file = row.original;
        return <Button onClick={() => onRerun(file.id)}>Rerun</Button>;
      },
    },
  ];

  return (
    <ScrollArea>
      <DataTable columns={columns} data={testRuns} />
    </ScrollArea>
  );
}

export default TestRunTable;
