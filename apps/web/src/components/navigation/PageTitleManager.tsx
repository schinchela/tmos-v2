import { useEffect } from "react";

interface PageTitleManagerProps {
  title: string;
}

export function PageTitleManager({
  title,
}: PageTitleManagerProps) {
  useEffect(() => {
    const previousTitle = document.title;

    document.title = title;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  return null;
}
