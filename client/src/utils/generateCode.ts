import { Test } from "@/models/Statement";

export function generateCode(tests: Test[]): string {
  let code = "";

  tests.forEach((test) => {
    code += `${test.name} {\n`;

    test.statements.forEach((statement) => {
      switch (statement.action) {
        case "visit":
          code += `   visit "${statement.url}"\n`;
          break;
        case "click":
          code += `   click ${statement.elementType} with description "${statement.description}"\n`;
          break;
        case "check":
          code += `   check if ${statement.elementType} with description "${statement.description}" ${statement.state}\n`;
          break;
        case "type":
          code += `   type "${statement.content}" on ${statement.elementType} with description "${statement.description}"\n`;
          break;
      }
    });

    code += `}\n`;
  });

  return code;
}
