import { createId } from "@paralleldrive/cuid2";
import { Edge, Node } from "@xyflow/react";
import Dexie, { Table } from "dexie";

export interface storedNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface storedEdge {
  id: string;
  source: string;
  target: string;
}

export function retrieveDatabase(param: string) {
  const db = new Dexie(param);
  db.version(1).stores({
    nodes: "id, label, x, y",
    edge: "id, source, target",
  });

  const node_table: Table<storedNode> = db.table("nodes");
  const edge_table: Table<storedEdge> = db.table("edge");

  return { node_table, edge_table };
}

export async function createNode(name: string, node_table: Table<storedNode>) {
  await node_table.add({ id: `n-${createId()}`, label: name, x: 0, y: 0 });
}

export function bulkPutMydoNodes(
  nodes: { name: string; pinned: boolean; id: number }[],
  node_table: Table<storedNode>,
) {
  const nodeToStored = async (node: {
    name: string;
    pinned: boolean;
    id: number;
  }) => {
    const storedNode = await node_table
      .where("id")
      .equals(node.id.toString())
      .first();
    if (storedNode) {
      if (storedNode.label !== node.name) {
        node_table
          .where("id")
          .equals(node.id.toString())
          .modify({ label: node.name });
      }
    } else {
      node_table.add({ id: node.id.toString(), label: node.name, x: 0, y: 0 });
    }
  };

  nodes.map(nodeToStored);

  node_table.toArray().then((stored) => {
    const storedNodesSet = new Set(stored.map((node) => node.id));
    const newNodesSet = new Set(nodes.map((node) => node.id.toString()));

    storedNodesSet.forEach((id) => {
      if (!newNodesSet.has(id)) {
        node_table.delete(id);
      }
    });
  });
}

export async function readUsableNodes(node_table: Table<storedNode>) {
  const nodes = await node_table.toArray();
  const storedToUsableNode = (stored_node: storedNode) => {
    const x: Node = {
      id: stored_node.id,
      data: { label: stored_node.label },
      position: { x: stored_node.x, y: stored_node.y },
      type: "custom",
    };
    return x;
  };
  return nodes.map(storedToUsableNode);
}

export async function updateNodePosition(
  id: string,
  position: { x: number; y: number },
  node_table: Table<storedNode>,
) {
  await node_table
    .where("id")
    .equals(id)
    .modify({ x: position.x, y: position.y });
}

export async function updateNodeName(
  id: string,
  data: Record<string, unknown>,
  node_table: Table<storedNode>,
) {
  return await node_table
    .where("id")
    .equals(id)
    .modify({ label: data.label as string });
}

export async function deleteNode(id: string, node_table: Table<storedNode>) {
  return node_table.where("id").equals(id).delete();
}

export async function createConnection(
  data: { from: string; to: string },
  edge_table: Table<storedEdge>,
) {
  await edge_table.add({ id: createId(), source: data.from, target: data.to });
}

export async function readUsableEdges(edge_table: Table<storedEdge>) {
  const edges = await edge_table.toArray();
  const storedToUsableEdge = (stored_edge: storedEdge) => {
    const x: Edge = {
      id: stored_edge.id,
      source: stored_edge.source,
      target: stored_edge.target,
    };
    return x;
  };
  return edges.map(storedToUsableEdge);
}

export async function deleteEdge(id: string, edge_table: Table<storedEdge>) {
  return await edge_table.where("id").equals(id).delete();
}
