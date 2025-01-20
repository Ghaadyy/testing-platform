import ReadOnlyEditor from "@/components/ReadOnlyEditor";
import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { LogGroup } from "@/models/Log";
import { TestRun } from "@/models/TestRun";
import { Button } from "@/shadcn/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

function ViewRunScreen() {
  const { runId } = useParams();
  const { token } = useContext(UserContext);
  const { state } = useLocation();
  const navigate = useNavigate();
  const testRun: TestRun = state;

  const [logs, setLogs] = useState<LogGroup[]>([]);

  async function getLogs(token: string) {
    try {
      const res = await fetch(`${API_URL}/api/runs/${runId}/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const logs: LogGroup[] = await res.json();
      console.log(logs);
      setLogs(logs);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (token) getLogs(token);
  }, [token]);

  return (
    <div className="h-screen w-screen p-5">
      <Button
        className="flex flex-row gap-3"
        onClick={() => navigate("/")}
        variant="link"
      >
        <ChevronLeft />
        <h1>Back</h1>
      </Button>
      <ReadOnlyEditor code={testRun.rawCode} logs={logs} />
    </div>
  );
}

export default ViewRunScreen;
