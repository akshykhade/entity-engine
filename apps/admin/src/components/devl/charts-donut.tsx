import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, chartColor } from "@/components/ui/chart";

const SLICES = [
  { name: "Subscriptions", value: 64.4, color: chartColor(0) },
  { name: "Add-ons", value: 18.2, color: chartColor(1) },
  { name: "Services", value: 9.8, color: chartColor(2) },
  { name: "Marketplace", value: 4.6, color: chartColor(3) },
  { name: "Other", value: 3.0, color: chartColor(4) },
];

export function ChartsDonutShowcasePage() {
  const total = SLICES.reduce((acc, s) => acc + s.value, 0);

  return (
    <div className="bg-background px-10 py-10 min-h-svh">
      <div className="mx-auto max-w-5xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Revenue mix · Q1 2026
        </div>
        <h1 className="mt-1 font-heading text-2xl">Where revenue comes from</h1>

        <div className="bg-background/40 mt-6 p-6 border border-border/60 rounded-xl">
          <div className="gap-8 grid grid-cols-1 lg:grid-cols-[260px_1fr]">
            <div className="relative place-items-center grid">
              <ChartContainer className="w-56 h-56">
                <PieChart>
                  <ChartTooltip />
                  <Pie
                    data={SLICES}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={96}
                    paddingAngle={1}
                    strokeWidth={0}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {SLICES.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="absolute inset-0 place-items-center grid pointer-events-none">
                <div className="text-center">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                    Total
                  </div>
                  <div className="mt-0.5 font-heading text-3xl tracking-tight">
                    $1.84M
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">
                    +14.2% vs Q4
                  </div>
                </div>
              </div>
            </div>

            <ul className="flex flex-col justify-center gap-3">
              {SLICES.map((s) => (
                <li key={s.name} className="flex items-center gap-3">
                  <span
                    className="rounded size-3 shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm">{s.name}</span>
                      <span className="font-mono tabular-nums text-muted-foreground text-xs">
                        {s.value.toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-muted mt-1 rounded-full w-full h-1 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          backgroundColor: s.color,
                          width: `${(s.value / total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-16 font-mono tabular-nums text-foreground text-xs text-right">
                    ${(s.value * 18400).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
