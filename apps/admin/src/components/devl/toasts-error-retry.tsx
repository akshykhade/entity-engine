import { RotateCcwIcon } from "lucide-react";
import { AppToast } from "@/components/app/app-toast";

export function ToastsErrorRetryShowcasePage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <FakeAppBackdrop />
      <div className="absolute top-6 right-6 z-50 w-96">
        <AppToast
          variant="error"
          title="Couldn't send invite"
          badge="503"
          description="Email gateway is unreachable right now. We'll keep your draft — try again or write to support."
          actions={[
            { label: "Dismiss", variant: "ghost" },
            { label: "Retry", variant: "outline", icon: RotateCcwIcon },
          ]}
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
      </div>
      <div className="p-10 space-y-3">
        <div className="h-4 w-48 rounded bg-foreground/15" />
        <div className="h-2 w-72 rounded bg-foreground/10" />
        <div className="h-40 rounded-xl border border-border/40 bg-foreground/[0.02]" />
      </div>
    </div>
  );
}
