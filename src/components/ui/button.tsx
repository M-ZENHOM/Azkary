import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center border align-middle select-none font-sans font-medium text-center rounded-lg duration-300 ease-in disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed focus:shadow-none text-sm py-2 px-4 shadow-sm hover:shadow-md transition antialiased cursor-pointer after:absolute after:inset-0 after:rounded-[inherit] after:box-shadow  after:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-stone-800 hover:bg-stone-700 bg-gradient-to-b from-stone-700 to-stone-800 border-stone-900 text-stone-50 hover:bg-gradient-to-b hover:from-stone-800 hover:to-stone-800 hover:border-stone-900 after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)] ",
        info: "bg-blue-500 hover:bg-info-light bg-gradient-to-b from-blue-500 to-blue-600 border-blue-600 text-stone-50 hover:bg-gradient-to-b hover:from-blue-600 hover:to-blue-600 hover:border-blue-600 after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.35),inset_0_-2px_0px_rgba(0,0,0,0.18)] ",
        success:
          "bg-green-500 hover:bg-success-light bg-gradient-to-b from-green-500 to-green-600 border-green-600 text-stone-50 hover:bg-gradient-to-b hover:from-green-600 hover:to-green-600 hover:border-green-600 after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.35),inset_0_-2px_0px_rgba(0,0,0,0.18)]",
        error:
          "bg-red-500 hover:bg-error-light bg-gradient-to-b from-red-500 to-red-600 border-red-600 text-stone-50  hover:bg-gradient-to-b hover:from-red-600 hover:to-red-600 hover:border-red-600 after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.35),inset_0_-2px_0px_rgba(0,0,0,0.18)]",
      },
      size: {
        default: "py-2 px-4",
        sm: "py-1 px-2 text-xs",
        lg: "py-3 px-6 text-base",
        icon: "px-2 py-1",
      },
    },
  }
);

export default function Button({
  children,
  className,
  variant = "default",
  size = "default",
  ...props
}: { children: React.ReactNode } & ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string;
    variant?: "default" | "info" | "success" | "error";
    size?: "default" | "sm" | "lg" | "icon";
  }) {
  return (
    <button
      {...props}
      className={cn(buttonVariants({ variant, size, className }))}
    >
      {children}
    </button>
  );
}
