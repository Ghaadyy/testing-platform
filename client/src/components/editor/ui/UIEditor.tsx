import StatementCreator from "@/components/editor/ui/StatementCreator";
import { useContext } from "react";

import { ScrollArea, ScrollBar } from "@/shadcn/components/ui/scroll-area";
import { EditorContext } from "@/context/EditorContext";
import AddTestDialog from "@/components/shared/dialog/AddTestDialog";

function UIEditor() {
  const { tests, setTests } = useContext(EditorContext);

  return (
    <>
      <ScrollArea className="w-full">
        <div className="w-full flex flex-col gap-3">
          {tests.map(({ testName, actions, id }) => (
            <div
              key={id}
              className="rounded-md bg-transparent border-input border-2 border-solid p-3 flex flex-col gap-3"
            >
              <h1 className="font-bold">{testName}</h1>
              <StatementCreator
                defaultActions={actions}
                onChange={(actions) =>
                  setTests((prev) => {
                    const tests = [...prev];
                    const t = tests.find((t) => t.id === id);
                    if (t) t.actions = actions;
                    return tests;
                  })
                }
                onDelete={() =>
                  setTests((prev) => prev.filter((t) => t.id !== id))
                }
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <AddTestDialog />
    </>
  );
}

export default UIEditor;
