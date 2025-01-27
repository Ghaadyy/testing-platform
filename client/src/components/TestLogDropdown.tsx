import { LogGroup, LogStatus } from "@/models/Log";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shadcn/components/ui/collapsible";
import { ChevronRight, CircleCheck, CircleX, LoaderCircle } from "lucide-react";

type Props = { logGroup: LogGroup };

function TestLogDropdown({ logGroup }: Props) {
  const { testName, assertions, status } = logGroup;

  return (
    <Collapsible defaultOpen className="group/collapsible w-full">
      <CollapsibleTrigger
        asChild
        className="cursor-pointer font-bold text-lg border-input border-2 rounded-lg p-2 w-full"
      >
        <div className="flex flex-row gap-3 items-center w-full">
          {status !== LogStatus.LOADING && assertions.length > 0 && (
            <ChevronRight
              size={20}
              className={`transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90`}
            />
          )}
          {status === LogStatus.LOADING ? (
            <LoaderCircle className="animate-spin" color="yellow" />
          ) : status === LogStatus.PASSED ? (
            <CircleCheck color="green" />
          ) : (
            <CircleX color="red" />
          )}
          <p>{testName}</p>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {assertions.map((log, index) => {
          return (
            <div
              key={index}
              className="flex flex-row items-center gap-2 py-3 w-full"
            >
              {log.passed ? (
                <CircleCheck color="green" />
              ) : (
                <CircleX color="red" />
              )}
              <p className="text-wrap">{log.message}</p>
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default TestLogDropdown;
