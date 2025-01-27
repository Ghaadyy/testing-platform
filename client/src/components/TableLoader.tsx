import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { Skeleton } from "@/shadcn/components/ui/skeleton";

function TableLoader() {
  const columns: ColumnDef<number>[] = [
    {
      accessorKey: "name",
      header: () => <Skeleton className="w-[75%] h-6" />,
      cell: () => <Skeleton className="w-full h-8" />,
    },
    {
      accessorKey: "createdAt",
      header: () => <Skeleton className="w-[75%] h-6" />,
      cell: () => <Skeleton className="w-full h-8" />,
    },
    {
      accessorKey: "updatedAt",
      header: () => <Skeleton className="w-[75%] h-6" />,
      cell: () => <Skeleton className="w-full h-8" />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={Array.from({ length: 10 }, (_, index) => index + 1)}
      sortKey="name"
    />
  );
}

export default TableLoader;
