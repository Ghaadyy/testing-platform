import { LogGroup } from "@/models/Log";
import TestLogDropdown from "./TestLogDropdown";

type Props = { logs: LogGroup[] };

function TestLogs({ logs }: Props) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {logs.map((group) => (
        <TestLogDropdown key={group.testName} logGroup={group} />
      ))}
    </div>
  );
}

export default TestLogs;
