import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shadcn/components/ui/alert";

type Props = { testName: string; passed: boolean };

function TestAlert({ testName, passed }: Props) {
  return (
    <Alert key={testName}>
      <AlertTitle>{testName}</AlertTitle>
      <AlertDescription>
        {passed ? "Test Passed" : "Test Failed"}
      </AlertDescription>
    </Alert>
  );
}

export default TestAlert;
