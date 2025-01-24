import { EditorContext } from "@/context/EditorContext";
import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { useToast } from "@/shadcn/hooks/use-toast";
import { generateCode } from "@/utils/generateCode";
import { parseCode } from "@/utils/parseCode";
import { useContext } from "react";

export function useSave() {
  const { toast } = useToast();
  const { token } = useContext(UserContext);
  const { setCode, isCode, tests } = useContext(EditorContext);

  async function saveDocument(fileId: string, code: string) {
    if (!isCode) {
      const generatedCode = generateCode(tests);
      const [, status] = parseCode(generatedCode);

      if (status) {
        setCode(generatedCode);
        code = generatedCode;
      } else {
        toast({
          title: "Test syntax error!",
          description:
            "Please make sure you have filled out all the fields correctly then try again. Your progress is unsaved.",
          variant: "destructive",
        });
      }
    }

    const res = await fetch(`${API_URL}/api/tests/${fileId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName: fileId, // TODO: FIX
        content: code,
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
