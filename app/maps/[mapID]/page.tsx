"use client";
import { useParams, useRouter } from "next/navigation";
import MindMap from "./flow";
import { verifyMap } from "@/db/mapTable";
import { useEffect } from "react";

export default function Page() {
  const paramObject: { mapID: string } = useParams();
  const router = useRouter();

  useEffect(() => {
    const x = async () => {
      if ((await verifyMap(paramObject.mapID)) == 0) {
        router.push("/maps");
      }
    };
    x();
  }, [paramObject.mapID, router]);

  return <MindMap id={paramObject.mapID} />;
}
