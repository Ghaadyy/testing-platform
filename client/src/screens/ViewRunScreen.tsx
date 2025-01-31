import EditorLoader from "@/components/editor/EditorLoader";
import ReadOnlyEditor from "@/components/editor/ReadOnlyEditor";
import { UserContext } from "@/context/UserContext";
import { useTest } from "@/hooks/useTest";
import { API_URL } from "@/main";
import { LogGroup } from "@/models/Log";
import { RunStatus, TestRun } from "@/models/TestRun";
import { Button } from "@/shadcn/components/ui/button";

import { ChevronLeft, RefreshCcw } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

function ViewRunScreen() {
  const { token } = useContext(UserContext);
  const { runId } = useParams();

  const { state } = useLocation();
  const navigate = useNavigate();
  const testRun: TestRun | undefined = state;

  const [logs, setLogs] = useState<LogGroup[]>([]);
  const [run, setRun] = useState<TestRun | undefined>(testRun);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onMessage = useCallback((logs: LogGroup[]) => setLogs(logs), []);
  const { getUpdates, rerun } = useTest(onMessage);

  console.log(run);

  useEffect(() => {
    if (!testRun) {
      (async () => {
        const res = await fetch(`${API_URL}/api/runs/${runId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const run: TestRun = await res.json();
        setRun(run);
      })();
    }
  }, [runId, testRun, token]);

  useEffect(() => {
    if (run?.status !== RunStatus.PENDING) {
      (async () => {
        const res = await fetch(`${API_URL}/api/runs/${runId}/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const logs: LogGroup[] = await res.json();
        setLogs(logs);
      })();
    } else {
      getUpdates(runId!);
    }
    setIsLoading(false);
  }, [getUpdates, runId, run, token]);

  return (
    <div className="h-screen w-screen p-5 flex flex-col gap-3">
      <div className="flex flex-row justify-between">
        <Button
          className="flex flex-row gap-3"
          onClick={() => navigate(-1)}
          variant="link"
        >
          <ChevronLeft />
          <h1>Back</h1>
        </Button>
        <div className="flex flex-row gap-3">
          <Button
            className="flex flex-row gap-3"
            variant="ghost"
            onClick={() => rerun(runId!)}
            disabled={run?.status === RunStatus.PENDING}
          >
            <RefreshCcw /> Replay test
          </Button>
        </div>
      </div>
      {isLoading || !run ? (
        <EditorLoader />
      ) : (
        <ReadOnlyEditor code={run.rawCode} logs={logs} />
      )}
    </div>
  );
}

export default ViewRunScreen;
