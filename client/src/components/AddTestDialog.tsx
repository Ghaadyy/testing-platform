import { EditorContext } from "@/context/EditorContext";
import { makeTest } from "@/models/Program";
import { Button } from "@/shadcn/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/shadcn/components/ui/dialog";
import { Input } from "@/shadcn/components/ui/input";
import { useToast } from "@/shadcn/hooks/use-toast";
import { useContext, useState } from "react";

function AddTestDialog() {
  const { toast } = useToast();

  const [testName, setTestName] = useState<string>("");
  const { setTests } = useContext(EditorContext);

  return (
    <div className="self-end flex flex-row gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add test</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>What is the test's name?</DialogTitle>
            <DialogDescription>
              Enter a name to create your test.
            </DialogDescription>
            <Input
              placeholder="Test name..."
              onChange={(e) => setTestName(e.target.value)}
              value={testName}
            />
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  if (testName === "") {
                    toast({
                      title: "Test Name cannot be empty!",
                    });
                    return;
                  }
                  setTests((prev) => [...prev, makeTest(testName)]);
                  setTestName("");
                }}
              >
                Create
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddTestDialog;
