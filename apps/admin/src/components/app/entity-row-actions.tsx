"use client";

import { MoreHorizontalIcon, PencilIcon, RadioIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@/components/ui/menu";
import type { EntityMeta } from "@/lib/types/entity";

function formatActionLabel(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

type EntityRowActionsProps = {
  entity: EntityMeta;
  recordId: string;
  onDelete: () => void;
  onCustomAction?: (action: string) => void;
};

export function EntityRowActions({
  entity,
  recordId,
  onDelete,
  onCustomAction,
}: EntityRowActionsProps) {
  const customActions = entity.actions ?? [];

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        <MoreHorizontalIcon />
      </MenuTrigger>
      <MenuPopup align="end">
        <MenuItem
          render={
            <Link href={`/entities/${entity.slug}/${recordId}`} onClick={(e) => e.stopPropagation()} />
          }
        >
          <PencilIcon />
          Edit
        </MenuItem>
        {customActions.map((action) => (
          <MenuItem
            key={action}
            onClick={(e) => {
              e.stopPropagation();
              onCustomAction?.(action);
            }}
          >
            <RadioIcon />
            {formatActionLabel(action)}
          </MenuItem>
        ))}
        <MenuItem
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2Icon />
          Delete
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}
