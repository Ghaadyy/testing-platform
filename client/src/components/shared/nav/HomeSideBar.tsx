import { FilePlusIcon, Moon, Sun } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/shadcn/components/ui/sidebar";
import { useContext } from "react";
import { Link } from "react-router";
import { useTheme } from "@/shadcn/components/theme-provider";
import { NavUser } from "./NavUser";
import { UserContext } from "@/context/UserContext";
import CreateFileDialog from "../dialog/CreateFileDialog";

type HomeSideBarProps = {
  children: React.ReactNode;
};

function HomeSideBar({ children }: HomeSideBarProps) {
  const { user } = useContext(UserContext);
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarHeader className="justify-center p-4">
            <Link to="/">
              <h1 className="font-bold">Home</h1>
            </Link>
          </SidebarHeader>
          <SidebarGroup>
            <SidebarGroupLabel>Manage your tests</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <CreateFileDialog>
                    <SidebarMenuButton>
                      <FilePlusIcon /> Create test
                    </SidebarMenuButton>
                  </CreateFileDialog>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {user && (
          <SidebarFooter>
            <NavUser user={user} />
          </SidebarFooter>
        )}
      </Sidebar>
      <div className="h-screen w-screen flex flex-col gap-3 p-3">
        <div className="flex flex-row gap-3 justify-between">
          <SidebarTrigger className="h-9 w-9" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
        {children}
      </div>
    </SidebarProvider>
  );
}

export default HomeSideBar;
