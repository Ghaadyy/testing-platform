import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { LogGroup } from "@/models/Log";
import { useCallback, useContext, useEffect } from "react";

export function useTest(fileId: string, onMessage: (logs: LogGroup[]) => void) {
  const { token } = useContext(UserContext);

  const connect = useCallback(
    async function (url: string) {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      const readStream = async () => {
        if (reader === undefined) return;

        const { value, done } = await reader.read();
        if (done) return;

        const chunk = decoder.decode(value, { stream: true });
        const { message, status } = JSON.parse(chunk);
        if (status === "close") {
          console.log("[SSE] Connection closed.");
          return;
        } else {
          onMessage(message);
        }
        readStream();
      };

      readStream();
    },
    [onMessage, token]
  );

  function run() {
    connect(`${API_URL}/api/tests/${fileId}/run`);
  }

  function rerun(runId: string) {
    connect(`${API_URL}/api/runs/${runId}/compiled/run`);
  }

  // Try to reconnect to an existing test
  useEffect(() => {
    const cleanup = async () => {
      try {
        await fetch(`${API_URL}/api/tests/${fileId}/cleanup`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fileId }),
        });
        console.log(`[SSE] Server resources cleaned up for file: ${fileId}`);
      } catch (err) {
        console.error("[SSE] Error cleaning up server resources: ", err);
      }
    };

    connect(`${API_URL}/api/tests/${fileId}/reconnect`);

    return () => {
      cleanup();
    };
  }, [fileId, token, onMessage, connect]);

  return { run, rerun };
}
