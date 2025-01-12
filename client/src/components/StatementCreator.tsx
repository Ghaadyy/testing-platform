import { Button, ButtonProps } from "@/shadcn/components/ui/button";
import ActionInput from "./StatementInput";
import { useState } from "react";
import type { Statement } from "@/models/Statement";
import { TrashIcon } from "lucide-react";

function AddActionButton({ onClick }: ButtonProps) {
  return <Button onClick={onClick}>+</Button>;
}

type StatementCreatorProps = {
  defaultStatements: Statement[];
  onChange?: (newStatements: Statement[]) => void;
  statementId: number;
  onDelete: () => void;
};

function StatementCreator({
  defaultStatements,
  onChange,
  statementId,
  onDelete,
}: StatementCreatorProps) {
  const [statements, setStatements] = useState<Statement[]>(defaultStatements);
  const [id, setId] = useState<number>(statementId);

  function onMove(fromId: number, toId: number) {
    setStatements((prevStatements) => {
      const updated = [...prevStatements];
      const fromIdx = updated.findIndex(({ id }) => id === fromId);
      const toIdx = updated.findIndex(({ id }) => id === toId);
      const from = updated[fromIdx],
        to = updated[toIdx];
      updated[fromIdx] = to;
      updated[toIdx] = from;
      if (onChange !== undefined) onChange(updated);
      return updated;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {statements.map((statement, id) => (
        <ActionInput
          key={statement.id}
          id={statement.id}
          defaultStatement={statement}
          setStatements={setStatements}
          onChange={(newStatement) => {
            setStatements((prev) => {
              const updatedStatements = [...prev];
              updatedStatements[id] = newStatement;
              if (onChange !== undefined) onChange(updatedStatements);
              return updatedStatements;
            });
          }}
          onMove={onMove}
        />
      ))}
      <div className="self-end flex flex-row items-center gap-3">
        <AddActionButton
          onClick={() =>
            setStatements((prevStatements) => {
              const updated: Statement[] = [
                ...prevStatements,
                {
                  id,
                  action: "visit",
                  url: "",
                },
              ];
              if (onChange !== undefined) onChange(updated);
              setId((prev) => prev + 1);
              return updated;
            })
          }
        />
        <Button onClick={onDelete}>
          <TrashIcon size={20} />
        </Button>
      </div>
    </div>
  );
}

export default StatementCreator;
