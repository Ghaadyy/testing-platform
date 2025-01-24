import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { Toaster } from "@/shadcn/components/ui/toaster";

export const API_URL = import.meta.env.VITE_API_URL;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
);
