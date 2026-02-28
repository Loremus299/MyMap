"use client";
import { Input } from "@/components/ui/input";
import { updateNodeName, deleteNode, retrieveDatabase } from "@/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Node, NodeProps } from "@xyflow/react";
import { Position, Handle, useNodeId } from "@xyflow/react";
import { ArrowDown, Check, Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { toast } from "sonner";

export type CustomNode = Node<{ label: string }, "number">;

export default function CustomNode({ data }: NodeProps<CustomNode>) {
  const nodeid = useNodeId() as string;
  const cuid = useParams<{ mapID: string }>();
  const client = useQueryClient();
  const name = useRef<HTMLInputElement>(null);
  const [showTick, setShowTick] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const info = useMemo(() => {
    return retrieveDatabase(cuid.mapID);
  }, [cuid.mapID]);

  const { mutate: updateNodeNameMutation } = useMutation({
    mutationKey: ["nodes", cuid.mapID],
    mutationFn: (arg: { id: string; data: Record<string, unknown> }) =>
      updateNodeName(arg.id, arg.data, info.node_table),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["nodes", cuid.mapID] });
    },
  });

  const { mutate: deleteNodeMutation } = useMutation({
    mutationKey: ["nodes", cuid.mapID],
    mutationFn: (id: string) => deleteNode(id, info.node_table),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["nodes", cuid.mapID] });
    },
  });

  const checkVisibility = () => {
    if (showTick == true) {
      return (
        <Button
          variant={"neutral"}
          onClick={(event) => {
            event.stopPropagation();
            updateNodeNameMutation({
              id: nodeid,
              data: { label: name.current?.value as string },
            });
            setShowTick(false);
          }}
        >
          <Check />
        </Button>
      );
    } else {
      return null;
    }
  };

  const deleteVisibility = () => {
    if (showDelete == true) {
      return (
        <Button
          className="bg-red-400"
          onClick={(event) => {
            event.stopPropagation();
            toast("Are you sure ?", {
              action: {
                label: "Yes",
                onClick: () => deleteNodeMutation(nodeid),
              },
            });
          }}
        >
          <Trash2 />
        </Button>
      );
    } else {
      return null;
    }
  };

  return (
    <Card className="bg-main p-4" onClick={() => setShowDelete(!showDelete)}>
      <div className="flex gap-4">
        <Input
          defaultValue={data.label}
          ref={name}
          className="text-center"
          onChange={() => setShowTick(true)}
        />
        {deleteVisibility()}
      </div>
      {checkVisibility()}
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
