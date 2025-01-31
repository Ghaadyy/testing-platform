export type Program = {
  tests: Test[];
};

export type Test = {
  id: string;
  actions: Action[];
  testName: string;
};

export type VisitAction = {
  id: string;
  action: "visit";
  url: string;
};

export type ClickAction = {
  id: string;
  action: "click";
  elementType: ElementType;
  description: string;
};

export type CheckAction = {
  id: string;
  action: "check";
  elementType: ElementType;
  description: string;
  state: ElementState;
};

export type TypeAction = {
  id: string;
  action: "type";
  content: string;
  elementType: ElementType;
  description: string;
};

export type Action = VisitAction | ClickAction | CheckAction | TypeAction;

export type ElementType = "button" | "link" | "text" | "image" | "input";
export type ElementState = boolean;

export function makeAction(): Action {
  return {
    id: crypto.randomUUID(),
    action: "visit",
    url: "",
  };
}

export function makeTest(testName: string): Test {
  return {
    id: crypto.randomUUID(),
    testName,
    actions: [],
  };
}
