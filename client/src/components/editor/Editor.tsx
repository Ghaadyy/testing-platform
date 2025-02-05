import { useContext, useEffect } from "react";
import { EditorContext } from "@/context/EditorContext";
import UIEditor from "@/components/editor/ui/UIEditor";
import { Switch } from "@/shadcn/components/ui/switch";
import { Label } from "@/shadcn/components/ui/label";
import { useCompiler } from "@/hooks/useCompiler";
import { toast } from "@/shadcn/hooks/use-toast";
import { TestFile } from "@/models/TestFile";
import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import CodeEditor from "./code/CodeEditor";

async function openDocument(
  fileId: string,
  token: string,
  onSuccess: (file: TestFile) => void,
  onError?: (err?: unknown) => void
) {
  try {
    const res = await fetch(`${API_URL}/api/tests/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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

function Editor() {
  const { setCode, setTests, tests, isCode, setIsCode, fileId } =
    useContext(EditorContext);
  const { token } = useContext(UserContext);
  const { parseCode, generateCode } = useCompiler();

  async function handleEditorSwitch(checked: boolean) {
    if (checked) {
      const generatedCode = await generateCode(tests);
      setCode(generatedCode);
      setIsCode(true);
    } else {
      const tests = await parseCode(fileId);
      setTests(tests);
      setIsCode(tests.length === 0);
    }
  }

  useEffect(() => {
    openDocument(fileId, token!, ({ content }) => {
      setCode(content);
      toast({
        title: "File opened successfully",
      });
    });
  }, [fileId, setCode, setTests, token]);

  return (
    <div className="w-full h-full flex flex-col gap-3 py-3">
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
      {isCode ? <CodeEditor /> : <UIEditor />}
    </div>
  );
}

export default Editor;
