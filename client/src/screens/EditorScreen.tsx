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
import { TestLogGroup } from "@/components/TestLogs";

function EditorScreen() {
  const { test } = useParams();
  const { toast } = useToast();

  const { token } = useContext(UserContext);

  const [logs, setLogs] = useState<TestLogGroup[]>([]);

  const [fileName, setFileName] = useState<string>(test!);
  const [code, setCode] = useState<string>("");
  const [isCode, setIsCode] = useState<boolean>(true);
  const [tests, setTests] = useState<Test[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);

  async function runTest(url: string) {
    setLogs([]);
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log("WebSocket connection established.");
      socket.send(token!);
    };

    socket.onmessage = (event) => setLogs(JSON.parse(event.data));

    socket.onerror = (error) => console.error("WebSocket error: ", error);
    socket.onclose = () => {
      console.log("WebSocket connection closed.");
      getTestRuns(fileName, token!);
    };
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

  useEffect(() => {
    getTestRuns(fileName, token!);
  }, [fileName, token]);

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
          onRun={() => runTest(`ws://localhost:5064/api/tests/${fileName}/run`)}
          onSave={handleSave}
        />
        <Dashboard
          logs={logs}
          testRuns={testRuns}
          onRerun={(id: number) =>
            runTest(`ws://localhost:5064/api/tests/${id}/compiled/run`)
          }
        />
        <Toaster />
      </div>
    </MainContext.Provider>
  );
}

export default EditorScreen;
