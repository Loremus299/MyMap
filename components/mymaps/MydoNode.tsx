"use client";
import type { Node, NodeProps } from "@xyflow/react";
import { Position, Handle } from "@xyflow/react";
import { ArrowDown, Plus } from "lucide-react";
import { Card } from "../ui/card";

export type CustomNode = Node<{ label: string }, "number">;

export default function MydoCustomNode({ data }: NodeProps<CustomNode>) {
  return (
    <Card className="bg-main p-4">
      <div className="flex gap-4">
        <div className="text-center">{data.label}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          border: "none",
          background: "none",
        }}
      >
        <div
          className="bg-main border rounded-full grid place-items-center"
          style={{
            pointerEvents: "none",
            fontSize: "1em",
            left: "-4px",
            bottom: "-4px",
            position: "absolute",
          }}
        >
          <ArrowDown className="w-3 h-3" />
        </div>
      </Handle>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          border: "none",
          background: "none",
        }}
      >
        <div
          className="bg-main border rounded-full grid place-items-center"
          style={{
            pointerEvents: "none",
            fontSize: "1em",
            left: "-4px",
            bottom: "-5px",
            position: "absolute",
          }}
        >
          <Plus className="w-3 h-3" />
        </div>
      </Handle>
    </Card>
  );
}
