import TestRunTable from "@/components/TestRunTable";
import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { TestFile } from "@/models/TestFile";
import { TestRun } from "@/models/TestRun";
import { Loader2Icon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";

function RunsScreen() {
  const { testId } = useParams();

  const { token } = useContext(UserContext);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [testFile, setTestFile] = useState<TestFile | null>(null);

  async function getTestRuns(testId: string, token: string) {
    try {
      const res = await fetch(`${API_URL}/api/tests/${testId}/runs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const testRuns: TestRun[] = await res.json();
      setTestRuns(testRuns);
    } catch (err) {
      console.log(err);
    }
  }

  async function getTest(testId: string, token: string) {
    try {
      const res = await fetch(`${API_URL}/api/tests/${testId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const testFile: TestFile = await res.json();
      setTestFile(testFile);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (testId && token) {
      getTestRuns(testId, token);
      getTest(testId, token);
    }
  }, [testId, token]);

  return (
    <div className="py-5">
      {!testFile ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <h1 className="font-bold text-3xl">{testFile.name}</h1>
      )}
      <TestRunTable testRuns={testRuns} testId={testId!} />
    </div>
  );
}

export default RunsScreen;
