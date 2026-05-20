"use client";

import Link from "next/link";

import {LayoutDashboard, Settings, ChevronLeft, ChevronRight,} from "lucide-react";

import { useState } from "react";

const items = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] =
    useState(false);

  return (
    <aside
      className={`h-screen bg-zinc-950 border-r border-zinc-800 transition-all duration-300 flex flex-col
        ${
          collapsed
            ? "w-20"
            : "w-72"
        }
      `}
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-zinc-800">
        {!collapsed && (
          <div>
            <h1 className="text-white font-bold text-xl">
              TheAuthService
            </h1>

            <p className="text-zinc-500 text-xs">
              Dashboard
            </p>
          </div>
        )}

        <button
          onClick={() =>
            setCollapsed(
              !collapsed,
            )
          }
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-white" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-4 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
            >
              <Icon className="w-5 h-5 shrink-0" />

              {!collapsed && (
                <span className="font-medium">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <div className="bg-zinc-900 rounded-2xl p-4">
          {!collapsed ? (
            <>
              <p className="text-sm text-white font-medium">
                Logged In
              </p>

              <p className="text-xs text-zinc-500 mt-1">
                Dashboard Session Active
              </p>
            </>
          ) : (
            <div className="w-3 h-3 rounded-full bg-green-500 mx-auto" />
          )}
        </div>
      </div>
    </aside>
  );
}