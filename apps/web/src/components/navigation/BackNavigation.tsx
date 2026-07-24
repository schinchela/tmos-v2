import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface BackNavigationProps {
  to: string;
  label: string;
}

export function BackNavigation({
  to,
  label,
}: BackNavigationProps) {
  return (
    <Link
      to={to}
      className="inline-flex w-fit items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950"
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  );
}
