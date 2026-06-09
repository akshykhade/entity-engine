"use client";

import { ChevronDownIcon, RadioIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@/components/ui/menu";
import { ApiError } from "@/lib/api/client";
import { useRunEntityAction } from "@/lib/hooks/use-entities";
import { toast } from "@/lib/toast";
import type { EntityMeta } from "@/lib/types/entity";

type EntityEditActionsProps = {
  entity: EntityMeta;
  recordId: string;
};

function formatActionLabel(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export function EntityEditActions({ entity, recordId }: EntityEditActionsProps) {
  const customActions = entity.actions ?? [];
  const actionMutation = useRunEntityAction(entity.slug);

  if (customActions.length === 0) {
    return null;
  }

  async function handleAction(action: string) {
    try {
      const result = await actionMutation.mutateAsync({ id: recordId, action });
      toast.success(typeof result === "string" ? result : `${action} completed`);
    } catch (error) {
      toast.error("Action failed", {
        description: error instanceof ApiError ? error.message : undefined,
      });
    }
  }

  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline" size="sm" />}>
        Actions
        <ChevronDownIcon className="opacity-60" />
      </MenuTrigger>
      <MenuPopup align="end">
        {customActions.map((action) => (
          <MenuItem key={action} onClick={() => handleAction(action)}>
            <RadioIcon />
            {formatActionLabel(action)}
          </MenuItem>
        ))}
      </MenuPopup>
    </Menu>
  );
}
