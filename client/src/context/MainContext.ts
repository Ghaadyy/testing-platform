import { Test } from "@/models/Statement";
import { createContext, Dispatch, SetStateAction } from "react";

export type MainContext = {
  fileId: string;
  setFileId: Dispatch<SetStateAction<string>>;
  code: string;
  setCode: Dispatch<SetStateAction<string>>;
  isCode: boolean;
  setIsCode: Dispatch<SetStateAction<boolean>>;
  tests: Test[];
  setTests: Dispatch<SetStateAction<Test[]>>;
};

export const MainContext = createContext<MainContext>({
  fileId: "",
  setFileId: () => "",
  code: "",
  setCode: () => "",
  isCode: false,
  setIsCode: () => false,
  tests: [],
  setTests: () => [],
});
