import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shadcn/components/ui/resizable";
import { ScrollArea } from "@/shadcn/components/ui/scroll-area";

import Editor from "@monaco-editor/react";
import { useContext, useEffect, useState } from "react";
import { MainContext } from "@/context/MainContext";
import { TestRun } from "@/models/TestRun";
import TestRunTable from "./TestRunTable";
import TestLogs from "./TestLogs";
import { Log } from "@/models/Log";
import TestCreator from "./TestCreator";
import { Switch } from "@/shadcn/components/ui/switch";
import { Label } from "@/shadcn/components/ui/label";
import { generateCode } from "@/utils/generateCode";
import { setupEditor } from "@/utils/setupEditor";
import { parseCode } from "@/utils/parseCode";
import { toast } from "@/shadcn/hooks/use-toast";
import { TestFile } from "@/models/TestFile";

type Props = {
  logs: Log[];
  onRerun: (id: number) => void;
};

async function openDocument(
  fileName: string,
  onSuccess: (file: TestFile) => void,
  onError?: (err?: unknown) => void
) {
  try {
    const res = await fetch(`http://localhost:5064/api/tests/${fileName}`);
    if (!res.ok) {
      if (onError) onError();
      return;
    }

    const file: TestFile = await res.json();
    onSuccess(file);
  } catch (err) {
    if (onError) onError(err);
  }
}

async function getTestRuns(
  fileName: string,
  onSuccess: (testRuns: TestRun[]) => void
) {
  try {
    const res = await fetch(`http://localhost:5064/api/tests/${fileName}/runs`);
    const testRuns: TestRun[] = await res.json();
    onSuccess(testRuns);
  } catch (err) {
    console.log(err);
  }
}

function Dashboard({ logs, onRerun }: Props) {
  const { code, setCode, tests, setTests, isCode, setIsCode, fileName } =
    useContext(MainContext);

  const [testRuns, setTestRuns] = useState<TestRun[]>([]);

  function handleEditorSwitch(checked: boolean) {
    if (checked) {
      setCode(generateCode(tests));
      setIsCode(checked);
    } else {
      const [parsedTests, status] = parseCode(code);
      if (!status) {
        toast({
          title: "Test contains syntax errors!",
          variant: "destructive",
          description:
            "Please fix these errors before switching to the UI editor.",
        });
        setIsCode(true);
      } else {
        setTests(parsedTests);
        setIsCode(checked);
      }
    }
  }

  useEffect(() => {
    openDocument(fileName, ({ content }) => {
      setCode(content);
      setTests(() => {
        const [parsedTests] = parseCode(content);
        return parsedTests;
      });
      toast({
        title: "File opened successfully",
      });
    });
    getTestRuns(fileName, (runs) => setTestRuns(runs));
  }, []);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full w-full rounded-lg"
    >
      <ResizablePanel className="flex flex-col gap-3 px-3">
        <div className="flex flex-row gap-3 items-center">
          <Switch
            id="code-toggle"
            checked={isCode}
            onCheckedChange={handleEditorSwitch}
          />
          <Label htmlFor="code-toggle">
            {isCode ? "Use visual editor" : "Use code editor"}
          </Label>
        </div>
        {isCode ? (
          <Editor
            height="100%"
            options={{
              minimap: {
                enabled: false,
              },
              fontSize: 14,
            }}
            language={"rnl"}
            className="editor-wrapper"
            theme={"rnl-theme"}
            value={code}
            onChange={(c) => setCode(c ?? "")}
            beforeMount={setupEditor}
          />
        ) : (
          <TestCreator />
        )}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel className="flex flex-col gap-3 p-3" defaultSize={60}>
            <TestRunTable testRuns={testRuns} onRerun={onRerun} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40} className="p-3 flex flex-col gap-3">
            <h1 className="font-bold text-2xl">Logs</h1>
            <ScrollArea>
              {logs.length === 0 ? (
                <p>There are no tests running yet. Try running a test first!</p>
              ) : (
                <div className="flex flex-col gap-3">
                  <TestLogs logs={logs} />
                </div>
              )}
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default Dashboard;
