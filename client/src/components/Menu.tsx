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

function Menu() {
  const { toast } = useToast();
  const { fileName, setFileName, code, setCode } = useContext(MainContext);

  const [openFileName, setOpenFileName] = useState<string>("");
  const [saveFileName, setSaveFileName] = useState<string>("");

  function resetPage() {
    setFileName("");
    setCode("");
  }

  async function openDocument(fileName: string) {
    try {
      const res = await fetch(`http://localhost:5064/api/tests/${fileName}`);
      if (!res.ok) {
        toast({
          title: "Couldn't find file",
        });
        return;
      }

      const file = await res.json();
      setFileName(file.name);
      setCode(file.content);
      toast({
        title: "File opened successfully",
      });
    } catch (err) {
      console.log(err);
    }
  }

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

  async function runTest() {
    const res = await fetch(`http://localhost:5064/api/tests/${fileName}/run`, {
      method: "POST",
    });

    toast({
      title: await res.text(),
    });
  }

  return (
    <Menubar>
      <MenubarMenu>
        <Dialog>
          <MenubarMenu>
            <MenubarTrigger>
              <DialogTrigger>New</DialogTrigger>
            </MenubarTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Page</DialogTitle>
                <DialogDescription>
                  Are you sure you want to discard the current page and create a
                  new one? Any unsaved changes will be lost.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-start">
                <DialogClose>
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => resetPage()}
                  >
                    New
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </MenubarMenu>
        </Dialog>
        <Dialog>
          <MenubarMenu>
            <MenubarTrigger>
              <DialogTrigger>Open</DialogTrigger>
            </MenubarTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Open file</DialogTitle>
                <DialogDescription>
                  Please enter the file name to open it.
                </DialogDescription>
              </DialogHeader>
              <div>
                <Input
                  placeholder="File Name...."
                  value={openFileName}
                  onChange={(e) => setOpenFileName(e.target.value)}
                />
              </div>
              <DialogFooter className="sm:justify-start">
                <DialogClose>
                  <div
                    style={{ display: "flex", flexDirection: "row", gap: 10 }}
                  >
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => openDocument(openFileName)}
                    >
                      Open
                    </Button>
                  </div>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </MenubarMenu>
        </Dialog>
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
  );
}

export default Menu;
