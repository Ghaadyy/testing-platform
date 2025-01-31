import HomeSideBar from "@/components/shared/nav/HomeSideBar";
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
