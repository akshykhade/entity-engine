import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface Gauge {
  name: string;
  value: number;
  target: number;
  unit: string;
  detail: string;
}

const GAUGES: Gauge[] = [
  { name: "API uptime", value: 99.94, target: 99.9, unit: "%", detail: "30-day rolling · 13 incidents" },
  { name: "P95 latency", value: 248, target: 300, unit: "ms", detail: "All regions · /v3 endpoints" },
  { name: "Error budget", value: 64, target: 100, unit: "%", detail: "Burned 36% this quarter" },
];

export function ChartsGaugesShowcasePage() {
  return (
    <div className="bg-background px-10 py-10 min-h-svh">
      <div className="mx-auto max-w-5xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Service-level objectives · Q2
        </div>
        <h1 className="mt-1 font-heading text-2xl">SLO health</h1>

        <div className="gap-4 grid grid-cols-1 sm:grid-cols-3 mt-6">
          {GAUGES.map((g) => (
            <GaugeCard key={g.name} g={g} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GaugeCard({ g }: { g: Gauge }) {
  const pct = computePct(g);
  const breached = computeBreached(g);
  const ringColor = breached
    ? "rgb(244 63 94)"
    : pct > 0.85
      ? "rgb(245 158 11)"
      : "rgb(20 184 166)";
  const tone = breached
    ? "text-rose-600 dark:text-rose-400"
    : "text-emerald-600 dark:text-emerald-400";

  const data = [{ name: g.name, value: pct * 100, fill: ringColor }];

  return (
    <div className="bg-background/40 p-5 border border-border/60 rounded-xl">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
        {g.name}
      </div>

      <div className="relative place-items-center grid mt-3">
        <ChartContainer className="w-44 h-44">
          <RadialBarChart
            data={data}
            innerRadius="78%"
            outerRadius="100%"
            startAngle={216}
            endAngle={-36}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <RadialBar
              dataKey="value"
              cornerRadius={8}
              background={{ fill: "currentColor", fillOpacity: 0.08 }}
            />
          </RadialBarChart>
        </ChartContainer>
        <div className="absolute inset-0 place-items-center grid pointer-events-none">
          <div className="text-center">
            <div className="font-heading text-3xl tracking-tight">
              {g.value}
              <span className="ml-0.5 text-muted-foreground text-sm">
                {g.unit}
              </span>
            </div>
            <div className={"font-mono text-[10px] uppercase tracking-[0.2em] " + tone}>
              {breached ? "breached" : "on track"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-3 font-mono text-[10px] uppercase tracking-[0.2em]">
        <span className="text-muted-foreground">
          target {g.target}{g.unit}
        </span>
        <span className="text-foreground/80">
          {Math.round(pct * 100)}% of target
        </span>
      </div>
      <div className="mt-2 text-muted-foreground text-xs">{g.detail}</div>
    </div>
  );
}

function computePct(g: Gauge) {
  if (g.name === "P95 latency") {
    return Math.min(1, g.value / 600);
  }
  return g.value / 100;
}

function computeBreached(g: Gauge) {
  if (g.name === "P95 latency") {
    return g.value > g.target;
  }
  if (g.name === "Error budget") {
    return g.value / 100 < 0.5;
  }
  return g.value < g.target;
}
