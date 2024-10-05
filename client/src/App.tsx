import Dashboard from "@/components/Dashboard";
import { Toaster } from "@/components/ui/toaster";

import { useState } from "react";

import Menu from "@/components/Menu";
import { MainContext } from "@/context/MainContext";

function App() {
  const [fileName, setFileName] = useState<string>("");
  const [code, setCode] = useState<string>("");

  return (
    <MainContext.Provider
      value={{
        fileName,
        code,
        setFileName,
        setCode,
      }}
    >
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: 10,
        }}
      >
        <Menu />
        <Dashboard />
        <Toaster />
      </div>
    </MainContext.Provider>
  );
}

export default App;
