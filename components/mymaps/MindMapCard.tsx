import { deleteMap, updateMapName } from "@/db/mapTable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function MindMapCard(props: {
  id?: number | undefined;
  name: string;
  date: string;
  cuid: string;
}) {
  const router = useRouter();
  const client = useQueryClient();
  const [nameStatus, setNameStatus] = useState(false);
  const { mutate: updateName } = useMutation({
    mutationKey: ["maps"],
    mutationFn: (name: string) => updateMapName(props.id ?? -1, name),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["maps"] });
    },
  });

  const { mutate: deleleMapMutation } = useMutation({
    mutationKey: ["maps"],
    mutationFn: () => deleteMap(props.id ?? -1, props.cuid),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["maps"] });
    },
  });

  const form = () => {
    if (nameStatus) {
      return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            console.log("event triggered");
            const formdata = new FormData(event.currentTarget);
            const name = formdata.get("name") as string;
            updateName(name);
            setNameStatus(false);
          }}
          className="flex gap-4"
        >
          <Input placeholder="New name" name="name" />
          <Button variant={"neutral"} type="submit">
            <Check />
          </Button>
        </form>
      );
    } else {
      return "";
    }
  };

  return (
    <Card key={props.id} className="bg-main p-4">
      <div className="flex">
        <CardTitle>{props.name}</CardTitle>
        <CardDescription className="ml-auto">{props.date}</CardDescription>
      </div>
      <div className="flex gap-4">
        <Button
          variant={"neutral"}
          onClick={() => router.push(`/maps/${props.cuid}`)}
          className="w-full"
        >
          <ExternalLink />
          Open Map
        </Button>
        <Button variant={"neutral"} onClick={() => setNameStatus(!nameStatus)}>
          <Pencil />
        </Button>
        <Button
          className="bg-red-400"
          onClick={() =>
            toast("Are you sure ?", {
              action: { label: "Yes", onClick: () => deleleMapMutation() },
            })
          }
        >
          <Trash2 />
        </Button>
      </div>
      {form()}
    </Card>
  );
}
