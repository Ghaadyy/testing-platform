import { TestRun } from "@/models/TestRun";
import { Button } from "@/shadcn/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcn/components/ui/table";

type Props = { testRuns: TestRun[] };

async function rerunHandler(id: number) {
  await fetch(`http://localhost:5064/api/tests/${id}/compiled/run`, {
    method: "POST",
  });
}

function TestRunTable({ testRuns }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Ran At</TableHead>
          <TableHead>Passed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {testRuns.map(({ name, ranAt, duration, passed, id }) => (
          <TableRow key={id}>
            <TableCell className="font-medium">{name}</TableCell>
            <TableCell>{duration.toString()}ms</TableCell>
            <TableCell>{ranAt}</TableCell>
            <TableCell>{passed ? "Passed" : "Failed"}</TableCell>
            <TableCell>
              <Button onClick={() => rerunHandler(id)}>Rerun</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default TestRunTable;
