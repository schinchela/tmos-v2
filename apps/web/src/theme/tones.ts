import type { UiTone } from "./ui.types";

export interface ToneClasses {
  accentText: string;
  accentBackground: string;
  accentBorder: string;
  softBackground: string;
  softText: string;
  iconBackground: string;
  iconText: string;
  ring: string;
  gradient: string;
}

export const toneClasses: Record<
  UiTone,
  ToneClasses
> = {
  neutral: {
    accentText: "text-slate-700",
    accentBackground: "bg-slate-700",
    accentBorder: "border-slate-300",
    softBackground: "bg-slate-100",
    softText: "text-slate-700",
    iconBackground: "bg-slate-100",
    iconText: "text-slate-700",
    ring: "focus-visible:ring-slate-200",
    gradient:
      "from-slate-700 via-slate-800 to-slate-950",
  },
  primary: {
    accentText: "text-indigo-700",
    accentBackground: "bg-indigo-600",
    accentBorder: "border-indigo-200",
    softBackground: "bg-indigo-50",
    softText: "text-indigo-700",
    iconBackground: "bg-indigo-100",
    iconText: "text-indigo-700",
    ring: "focus-visible:ring-indigo-200",
    gradient:
      "from-indigo-600 via-blue-700 to-slate-950",
  },
  info: {
    accentText: "text-sky-700",
    accentBackground: "bg-sky-600",
    accentBorder: "border-sky-200",
    softBackground: "bg-sky-50",
    softText: "text-sky-700",
    iconBackground: "bg-sky-100",
    iconText: "text-sky-700",
    ring: "focus-visible:ring-sky-200",
    gradient:
      "from-sky-500 via-blue-700 to-slate-950",
  },
  success: {
    accentText: "text-emerald-700",
    accentBackground: "bg-emerald-600",
    accentBorder: "border-emerald-200",
    softBackground: "bg-emerald-50",
    softText: "text-emerald-700",
    iconBackground: "bg-emerald-100",
    iconText: "text-emerald-700",
    ring: "focus-visible:ring-emerald-200",
    gradient:
      "from-emerald-500 via-teal-700 to-slate-950",
  },
  warning: {
    accentText: "text-amber-700",
    accentBackground: "bg-amber-500",
    accentBorder: "border-amber-200",
    softBackground: "bg-amber-50",
    softText: "text-amber-800",
    iconBackground: "bg-amber-100",
    iconText: "text-amber-700",
    ring: "focus-visible:ring-amber-200",
    gradient:
      "from-amber-500 via-orange-700 to-slate-950",
  },
  danger: {
    accentText: "text-rose-700",
    accentBackground: "bg-rose-600",
    accentBorder: "border-rose-200",
    softBackground: "bg-rose-50",
    softText: "text-rose-700",
    iconBackground: "bg-rose-100",
    iconText: "text-rose-700",
    ring: "focus-visible:ring-rose-200",
    gradient:
      "from-rose-600 via-red-800 to-slate-950",
  },
  dashboard: {
    accentText: "text-blue-700",
    accentBackground: "bg-blue-600",
    accentBorder: "border-blue-200",
    softBackground: "bg-blue-50",
    softText: "text-blue-700",
    iconBackground: "bg-blue-100",
    iconText: "text-blue-700",
    ring: "focus-visible:ring-blue-200",
    gradient:
      "from-blue-600 via-indigo-700 to-slate-950",
  },
  members: {
    accentText: "text-teal-700",
    accentBackground: "bg-teal-600",
    accentBorder: "border-teal-200",
    softBackground: "bg-teal-50",
    softText: "text-teal-700",
    iconBackground: "bg-teal-100",
    iconText: "text-teal-700",
    ring: "focus-visible:ring-teal-200",
    gradient:
      "from-teal-500 via-cyan-700 to-slate-950",
  },
  meetings: {
    accentText: "text-orange-700",
    accentBackground: "bg-orange-600",
    accentBorder: "border-orange-200",
    softBackground: "bg-orange-50",
    softText: "text-orange-700",
    iconBackground: "bg-orange-100",
    iconText: "text-orange-700",
    ring: "focus-visible:ring-orange-200",
    gradient:
      "from-orange-500 via-amber-700 to-slate-950",
  },
  education: {
    accentText: "text-violet-700",
    accentBackground: "bg-violet-600",
    accentBorder: "border-violet-200",
    softBackground: "bg-violet-50",
    softText: "text-violet-700",
    iconBackground: "bg-violet-100",
    iconText: "text-violet-700",
    ring: "focus-visible:ring-violet-200",
    gradient:
      "from-violet-600 via-purple-700 to-slate-950",
  },
  leadership: {
    accentText: "text-blue-800",
    accentBackground: "bg-blue-700",
    accentBorder: "border-blue-200",
    softBackground: "bg-blue-50",
    softText: "text-blue-800",
    iconBackground: "bg-blue-100",
    iconText: "text-blue-800",
    ring: "focus-visible:ring-blue-200",
    gradient:
      "from-blue-700 via-indigo-800 to-slate-950",
  },
  reports: {
    accentText: "text-emerald-700",
    accentBackground: "bg-emerald-600",
    accentBorder: "border-emerald-200",
    softBackground: "bg-emerald-50",
    softText: "text-emerald-700",
    iconBackground: "bg-emerald-100",
    iconText: "text-emerald-700",
    ring: "focus-visible:ring-emerald-200",
    gradient:
      "from-emerald-600 via-green-700 to-slate-950",
  },
  administration: {
    accentText: "text-indigo-700",
    accentBackground: "bg-indigo-600",
    accentBorder: "border-indigo-200",
    softBackground: "bg-indigo-50",
    softText: "text-indigo-700",
    iconBackground: "bg-indigo-100",
    iconText: "text-indigo-700",
    ring: "focus-visible:ring-indigo-200",
    gradient:
      "from-indigo-600 via-slate-700 to-slate-950",
  },
  platform: {
    accentText: "text-purple-700",
    accentBackground: "bg-purple-600",
    accentBorder: "border-purple-200",
    softBackground: "bg-purple-50",
    softText: "text-purple-700",
    iconBackground: "bg-purple-100",
    iconText: "text-purple-700",
    ring: "focus-visible:ring-purple-200",
    gradient:
      "from-purple-600 via-indigo-800 to-slate-950",
  },
};
