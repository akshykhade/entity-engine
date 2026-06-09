import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EntityNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
        404
      </p>
      <h1 className="mt-2 font-heading text-2xl">Entity not found</h1>
      <p className="mt-2 max-w-sm text-muted-foreground text-sm">
        The entity you&apos;re looking for doesn&apos;t exist in the catalog.
      </p>
      <Button className="mt-6" render={<Link href="/entities" />}>
        Back to entities
      </Button>
    </div>
  );
}
