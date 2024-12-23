import { Toaster } from "@/shadcn/components/ui/toaster";
import Files from "@/components/Files";
import HomeSideBar from "@/components/HomeSideBar";

function HomeScreen() {
  return (
    <HomeSideBar>
      <Files />
      <Toaster />
    </HomeSideBar>
  );
}

export default HomeScreen;
