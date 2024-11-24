import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/shadcn/components/theme-provider.tsx";
import App from "./App.tsx";
import "./index.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider defaultTheme="dark">
        <App />
      </ThemeProvider>
    </DndProvider>
  </StrictMode>
);
