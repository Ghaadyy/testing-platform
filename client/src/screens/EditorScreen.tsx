import Menu from "@/components/Menu";
import Editor from "@/components/Editor";
import { useCallback, useState } from "react";
import { EditorContext } from "@/context/EditorContext";
import { useParams } from "react-router";
import { Test } from "@/models/Statement";
import { LogGroup } from "@/models/Log";
import { useTest } from "@/hooks/useTest";

function EditorScreen() {
  const { testId } = useParams();

  const [logs, setLogs] = useState<LogGroup[]>([]);
  const [fileId, setFileId] = useState<string>(testId!);
  const [code, setCode] = useState<string>("");
  const [isCode, setIsCode] = useState<boolean>(true);
  const [tests, setTests] = useState<Test[]>([]);

  const onMessage = useCallback((logs: LogGroup[]) => setLogs(logs), []);

  const { run } = useTest(fileId, onMessage);

  return (
    <EditorContext.Provider
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
        <Menu onRun={run} />
        <Editor logs={logs} />
      </div>
    </EditorContext.Provider>
  );
}

export default EditorScreen;
