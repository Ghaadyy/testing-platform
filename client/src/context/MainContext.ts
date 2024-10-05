import { createContext, Dispatch, SetStateAction } from "react";

export type MainContext = {
  fileName: string;
  code: string;
  setFileName: Dispatch<SetStateAction<string>>;
  setCode: Dispatch<SetStateAction<string>>;
};

export const MainContext = createContext<MainContext>({
  fileName: "",
  code: "",
  setFileName: () => "",
  setCode: () => "",
});
