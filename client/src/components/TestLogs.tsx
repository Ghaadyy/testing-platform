import { ChevronRight, CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { Log, LogType } from "@/models/Log";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shadcn/components/ui/collapsible";

type Props = { logs: TestLogGroup[] };

export type TestLogGroup = {
  Assertions: Log[];
  Test: Log;
};

function TestLogs({ logs }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {logs.map(({ Test, Assertions }) => (
        <TestDropdown key={Test.Test} test={Test} asserts={Assertions} />
      ))}
    </div>
  );
}

function TestDropdown({ test, asserts }: { test: Log; asserts: Log[] }) {
  return (
    <Collapsible defaultOpen className="group/collapsible">
      <CollapsibleTrigger
        asChild
        className="cursor-pointer font-bold text-lg border-input border-2 rounded-lg p-2 w-full"
      >
        <div className="flex flex-row gap-3 items-center">
          <ChevronRight
            size={20}
            className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
          />
          {test.Type !== LogType.AFTER_EACH_MESSAGE ? (
            <LoaderCircle className="animate-spin" />
          ) : test.Passed ? (
            <CircleCheck color="green" />
          ) : (
            <CircleX color="red" />
          )}
          <p>{test.Test}</p>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {asserts.map((log, index) => {
          return (
            <div key={index} className="flex items-center gap-2">
              {log.Passed ? (
                <CircleCheck color="green" />
              ) : (
                <CircleX color="red" />
              )}
              <p>{log.Message}</p>
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default TestLogs;
