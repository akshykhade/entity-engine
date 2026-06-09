import type { ReactNode } from "react";

type PageHeaderProps = {
  label?: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ label, title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div>
        {label ? (
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            {label}
          </div>
        ) : null}
        <h1 className="mt-1 font-heading text-xl tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </header>
  );
}
