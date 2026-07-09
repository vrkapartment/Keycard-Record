"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme";

const THEME_EVENT = "themepreferencechange";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): ThemePreference {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

function getServerSnapshot(): ThemePreference {
  return "system";
}

function applyTheme(pref: ThemePreference) {
  if (pref === "system") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem(THEME_STORAGE_KEY);
  } else {
    document.documentElement.setAttribute("data-theme", pref);
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  }
  // Native "storage" events only fire in OTHER tabs, so notify this tab too.
  window.dispatchEvent(new Event(THEME_EVENT));
}

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "ระบบ" },
  { value: "light", label: "สว่าง" },
  { value: "dark", label: "มืด" },
];

export function ThemeToggle() {
  const pref = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div className="inline-flex gap-1 rounded-md border border-border-strong p-1">
      {OPTIONS.map((option) => {
        const active = pref === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => applyTheme(option.value)}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              active ? "bg-primary text-primary-ink" : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
