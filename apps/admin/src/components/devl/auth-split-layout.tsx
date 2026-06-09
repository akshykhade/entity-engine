import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthSplitLayoutProps = {
  left: ReactNode;
  right: ReactNode;
  className?: string;
  frameClassName?: string;
  leftClassName?: string;
  rightClassName?: string;
};

export function AuthSplitLayout({
  left,
  right,
  className,
  frameClassName,
  leftClassName,
  rightClassName,
}: AuthSplitLayoutProps) {
  return (
    <div
      className={cn(
        "relative 2xl:flex 2xl:justify-center 2xl:items-center bg-background 2xl:p-6 h-svh 2xl:h-auto 2xl:min-h-svh overflow-hidden 2xl:overflow-visible text-foreground",
        className,
      )}
    >
      <ThemeToggle className="top-6 right-6 z-30 absolute" />
      <div
        className={cn(
          "relative flex mx-auto w-full max-w-[1600px] h-full",
          "2xl:h-auto 2xl:min-h-0 2xl:w-[min(94vw,calc(92svh*16/9))] 2xl:max-w-none 2xl:aspect-[16/9]",
          "2xl:overflow-hidden 2xl:rounded-2xl 2xl:border 2xl:border-border/70 2xl:bg-background/95 2xl:shadow-[0_25px_80px_-24px_rgba(0,0,0,0.75)]",
          frameClassName,
        )}
      >
        <div
          className={cn(
            "hidden lg:block relative flex-1 border-border/60 border-r overflow-hidden",
            leftClassName,
          )}
        >
          {left}
        </div>
        <div
          className={cn(
            "relative flex flex-col justify-center items-center px-6 lg:px-14 py-10 w-full lg:w-[560px] overflow-y-auto",
            rightClassName,
          )}
        >
          {right}
        </div>
      </div>
    </div>
  );
}
