import type { LucideIcon } from "lucide-react";

export type UiTone =
  | "neutral"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "dashboard"
  | "members"
  | "meetings"
  | "education"
  | "leadership"
  | "reports"
  | "administration"
  | "platform";

export type UiSize =
  | "sm"
  | "md"
  | "lg";

export interface RouteMetadata {
  id: string;
  path: string;
  title: string;
  shortTitle?: string;
  browserTitle: string;
  description?: string;
  eyebrow?: string;
  tone: UiTone;
  icon: LucideIcon;
  parentId?: string;
  backTo?: string;
  backLabel?: string;
}
