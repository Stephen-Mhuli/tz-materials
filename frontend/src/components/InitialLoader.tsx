"use client";

import { useEffect, useState } from "react";

export function InitialLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const hide = () => setVisible(false);

    if (document.readyState === "complete") {
      timeoutId = setTimeout(hide, 150);
    } else {
      window.addEventListener("load", hide, { once: true });
    }

    timeoutId = setTimeout(hide, 4000);

    return () => {
      window.removeEventListener("load", hide);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (!visible) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-page">
      <div className="flex items-center rounded-full border border-muted bg-surface p-4 shadow-soft">
        <span className="spinner h-4 w-4 rounded-full border-2 border-muted border-t-transparent" />
      </div>
    </div>
  );
}
