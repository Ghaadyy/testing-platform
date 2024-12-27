import { CircleCheck, CircleX } from "lucide-react";
import { Log } from "@/models/Log";

type Props = { testName?: string; logs: Log[] };

function TestLogs({ logs }: Props) {
  return logs.map(({ message, passed }) => (
    <div key={message} className="flex flex-row gap-2 items-center">
      {passed ? <CircleCheck color="green" /> : <CircleX color="red" />}
      <p>{message}</p>
    </div>
  ));
}

export default TestLogs;
