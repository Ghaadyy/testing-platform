import { EditorContext } from "@/context/EditorContext";
import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { useToast } from "@/shadcn/hooks/use-toast";
import { useContext } from "react";
import { useCompiler } from "./useCompiler";

export function useSave() {
  const { toast } = useToast();
  const { token } = useContext(UserContext);
  const { setCode, isCode, tests, code } = useContext(EditorContext);
  const { generateCode } = useCompiler();

  async function saveDocument(fileId: string) {
    let generatedCode: string = "";
    if (!isCode) {
      generatedCode = await generateCode(tests);
      setCode(generatedCode);
    }

    const res = await fetch(`${API_URL}/api/tests/${fileId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName: fileId, // TODO: FIX
        content: isCode ? code : generatedCode,
      }),
    });

    if (!res.ok) {
      toast({
        title: await res.text(),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Saved successfully!",
    });
  }

  return { saveDocument };
}
