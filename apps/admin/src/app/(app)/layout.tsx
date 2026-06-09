"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app/app-shell";
import { ToastProvider } from "@/components/ui/toast";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider position="bottom-right">
        <AppShell>{children}</AppShell>
      </ToastProvider>
    </ThemeProvider>
  );
}
