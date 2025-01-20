import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shadcn/components/ui/resizable";
import { ScrollArea } from "@/shadcn/components/ui/scroll-area";

import Editor from "@monaco-editor/react";
import { setupEditor } from "@/utils/setupEditor";
import { LogGroup } from "@/models/Log";
import { Card } from "@/shadcn/components/ui/card";
import TestLogs from "./TestLogs";

type Props = {
  code: string;
  logs: LogGroup[];
};

function ReadOnlyEditor({ code, logs }: Props) {
  return (
    <ResizablePanelGroup direction="vertical" className="h-full w-full">
      <ResizablePanel className="flex flex-col gap-3 py-3" defaultSize={80}>
        <Editor
          height="100%"
          options={{
            minimap: {
              enabled: false,
            },
            fontSize: 14,
            readOnly: true,
          }}
          language={"rnl"}
          className="editor-wrapper"
          theme={"rnl-theme"}
          value={code}
          beforeMount={setupEditor}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={20} className="py-3">
        <Card className="p-4 flex flex-col gap-3">
          <h1 className="font-bold text-2xl">Logs</h1>
          <ScrollArea>
            {Object.keys(logs).length === 0 ? (
              <p>No test logs for this run!</p>
            ) : (
              <div className="flex flex-col gap-3">
                <TestLogs logs={logs} />
              </div>
            )}
          </ScrollArea>
        </Card>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default ReadOnlyEditor;
