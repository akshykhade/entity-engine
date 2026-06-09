"use client";

import {
  KeyRoundIcon,
  MoreHorizontalIcon,
  PencilIcon,
  VenetianMaskIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@/components/ui/menu";
import type { AdminUser } from "@/lib/types/entity";

type UserRowActionsProps = {
  user: AdminUser;
  onChangePassword: () => void;
  onImpersonate: () => void;
};

export function UserRowActions({
  user,
  onChangePassword,
  onImpersonate,
}: UserRowActionsProps) {
  const canImpersonate = user.status === "active" && user.id !== "user-1";

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
            <Link href={`/users/${user.id}`} onClick={(e) => e.stopPropagation()} />
          }
        >
          <PencilIcon />
          Edit
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            onChangePassword();
          }}
        >
          <KeyRoundIcon />
          Change password
        </MenuItem>
        <MenuItem
          disabled={!canImpersonate}
          onClick={(e) => {
            e.stopPropagation();
            if (canImpersonate) onImpersonate();
          }}
        >
          <VenetianMaskIcon />
          Impersonate
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}
