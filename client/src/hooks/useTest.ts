import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { LogGroup } from "@/models/Log";
import { useCallback, useContext } from "react";

export function useTest(onMessage: (logs: LogGroup[]) => void) {
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

  function getLiveUpdates(runId: string) {
    connect(`${API_URL}/api/runs/${runId}/connect`);
  }

  return { getLiveUpdates};
}
