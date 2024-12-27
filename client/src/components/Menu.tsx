import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/shadcn/components/ui/menubar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/shadcn/components/ui/dialog";
import { useToast } from "@/shadcn/hooks/use-toast";
import { Input } from "@/shadcn/components/ui/input";
import { Button } from "@/shadcn/components/ui/button";
import { useContext, useState } from "react";
import { MainContext } from "@/context/MainContext";
import { useTheme } from "@/shadcn/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Link } from "react-router";

type Props = {
  runTest: () => void;
};

function Menu({ runTest }: Props) {
  const { toast } = useToast();
  const { fileName, setFileName, code, setCode } = useContext(MainContext);

  const [saveFileName, setSaveFileName] = useState<string>("");

  async function saveDocument(code: string, savedFileName: string) {
    const res = await fetch("http://localhost:5064/api/tests", {
      method: fileName ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: savedFileName,
        content: code,
      }),
    });

    if (!res.ok) {
      toast({
        title: "File with this name already exists",
      });
      return;
    }

    setFileName(savedFileName);
    setCode(code);
    toast({
      title: "Saved successfully!",
    });
  }

  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-row gap-3">
      <Menubar className="flex-1">
        <MenubarMenu>
          <MenubarTrigger>
            <Link to="/">Home</Link>
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          {fileName ? (
            <MenubarMenu>
              <MenubarTrigger onClick={() => saveDocument(code, fileName)}>
                Save
              </MenubarTrigger>
            </MenubarMenu>
          ) : (
            <Dialog>
              <MenubarMenu>
                <MenubarTrigger>
                  <DialogTrigger>Save</DialogTrigger>
                </MenubarTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save file</DialogTitle>
                    <DialogDescription>
                      Enter a file name to save your progress.
                    </DialogDescription>
                  </DialogHeader>
                  <div>
                    <Input
                      placeholder="File Name...."
                      value={saveFileName}
                      onChange={(e) => setSaveFileName(e.target.value)}
                    />
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <DialogClose>
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => saveDocument(code, saveFileName)}
                      >
                        Save
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </MenubarMenu>
            </Dialog>
          )}
          <MenubarMenu>
            <MenubarTrigger onClick={runTest} disabled={!fileName}>
              Run
            </MenubarTrigger>
          </MenubarMenu>
        </MenubarMenu>
      </Menubar>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </div>
  );
}

export default Menu;
