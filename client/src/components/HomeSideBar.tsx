import { FilePlusIcon, Moon, Sun } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/components/ui/dialog";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
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
import { useContext, useState } from "react";
import { toast } from "@/shadcn/hooks/use-toast";
import { Link, useNavigate } from "react-router";
import { useTheme } from "@/shadcn/components/theme-provider";
import { NavUser } from "./NavUser";
import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { MainContext } from "@/context/MainContext";
import { TestFile } from "@/models/TestFile";

type HomeSideBarProps = {
  children: React.ReactNode;
};

function HomeSideBar({ children }: HomeSideBarProps) {
  const { user, token } = useContext(UserContext);
  const { setFileId } = useContext(MainContext);
  const [fileName, setFileName] = useState<string>("");
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  async function createFile(fileName: string) {
    const res = await fetch(`${API_URL}/api/tests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName,
        content: "",
      }),
    });

    if (!res.ok) {
      toast({
        title: "File with this name already exists",
      });
      return;
    }

    const file: TestFile = await res.json();
    setFileId(file.id);
    return file.id;
  }

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
                  <Dialog>
                    <DialogTrigger asChild className="w-full">
                      <SidebarMenuButton>
                        <FilePlusIcon /> Create test
                      </SidebarMenuButton>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create file</DialogTitle>
                        <DialogDescription>
                          Please enter the file name to create it.
                        </DialogDescription>
                      </DialogHeader>
                      <Input
                        placeholder="File Name...."
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                      />
                      <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                          <div className="flex flex-row gap-3">
                            <Button
                              type="button"
                              variant="default"
                              onClick={async () => {
                                const id = await createFile(fileName);
                                navigate(`/editor/${id}`);
                              }}
                            >
                              Create
                            </Button>
                          </div>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
