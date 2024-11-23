import { CircleCheck, CircleX } from "lucide-react";
import { Check } from "@/models/Check";

type Props = { testName?: string; checks: Check[] };

function TestAlert({ checks }: Props) {
  return checks.map(({ message, passed }) => (
    <div className="flex flex-row gap-2 items-center">
      {passed ? <CircleCheck color="green" /> : <CircleX color="red" />}
      <p>{message}</p>
    </div>
  ));
}

export default TestAlert;
