import { cn } from "@/lib/utils";
import React, { type InputHTMLAttributes } from "react";

export default function Input({
  className,
  icon,
  containerClassName,
  ...props
}: {
  className?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      <input
        {...props}
        className={cn(
          " border border-black/10 aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 placeholder:text-stone-600/60 ring-transparent transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 pr-8 pl-2.5 ring bg-white rounded-lg duration-100 peer",
          className
        )}
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-600/70  peer-focus:text-stone-800 dark:peer-hover:text-white dark:peer-focus:text-white transition-all duration-300 ease-in overflow-hidden ">
        {icon}
      </span>
    </div>
  );
}
