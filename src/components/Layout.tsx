import { cn } from "@/lib/utils";
import React from "react";

export default function Layout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-4 w-full max-w-[600px] mx-auto overflow-hidden",
        className
      )}
    >
      {children}
    </main>
  );
}
