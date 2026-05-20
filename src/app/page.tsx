"use client";

import { ShieldCheck, Bell, Activity, Lock, ArrowRight, } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.15),transparent_35%)]" />

      {/* NAVBAR */}
      <header className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Auth Platform
            </h1>

            <p className="text-xs text-zinc-400">
              Distributed Identity Infrastructure
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/login"
              className="px-6 py-3 rounded-2xl border border-zinc-700 hover:border-zinc-500 transition"
            >
              Login
            </Link>
            <button className="px-5 py-2.5 rounded-2xl bg-white text-black font-medium hover:bg-zinc-200 transition">
              Signup
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-28 lg:py-36">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 mb-8">
              <Activity className="w-4 h-4" />
              Event Driven Authentication Platform
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
              Build modern
              <span className="block text-zinc-400">
                distributed auth systems
              </span>
            </h1>

            <p className="mt-8 text-lg lg:text-xl text-zinc-400 max-w-2xl leading-8">
              OAuth2, JWT sessions, centralized logging,
              notifications, event-driven architecture,
              RabbitMQ pipelines, and platform-level observability —
              all in one ecosystem.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button className="group px-7 py-4 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:bg-zinc-200 transition">
                Get Started

                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              <button className="px-7 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition">
                Documentation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 pb-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              {
                icon: Lock,
                title: "OAuth2 + PKCE",
                description:
                  "Secure centralized authentication with modern OAuth flows.",
              },
              {
                icon: Bell,
                title: "Notifications",
                description:
                  "Email, SMS, push notifications powered by event consumers.",
              },
              {
                icon: Activity,
                title: "Event Driven",
                description:
                  "RabbitMQ powered microservice communication architecture.",
              },
              {
                icon: ShieldCheck,
                title: "Observability",
                description:
                  "Centralized logging and monitoring across all services.",
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 hover:bg-white/[0.05] transition"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-zinc-400 leading-7">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-medium">
              Auth Platform
            </p>

            <p className="text-sm text-zinc-500 mt-1">
              Distributed Authentication Infrastructure
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <button className="hover:text-white transition">
              Docs
            </button>

            <button className="hover:text-white transition">
              GitHub
            </button>

            <button className="hover:text-white transition">
              Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}