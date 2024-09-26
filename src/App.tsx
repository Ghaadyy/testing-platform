import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// import Editor from "react-simple-code-editor";
import { Input } from "@/components/ui/input";

import { useState } from "react";

import Editor from "@monaco-editor/react";

function App() {
  const [code, setCode] = useState<string>("");
  const [urlSrc, setUrlSrc] = useState<string>(
    "https://www.selenium.dev/documentation"
  );

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 10,
      }}
    >
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Open <MenubarShortcut>⌘O</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              Save <MenubarShortcut>⌘S</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
          <MenubarMenu>
            <MenubarTrigger>Run</MenubarTrigger>
          </MenubarMenu>
        </MenubarMenu>
      </Menubar>
      <ResizablePanelGroup
        direction="horizontal"
        style={{ height: "100%", width: "100%", borderRadius: 10 }}
      >
        <ResizablePanel>
          <Editor
            height="100%"
            defaultValue="Write some code here..."
            theme="vs-dark"
            value={code}
            onChange={(c) => setCode(c ?? "")}
          />
          {/* <Editor
            value={code}
            onValueChange={(code) => setCode(code)}
            highlight={(code) => code}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
              height: "100%",
              width: "100%",
            }}
          /> */}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel
              style={{
                backgroundColor: "black",
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
                backgroundColor: "black",
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
                  <Alert>
                    <AlertTitle>discordSignIn</AlertTitle>
                    <AlertDescription>
                      You can add components and dependencies to your app using
                      the cli.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTitle>discordSignIn</AlertTitle>
                    <AlertDescription>
                      You can add components and dependencies to your app using
                      the cli.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTitle>discordSignIn</AlertTitle>
                    <AlertDescription>
                      You can add components and dependencies to your app using
                      the cli.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTitle>discordSignIn</AlertTitle>
                    <AlertDescription>
                      You can add components and dependencies to your app using
                      the cli.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTitle>discordSignIn</AlertTitle>
                    <AlertDescription>
                      You can add components and dependencies to your app using
                      the cli.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTitle>discordSignIn</AlertTitle>
                    <AlertDescription>
                      You can add components and dependencies to your app using
                      the cli.
                    </AlertDescription>
                  </Alert>
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
    </div>
  );
}

export default App;
