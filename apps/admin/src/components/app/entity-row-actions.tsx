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
import { getActionLabel } from "@/lib/mock/actions";
import type { EntityMeta } from "@/lib/types/entity";

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
            {getActionLabel(entity.slug, action)}
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
