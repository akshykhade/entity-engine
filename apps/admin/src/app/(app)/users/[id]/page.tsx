"use client";

import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { PageHeader } from "@/components/app/page-header";
import { UserActivityTabs } from "@/components/app/user-activity-tabs";
import { UserEditActions } from "@/components/app/user-edit-actions";
import { UserForm } from "@/components/app/user-form";
import { getRoleLabel } from "@/lib/api/roles";
import { ApiError } from "@/lib/api/client";
import { useRoles } from "@/lib/hooks/use-roles";
import { useUpdateUser, useUser } from "@/lib/hooks/use-users";
import { toast } from "@/lib/toast";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function UserEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: user, isLoading, isError } = useUser(id);
  const { data: roles = [] } = useRoles();
  const updateMutation = useUpdateUser(id);

  if (!isLoading && (isError || !user)) {
    notFound();
  }

  return (
    <div className="px-10 py-10">
      <div className="mx-auto max-w-2xl">
        <Breadcrumbs
          items={[
            { label: "Users", href: "/users" },
            { label: user?.name ?? "…" },
          ]}
        />
        <PageHeader
          label="User management"
          title="Edit user"
          description={
            user
              ? `${getRoleLabel(user.roleId, roles)} · Last active ${formatDistanceToNow(user.lastActive, { addSuffix: true })}`
              : "Loading…"
          }
          action={user ? <UserEditActions user={user} /> : null}
        />
        {user ? (
          <>
            <UserForm
              user={user}
              onCancel={() => router.push("/users")}
              onSubmit={async (data) => {
                try {
                  await updateMutation.mutateAsync(data);
                  toast.success("User saved");
                } catch (error) {
                  toast.error("Save failed", {
                    description: error instanceof ApiError ? error.message : undefined,
                  });
                }
              }}
            />
            <UserActivityTabs userId={id} />
          </>
        ) : null}
      </div>
    </div>
  );
}
