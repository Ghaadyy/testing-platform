import ReadOnlyEditor from "@/components/ReadOnlyEditor";
import { UserContext } from "@/context/UserContext";
import { useTest } from "@/hooks/useTest";
import { API_URL } from "@/main";
import { LogGroup } from "@/models/Log";
import { TestRun } from "@/models/TestRun";
import { Button } from "@/shadcn/components/ui/button";
import { ChevronLeft, RefreshCcw } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

function ViewRunScreen() {
  const { token } = useContext(UserContext);
  const { runId } = useParams();

  const { state } = useLocation();
  const navigate = useNavigate();
  const testRun: TestRun = state;

  const [logs, setLogs] = useState<LogGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onMessage = useCallback((logs: LogGroup[]) => setLogs(logs), []);
  const { getLiveUpdates } = useTest(onMessage);

  useEffect(() => {
    if(testRun.status !== 1){
      (async () => {
        const res = await fetch(`${API_URL}/api/runs/${runId}/logs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const logs: LogGroup[] = await res.json();
        setLogs(logs);
        setIsLoading(false);
      })();
    }else{
      getLiveUpdates(runId!);
      setIsLoading(false);
    }
  }, [runId, token]);

  const initiateRerun = async () => {
    const res = await fetch(`${API_URL}/api/runs/${runId}/compiled/run`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    
    if(res.ok){
      //Toast to the user that rerun was successfull or something
    }else{
      console.log(await res.json())
    }
  }


  return (
    <div className="h-screen w-screen p-5">
      <div className="flex flex-row justify-between">
        <Button
          className="flex flex-row gap-3"
          onClick={() => navigate(-1)}
          variant="link"
        >
          <ChevronLeft />
          <h1>Back</h1>
        </Button>
        <Button
          className="flex flex-row gap-3"
          variant="ghost"
          onClick={() => initiateRerun()}
          disabled={testRun.status === 1}
        >
          <RefreshCcw /> Replay test
        </Button>
      </div>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <ReadOnlyEditor code={testRun.rawCode} logs={logs} />
      )}
    </div>
  );
}

export default ViewRunScreen;
