import React, { useState } from "react";
import { UserContext } from "./UserContext";
import { ThemeProvider } from "@/shadcn/components/theme-provider";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { User } from "@/models/User";

type Props = {
  children: React.ReactNode;
};

function AppProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);

  const userContext = {
    user,
    setUser,
    token,
    setToken,
    isAuthenticated,
    setIsAuthenticated,
    authInitialized,
    setAuthInitialized,
  };

  return (
    <UserContext.Provider value={userContext}>
      <DndProvider backend={HTML5Backend}>
        <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
      </DndProvider>
    </UserContext.Provider>
  );
}

export default AppProvider;
