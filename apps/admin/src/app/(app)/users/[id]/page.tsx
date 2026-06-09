"use client";

import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { PageHeader } from "@/components/app/page-header";
import { UserActivityTabs } from "@/components/app/user-activity-tabs";
import { UserEditActions } from "@/components/app/user-edit-actions";
import { UserForm } from "@/components/app/user-form";
import { getAdminUser, getUserRoleName, updateUser } from "@/lib/mock/users";
import { toast } from "@/lib/toast";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function UserEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const user = getAdminUser(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="px-10 py-10">
      <div className="mx-auto max-w-2xl">
        <Breadcrumbs
          items={[
            { label: "Users", href: "/users" },
            { label: user.name },
          ]}
        />
        <PageHeader
          label="User management"
          title="Edit user"
          description={`${getUserRoleName(user.roleId)} · Last active ${formatDistanceToNow(user.lastActive, { addSuffix: true })}`}
          action={<UserEditActions user={user} />}
        />
        <UserForm
          key={`${id}-${refreshKey}`}
          user={user}
          onCancel={() => router.push("/users")}
          onSubmit={(data) => {
            updateUser(id, data);
            toast.success("User saved");
            setRefreshKey((k) => k + 1);
          }}
        />
        <UserActivityTabs userId={id} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
