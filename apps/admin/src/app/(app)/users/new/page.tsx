"use client";

import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { PageHeader } from "@/components/app/page-header";
import { UserForm } from "@/components/app/user-form";
import { ApiError } from "@/lib/api/client";
import { useCreateUser } from "@/lib/hooks/use-users";
import { toast } from "@/lib/toast";

export default function UserNewPage() {
  const router = useRouter();
  const createMutation = useCreateUser();

  return (
    <div className="px-10 py-10">
      <div className="mx-auto max-w-2xl">
        <Breadcrumbs
          items={[
            { label: "Users", href: "/users" },
            { label: "New user" },
          ]}
        />
        <PageHeader
          label="User management"
          title="New user"
          description="Create an account and assign a role. A temporary password is generated if none is set."
        />
        <UserForm
          submitLabel="Create user"
          onCancel={() => router.push("/users")}
          onSubmit={async (data) => {
            try {
              const user = await createMutation.mutateAsync(data);
              toast.success("User created");
              router.push(`/users/${user.id}`);
            } catch (error) {
              toast.error("Create failed", {
                description: error instanceof ApiError ? error.message : undefined,
              });
            }
          }}
        />
      </div>
    </div>
  );
}
