import { Button, ButtonProps } from "@/shadcn/components/ui/button";
import ActionInput from "./StatementInput";
import { useState } from "react";
import type { Statement } from "@/models/Statement";

function AddActionButton({ onClick }: ButtonProps) {
  return <Button onClick={onClick}>+</Button>;
}

type StatementCreatorProps = {
  defaultStatements: Statement[];
  onChange?: (newStatements: Statement[]) => void;
};

function StatementCreator({
  defaultStatements,
  onChange,
}: StatementCreatorProps) {
  const [statements, setStatements] = useState<Statement[]>(defaultStatements);

  return (
    <div className="flex flex-col">
      {statements.map((statement, id) => (
        <ActionInput
          key={id}
          defaultStatement={statement}
          onChange={(newStatement) => {
            setStatements((prev) => {
              const updatedStatements = [...prev];
              updatedStatements[id] = newStatement;
              if (onChange !== undefined) onChange(updatedStatements);
              return updatedStatements;
            });
          }}
        />
      ))}
      <div className="self-end mr-5">
        <AddActionButton
          onClick={() =>
            setStatements((prevStatements) => {
              const updated: Statement[] = [
                ...prevStatements,
                {
                  action: "visit",
                  url: "",
                },
              ];
              if (onChange !== undefined) onChange(updated);
              return updated;
            })
          }
        />
      </div>
    </div>
  );
}

export default StatementCreator;
