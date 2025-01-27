import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { LogGroup } from "@/models/Log";
import { TestRun } from "@/models/TestRun";
import { Button } from "@/shadcn/components/ui/button";
import { toast } from "@/shadcn/hooks/use-toast";
import { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router";

export function useTest(onMessage: (logs: LogGroup[]) => void = () => {}) {
  const { token } = useContext(UserContext);
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const connect = useCallback(async function (url: string) {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const readStream = async () => {
      if (reader === undefined) return;

      const { value, done } = await reader.read();
      if (done) return;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      let boundaryIndex;
      while ((boundaryIndex = buffer.indexOf("\n\n")) !== -1) {
        const completeMessage = buffer.slice(0, boundaryIndex).trim();
        buffer = buffer.slice(boundaryIndex + 1);

        if (completeMessage.startsWith("data:")) {
          const jsonData = completeMessage.slice(5).trim();
          try {
            const { message, status } = JSON.parse(jsonData);

            if (status === "close") {
              console.log("[SSE] Connection closed.");
              return;
            } else {
              onMessage(message);
            }
          } catch (error) {
            console.error("Failed to parse SSE JSON:", jsonData, error);
          }
        }
      }

      readStream();
    };

    readStream();
  }, []);

  function getLiveUpdates(runId: string) {
    connect(`${API_URL}/api/runs/${runId}/connect`);
  }

  const run = useCallback(
    async (fileId: string) => {
      const res = await fetch(`${API_URL}/api/tests/${fileId}/run`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const run: TestRun = await res.json();
        toast({
          title: "Compiled successfully",
          description: "View live test run.",
          action: (
            <Button
              onClick={() =>
                navigate(`/runs/${run.id}`, {
                  state: run,
                })
              }
            >
              View
            </Button>
          ),
        });
      } else {
        const errors: string[] = await res.json();
        setErrors(errors);
      }
    },
    [token]
  );

  const rerun = useCallback(
    async (runId: string) => {
      const res = await fetch(`${API_URL}/api/runs/${runId}/compiled/run`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const runId: string = await res.json();
        toast({
          title: "Compiled successfully",
          description: "View live test run.",
          action: (
            <Button onClick={() => navigate(`/runs/${runId}`)}>View</Button>
          ),
        });
      }
    },
    [token]
  );

  return { getLiveUpdates, run, rerun, errors, setErrors };
}
