"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Mail } from 'lucide-react';
import Link from 'next/link';

const terminalLines = [
  { text: "$ mainbranch init --identity", delay: 0, isCommand: true },
  { text: "> Syncing GitHub...          ✓", delay: 1200, isCommand: false },
  { text: "> Building portfolio...      ✓", delay: 2400, isCommand: false },
  { text: "> Joining the network...     ✓", delay: 3600, isCommand: false },
  { text: "> Ready. Your identity starts now.", delay: 4800, isCommand: false, isHighlight: true },
];

export default function TerminalCTA() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;

    const timers: NodeJS.Timeout[] = [];
    terminalLines.forEach((line, i) => {
      const timer = setTimeout(() => {
        setVisibleLines(i + 1);
      }, line.delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [started]);

  return (
    <motion.section
      className="w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-24 pb-8"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onViewportEnter={() => setStarted(true)}
    >
      {/* Terminal Window */}
      <div className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_0_60px_rgba(166,75,42,0.15)] overflow-hidden">
        
        {/* Title Bar */}
        <div className="flex items-center gap-2 px-5 py-3 bg-[#111111] border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-sm text-gray-500 font-mono">terminal — mainbranch</span>
        </div>

        {/* Terminal Body */}
        <div className="px-6 py-6 font-mono text-sm md:text-base min-h-[220px] flex flex-col justify-center gap-1">
          {terminalLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={i < visibleLines ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`
                ${line.isCommand ? 'text-[#D7C49E]' : 'text-gray-400'}
                ${line.isHighlight ? 'text-[#A64B2A] font-semibold' : ''}
              `}
            >
              {i < visibleLines ? line.text : ""}
            </motion.div>
          ))}
          
          {/* Blinking cursor after all lines */}
          {visibleLines >= terminalLines.length && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-[#A64B2A] text-lg mt-1"
            >
              ▊
            </motion.span>
          )}
        </div>
      </div>

      {/* CTA Area Below Terminal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={visibleLines >= terminalLines.length ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="mt-12 flex flex-col items-center gap-6"
      >
        <h3 className="text-2xl md:text-3xl font-abel font-bold text-white text-center">
          Ready to own your developer identity?
        </h3>

        <Link
          href="/login"
          className="px-10 py-4 rounded-xl bg-[#A64B2A] hover:bg-[#A64B2A]/90 text-white font-bold text-base tracking-wide transition-all shadow-[0_0_20px_rgba(166,75,42,0.3)] hover:shadow-[0_0_30px_rgba(166,75,42,0.5)]"
        >
          Get Started
        </Link>
      </motion.div>

      {/* Footer — Contact Us */}
      <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center gap-6">
        <h4 className="text-xl font-abel font-bold text-[#D7C49E] tracking-wider">Contact Us</h4>

        <div className="flex items-center gap-8">
          {/* Jalpan */}
          <div className="flex items-center gap-3">
            <a href="https://github.com/Jalpan04" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D7C49E] transition-colors">
              <Github size={24} strokeWidth={1.5} />
            </a>
            <a href="mailto:jalpan2104@gmail.com" className="text-gray-400 hover:text-[#A64B2A] transition-colors">
              <Mail size={24} strokeWidth={1.5} />
            </a>
          </div>

          <span className="w-px h-6 bg-white/10" />

          {/* Smit */}
          <div className="flex items-center gap-3">
            <a href="https://github.com/ayoitssmit" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D7C49E] transition-colors">
              <Github size={24} strokeWidth={1.5} />
            </a>
            <a href="mailto:smitshah3005@gmail.com" className="text-gray-400 hover:text-[#A64B2A] transition-colors">
              <Mail size={24} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <p className="text-gray-600 text-xs font-mono mt-4">
          © 2026 MainBranch. Built by developers, for developers.
        </p>
      </footer>
    </motion.section>
  );
}
