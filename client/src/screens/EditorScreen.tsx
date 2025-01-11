import Dashboard from "@/components/Dashboard";
import { Toaster } from "@/shadcn/components/ui/toaster";

import { useContext, useEffect, useState } from "react";

import Menu from "@/components/Menu";
import { MainContext } from "@/context/MainContext";
import { Log } from "@/models/Log";
import { useParams } from "react-router";
import { useToast } from "@/shadcn/hooks/use-toast";
import { generateCode } from "@/utils/generateCode";
import { Test } from "@/models/Statement";
import { parseCode } from "@/utils/parseCode";
import { UserContext } from "@/context/UserContext";
import { TestRun } from "@/models/TestRun";
import { API_URL } from "@/main";

function EditorScreen() {
  const { test } = useParams();
  const { toast } = useToast();

  const { token } = useContext(UserContext);

  const [logs, setLogs] = useState<Log[]>([]);

  const [fileName, setFileName] = useState<string>(test!);
  const [code, setCode] = useState<string>("");
  const [isCode, setIsCode] = useState<boolean>(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);

  async function runTest(url: string) {
    setLogs([]);
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log("WebSocket connection established.");
      socket.send(token!);
    };

    socket.onmessage = (event) =>
      setLogs((prevLogs) => [...prevLogs, JSON.parse(event.data)]);

    socket.onerror = (error) => console.error("WebSocket error: ", error);
    socket.onclose = () => {
      console.log("WebSocket connection closed.");
      getTestRuns(fileName, token!);
    };
  }

  async function saveDocument(code: string, savedFileName: string) {
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
  }

  async function handleSave(fileName: string) {
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
  }

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
  });

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
