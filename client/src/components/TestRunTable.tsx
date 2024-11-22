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

type Props = { testRuns: TestRun[]; rerunHandler: (id: number) => void };

function TestRunTable({ testRuns, rerunHandler }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Ran At</TableHead>
          <TableHead>Passed</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {testRuns.map(({ name, ranAt, duration, passed, id }) => (
          <TableRow key={id}>
            <TableCell className="font-medium">{name}</TableCell>
            <TableCell>{duration.toString()}ms</TableCell>
            <TableCell>{new Date(ranAt).toLocaleString()}</TableCell>
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
