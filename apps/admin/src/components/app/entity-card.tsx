"use client";

import { ArrowRightIcon, DatabaseIcon } from "lucide-react";
import Link from "next/link";
import { useEntityRecords } from "@/lib/hooks/use-entities";
import type { EntityMeta } from "@/lib/types/entity";

const ENTITY_COLORS = [
  "from-emerald-400/40 to-teal-600/30",
  "from-amber-300/40 to-orange-500/30",
  "from-indigo-400/40 to-violet-600/30",
  "from-rose-400/40 to-pink-600/30",
  "from-cyan-400/40 to-blue-600/30",
  "from-fuchsia-400/40 to-purple-600/30",
  "from-yellow-300/40 to-amber-500/30",
  "from-lime-400/40 to-green-600/30",
];

type EntityCardProps = {
  entity: EntityMeta;
  index: number;
};

export function EntityCard({ entity, index }: EntityCardProps) {
  const { data } = useEntityRecords(entity.slug, { page: 1, pageSize: 1 });
  const recordCount = data?.total ?? 0;
  const fieldCount = Object.keys(entity.fields).length;
  const gradient = ENTITY_COLORS[index % ENTITY_COLORS.length] ?? "from-zinc-400/40 to-zinc-700/30";

  return (
    <Link
      href={`/entities/${entity.slug}`}
      className="group flex flex-col bg-card hover:bg-card/80 shadow-xs/5 p-5 border border-border/60 hover:border-foreground/30 rounded-xl transition-colors"
    >
      <div className="flex justify-between items-start gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ring-1 ring-border/60 ${gradient}`}
        >
          <DatabaseIcon className="size-4 text-foreground/70" />
        </div>
        <ArrowRightIcon className="opacity-0 group-hover:opacity-100 size-4 text-muted-foreground transition-all group-hover:translate-x-0.5" />
      </div>
      <h3 className="mt-4 font-heading text-base">{entity.name}</h3>
      <p className="mt-0.5 font-mono text-muted-foreground text-xs">{entity.slug}</p>
      <div className="flex items-center gap-3 mt-4 text-muted-foreground text-xs">
        <span>{fieldCount} fields</span>
        <span className="text-border">·</span>
        <span>{recordCount} records</span>
      </div>
    </Link>
  );
}
