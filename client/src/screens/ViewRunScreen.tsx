import ReadOnlyEditor from "@/components/ReadOnlyEditor";
import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { LogGroup } from "@/models/Log";
import { TestRun } from "@/models/TestRun";
import { Button } from "@/shadcn/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";

function ViewRunScreen() {
  const { runId } = useParams();

  const [searchParams] = useSearchParams();

  const executeParam = searchParams.get("execute");

  const execute: boolean = new Boolean(executeParam).valueOf();

  const { token } = useContext(UserContext);
  const { state } = useLocation();
  const navigate = useNavigate();
  const testRun: TestRun = state;

  const [logs, setLogs] = useState<LogGroup[]>([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

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

  async function runTest(url: string) {
    setLogs([]);

    if (eventSource) {
      eventSource.close();
      console.log("Previous SSE connection closed.");
    }

    const newEventSource = new EventSource(`${url}?token=${token}`);
    setEventSource(newEventSource);

    newEventSource.onopen = () => {
      console.log("SSE connection established.");
    };

    newEventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      const message = data.message;
      const status = data.status;

      console.log(message);
      console.log(status);

      if (status === "close") {
        console.log("Gracefully stopping...");
        newEventSource.close();
      } else {
        setLogs(message);
      }
    };

    newEventSource.onerror = (error) => {
      console.error("SSE error: ", error);
      newEventSource.close();
    };

    return eventSource;
  }

  useEffect(() => {
    if (token) getLogs(token);
  }, [token]);

  useEffect(() => {
    if (execute) runTest(`${API_URL}/api/runs/${runId}/compiled/run`);
  }, [execute]);

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
