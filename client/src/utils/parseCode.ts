import {
  CheckStatement,
  ClickStatement,
  Test,
  TypeStatement,
  VisitStatement,
  ElementType,
  ElementState,
} from "@/models/Statement";

enum Token {
  CLICK = "click",
  VISIT = "visit",
  BUTTON = "button",
  LEFT_BRACE = "{",
  RIGHT_BRACE = "}",
  ON = "on",
  TYPE = "type",
  DISPLAYED = "is displayed",
  HIDDEN = "is hidden",
  TEXT = "text",
  INPUT = "input",
  IMAGE = "image",
  LINK = "link",
  WITH_DESC = "with description",
  CHECK_IF = "check if",
  URL = '["]https://[a-zA-Z0-9./]*["]',
  TEST_NAME = "[a-zA-Z][a-zA-Z0-9]*",
  NLD = '["][a-zA-Z0-9 /@=\'\\]\\[]*["]',
  SPACE = "\\s+",
  INVALID = ".",
}

export function parseCode(code: string): [Test[], boolean, number] {
  const tests: Test[] = [];
  let token: Token;
  let yytext: string;
  let position = 0;
  let id = 0;

  function scanner(): Token {
    while (true) {
      if (code.length === position) return Token.INVALID;

      const tokens = Object.values(Token);

      for (let i = 0; i < tokens.length; ++i) {
        const token = tokens[i];
        const match = code.substring(position).match(`^${tokens[i]}`);

        if (match) {
          const [str] = match;
          yytext = str;
          position += str.length;
          if (token !== Token.SPACE) return token as Token;
          else break;
        }
      }
    }
  }

  function program(): boolean {
    if (position === code.length) return true;
    if (!test()) return false;
    if (!program()) return false;

    return true;
  }

  function test() {
    const test: Test = {
      name: "",
      statements: [],
    };

    if (token === Token.TEST_NAME) {
      test.name = yytext;
      token = scanner();
      if (token == Token.LEFT_BRACE) {
        token = scanner();
        if (!body(test)) return false;

        if (token != Token.RIGHT_BRACE) {
          return false;
        }
      } else {
        return false;
      }

      tests.push(test);
      token = scanner();
      return true;
    }

    return false;
  }

  function body(test: Test) {
    if (action(test)) {
      if (!body(test)) return false;
      return true;
    }

    return true;
  }

  function action(test: Test) {
    if (click(test)) return true;
    if (visit(test)) return true;
    if (type(test)) return true;
    if (check(test)) return true;

    return false;
  }

  function click(test: Test) {
    const statement: ClickStatement = {
      id: id++,
      action: "click",
      elementType: "button",
      description: "",
    };

    if (token === Token.CLICK) {
      token = scanner();
      statement.elementType = yytext as ElementType;
      if (!elem_type()) return false;
      if (token === Token.WITH_DESC) {
        token = scanner();
        statement.description = yytext.replace(/"/g, "");

        if (token !== Token.NLD) return false;
      } else {
        return false;
      }

      test.statements.push(statement);

      token = scanner();
      return true;
    }

    return false;
  }

  function visit(test: Test) {
    const statement: VisitStatement = {
      id: id++,
      action: "visit",
      url: "",
    };

    if (token === Token.VISIT) {
      token = scanner();
      statement.url = yytext.replace(/"/g, "");
      if (token !== Token.URL) {
        return false;
      }

      test.statements.push(statement);

      token = scanner();
      return true;
    }

    return false;
  }

  function type(test: Test) {
    const statement: TypeStatement = {
      id: id++,
      action: "type",
      content: "",
      elementType: "button",
      description: "",
    };

    if (token !== Token.TYPE) return false;
    token = scanner();
    statement.content = yytext.replace(/"/g, "");
    if (token !== Token.NLD) return false;
    token = scanner();
    if (token !== Token.ON) return false;
    token = scanner();
    statement.elementType = yytext as ElementType;
    if (!elem_type()) return false;
    if (token !== Token.WITH_DESC) return false;
    token = scanner();
    statement.description = yytext.replace(/"/g, "");
    if (token !== Token.NLD) return false;

    test.statements.push(statement);

    token = scanner();
    return true;
  }

  function check(test: Test) {
    const statement: CheckStatement = {
      id: id++,
      action: "check",
      elementType: "button",
      description: "",
      state: "is displayed",
    };

    if (token === Token.CHECK_IF) {
      token = scanner();
      statement.elementType = yytext as ElementType;
      if (!elem_type()) return false;
      if (token === Token.WITH_DESC) {
        token = scanner();
        statement.description = yytext.replace(/"/g, "");
        if (token !== Token.NLD) return false;

        token = scanner();
        statement.state = yytext as ElementState;
        test.statements.push(statement);

        return state();
      }
    }

    return false;
  }

  function elem_type() {
    if (
      token === Token.BUTTON ||
      token === Token.LINK ||
      token === Token.TEXT ||
      token === Token.IMAGE ||
      token === Token.INPUT
    ) {
      token = scanner();
      return true;
    }

    return false;
  }

  function state(): boolean {
    if (token === Token.DISPLAYED || token == Token.HIDDEN) {
      token = scanner();
      return true;
    }

    return false;
  }

  token = scanner();
  const status = program();
  return [tests, status, id];
}
