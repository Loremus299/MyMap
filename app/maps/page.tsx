"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createMap, readMaps } from "@/db/mapTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Plus } from "lucide-react";
import MindMapCard from "@/components/mymaps/MindMapCard";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const client = useQueryClient();
  const { data } = useQuery({
    queryKey: ["maps"],
    queryFn: readMaps,
    staleTime: Infinity,
  });

  useEffect(() => {
    client.invalidateQueries({ queryKey: ["maps"] });
  }, [client]);

  return (
    <div className="flex justify-center">
      <div className="p-4 grid gap-4 landscape:w-[80em] portrait:w-full">
        <div className="flex gap-2">
          <Button
            onClick={() => {
              const redirect_url_id = createMap("Mindmap");
              router.push(`/maps/${redirect_url_id}`);
            }}
            className="w-min"
          >
            <Plus /> New Mindmap
          </Button>
          <Button className="ml-auto" onClick={() => router.push("/maps/mydo")}>
            <CheckCircle2 /> Mydo graph
          </Button>
        </div>
        <div className="grid gap-4 landscape:grid-cols-3 portrait:grid-cols-1">
          {data?.map((item) => (
            <MindMapCard
              key={item.id ?? -1}
              id={item.id}
              name={item.name}
              cuid={item.cuid}
              date={item.date}
            ></MindMapCard>
          ))}
        </div>
      </div>
    </div>
  );
}
