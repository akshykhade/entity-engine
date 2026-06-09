"use client";

import {
  ChevronDownIcon,
  KeyRoundIcon,
  VenetianMaskIcon,
} from "lucide-react";
import { useState } from "react";
import { ChangePasswordDialog } from "@/components/app/change-password-dialog";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@/components/ui/menu";
import { toast } from "@/lib/toast";
import type { AdminUser } from "@/lib/types/entity";

type UserEditActionsProps = {
  user: AdminUser;
};

export function UserEditActions({ user }: UserEditActionsProps) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const canImpersonate = user.status === "active" && user.id !== "user-1";

  function handleImpersonate() {
    toast.info(`Impersonating ${user.name}`, {
      description: "You are now viewing the app as this user. Mock session only.",
      action: {
        label: "End session",
        onClick: () => toast.success("Impersonation ended"),
      },
    });
  }

  return (
    <>
      <Menu>
        <MenuTrigger
          render={<Button variant="outline" size="sm" />}
        >
          Actions
          <ChevronDownIcon className="opacity-60" />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuItem onClick={() => setPasswordOpen(true)}>
            <KeyRoundIcon />
            Change password
          </MenuItem>
          <MenuItem
            disabled={!canImpersonate}
            onClick={() => {
              if (canImpersonate) handleImpersonate();
            }}
          >
            <VenetianMaskIcon />
            Impersonate
          </MenuItem>
        </MenuPopup>
      </Menu>

      <ChangePasswordDialog
        user={user}
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        onConfirm={(_userId, _password) => {
          toast.success("Password updated", {
            description: "The user will be signed out of all sessions.",
          });
        }}
      />
    </>
  );
}
