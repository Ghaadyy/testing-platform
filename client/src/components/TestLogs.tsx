import { LogGroup } from "@/models/Log";
import TestLogDropdown from "./TestLogDropdown";

type Props = { logs: LogGroup[] };

function TestLogs({ logs }: Props) {
  return (
    <div className="flex flex-col gap-3 h-full w-full">
      {Object.keys(logs).length === 0 ? (
        <p>There are no tests running yet. Try running a test first!</p>
      ) : (
        logs.map((group) => (
          <TestLogDropdown key={group.testName} logGroup={group} />
        ))
      )}
    </div>
  );
}

export default TestLogs;
