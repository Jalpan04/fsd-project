"use client";

import Link from "next/link";
import { Terminal, Code, Cpu } from "lucide-react";
import GitBranchAnimation from "@/components/layout/GitBranchAnimation";
import FeaturesSection from "@/components/layout/FeaturesSection";
import TerminalCTA from "@/components/layout/TerminalCTA";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-6 pt-6 md:px-12 md:pt-8 bg-[hsl(var(--ide-bg))] text-white selection:bg-primary/30">
      
      {/* Top Header Nav */}
      <nav className="z-50 w-full max-w-7xl flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="MainBranch Logo" className="w-10 h-10 object-contain drop-shadow-md" />
          <span className="font-abel text-3xl font-bold tracking-wider text-white shadow-primary/20 drop-shadow-lg">MainBranch</span>
        </div>
        <Link
          href="/login"
          className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-white px-6 py-2.5 rounded-full font-semibold transition-all border border-primary/30"
        >
          Login / Register
        </Link>
      </nav>

      {/* Hero Section: Two Column Grid */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center mt-2 mb-24 relative z-10">
        
        {/* Left Column: Typography */}
        <div className="flex flex-col items-start text-left space-y-6 lg:pr-12 relative z-20">
            <h1 className="font-abel text-7xl md:text-8xl lg:text-9xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 font-bold">
                MainBranch
            </h1>
            <p className="text-slate-300 text-xl font-light tracking-wide max-w-2xl leading-relaxed mt-2">
                Unify your GitHub, LeetCode, and Kaggle metrics into one dynamic developer portfolio. Showcase your best work organically and network directly with top engineers worldwide in real-time.
            </p>
            <div className="pt-4 flex gap-4">
                 <Link href="/login" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg font-bold transition-colors shadow-[0_0_20px_rgba(166,75,42,0.3)]">
                    Start Building Identity
                 </Link>
            </div>
        </div>

        {/* Right Column: Animation Graphic */}
        <div className="w-full h-full flex items-center justify-center relative pointer-events-auto z-10 mt-12 lg:mt-0">
            <GitBranchAnimation />
        </div>
        
      </div>

      {/* NEW Features Section */}
      <FeaturesSection />

      {/* Terminal CTA Section */}
      <TerminalCTA />
    </main>
  );
}
