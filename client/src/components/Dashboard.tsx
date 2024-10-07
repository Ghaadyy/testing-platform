import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shadcn/components/ui/resizable";
import { ScrollArea } from "@/shadcn/components/ui/scroll-area";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shadcn/components/ui/alert";
import { Input } from "@/shadcn/components/ui/input";

import Editor from "@monaco-editor/react";

import { useContext, useState } from "react";
import { MainContext } from "@/context/MainContext";
import { useTheme } from "@/shadcn/components/theme-provider";

function Dashboard() {
  const { code, setCode } = useContext(MainContext);
  const { theme } = useTheme();

  const [urlSrc, setUrlSrc] = useState<string>(
    "https://www.selenium.dev/documentation"
  );

  return (
    <ResizablePanelGroup
      direction="horizontal"
      style={{ height: "100%", width: "100%", borderRadius: 10 }}
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
          <ResizablePanel
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: 10,
            }}
            defaultSize={60}
          >
            <Input
              placeholder="Enter your website.."
              onChange={(e) => setUrlSrc(e.target.value)}
              value={urlSrc}
            />
            <iframe
              width="100%"
              height="100%"
              style={{ borderRadius: 10 }}
              src={urlSrc}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={40}
            style={{
              padding: 10,
            }}
          >
            <ScrollArea
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <Alert>
                  <AlertTitle>discordSignIn</AlertTitle>
                  <AlertDescription>
                    You can add components and dependencies to your app using
                    the cli.
                  </AlertDescription>
                </Alert>
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default Dashboard;
