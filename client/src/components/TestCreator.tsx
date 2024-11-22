import StatementCreator from "@/components/StatementCreator";
import { Test } from "@/models/Statement";
import { Button } from "@/shadcn/components/ui/button";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/shadcn/components/ui/dialog";
import { Input } from "@/shadcn/components/ui/input";
import { useToast } from "@/shadcn/hooks/use-toast";

function TestCreator({ onChange }: { onChange: (tests: Test[]) => void }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [testName, setTestName] = useState<string>("");
  const { toast } = useToast();

  return (
    <div className="p-5">
      <div className="flex flex-col gap-3">
        {tests.map((test, id) => (
          <div className="rounded-md bg-gray-950 border-white border-2 border-solid p-3">
            <h1 className="font-bold">{test.name}</h1>
            <StatementCreator
              defaultStatements={test.statements}
              onChange={(newStatements) =>
                setTests((prevTests) => {
                  const updatedTests = [...prevTests];
                  updatedTests[id].statements = newStatements;
                  onChange(updatedTests);
                  return updatedTests;
                })
              }
            />
          </div>
        ))}
        <div className="self-end mr-5 flex flex-row gap-3">
          <Dialog>
            <DialogTrigger>
              <Button>Add test</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>What is the test's name?</DialogTitle>
                <Input
                  placeholder="Test name..."
                  onChange={(e) => setTestName(e.target.value)}
                  value={testName}
                />
              </DialogHeader>
              <DialogFooter className="sm:justify-start">
                <DialogClose>
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
                      setTests((prevTests) => {
                        const updated = [
                          ...prevTests,
                          {
                            name: testName,
                            statements: [],
                          },
                        ];
                        onChange(updated);
                        return updated;
                      });
                      setTestName("");
                    }}
                  >
                    Create
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* <Button>Add test</Button> */}
        </div>
      </div>
    </div>
  );
}

export default TestCreator;

/*
onClick={() =>
              setTests((prevTests) => {
                const updated = [
                  ...prevTests,
                  {
                    name: "test",
                    statements: [],
                  },
                ];
                onChange(updated);
                return updated;
              })
            }*/
