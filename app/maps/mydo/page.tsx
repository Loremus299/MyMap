"use client";
import { useEffect } from "react";
import MindMap from "./flow";
import { bulkPutMydoNodes, storedNode } from "@/db";
import Dexie, { Table } from "dexie";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";

export default function Page() {
  useEffect(() => {
    window.addEventListener("message", (data) => {
      if (data.origin == "https://mydo.loremus.gay") {
        const db = new Dexie("mydo");
        db.version(1).stores({
          nodes: "id, label, x, y",
          edge: "id, source, target",
        });
        const table: Table<storedNode> = db.table("nodes");

        bulkPutMydoNodes(JSON.parse(data.data), table);
      }
    });
  }, []);

  return (
    <div>
      <iframe src="https://mydo.loremus.gay/mydo" className="hidden" />
      <MindMap />
      <div className="fixed flex gap-4 top-0 m-4">
        <Link href={"/maps"}>
          <Button>
            <MoveLeft />
          </Button>
        </Link>
      </div>
    </div>
  );
}
