import writeCode from "@/lib/codegen";
import useStore, { RFState } from "@/store";
import { shallow } from "zustand/shallow";

import Editor from "@monaco-editor/react";

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  rolesParticipants: state.rolesParticipants,
  security: state.security,
  code: state.code,
  setCode: state.setCode,
});

export default function CodeMenu() {
  const { nodes, edges, rolesParticipants, security, code, setCode } = useStore(
    selector,
    shallow
  );

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "regrada.txt";

    // Append, click, and remove for compatibility
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-[calc(100%-4px)] p-2 flex flex-col items-center justify-center gap-2">
      <label className="text-lg font-bold">Code</label>
      <Editor
        className="w-full h-[700px]"
        defaultLanguage="java"
        value={code}
        loading={false}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          scrollBeyondLastLine: false,
        }}
      />
      {/*<textarea
        className="w-full min-h-[350px] max-h-[700px] h-[350px] bg-white rounded-sm p-1 font-mono text-xs"
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />*/}
      <div className="flex gap-2 w-full">
        <button
          className="bg-black h-8 w-full rounded-sm cursor-pointer font-semibold text-white hover:opacity-75"
          onClick={() =>
            setCode(writeCode(nodes, edges, rolesParticipants, security))
          }
        >
          Generate Code
        </button>
        <button
          className="bg-black h-8 w-full rounded-sm cursor-pointer font-semibold text-white hover:opacity-75"
          onClick={() => {
            if (code) downloadCode();
          }}
        >
          Download Code
        </button>
      </div>
    </div>
  );
}
