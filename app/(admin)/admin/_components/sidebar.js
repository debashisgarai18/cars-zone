"use client";

import { cn } from "@/lib/utils";
import { Calendar, Car, Cog, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Cars",
    icon: Car,
    href: "/admin/cars",
  },
  {
    label: "Test Drivers",
    icon: Calendar,
    href: "/admin/test-drivers",
  },
  {
    label: "Settings",
    icon: Cog,
    href: "/admin/settings",
  },
];

export default function Sidebar() {
  const pathName = usePathname();
  return (
    <>
      {/* for web */}
      <div className="hidden md:flex h-full flex-col overflow-y-auto bg-white shadow-sm">
        {routes.map((elem) => {
          return (
            <Link
              key={elem.href}
              href={elem.href}
              className={cn(
                "flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-100/50 h-12",
                pathName === elem.href &&
                  "text-blue-700 bg-blue-100/50 hohver:bg-blue-100 hover:text-blue-700"
              )}
            >
              <elem.icon className="h-5 w-5" />
              {elem.label}
            </Link>
          );
        })}
      </div>
      {/* for mobile */}
      <div></div>
    </>
  );
}
