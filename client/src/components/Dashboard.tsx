import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shadcn/components/ui/resizable";
import { ScrollArea } from "@/shadcn/components/ui/scroll-area";

import Editor from "@monaco-editor/react";

import { useContext, useEffect, useState } from "react";
import { MainContext } from "@/context/MainContext";
import { useTheme } from "@/shadcn/components/theme-provider";
import useWebSocket from "react-use-websocket";
import { TestRun } from "@/models/TestRun";
import TestRunTable from "./TestRunTable";
import TestAlert from "./TestAlert";

function Dashboard() {
  const { code, setCode, fileName } = useContext(MainContext);
  const { theme } = useTheme();
  const { lastMessage } = useWebSocket("ws://localhost:5064/ws/user");
  const [tests, setTests] = useState<any[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);

  async function getTestRuns(fileName: string) {
    try {
      const res = await fetch(
        `http://localhost:5064/api/tests/${fileName}/runs`
      );
      const testRuns: TestRun[] = await res.json();
      console.log(testRuns);
      setTestRuns(testRuns);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (fileName) getTestRuns(fileName);
  }, [fileName]);

  useEffect(() => {
    if (lastMessage !== null) {
      const test = JSON.parse(lastMessage.data);
      setTests((prevTests) => [...prevTests, test]);
    }
  }, [lastMessage]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full w-full rounded-lg"
    >
      <ResizablePanel>
        <Editor
          height="100%"
          theme={theme == "light" ? "vs-light" : "vs-dark"}
          value={code}
          onChange={(c) => setCode(c ?? "")}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel className="flex flex-col gap-3 p-3" defaultSize={60}>
            <TestRunTable testRuns={testRuns} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40} className="p-3 flex flex-col gap-3">
            <h1 className="font-bold text-2xl">Tests</h1>
            <ScrollArea className="h-full w-full">
              <div className="flex flex-col gap-3">
                {tests.length === 0 && (
                  <p>
                    There are no tests running yet. Try running a test first!
                  </p>
                )}
                {tests.map(({ testName, passed }) => (
                  <TestAlert testName={testName} passed={passed} />
                ))}
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default Dashboard;
