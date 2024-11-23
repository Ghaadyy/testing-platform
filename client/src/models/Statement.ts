export type Test = {
  statements: Statement[];
  name: string;
};

export type VisitStatement = {
  id: number;
  action: "visit";
  url: string;
};

export type ClickStatement = {
  id: number;
  action: "click";
  elementType: ElementType;
  description: string;
};

export type CheckStatement = {
  id: number;
  action: "check";
  elementType: ElementType;
  description: string;
  state: ElementState;
};

export type TypeStatement = {
  id: number;
  action: "type";
  content: string;
  elementType: ElementType;
  description: string;
};

export type Statement =
  | VisitStatement
  | ClickStatement
  | CheckStatement
  | TypeStatement;

export type ElementType = "button" | "link" | "text" | "image" | "input";
export type ElementState = "displayed" | "hidden";
