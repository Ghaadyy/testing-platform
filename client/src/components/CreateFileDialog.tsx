import { EditorContext } from "@/context/EditorContext";
import { UserContext } from "@/context/UserContext";
import { API_URL } from "@/main";
import { TestFile } from "@/models/TestFile";
import { Button } from "@/shadcn/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTrigger,
} from "@/shadcn/components/ui/dialog";
import { Input } from "@/shadcn/components/ui/input";
import { toast } from "@/shadcn/hooks/use-toast";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";

type Props = {
  children: React.ReactNode;
};

function CreateFileDialog({ children }: Props) {
  const [fileName, setFileName] = useState<string>("");
  const { setFileId } = useContext(EditorContext);
  const { token } = useContext(UserContext);
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
    <Dialog>
      <DialogTrigger asChild className="w-full">
        {children}
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const id = await createFile(fileName);
            navigate(`/editor/${id}`);
          }}
          className="flex flex-col gap-3"
        >
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
              <Button type="submit" variant="default">
                Create
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateFileDialog;
