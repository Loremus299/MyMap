"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  EdgeChange,
  Edge,
  Connection,
  Node,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeChange,
  OnNodeDrag,
  OnConnectEnd,
  FinalConnectionState,
  EdgeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  createNode,
  readUsableNodes,
  retrieveDatabase,
  updateNodePosition,
  readUsableEdges,
  createConnection,
  deleteEdge,
} from "@/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import CustomNode from "@/components/mymaps/Node";
import { readMap } from "@/db/mapTable";
import { Card } from "@/components/ui/card";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

const initialNodes = [
  { id: "n1", position: { x: 0, y: 0 }, data: { label: "wait" } },
  { id: "n2", position: { x: 0, y: 100 }, data: { label: "fetching data" } },
];
const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

export default function MindMap(props: { id: string }) {
  const nodeTypes = {
    custom: CustomNode,
  };
  const client = useQueryClient();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const data = useMemo(() => {
    return retrieveDatabase(props.id);
  }, [props.id]);

  const { data: newNodes, isSuccess: nodeSuccess } = useQuery({
    queryKey: ["nodes", props.id],
    queryFn: () => readUsableNodes(data.node_table),
    staleTime: Infinity,
  });

  const { data: newEdges, isSuccess: edgeSuccess } = useQuery({
    queryKey: ["edges", props.id],
    queryFn: () => readUsableEdges(data.edge_table),
    staleTime: Infinity,
  });

  const { data: name } = useQuery({
    queryKey: ["title", props.id],
    queryFn: () => readMap(props.id),
  });

  useEffect(() => {
    if (nodeSuccess && edgeSuccess) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [nodeSuccess, newNodes, edgeSuccess, newEdges]);

  const { mutate: createNodeMutation } = useMutation({
    mutationKey: ["nodes", props.id],
    mutationFn: () => createNode("Node", data.node_table),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["nodes", props.id] });
    },
  });

  const { mutate: updateNodePositionMutation } = useMutation({
    mutationKey: ["nodes", props.id],
    mutationFn: (arg: { id: string; position: { x: number; y: number } }) =>
      updateNodePosition(arg.id, arg.position, data.node_table),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["nodes", props.id] });
    },
  });

  const { mutate: createEdgeMutation } = useMutation({
    mutationKey: ["edges", props.id],
    mutationFn: (arg: { to: string; from: string }) =>
      createConnection({ from: arg.from, to: arg.to }, data.edge_table),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["edges", props.id] });
    },
  });

  const { mutate: deleteEdgeMutation } = useMutation({
    mutationKey: ["edges", props.id],
    mutationFn: (id: string) => deleteEdge(id, data.edge_table),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["edges", props.id] });
    },
  });

  const onNodesChange: OnNodesChange<Node> = useCallback(
    (changes: NodeChange<Node>[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange: OnEdgesChange<Edge> = useCallback(
    (changes: EdgeChange<Edge>[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect: OnConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const onNodeDragStop: OnNodeDrag = useCallback(
    (_event: React.TouchEvent | React.MouseEvent, node: Node) => {
      updateNodePositionMutation({ id: node.id, position: node.position });
    },
    [updateNodePositionMutation],
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (_event: MouseEvent | TouchEvent, params: FinalConnectionState) => {
      if (params.fromNode && params.toNode)
        createEdgeMutation({
          from: params.fromNode.id,
          to: params.toNode.id,
        });
    },
    [createEdgeMutation],
  );

  const onEdgeDoubleClick: EdgeMouseHandler = useCallback(
    (_event: React.MouseEvent | React.TouchEvent, edge: Edge) => {
      deleteEdgeMutation(edge.id);
    },
    [deleteEdgeMutation],
  );

  if (nodeSuccess && edgeSuccess) {
    return (
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onConnectEnd={onConnectEnd}
          onEdgeDoubleClick={onEdgeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
        />
        <div className="fixed flex gap-4 top-0 m-4">
          <Card className="bg-main p-1 pl-4 pr-4">{name}</Card>
          <Button onClick={() => createNodeMutation()}>+</Button>
          <Link href={"/maps"}>
            <Button>
              <MoveLeft />
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
