"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, DoorIcon, CardIcon } from "./icons";

const TABS = [
  { href: "/", label: "หน้าแรก", Icon: HomeIcon },
  { href: "/rooms", label: "ห้อง", Icon: DoorIcon },
  { href: "/cards", label: "การ์ด", Icon: CardIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-paper pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-xl">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              <Icon className="h-6 w-6" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
