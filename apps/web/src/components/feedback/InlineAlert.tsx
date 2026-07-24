import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
} from "lucide-react";
import type { ReactNode } from "react";

import { toneClasses } from "../../theme/tones";
import type { UiTone } from "../../theme/ui.types";
import { cn } from "../ui/cn";

interface InlineAlertProps {
  title?: string;
  children: ReactNode;
  tone?: Extract<
    UiTone,
    "info" | "success" | "warning" | "danger"
  >;
}

const alertIcons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
};

export function InlineAlert({
  title,
  children,
  tone = "info",
}: InlineAlertProps) {
  const Icon = alertIcons[tone];
  const classes = toneClasses[tone];

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3",
        classes.accentBorder,
        classes.softBackground,
        classes.softText,
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />

      <div className="min-w-0">
        {title ? (
          <p className="text-sm font-bold">
            {title}
          </p>
        ) : null}

        <div
          className={cn(
            "text-sm leading-6",
            title && "mt-1",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
