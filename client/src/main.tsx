import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/shadcn/components/theme-provider.tsx";
import "./index.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createBrowserRouter, RouterProvider } from "react-router";
import HomeScreen from "./screens/HomeScreen.tsx";
import EditorScreen from "./screens/EditorScreen.tsx";

const router = createBrowserRouter([
  { path: "/", element: <HomeScreen /> },
  { path: "/editor/:test", element: <EditorScreen /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider defaultTheme="dark">
        <RouterProvider router={router} />
      </ThemeProvider>
    </DndProvider>
  </StrictMode>
);
