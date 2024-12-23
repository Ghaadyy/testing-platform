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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/shadcn/components/ui/sidebar";
import { useState } from "react";
import { toast } from "@/shadcn/hooks/use-toast";
import { useNavigate } from "react-router";
import { useTheme } from "@/shadcn/components/theme-provider";

type HomeSideBarProps = {
  children: React.ReactNode;
};

function HomeSideBar({ children }: HomeSideBarProps) {
  const [fileName, setFileName] = useState<string>("");
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  async function createFile(fileName: string) {
    const res = await fetch("http://localhost:5064/api/tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Automated UI Testing</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Dialog>
                    <DialogTrigger className="w-full">
                      <SidebarMenuButton>
                        <FilePlusIcon /> New File
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
                        <DialogClose>
                          <div className="flex flex-row gap-3">
                            <Button
                              type="button"
                              variant="default"
                              onClick={() => {
                                createFile(fileName);
                                navigate(`/editor/${fileName}`);
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
