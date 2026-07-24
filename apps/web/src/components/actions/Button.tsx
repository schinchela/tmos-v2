import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { Link } from "react-router-dom";

import { cn } from "../ui/cn";
import type {
  UiSize,
  UiTone,
} from "../../theme/ui.types";
import { toneClasses } from "../../theme/tones";

type ButtonVariant =
  | "solid"
  | "soft"
  | "outline"
  | "ghost";

interface ButtonBaseProps {
  children: ReactNode;
  tone?: UiTone;
  variant?: ButtonVariant;
  size?: UiSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

type ButtonProps =
  ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement>;

interface ButtonLinkProps
  extends ButtonBaseProps {
  to: string;
}

const sizeClasses: Record<UiSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-sm",
};

function getVariantClasses(
  tone: UiTone,
  variant: ButtonVariant,
): string {
  const classes = toneClasses[tone];

  if (variant === "solid") {
    return cn(
      classes.accentBackground,
      "border-transparent text-white shadow-sm hover:brightness-95",
    );
  }

  if (variant === "soft") {
    return cn(
      classes.softBackground,
      classes.softText,
      classes.accentBorder,
      "hover:brightness-98",
    );
  }

  if (variant === "outline") {
    return cn(
      "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950",
    );
  }

  return "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950";
}

function buttonClasses({
  tone = "primary",
  variant = "solid",
  size = "md",
  fullWidth = false,
  className,
}: Pick<
  ButtonBaseProps,
  | "tone"
  | "variant"
  | "size"
  | "fullWidth"
  | "className"
>): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50",
    toneClasses[tone].ring,
    sizeClasses[size],
    getVariantClasses(tone, variant),
    fullWidth && "w-full",
    className,
  );
}

export function Button({
  children,
  tone = "primary",
  variant = "solid",
  size = "md",
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={buttonClasses({
        tone,
        variant,
        size,
        fullWidth,
        className,
      })}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  );
}

export function ButtonLink({
  children,
  to,
  tone = "primary",
  variant = "solid",
  size = "md",
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  className,
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={buttonClasses({
        tone,
        variant,
        size,
        fullWidth,
        className,
      })}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </Link>
  );
}
