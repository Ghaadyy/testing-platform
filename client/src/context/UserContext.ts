import { User } from "@/models/User";
import { createContext, Dispatch, SetStateAction } from "react";

export type UserContext = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
  isAuthenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
};

export const UserContext = createContext<UserContext>({
  user: null,
  setUser: () => null,
  token: "",
  setToken: () => "",
  isAuthenticated: false,
  setIsAuthenticated: () => false,
});
