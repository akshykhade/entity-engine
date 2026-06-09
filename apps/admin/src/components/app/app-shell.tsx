"use client";

import {
  ChevronDownIcon,
  DatabaseIcon,
  HomeIcon,
  KeyRoundIcon,
  ScrollTextIcon,
  ShapesIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import {
  CommandPalette,
  useCommandPalette,
} from "@/components/app/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { useEntityCatalog } from "@/lib/hooks/use-entities";

const PRIMARY_NAV = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/entities", label: "Entities", icon: ShapesIcon },
  { href: "/audit-log", label: "Audit log", icon: ScrollTextIcon },
];

const USER_MANAGEMENT_NAV = [
  { href: "/users", label: "Users", icon: UsersIcon },
  { href: "/permissions", label: "Permissions", icon: KeyRoundIcon },
];

type AppShellProps = {
  children: ReactNode;
};

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
          active
            ? "bg-foreground/[0.06] text-foreground"
            : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
        }`}
      >
        <Icon className="opacity-70 size-4" />
        <span className="flex-1 text-left">{label}</span>
      </Link>
    </li>
  );
}

function SidebarSection({ label }: { label: string }) {
  return (
    <div className="px-4 pt-4 pb-1 font-mono text-[9px] text-muted-foreground uppercase tracking-[0.25em]">
      {label}
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { data: entities = [] } = useEntityCatalog();
  const commandPalette = useCommandPalette();

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="grid grid-rows-[56px_1fr] bg-background h-svh overflow-hidden text-foreground">
      <header className="flex items-center gap-4 bg-background px-4 border-border/60 border-b h-14 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 bg-card hover:bg-foreground/[0.03] px-2 py-1.5 border border-border rounded-md transition-colors"
        >
          <span className="bg-gradient-to-br from-emerald-500/80 to-sky-500/70 rounded size-6" />
          <span className="font-medium text-sm">CRUD Admin</span>
          <ChevronDownIcon className="opacity-60 size-3.5" />
        </Link>

        <div className="mx-auto w-full max-w-md">
          <InputGroup>
            <InputGroupInput
              aria-label="Open command center"
              placeholder="Search…"
              readOnly
              className="cursor-pointer"
              onClick={() => commandPalette.setOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  commandPalette.setOpen(true);
                }
              }}
            />
            <InputGroupAddon align="inline-end">
              <Kbd>⌘K</Kbd>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <div className="grid grid-cols-[256px_1fr] min-h-0 overflow-hidden">
        <aside className="flex flex-col bg-foreground/[0.015] border-border/60 border-r w-64 min-h-0 overflow-y-auto">
          <SidebarSection label="Workspace" />
          <ul className="flex flex-col gap-0.5 px-2">
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
              />
            ))}
          </ul>

          <SidebarSection label="User management" />
          <ul className="flex flex-col gap-0.5 px-2">
            {USER_MANAGEMENT_NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
              />
            ))}
          </ul>

          <SidebarSection label="Entities" />
          <ul className="flex flex-col gap-0.5 px-2 pb-4">
            {entities.map((entity) => {
              const href = `/entities/${entity.slug}`;
              const active = pathname.startsWith(href);
              return (
                <li key={entity.slug}>
                  <Link
                    href={href}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-foreground/[0.06] text-foreground"
                        : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                    }`}
                  >
                    <DatabaseIcon className="opacity-70 size-4" />
                    <span className="flex-1 text-left truncate">{entity.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="min-h-0 overflow-y-auto">{children}</main>
      </div>

      <CommandPalette
        open={commandPalette.open}
        onOpenChange={commandPalette.setOpen}
      />
    </div>
  );
}
