import { Input } from "@/shadcn/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/components/ui/select";
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";

import { GripVerticalIcon, TrashIcon } from "lucide-react";
import { Action, ElementType, makeAction } from "@/models/Program";

type Props = {
  defaultAction: Action | undefined;
  onChange: (action: Action) => void;
  onMove: (fromId: string, toId: string) => void;
  setActions: React.Dispatch<React.SetStateAction<Action[]>>;
};

function StatementInput({
  defaultAction,
  onChange,
  onMove,
  setActions,
}: Props) {
  const [action, setAction] = useState<Action>(defaultAction ?? makeAction());

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "action",
    item: { action: action },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: "action",
    drop: (draggedItem: { id: string; action: Action }) => {
      if (draggedItem.action.id !== action.id) {
        onMove(draggedItem.action.id, action.id);
        draggedItem.id = action.id;
      }
    },
  }));

  return (
    <div
      className="p-4 flex flex-row gap-5 border-input bg-background border-2 rounded-lg cursor-grab items-center"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      ref={(node) => drag(drop(node))}
    >
      <Select
        onValueChange={(action: Action["action"]) => {
          setAction((statement) => {
            statement.action = action;
            if (onChange) onChange(statement);
            return statement;
          });
        }}
        value={action.action}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="visit">visit</SelectItem>
          <SelectItem value="click">click</SelectItem>
          <SelectItem value="check">check</SelectItem>
          <SelectItem value="type">type</SelectItem>
        </SelectContent>
      </Select>

      {action.action === "visit" && (
        <Input
          className="w-[180px]"
          placeholder="http://www.example.com"
          value={action.url}
          onChange={(e) =>
            setAction((statement) => {
              if (statement.action === "visit") statement.url = e.target.value;
              onChange(statement);
              return statement;
            })
          }
        />
      )}

      {action.action === "type" && (
        <Input
          className="w-[180px]"
          placeholder="Content to type..."
          value={action.content}
          onChange={(e) =>
            setAction((action) => {
              if (action.action === "type") action.content = e.target.value;
              onChange(action);
              return action;
            })
          }
        />
      )}

      {(action.action === "click" ||
        action.action === "type" ||
        action.action == "check") && (
        <Select
          onValueChange={(element: ElementType) =>
            setAction((statement) => {
              if (
                statement.action === "click" ||
                statement.action === "type" ||
                statement.action == "check"
              )
                statement.elementType = element;
              if (onChange) onChange(statement);
              return statement;
            })
          }
          value={action.elementType}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Element Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="button">button</SelectItem>
            <SelectItem value="link">link</SelectItem>
            <SelectItem value="text">text</SelectItem>
            <SelectItem value="image">image</SelectItem>
            <SelectItem value="input">input</SelectItem>
          </SelectContent>
        </Select>
      )}

      {(action.action === "click" ||
        action.action === "check" ||
        action.action === "type") && (
        <Input
          className="w-[180px]"
          placeholder="Describe your statement..."
          value={action.description}
          onChange={(e) =>
            setAction((statement) => {
              if (
                statement.action === "click" ||
                statement.action === "type" ||
                statement.action === "check"
              )
                statement.description = e.target.value;
              if (onChange) onChange(statement);
              return statement;
            })
          }
        />
      )}

      {action.action === "check" && (
        <Select
          onValueChange={(state: string) =>
            setAction((statement) => {
              if (statement.action === "check")
                statement.state = state === "is displayed";
              if (onChange) onChange(statement);
              return statement;
            })
          }
          value={action.state ? "is displayed" : "is hidden"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="is displayed">is displayed</SelectItem>
            <SelectItem value="is hidden">is hidden</SelectItem>
          </SelectContent>
        </Select>
      )}

      <div className="ml-auto flex flex-row gap-2">
        <TrashIcon
          className="cursor-pointer"
          size={20}
          onClick={() =>
            setActions((prev) => prev.filter((a) => a.id !== action.id))
          }
        />
        <GripVerticalIcon size={20} />
      </div>
    </div>
  );
}

export default StatementInput;
