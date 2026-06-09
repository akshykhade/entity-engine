"use client";

type UserAccessLogSectionProps = {
  userId: string;
  embedded?: boolean;
};

export function UserAccessLogSection({
  embedded = false,
}: UserAccessLogSectionProps) {
  const content = (
    <p className="text-muted-foreground text-sm">
      Access log entries will appear here once that API is available.
    </p>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className="mt-10 border-t border-border/60 pt-8">
      <h2 className="font-heading text-lg">Access log</h2>
      <p className="mt-1 text-muted-foreground text-sm">
        Sign-in and security events for this user.
      </p>
      <div className="mt-6">{content}</div>
    </section>
  );
}
