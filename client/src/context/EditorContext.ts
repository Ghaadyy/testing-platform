import { Test } from "@/models/Program";
import { createContext, Dispatch, SetStateAction } from "react";

export type EditorContext = {
  fileId: string;
  setFileId: Dispatch<SetStateAction<string>>;
  code: string;
  setCode: Dispatch<SetStateAction<string>>;
  isCode: boolean;
  setIsCode: Dispatch<SetStateAction<boolean>>;
  tests: Test[];
  setTests: Dispatch<SetStateAction<Test[]>>;
};

export const EditorContext = createContext<EditorContext>({
  fileId: "",
  setFileId: () => "",
  code: "",
  setCode: () => "",
  isCode: false,
  setIsCode: () => false,
  tests: [],
  setTests: () => [],
});
