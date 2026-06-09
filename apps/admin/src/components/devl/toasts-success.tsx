import { AppToast } from "@/components/app/app-toast";

export function ToastsSuccessShowcasePage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <FakeAppBackdrop />
      <div className="absolute top-6 right-6 z-50 flex w-80 flex-col gap-3">
        <AppToast
          variant="success"
          title="Saved"
          description="Workspace settings updated."
        />
        <AppToast
          variant="warning"
          title="Approaching limit"
          description="You've used 90% of your monthly API quota."
        />
        <AppToast
          variant="info"
          title="New version available"
          description="Refresh to get the latest features."
        />
        <AppToast
          variant="error"
          title="Couldn't save changes"
          description="Check your connection and try again."
        />
      </div>
    </div>
  );
}

function FakeAppBackdrop() {
  return (
    <div className="absolute inset-0 grid grid-cols-[200px_1fr] opacity-50">
      <div className="border-r border-border/40 bg-foreground/[0.02] p-4 space-y-2">
        <div className="h-3 w-24 rounded bg-foreground/10" />
        <div className="h-2 w-32 rounded bg-foreground/10" />
        <div className="h-2 w-28 rounded bg-foreground/10" />
        <div className="h-2 w-24 rounded bg-foreground/10" />
      </div>
      <div className="p-10 space-y-3">
        <div className="h-4 w-48 rounded bg-foreground/15" />
        <div className="h-2 w-72 rounded bg-foreground/10" />
        <div className="h-32 rounded-xl border border-border/40 bg-foreground/[0.02]" />
        <div className="h-32 rounded-xl border border-border/40 bg-foreground/[0.02]" />
      </div>
    </div>
  );
}
