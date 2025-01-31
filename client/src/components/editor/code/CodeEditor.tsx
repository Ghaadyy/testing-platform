import { Editor } from "@monaco-editor/react";
import { setupEditor } from "@/utils/setupEditor";
import { useContext } from "react";
import { EditorContext } from "@/context/EditorContext";

function CodeEditor() {
  const { code, setCode } = useContext(EditorContext);

  return (
    <Editor
      height="100%"
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 14,
      }}
      language={"rnl"}
      className="editor-wrapper"
      theme={"rnl-theme"}
      value={code}
      onChange={(c) => setCode(c ?? "")}
      beforeMount={setupEditor}
    />
  );
}

export default CodeEditor;
