import HomeSideBar from "@/components/HomeSideBar";
import { Toaster } from "@/shadcn/components/ui/toaster";
import { Outlet } from "react-router";

function RootLayout() {
  return (
    <HomeSideBar>
      <Outlet />
      <Toaster />
    </HomeSideBar>
  );
}

export default RootLayout;
