import Dashboard from "@/components/Dashboard";
import { Toaster } from "@/shadcn/components/ui/toaster";

import { useCallback, useContext, useEffect, useState } from "react";

import Menu from "@/components/Menu";
import { MainContext } from "@/context/MainContext";
import { useParams } from "react-router";
import { useToast } from "@/shadcn/hooks/use-toast";
import { generateCode } from "@/utils/generateCode";
import { Test } from "@/models/Statement";
import { parseCode } from "@/utils/parseCode";
import { UserContext } from "@/context/UserContext";
import { TestRun } from "@/models/TestRun";
import { API_URL } from "@/main";
import { LogGroup } from "@/models/Log";

function EditorScreen() {
  const { test } = useParams();
  const { toast } = useToast();

  const { token } = useContext(UserContext);

  const [logs, setLogs] = useState<LogGroup[]>([]);

  const [fileName, setFileName] = useState<string>(test!);
  const [code, setCode] = useState<string>("");
  const [isCode, setIsCode] = useState<boolean>(true);
  const [tests, setTests] = useState<Test[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);

  const [eventSource, setEventSource] = useState<EventSource | null>(null);

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

  const saveDocument = useCallback(
    async function (code: string, savedFileName: string) {
      const res = await fetch(`${API_URL}/api/tests`, {
        method: fileName ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: savedFileName,
          content: code,
        }),
      });

      if (!res.ok) {
        toast({
          title: "File with this name already exists",
        });
        return;
      }

      setFileName(savedFileName);
      setCode(code);
      toast({
        title: "Saved successfully!",
      });
    },
    [fileName, toast, token]
  );

  const handleSave = useCallback(
    async function (fileName: string) {
      if (isCode) {
        await saveDocument(code, fileName);
      } else {
        const generatedCode = generateCode(tests);
        const [, status] = parseCode(generatedCode);
        if (status) {
          setCode(generatedCode);
          await saveDocument(generatedCode, fileName);
        } else {
          toast({
            title: "Test syntax error!",
            description:
              "Please make sure you have filled out all the fields correctly then try again. Your progress is unsaved.",
            variant: "destructive",
          });
        }
      }
    },
    [code, isCode, saveDocument, tests, toast]
  );

  async function getTestRuns(fileName: string, token: string) {
    try {
      const res = await fetch(`${API_URL}/api/tests/${fileName}/runs`, {
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

  const reconnect = (fileName: string) => {
    console.log("Reconnecting...");

    if (eventSource) {
      eventSource.close();
    }

    const url = `http://localhost:5064/api/tests/${fileName}/reconnect?token=${token}`;
    const newEventSource = new EventSource(url);
    setEventSource(newEventSource);

    newEventSource.onopen = () => {
      console.log("Reconnected to running tests.");
    };

    newEventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
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

    newEventSource.onerror = (err) => {
      console.error("Error with EventSource: ", err);
      newEventSource.close();
    };
  };

  const cleanup = async (fileName: string) => {
    if (eventSource) {
      eventSource.close();
    }
    try {
      const url = `http://localhost:5064/api/tests/${fileName}/cleanup`;
      await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileName }),
      });
      console.log(`Server resources cleaned up for file: ${fileName}`);
    } catch (err) {
      console.error("Error cleaning up server resources: ", err);
    }
  };

  // Fetch test runs
  useEffect(() => {
    if (fileName && token) {
      getTestRuns(fileName, token);
    }
  }, [fileName, token]);

  // Handle save input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSave(fileName);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fileName, handleSave]);

  // Reconnect if possible when mounted and close connection and cleanup on unmount
  useEffect(() => {
    if (fileName) {
      reconnect(fileName);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        console.log("SSE connection closed during cleanup.");
      }
      if (fileName) {
        cleanup(fileName);
      }
    };
  }, []);

  return (
    <MainContext.Provider
      value={{
        fileName,
        setFileName,
        code,
        setCode,
        isCode,
        setIsCode,
        tests,
        setTests,
      }}
    >
      <div className="h-screen w-screen flex flex-col gap-3 p-3">
        <Menu
          onRun={() =>
            runTest(`http://localhost:5064/api/tests/${fileName}/run`)
          }
          onSave={handleSave}
        />
        <Dashboard
          logs={logs}
          testRuns={testRuns}
          onRerun={(id: number) =>
            runTest(`http://localhost:5064/api/tests/${id}/compiled/run`)
          }
        />
        <Toaster />
      </div>
    </MainContext.Provider>
  );
}

export default EditorScreen;
