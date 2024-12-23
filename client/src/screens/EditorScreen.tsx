import Dashboard from "@/components/Dashboard";
import { Toaster } from "@/shadcn/components/ui/toaster";

import { useState } from "react";

import Menu from "@/components/Menu";
import { MainContext } from "@/context/MainContext";
import { Check } from "@/models/Check";
import { useParams } from "react-router";

function EditorScreen() {
  const { test } = useParams();

  const [fileName, setFileName] = useState<string>(test!);
  const [code, setCode] = useState<string>("");
  const [checks, setChecks] = useState<Check[]>([]);

  async function runTest(url: string) {
    setChecks([]);
    const socket = new WebSocket(url);

    socket.onopen = () => console.log("WebSocket connection established.");

    socket.onmessage = (event) =>
      setChecks((prevChecks) => [...prevChecks, JSON.parse(event.data)]);

    socket.onerror = (error) => console.error("WebSocket error: ", error);
    socket.onclose = () => console.log("WebSocket connection closed.");
  }

  return (
    <MainContext.Provider
      value={{
        fileName,
        code,
        setFileName,
        setCode,
      }}
    >
      <div className="h-screen w-screen flex flex-col gap-3 p-3">
        <Menu
          runTest={() =>
            runTest(`ws://localhost:5064/api/tests/${fileName}/run`)
          }
        />
        <Dashboard
          checks={checks}
          fileName={test!}
          rerunHandler={(id: number) =>
            runTest(`ws://localhost:5064/api/tests/${id}/compiled/run`)
          }
        />
        <Toaster />
      </div>
    </MainContext.Provider>
  );
}

export default EditorScreen;
