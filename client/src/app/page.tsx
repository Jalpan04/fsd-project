"use client";

import Link from "next/link";
import { Terminal, Code, Cpu } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-[hsl(var(--ide-bg))] text-white selection:bg-cyan-500/30">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-800 bg-black/50 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-[hsl(var(--ide-sidebar))] lg:p-4 lg:dark:bg-[hsl(var(--ide-sidebar))]">
          <img src="/logo.png" alt="MainBranch Logo" className="w-6 h-6 mr-2 rounded" /> MainBranch v1.0
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <Link
            href="/login"
            className="flex place-items-center gap-2 p-4 lg:p-0 pointer-events-auto lg:pointer-events-auto"
          >
            <span className="text-cyan-400 hover:text-cyan-300 transition-colors pointer-events-auto cursor-pointer">Login / Register &rarr;</span>
          </Link>
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-br before:from-transparent before:to-cyan-700 before:opacity-10 before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-to-t after:from-emerald-900 after:via-cyan-800 after:opacity-40 after:blur-2xl after:content-[''] z-[-1]">
        <h1 className="text-6xl font-black tracking-tight text-center">
          Code is your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-600">
            Identity
          </span>
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-[#333] hover:bg-[#1e1e1e] hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Sync{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Connect GitHub, LeetCode, and Kaggle.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-[#333] hover:bg-[#1e1e1e] hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Build{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Create your modular developer profile.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-[#333] hover:bg-[#1e1e1e] hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Share{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Write markdown blogs with syntax highlighting.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-[#333] hover:bg-[#1e1e1e] hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Connect{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Network with fellow developers.
          </p>
        </div>
      </div>
    </main>
  );
}
