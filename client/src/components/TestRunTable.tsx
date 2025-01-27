import { TestRun } from "@/models/TestRun";
import { Button } from "@/shadcn/components/ui/button";
import { ScrollArea } from "@/shadcn/components/ui/scroll-area";
import { DataTable } from "./DataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  Binoculars,
  CircleCheck,
  CircleX,
  Loader2Icon,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/components/ui/dropdown-menu";
import { useNavigate } from "react-router";
import { sortHeader } from "@/utils/sortHeader";

type Props = { testRuns: TestRun[] };

function TestRunTable({ testRuns }: Props) {
  const navigate = useNavigate();

  function Actions({ run }: { run: TestRun }) {
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
          <DropdownMenuItem
            onClick={() =>
              navigate(`/runs/${run.id}`, {
                state: run,
              })
            }
          >
            <Binoculars /> View test
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

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
      cell: ({ row }) =>
        row.original.status === 0 ? (
          <CircleCheck color="green" />
        ) : row.original.status === 2 ? (
          <CircleX color="red" />
        ) : (
          <Loader2Icon className="animate-spin" color="yellow" />
        ),
    },
    {
      id: "rerun",
      cell: ({ row }) => {
        const run = row.original;
        return <Actions run={run} />;
      },
    },
  ];

  return (
    <ScrollArea>
      <DataTable columns={columns} data={testRuns} sortKey="ranAt" desc />
    </ScrollArea>
  );
}

export default TestRunTable;
