"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Github, Code2, Database, BrainCircuit, Columns3, Blocks, MessageCircle, Wifi, Rss, PenLine } from 'lucide-react';

export default function FeaturesSection() {
  // Shared floating animation variants
  const floatingVariants = (delay: number, duration: number, yOffset: number): Variants => ({
    animate: {
      y: [0, yOffset, 0],
      transition: {
        y: {
          duration: duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay,
        }
      }
    },
    hover: {
      scale: 1.2,
      filter: "drop-shadow(0px 0px 16px rgba(166,75,42,0.8))",
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  });

  // Card data — each card gets an incrementing sticky `top` value
  const cards = [
    {
      title: "Sync Network",
      description: "Auto-sync contributions from GitHub, LeetCode, Kaggle, and HuggingFace. No manual updates, no fuss—just code, solve, and watch your stats grow together.",
      bg: "bg-[#161616]",
      glowDir: "bg-gradient-to-b from-[#A64B2A]/10 to-transparent",
      icons: [
        { Icon: Github, pos: "top-1/4 left-6 md:left-24", color: "text-[#D7C49E]", size: 56, float: floatingVariants(0, 4, -15) },
        { Icon: Code2, pos: "bottom-1/4 left-4 md:left-16", color: "text-[#D7C49E]", size: 48, float: floatingVariants(1.2, 5, 20) },
        { Icon: Database, pos: "top-1/4 right-8 md:right-36", color: "text-[#A64B2A]", size: 60, float: floatingVariants(0.5, 4.5, -20) },
        { Icon: BrainCircuit, pos: "bottom-1/4 right-6 md:right-28", color: "text-[#D7C49E]", size: 52, float: floatingVariants(2, 3.5, 15) },
      ]
    },
    {
      title: "Build Portfolio",
      description: "Showcase top projects entirely organically. Pin up to 3 major achievements and let your code speak for itself while you focus on building.",
      bg: "bg-[#131313]",
      glowDir: "bg-gradient-to-t from-[#D7C49E]/10 to-transparent",
      icons: [
        { Icon: Columns3, pos: "top-1/2 -translate-y-1/2 left-8 md:left-32", color: "text-[#D7C49E]", size: 72, float: floatingVariants(0, 6, -20) },
        { Icon: Blocks, pos: "top-1/3 -translate-y-1/2 right-8 md:right-32", color: "text-[#A64B2A]", size: 64, float: floatingVariants(1.5, 5.5, 20) },
      ]
    },
    {
      title: "Real-Time Chat",
      description: "Connect and collaborate with developers instantly. Secure, fast messaging built for engineering teams who move at the speed of thought.",
      bg: "bg-[#101010]",
      glowDir: "bg-gradient-to-b from-[#A64B2A]/8 to-transparent",
      icons: [
        { Icon: MessageCircle, pos: "top-1/3 -translate-y-1/2 left-8 md:left-32", color: "text-[#A64B2A]", size: 64, float: floatingVariants(0, 5, -18) },
        { Icon: Wifi, pos: "bottom-1/3 right-8 md:right-32", color: "text-[#D7C49E]", size: 56, float: floatingVariants(1, 4.5, 16) },
      ]
    },
    {
      title: "Social Feed",
      description: "Share your progress, build in public, and write markdown updates. A dev-first social feed where shipping is the ultimate flex.",
      bg: "bg-[#0d0d0d]",
      glowDir: "bg-gradient-to-t from-[#D7C49E]/8 to-transparent",
      icons: [
        { Icon: Rss, pos: "top-1/2 -translate-y-1/2 left-8 md:left-32", color: "text-[#D7C49E]", size: 60, float: floatingVariants(0.5, 5, -15) },
        { Icon: PenLine, pos: "top-1/3 -translate-y-1/2 right-8 md:right-32", color: "text-[#A64B2A]", size: 56, float: floatingVariants(1.5, 4, 18) },
      ]
    },
  ];

  // Incrementing sticky top values (like the SCSS: top: $i * 20px)
  const stickyTops = ["top-[96px]", "top-[108px]", "top-[120px]", "top-[132px]"];

  return (
    <div className="w-full relative z-20 px-4 md:px-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ y: 80, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`sticky ${stickyTops[i]} ${i > 0 ? 'mt-8' : ''} w-full max-w-[1200px] mx-auto ${card.bg} border border-white/10 rounded-[40px] px-12 py-8 overflow-hidden flex flex-col items-center text-center justify-center min-h-[280px] shadow-[0_10px_40px_rgba(0,0,0,0.6)]`}
        >
          {/* Glow behind the text */}
          <div className={`absolute inset-0 ${card.glowDir} blur-3xl rounded-full`} />
          
          {/* Content with Hoverable Header */}
          <motion.div className="relative z-10 max-w-3xl flex flex-col items-center group cursor-default">
            <div className="relative inline-block mb-4">
              <h2 className="text-4xl md:text-5xl font-abel font-bold text-white transition-colors duration-300 group-hover:text-[#D7C49E]">
                {card.title}
              </h2>
              {/* Animated Underline */}
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-0 bg-[#A64B2A] transition-all duration-300 group-hover:w-full rounded-full" />
            </div>
            
            <p className="text-slate-300 text-lg md:text-xl font-light tracking-wide leading-relaxed">
              {card.description}
            </p>
          </motion.div>

          {/* Floating Icons */}
          <div className="absolute inset-0 pointer-events-none">
            {card.icons.map(({ Icon, pos, color, size, float }, j) => (
              <motion.div
                key={j}
                className={`absolute ${pos} opacity-70 ${color} pointer-events-auto cursor-pointer`}
                variants={float}
                animate="animate"
                whileHover="hover"
              >
                <Icon size={size} strokeWidth={1.5} className="filter drop-shadow-[0_0_10px_rgba(166,75,42,0.4)]" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
