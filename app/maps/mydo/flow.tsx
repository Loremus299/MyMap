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
  NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  readUsableNodes,
  retrieveDatabase,
  updateNodePosition,
  readUsableEdges,
  createConnection,
  deleteEdge,
} from "@/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MydoCustomNode from "@/components/mymaps/MydoNode";
import { useRouter } from "next/navigation";

const initialNodes = [
  { id: "n1", position: { x: 0, y: 0 }, data: { label: "wait" } },
  { id: "n2", position: { x: 0, y: 100 }, data: { label: "fetching data" } },
];
const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

export default function MindMap() {
  const nodeTypes = {
    custom: MydoCustomNode,
  };
  const router = useRouter();
  const client = useQueryClient();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const data = useMemo(() => {
    return retrieveDatabase("mydo");
  }, []);

  const { data: newNodes, isSuccess: nodeSuccess } = useQuery({
    queryKey: ["nodes", "mydo"],
    queryFn: () => readUsableNodes(data.node_table),
    staleTime: Infinity,
  });

  const { data: newEdges, isSuccess: edgeSuccess } = useQuery({
    queryKey: ["edges", "mydo"],
    queryFn: () => readUsableEdges(data.edge_table),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (nodeSuccess && edgeSuccess) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [nodeSuccess, newNodes, edgeSuccess, newEdges]);

  const { mutate: updateNodePositionMutation } = useMutation({
    mutationKey: ["nodes", "mydo"],
    mutationFn: (arg: { id: string; position: { x: number; y: number } }) =>
      updateNodePosition(arg.id, arg.position, data.node_table),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["nodes", "mydo"] });
    },
  });

  const { mutate: createEdgeMutation } = useMutation({
    mutationKey: ["edges", "mydo"],
    mutationFn: (arg: { to: string; from: string }) =>
      createConnection({ from: arg.from, to: arg.to }, data.edge_table),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["edges", "mydo"] });
    },
  });

  const { mutate: deleteEdgeMutation } = useMutation({
    mutationKey: ["edges", "mydo"],
    mutationFn: (id: string) => deleteEdge(id, data.edge_table),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["edges", "mydo"] });
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
    (_event: React.MouseEvent, edge: Edge) => {
      deleteEdgeMutation(edge.id);
    },
    [deleteEdgeMutation],
  );

  const onNodeDoubleClick: NodeMouseHandler = useCallback(
    (_event: React.MouseEvent | React.TouchEvent, node: Node) => {
      router.push(`https://mydo.loremus.gay/mydo/${node.id}`);
    },
    [router],
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
          onNodeDoubleClick={onNodeDoubleClick}
          fitView
        />
      </div>
    );
  }
}
