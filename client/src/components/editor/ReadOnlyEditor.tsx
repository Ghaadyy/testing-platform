import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shadcn/components/ui/resizable";

import Editor from "@monaco-editor/react";
import { setupEditor } from "@/utils/setupEditor";
import { LogGroup } from "@/models/Log";
import TestLogs from "../TestLogs";
import { ScrollArea, ScrollBar } from "@/shadcn/components/ui/scroll-area";
import { Card, CardContent, CardTitle } from "@/shadcn/components/ui/card";

type Props = {
  code: string;
  logs: LogGroup[];
};

function ReadOnlyEditor({ code, logs }: Props) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full w-full rounded-lg"
    >
      <ResizablePanel className="flex flex-col gap-3 px-3" defaultSize={50}>
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
      <ResizablePanel defaultSize={50} className="px-3 w-full">
        <Card className="flex flex-col gap-4 h-full">
          <CardTitle className="font-bold text-2xl px-4 pt-4">Logs</CardTitle>
          <ScrollArea className="h-full">
            <CardContent className="px-4">
              {Object.keys(logs).length === 0 ? (
                <p>No test logs for this run!</p>
              ) : (
                <TestLogs logs={logs} />
              )}
            </CardContent>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Card>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default ReadOnlyEditor;
