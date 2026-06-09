"use client";

import { ChevronDownIcon, RadioIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@/components/ui/menu";
import { getActionLabel, getCustomActionsForEntity, runMockEntityAction } from "@/lib/mock/actions";
import { toast } from "@/lib/toast";
import type { EntityMeta } from "@/lib/types/entity";

type EntityEditActionsProps = {
  entity: EntityMeta;
  recordId: string;
};

export function EntityEditActions({ entity, recordId }: EntityEditActionsProps) {
  const customActions = getCustomActionsForEntity(entity.slug);

  if (customActions.length === 0) {
    return null;
  }

  function handleAction(action: string) {
    toast.info(runMockEntityAction(entity.slug, action, recordId));
  }

  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline" size="sm" />}>
        Actions
        <ChevronDownIcon className="opacity-60" />
      </MenuTrigger>
      <MenuPopup align="end">
        {customActions.map((action) => (
          <MenuItem key={action.name} onClick={() => handleAction(action.name)}>
            <RadioIcon />
            {getActionLabel(entity.slug, action.name)}
          </MenuItem>
        ))}
      </MenuPopup>
    </Menu>
  );
}
