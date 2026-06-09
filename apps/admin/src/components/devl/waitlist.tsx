import { useRef } from "react";
import { ParticleField } from "@/components/devl/particle-field";
import emptyRoomSrc from "@/assets/devl/empty-room.png";

export function WaitlistShowcasePage() {
  const typingImpulse = useRef(0);
  return (
    <div className="relative bg-background w-dvw h-dvh overflow-hidden">
      <ParticleField
        src={emptyRoomSrc.src}
        sampleStep={3}
        threshold={38}
        dotSize={0.95}
        renderScale={1}
        align="center"
        typingImpulseRef={typingImpulse}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1200px 800px at 50% 55%, transparent 40%, color-mix(in srgb, var(--background) 85%, transparent) 95%)",
        }}
      />
      <div
        aria-hidden
        className="bottom-0 absolute inset-x-0 h-[46%] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--background) 55%, transparent) 38%, color-mix(in srgb, var(--background) 88%, transparent) 70%, var(--background) 100%)",
        }}
      />
      <div
        aria-hidden
        className="bottom-0 absolute inset-x-0 h-[32%] pointer-events-none"
        style={{
          background:
            "radial-gradient(420px 220px at 50% 78%, color-mix(in srgb, var(--background) 85%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="bottom-0 absolute inset-x-0 flex flex-col items-center gap-4 px-6 pb-16 text-center">
        <div
          className="font-mono text-[11px] text-foreground/55 uppercase tracking-[0.3em] pointer-events-none"
          style={{ textShadow: "0 1px 16px rgba(0,0,0,0.7)" }}
        >
          Invite-only, for now
        </div>
        <h1
          className="max-w-xl font-heading text-3xl md:text-4xl leading-tight pointer-events-none"
          style={{ textShadow: "0 1px 24px rgba(0,0,0,0.65)" }}
        >
          This room's full.
        </h1>
        <p
          className="max-w-md text-foreground/70 text-sm leading-relaxed pointer-events-none"
          style={{ textShadow: "0 1px 16px rgba(0,0,0,0.7)" }}
        >
          Join the waitlist and we'll email you when there's space.
        </p>
        <a
          href="#"
          className="inline-flex justify-center items-center bg-foreground hover:opacity-90 mt-2 px-5 rounded-md h-10 font-medium text-background text-sm transition-opacity"
        >
          Join the waitlist
        </a>
      </div>
    </div>
  );
}
