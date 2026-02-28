import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="p-4">
      <Link href={"/maps"}>
        <Button>Maps</Button>
      </Link>
    </div>
  );
}
