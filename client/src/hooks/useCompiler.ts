import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { Program, Test } from "@/models/Program";
import { toast } from "@/shadcn/hooks/use-toast";
import { useCallback, useContext } from "react";

function generateCode(tests: Test[]): string {
  let code = "";

  tests.forEach(({ testName, actions }) => {
    code += `${testName} {\n`;

    actions.forEach((action) => {
      switch (action.action) {
        case "visit":
          code += `   visit "${action.url}"\n`;
          break;
        case "click":
          code += `   click ${action.elementType} with description "${action.description}"\n`;
          break;
        case "check":
          code += `   check if ${action.elementType} with description "${
            action.description
          }" ${action.state ? "is displayed" : "is hidden"}\n`;
          break;
        case "type":
          code += `   type "${action.content}" on ${action.elementType} with description "${action.description}"\n`;
          break;
      }
    });

    code += `}\n`;
  });

  return code;
}

export function useCompiler() {
  const { token } = useContext(UserContext);

  const parseCode = useCallback(
    async function (fileId: string): Promise<Test[]> {
      const res = await fetch(`${API_URL}/api/tests/${fileId}/compile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok)
        toast({
          title: "Test contains syntax errors!",
          variant: "destructive",
          description:
            "Please fix these errors before switching to the UI editor.",
        });

      const program: Program = await res.json();

      program.tests = program.tests.map((test) => ({
        ...test,
        id: crypto.randomUUID(),
      }));

      program.tests.forEach((test) => {
        test.actions = test.actions.map((action) => ({
          ...action,
          id: crypto.randomUUID(),
        }));
      });

      return program.tests;
    },
    [token]
  );

  return { parseCode, generateCode };
}
