import Editor from "@/components/Editor";
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
import { API_URL } from "@/main";
import { LogGroup } from "@/models/Log";
import { TestFile } from "@/models/TestFile";

function EditorScreen() {
  const { testId } = useParams();
  const { toast } = useToast();

  const { token } = useContext(UserContext);

  const [logs, setLogs] = useState<LogGroup[]>([]);

  const [fileId, setFileId] = useState<string>(testId!);
  const [code, setCode] = useState<string>("");
  const [isCode, setIsCode] = useState<boolean>(true);
  const [tests, setTests] = useState<Test[]>([]);

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
    async function (code: string, fileId: string) {
      const res = await fetch(`${API_URL}/api/tests/${fileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: fileId, // TODO: FIX
          content: code,
        }),
      });

      if (!res.ok) {
        toast({
          title: "File with this name already exists",
        });
        return;
      }
      const file: TestFile = await res.json();
      setFileId(file.id);
      setCode(code);
      toast({
        title: "Saved successfully!",
      });
    },
    [toast, token]
  );

  const handleSave = useCallback(
    async function (fileId: string) {
      if (isCode) {
        await saveDocument(code, fileId);
      } else {
        const generatedCode = generateCode(tests);
        const [, status] = parseCode(generatedCode);
        if (status) {
          setCode(generatedCode);
          await saveDocument(generatedCode, fileId);
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

  const reconnect = (fileId: string) => {
    console.log("Reconnecting...");

    if (eventSource) {
      eventSource.close();
    }

    const url = `${API_URL}/api/tests/${fileId}/reconnect?token=${token}`;
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

  const cleanup = async (fileId: string) => {
    if (eventSource) {
      eventSource.close();
    }
    try {
      const url = `${API_URL}/api/tests/${fileId}/cleanup`;
      await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileId }),
      });
      console.log(`Server resources cleaned up for file: ${fileId}`);
    } catch (err) {
      console.error("Error cleaning up server resources: ", err);
    }
  };

  // Handle save input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSave(fileId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fileId, handleSave]);

  // Reconnect if possible when mounted and close connection and cleanup on unmount
  useEffect(() => {
    if (fileId) {
      reconnect(fileId);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        console.log("SSE connection closed during cleanup.");
      }
      if (fileId) {
        cleanup(fileId);
      }
    };
  }, []);

  return (
    <MainContext.Provider
      value={{
        fileId,
        setFileId,
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
          onRun={() => runTest(`${API_URL}/api/tests/${fileId}/run`)}
          onSave={handleSave}
        />
        <Editor logs={logs} />
        <Toaster />
      </div>
    </MainContext.Provider>
  );
}

export default EditorScreen;
