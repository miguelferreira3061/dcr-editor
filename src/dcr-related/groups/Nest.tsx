import {
  NodeProps,
  NodeResizer,
  Handle,
  Position,
  useConnection,
} from "@xyflow/react";

import "@/dcr-related/CustomHandles.css";

/**
 * `Nest` component for rendering a node with a dashed border and handles.
 * It displays a label, an algorithm type indicator, and a pending indicator.
 * @param props - The props for the `Nest` component.
 * @returns JSX element representing the `Nest` component.
 */
export default function Nest(props: NodeProps) {
  const { nestType } = props.data;
  const { pending } = props.data.marking as Record<string, boolean>;

  const connection = useConnection();
  const isTarget = connection.inProgress && connection.fromNode.id != props.id;

  return (
    <>
      {/* NEST */}
      <div
        className={`relative w-full h-full border-dashed border-1 border-black`}
      >
        {/* NEST NODE RESIZER */}
        <NodeResizer
          color="#000000"
          isVisible={props.selected}
          nodeId={props.id as string}
        />

        {/* NEST LABEL */}
        <div className={`flex absolute top-0 left-0 px-2 py-1`}>
          {props.data.label as string}
        </div>

        {/* NEST ALGORITHM TYPE AND PENDING STATE */}
        <div className="absolute px-[4px] right-0 flex gap-1 font-bold ">
          {(nestType as string) === "choice" && (
            <div className="text-red-700">%</div>
          )}
          {pending && <div className="text-blue-700">!</div>}
        </div>

        {/* HANDLES */}
        {!connection.inProgress && (
          <Handle
            id={`${props.id}-source-handle`}
            className="nestHandle"
            position={Position.Right}
            type="source"
          />
        )}

        {(!connection.inProgress || isTarget) && (
          <Handle
            id={`${props.id}-target-handle`}
            className="nestHandle"
            position={Position.Left}
            type="target"
            isConnectableStart={false}
          />
        )}
      </div>
    </>
  );
}
