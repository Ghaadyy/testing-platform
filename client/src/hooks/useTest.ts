import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { LogGroup } from "@/models/Log";
import { useContext, useEffect, useState } from "react";

function makeEventSource(
  url: string,
  onMessage: (logs: LogGroup[]) => void
): EventSource {
  const eventSource = new EventSource(url);

  eventSource.onopen = () => console.log("[SSE] Connection established.");

  eventSource.onmessage = (event) => {
    const { message, status } = JSON.parse(event.data);

    if (status === "close") {
      console.log("[SSE] Connection closed.");
      eventSource.close();
    } else {
      onMessage(message);
    }
  };

  eventSource.onerror = () => {
    console.log("[SSE] An error occured.");
    eventSource.close();
  };

  return eventSource;
}

export function useTest(fileId: string, onMessage: (logs: LogGroup[]) => void) {
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { token } = useContext(UserContext);

  function run() {
    if (eventSource) eventSource.close();

    setEventSource(
      makeEventSource(
        `${API_URL}/api/tests/${fileId}/run?token=${token}`,
        onMessage
      )
    );
  }

  function rerun(runId: string) {
    if (eventSource) eventSource.close();

    setEventSource(
      makeEventSource(
        `${API_URL}/api/runs/${runId}/compiled/run?token=${token}`,
        onMessage
      )
    );
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

    setEventSource(
      makeEventSource(
        `${API_URL}/api/tests/${fileId}/reconnect?token=${token}`,
        onMessage
      )
    );

    return () => {
      cleanup();
    };
  }, [fileId, token, onMessage]);

  return { run, rerun };
}
