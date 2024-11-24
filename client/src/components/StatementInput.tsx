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

import type { Statement, ElementState, ElementType } from "@/models/Statement";
import { GripVerticalIcon } from "lucide-react";

type StatementInputProps = {
  id: number;
  defaultStatement: Statement | undefined;
  onChange?: (newStatement: Statement) => void;
  onMove?: (fromId: number, toId: number) => void;
};

function StatementInput({
  id,
  defaultStatement,
  onChange,
  onMove,
}: StatementInputProps) {
  const [statement, setStatement] = useState<Statement>(
    defaultStatement ?? {
      id: 1,
      action: "visit",
      url: "",
    }
  );

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "statement",
    item: { id, statement },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: "statement",
    drop: (draggedItem: { id: number; statement: Statement }) => {
      if (draggedItem.statement.id !== statement.id && onMove) {
        onMove(draggedItem.statement.id, statement.id);
        draggedItem.id = id;
      }
    },
  }));

  return (
    <div
      className="p-4 flex flex-row gap-5 border-input border-2 rounded-lg cursor-grab items-center"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      ref={(node) => drag(drop(node))}
    >
      <Select
        onValueChange={(action: Statement["action"]) => {
          setStatement((statement) => {
            statement.action = action;
            if (onChange !== undefined) onChange(statement);
            return statement;
          });
        }}
        value={statement.action}
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

      {statement.action === "visit" && (
        <Input
          className="w-[180px]"
          placeholder="http://www.example.com"
          value={statement.url}
          onChange={(e) =>
            setStatement((statement) => {
              if (statement.action === "visit") statement.url = e.target.value;
              if (onChange !== undefined) onChange(statement);
              return statement;
            })
          }
        />
      )}

      {statement.action === "type" && (
        <Input
          className="w-[180px]"
          placeholder="Content to type..."
          value={statement.content}
          onChange={(e) =>
            setStatement((statement) => {
              if (statement.action === "type")
                statement.content = e.target.value;
              if (onChange !== undefined) onChange(statement);
              return statement;
            })
          }
        />
      )}

      {(statement.action === "click" ||
        statement.action === "type" ||
        statement.action == "check") && (
        <Select
          onValueChange={(element: ElementType) =>
            setStatement((statement) => {
              if (
                statement.action === "click" ||
                statement.action === "type" ||
                statement.action == "check"
              )
                statement.elementType = element;
              if (onChange !== undefined) onChange(statement);
              return statement;
            })
          }
          value={statement.elementType}
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

      {(statement.action === "click" ||
        statement.action === "check" ||
        statement.action === "type") && (
        <Input
          className="w-[180px]"
          placeholder="Describe your statement..."
          value={statement.description}
          onChange={(e) =>
            setStatement((statement) => {
              if (
                statement.action === "click" ||
                statement.action === "type" ||
                statement.action === "check"
              )
                statement.description = e.target.value;
              if (onChange !== undefined) onChange(statement);
              return statement;
            })
          }
        />
      )}

      {statement.action === "check" && (
        <Select
          onValueChange={(state: ElementState) =>
            setStatement((statement) => {
              if (statement.action === "check") statement.state = state;
              if (onChange !== undefined) onChange(statement);
              return statement;
            })
          }
          value={statement.state}
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

      <div className="ml-auto">
        <GripVerticalIcon size={20} />
      </div>
    </div>
  );
}

export default StatementInput;
