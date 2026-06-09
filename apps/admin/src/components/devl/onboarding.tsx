import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  bumpParticleTypingImpulse,
  pulseParticleSubmitImpulse,
} from "@/components/devl/particle-field";
import { AuthShell, useAuthTypingImpulse } from "./auth-shell";

const STEPS = ["Workspace", "Invite", "Ready"] as const;

export function OnboardingShowcasePage() {
  return (
    <AuthShell variant="onboarding">
      <OnboardingFlow />
    </AuthShell>
  );
}

function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [workspace, setWorkspace] = useState("");
  const [invitees, setInvitees] = useState<string[]>([]);
  const [pendingEmail, setPendingEmail] = useState("");
  const typingImpulse = useAuthTypingImpulse();

  const next = () => {
    pulseParticleSubmitImpulse(typingImpulse);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div
      className="w-full max-w-lg"
      onKeyDown={(e) => bumpParticleTypingImpulse(typingImpulse, e)}
    >
      <Stepper step={step} />

      {step === 0 ? (
        <WorkspaceStep
          value={workspace}
          onChange={setWorkspace}
          onSubmit={(e) => {
            e.preventDefault();
            if (!workspace.trim()) return;
            next();
          }}
        />
      ) : null}

      {step === 1 ? (
        <InviteStep
          invitees={invitees}
          pending={pendingEmail}
          onPendingChange={setPendingEmail}
          onAdd={(e) => {
            e.preventDefault();
            const trimmed = pendingEmail.trim().toLowerCase();
            if (!trimmed) return;
            if (invitees.includes(trimmed)) {
              setPendingEmail("");
              return;
            }
            setInvitees((prev) => [...prev, trimmed]);
            setPendingEmail("");
          }}
          onRemove={(email) =>
            setInvitees((prev) => prev.filter((e) => e !== email))
          }
          onContinue={next}
          onBack={back}
        />
      ) : null}

      {step === 2 ? (
        <ReadyStep workspace={workspace || "Untitled"} count={invitees.length} />
      ) : null}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
      <span>
        Step {String(step + 1).padStart(2, "0")} / {STEPS.length}
      </span>
      <div className="flex items-center gap-1.5 ml-2">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step
                ? "w-5 bg-foreground"
                : i < step
                  ? "w-1.5 bg-foreground/70"
                  : "w-1.5 bg-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function WorkspaceStep({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <>
      <div className="mt-8 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]">
        Name your workspace
      </div>
      <h1 className="mt-2 font-heading text-3xl leading-tight">
        What are we calling it?
      </h1>
      <p className="mt-2 text-muted-foreground text-sm">
        You can change this later in settings.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-8">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="onboarding-workspace">Workspace name</Label>
          <Input
            id="onboarding-workspace"
            placeholder="Acme inc."
            autoComplete="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            nativeInput
          />
        </div>
        <Button type="submit" size="lg" disabled={!value.trim()} className="mt-2">
          Continue
        </Button>
      </form>
    </>
  );
}

function InviteStep({
  invitees,
  pending,
  onPendingChange,
  onAdd,
  onRemove,
  onContinue,
  onBack,
}: {
  invitees: string[];
  pending: string;
  onPendingChange: (v: string) => void;
  onAdd: (e: FormEvent) => void;
  onRemove: (email: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="mt-8 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]">
        Bring people with you
      </div>
      <h1 className="mt-2 font-heading text-3xl leading-tight">
        Invite teammates
      </h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Optional — you can add anyone later.
      </p>

      <form onSubmit={onAdd} className="flex gap-2 mt-8">
        <Input
          type="email"
          placeholder="colleague@example.com"
          autoComplete="off"
          value={pending}
          onChange={(e) => onPendingChange(e.target.value)}
          nativeInput
        />
        <Button type="submit" variant="outline">
          Add
        </Button>
      </form>

      {invitees.length > 0 ? (
        <ul className="flex flex-col gap-1.5 mt-5">
          {invitees.map((email) => (
            <li
              key={email}
              className="flex justify-between items-center bg-background/40 px-3 py-2 border border-border/70 rounded-md text-sm"
            >
              <span className="text-foreground/85 truncate">{email}</span>
              <button
                type="button"
                onClick={() => onRemove(email)}
                className="font-mono text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-[0.2em] transition-colors"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-background/30 mt-5 px-3 py-6 border border-border/70 border-dashed rounded-md text-muted-foreground text-xs text-center">
          No invites yet. Add a few or skip — totally fine.
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        <Button variant="ghost" type="button" onClick={onBack}>
          Back
        </Button>
        <Button type="button" size="lg" onClick={onContinue}>
          {invitees.length === 0
            ? "Skip for now"
            : `Send ${invitees.length} invite${invitees.length === 1 ? "" : "s"}`}
        </Button>
      </div>
    </>
  );
}

function ReadyStep({
  workspace,
  count,
}: {
  workspace: string;
  count: number;
}) {
  return (
    <>
      <div className="mt-8 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]">
        You're set
      </div>
      <h1 className="mt-2 font-heading text-3xl leading-tight">
        Welcome to {workspace}.
      </h1>
      <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
        {count === 0
          ? "Quiet for now — when you're ready, invite people from settings."
          : `We've sent ${count} invite${count === 1 ? "" : "s"}. They'll show up here once accepted.`}
      </p>

      <div className="gap-2 grid grid-cols-3 mt-8">
        <FactCard label="Workspace" value={workspace} />
        <FactCard label="Members" value={String(count + 1)} />
        <FactCard label="Plan" value="Free" />
      </div>

      <Button size="lg" className="mt-8 w-full" type="button">
        Take me in
      </Button>
    </>
  );
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background/40 px-3 py-3 border border-border/70 rounded-md">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
        {label}
      </div>
      <div className="mt-1 font-heading text-sm truncate">{value}</div>
    </div>
  );
}
