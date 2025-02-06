import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { Program, Test } from "@/models/Program";
import { toast } from "@/shadcn/hooks/use-toast";
import { useCallback, useContext } from "react";

export function useCompiler() {
  const { token } = useContext(UserContext);

  const generateCode = useCallback(
    async function (tests: Test[]): Promise<string> {
      const res = await fetch(`${API_URL}/api/tests/decompile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(JSON.stringify({ tests })),
        method: "POST",
      });

      if (!res.ok)
        toast({
          title: "Test contains errors!",
          variant: "destructive",
        });

      const code: string = await res.text();

      return code;
    },
    [token]
  );

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
