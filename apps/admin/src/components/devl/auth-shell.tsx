import type { ReactNode, RefObject } from "react";
import { createContext, useContext, useRef } from "react";
import { ParticleField } from "@/components/devl/particle-field";
import { AuthSplitLayout } from "@/components/devl/auth-split-layout";
import welcomeSrc from "@/assets/devl/welcome.png";
import clustersSrc from "@/assets/devl/clusters.png";

type ImpulseRef = RefObject<number>;
const TypingImpulseContext = createContext<ImpulseRef | null>(null);

export function useAuthTypingImpulse(): ImpulseRef {
  const ctx = useContext(TypingImpulseContext);
  if (!ctx) throw new Error("useAuthTypingImpulse outside <AuthShell>");
  return ctx;
}

type Variant = "welcome" | "request-access" | "onboarding";

const FIGURES: Record<Variant, string> = {
  welcome: welcomeSrc.src,
  "request-access": welcomeSrc.src,
  onboarding: clustersSrc.src,
};

export function AuthShell({
  children,
  variant = "welcome",
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  const typingImpulseRef = useRef(0);
  const src = FIGURES[variant];
  return (
    <TypingImpulseContext.Provider value={typingImpulseRef}>
      <AuthSplitLayout
        rightClassName="lg:w-[620px]"
        left={
          <>
            <ParticleField
              src={src}
              sampleStep={3}
              threshold={34}
              dotSize={1}
              renderScale={1}
              align="center"
              typingImpulseRef={typingImpulseRef}
            />
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(900px 600px at 50% 50%, transparent 45%, color-mix(in srgb, var(--background) 88%, transparent) 92%)",
              }}
            />
            <div className="absolute inset-0 flex flex-col justify-between p-12 pointer-events-none">
              <div className="flex items-center gap-2 font-mono text-sm pointer-events-auto">
                <span className="inline-block bg-foreground rounded-full w-2 h-2" />
                <span className="uppercase tracking-[0.2em]">Sean's scratch pad</span>
              </div>
              {variant === "request-access" ? (
                <div className="max-w-md">
                  <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]">
                    Quiet onboarding
                  </div>
                  <p className="mt-3 font-heading text-xl md:text-2xl leading-snug">
                    A waitlist screen with a particle figure and a single soft
                    CTA — for invite-only entry points.
                  </p>
                </div>
              ) : variant === "onboarding" ? (
                <div className="max-w-md">
                  <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]">
                    First steps
                  </div>
                  <p className="mt-3 font-heading text-xl md:text-2xl leading-snug">
                    A guided multi-step setup, paced so each screen carries one
                    decision at a time.
                  </p>
                </div>
              ) : (
                <div className="max-w-md">
                  <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]">
                    Sign-in design
                  </div>
                  <p className="mt-3 font-heading text-xl md:text-2xl leading-snug">
                    Split layout with a particle field on the left and a single
                    centered form on the right.
                  </p>
                </div>
              )}
            </div>
          </>
        }
        right={children}
      />
    </TypingImpulseContext.Provider>
  );
}
