import { Button } from "@/shadcn/components/ui/button";
import { Column } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export function sortHeader<T>(name: string) {
  return ({ column }: { column: Column<T, unknown> }) => (
    <Button
      variant="ghost"
      className="p-0 hover:bg-transparent"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {name}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}
