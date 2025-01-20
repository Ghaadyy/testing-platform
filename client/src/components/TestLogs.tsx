import { ChevronRight, CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { LogGroup, LogStatus } from "@/models/Log";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shadcn/components/ui/collapsible";

type Props = { logs: LogGroup[] };

function TestLogs({ logs }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {logs.map((group) => (
        <TestDropdown key={group.TestName} logGroup={group} />
      ))}
    </div>
  );
}

function TestDropdown({ logGroup }: { logGroup: LogGroup }) {
  const { TestName, Assertions, Status } = logGroup;

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
          {Status === LogStatus.LOADING ? (
            <LoaderCircle className="animate-spin" />
          ) : Assertions.every((a) => a.Passed) ? (
            <CircleCheck color="green" />
          ) : (
            <CircleX color="red" />
          )}
          <p>{TestName}</p>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {Assertions.map((log, index) => {
          return (
            <div key={index} className="flex items-center gap-2 py-3">
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
