import Menu from "@/components/Menu";
import Editor from "@/components/Editor";
import { useContext, useState } from "react";
import { EditorContext } from "@/context/EditorContext";
import { useParams } from "react-router";
import { Test } from "@/models/Statement";
import { LogGroup } from "@/models/Log";
import { API_URL } from "@/main";
import { UserContext } from "@/context/UserContext";

function EditorScreen() {
  const { token } = useContext(UserContext);
  const { testId } = useParams();

  const [logs, setLogs] = useState<LogGroup[]>([]);
  const [fileId, setFileId] = useState<string>(testId!);
  const [code, setCode] = useState<string>("");
  const [isCode, setIsCode] = useState<boolean>(true);
  const [tests, setTests] = useState<Test[]>([]);

  const initiateRun = async () => {
    const res = await fetch(`${API_URL}/api/tests/${fileId}/run`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    
    if(res.ok){
      const logs: LogGroup[] = await res.json();
      if(logs[0].assertions.length == 0){
        logs.push({
          id: crypto.randomUUID(),
          testName: "View runs screen for live updates",
          status: 1,
          assertions: []  
        })
      }
      setLogs(logs);
    }else{
      console.log(await res.json())
    }
  }

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
        <Menu onRun={initiateRun} />
        <Editor logs={logs} />
      </div>
    </EditorContext.Provider>
  );
}

export default EditorScreen;
