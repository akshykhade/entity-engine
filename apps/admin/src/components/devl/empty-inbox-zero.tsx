"use client";

import { useRef } from "react";
import { CheckCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleField } from "@/components/devl/particle-field";
import dustyFieldSrc from "@/assets/devl/dusty-field.png";

export function EmptyInboxZeroShowcasePage() {
  const typingImpulse = useRef(0);
  return (
    <div className="relative bg-background w-dvw h-dvh overflow-hidden">
      <ParticleField
        src={dustyFieldSrc.src}
        sampleStep={2}
        threshold={48}
        dotSize={0.9}
        renderScale={1}
        align="center"
        typingImpulseRef={typingImpulse}
      />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1200px 800px at 50% 45%, transparent 35%, color-mix(in srgb, var(--background) 80%, transparent) 95%)",
        }}
      />
      <div
        aria-hidden
        className="bottom-0 absolute inset-x-0 h-[60%] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--background) 50%, transparent) 35%, color-mix(in srgb, var(--background) 90%, transparent) 70%, var(--background) 100%)",
        }}
      />

      <div className="inline-flex top-6 left-6 z-10 absolute items-center gap-2 bg-background/60 backdrop-blur px-3 py-1 border border-border/70 rounded-full font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
        <CheckCheckIcon className="size-3 text-foreground" aria-hidden />
        Inbox · 0 unread
      </div>

      <div className="top-6 right-6 z-10 absolute font-mono text-[10px] text-muted-foreground text-right uppercase tracking-[0.3em]">
        <div>This week</div>
        <div className="mt-0.5 font-heading text-foreground/85 text-xs normal-case tracking-normal">
          47 cleared
        </div>
      </div>

      <div className="bottom-0 z-10 absolute inset-x-0 flex flex-col items-center gap-4 px-6 pb-20 text-center">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          A quiet horizon
        </div>
        <h1 className="max-w-xl font-heading text-4xl md:text-5xl leading-tight">
          You're all caught up.
        </h1>
        <p className="max-w-md text-muted-foreground text-sm text-balance leading-relaxed">
          Nothing new since 8:42 this morning. Take a break — we'll let you
          know when something arrives.
        </p>

        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" size="sm">
            View archive
          </Button>
          <Button variant="ghost" size="sm">
            Snooze new mail
          </Button>
        </div>
      </div>
    </div>
  );
}
