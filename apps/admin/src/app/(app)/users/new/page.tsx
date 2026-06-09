"use client";

import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { PageHeader } from "@/components/app/page-header";
import { UserForm } from "@/components/app/user-form";
import { createUser } from "@/lib/mock/users";
import { toast } from "@/lib/toast";

export default function UserNewPage() {
  const router = useRouter();

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
          description="Create an account and assign a role. New users default to invited status."
        />
        <UserForm
          submitLabel="Create user"
          onCancel={() => router.push("/users")}
          onSubmit={(data) => {
            const user = createUser(data);
            toast.success("User created", {
              description:
                data.status === "invited"
                  ? "An invite email would be sent in production."
                  : undefined,
            });
            router.push(`/users/${user.id}`);
          }}
        />
      </div>
    </div>
  );
}
