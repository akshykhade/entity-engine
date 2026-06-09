import { useEffect, useRef, useState } from "react";
import { GripVerticalIcon, PlayIcon, RotateCcwIcon, Share2Icon, WandSparklesIcon } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/devl/theme-provider";

const CODE = `import { useState } from "react";
import { Button } from "@/components/ui/button";

// A tiny counter widget
export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-xl">
        Live preview
      </h2>
      <p>You clicked {count} times.</p>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  );
}
`;

export function LayoutsSplitResizableShowcasePage() {
  const [leftPct, setLeftPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const raw = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(85, Math.max(15, raw));
      setLeftPct(clamped);
    };
    const onUp = () => setDragging(false);

    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [dragging]);

  const leftLabel = Math.round(leftPct);
  const rightLabel = 100 - leftLabel;

  return (
    <div className="flex flex-col bg-background h-svh overflow-hidden text-foreground">
      <header className="flex items-center gap-3 px-4 border-border/60 border-b h-12">
        <span className="font-mono text-muted-foreground text-xs">
          scratchpad / playground.tsx
        </span>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-1">
          <Button size="xs" variant="ghost">
            <WandSparklesIcon />
            Format
          </Button>
          <Button size="xs" variant="ghost">
            <PlayIcon />
            Run
          </Button>
          <Button size="xs" variant="ghost">
            <Share2Icon />
            Share
          </Button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="outline" className="font-mono text-[10px] tracking-wider">
            {leftLabel}% / {rightLabel}%
          </Badge>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setLeftPct(50)}
            disabled={leftLabel === 50}
          >
            <RotateCcwIcon />
            Reset
          </Button>
        </div>
      </header>

      <div
        ref={containerRef}
        className="relative flex flex-1 overflow-hidden"
      >
        <div
          className="flex flex-col bg-foreground/[0.02] border-border/60 border-r overflow-hidden shrink-0"
          style={{ width: `${leftPct}%` }}
        >
          <EditorPane />
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={leftLabel}
          aria-valuemin={15}
          aria-valuemax={85}
          onMouseDown={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDoubleClick={() => setLeftPct(50)}
          className={`group relative z-10 flex w-1.5 shrink-0 cursor-col-resize items-center justify-center transition-colors hover:bg-foreground/10 ${
            dragging ? "bg-foreground/15" : ""
          }`}
        >
          <span className="flex justify-center items-center opacity-0 group-hover:opacity-100 rounded-full w-3 h-10 transition-opacity pointer-events-none">
            <GripVerticalIcon className="size-3 text-muted-foreground" />
          </span>
        </div>

        <div className="flex flex-col flex-1 bg-background overflow-hidden">
          <PreviewPane count={3} dragging={dragging} />
        </div>
      </div>
    </div>
  );
}

function EditorPane() {
  const { resolved } = useTheme();
  const theme = resolved === "dark" ? themes.vsDark : themes.vsLight;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-2 border-border/60 border-b h-9 shrink-0">
        <EditorTab label="playground.tsx" active />
        <EditorTab label="config.json" />
      </div>
      <div className="flex-1 overflow-auto">
        <Highlight code={CODE.trimEnd()} language="tsx" theme={theme}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`m-0 px-3 py-3 font-mono text-[12.5px] leading-[1.65] ${className}`}
              style={{ ...style, background: "transparent" }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="table-row">
                  <span className="table-cell pr-4 font-mono tabular-nums text-muted-foreground/40 text-xs text-right select-none">
                    {i + 1}
                  </span>
                  <span className="table-cell whitespace-pre">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}

function EditorTab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
        active
          ? "bg-foreground/[0.06] text-foreground"
          : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function PreviewPane({ count, dragging }: { count: number; dragging: boolean }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-2 border-border/60 border-b h-9 shrink-0">
        <EditorTab label="Preview" active />
        <EditorTab label="Console" />
      </div>
      <div
        className={`flex flex-1 items-center justify-center overflow-auto p-8 ${
          dragging ? "pointer-events-none" : ""
        }`}
      >
        <div className="flex flex-col gap-3 bg-card shadow-sm p-6 border border-border rounded-xl w-full max-w-sm">
          <h2 className="font-heading font-semibold text-xl">Live preview</h2>
          <p className="text-muted-foreground text-sm">
            You clicked {count} times.
          </p>
          <Button size="sm" className="self-start">
            Increment
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center px-3 border-border/60 border-t h-7 shrink-0">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
          Ready · 42ms
        </span>
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
          v1.0.0
        </span>
      </div>
    </div>
  );
}
