import { Button, ButtonProps } from "@/shadcn/components/ui/button";
import ActionInput from "./StatementInput";
import { useState } from "react";
import { Plus, TrashIcon } from "lucide-react";
import { Action, makeAction } from "@/models/Program";

function AddActionButton({ onClick }: ButtonProps) {
  return (
    <Button onClick={onClick}>
      <Plus />
    </Button>
  );
}

type Props = {
  defaultActions: Action[];
  onChange: (actions: Action[]) => void;
  onDelete: () => void;
};

function StatementCreator({ defaultActions, onChange, onDelete }: Props) {
  const [actions, setActions] = useState<Action[]>(defaultActions);

  function onMove(fromId: string, toId: string) {
    setActions((prev) => {
      const actions = [...prev];
      const fromIdx = actions.findIndex((a) => a.id === fromId);
      const toIdx = actions.findIndex((a) => a.id === toId);
      const from = actions[fromIdx],
        to = actions[toIdx];
      actions[fromIdx] = to;
      actions[toIdx] = from;
      onChange(actions);
      return actions;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {actions.map((action) => (
        <ActionInput
          key={action.id}
          defaultAction={action}
          setActions={setActions}
          onChange={(action) => {
            setActions((prev) => {
              const actions = [...prev];
              const actionIdx = actions.findIndex((a) => a.id === action.id);
              actions[actionIdx] = action;
              onChange(actions);
              return actions;
            });
          }}
          onMove={onMove}
        />
      ))}
      <div className="self-end flex flex-row items-center gap-3">
        <AddActionButton
          onClick={() =>
            setActions((prev) => {
              const actions: Action[] = [...prev, makeAction()];
              onChange(actions);
              return actions;
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
