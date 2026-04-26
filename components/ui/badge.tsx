import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand/20 text-brand border border-brand/30",
        secondary: "bg-zinc-800 text-zinc-400 border border-zinc-700",
        file: "bg-emerald-900/30 text-emerald-400 border border-emerald-800/30",
        manual: "bg-blue-900/30 text-blue-400 border border-blue-800/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
