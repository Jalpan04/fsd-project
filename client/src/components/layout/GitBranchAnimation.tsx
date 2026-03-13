"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export default function GitBranchAnimation() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SVG Canvas dimensions for vertical layout
  const width = 600;
  const height = 500;

  // Vertical Path coordinates based on reference image rotated 90deg left
  // Main Branch (Bottom to Top)
  const mainBranchPath = `M 250 450 L 250 50`;
  
  // Left Branch (Splits from main smoothly, moves left and goes straight up)
  const leftBranchPath = `M 250 350 C 250 300, 100 300, 100 250 L 100 120`;
  
  // Right Branch (Splits from main smoothly, moves right and goes straight up)
  const rightBranchPath = `M 250 250 C 250 200, 400 200, 400 150 L 400 50`;

  // Animation variants
  const pathVariants: any = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 2.5, ease: "easeInOut", delay: 0.5 }
    }
  };

  const nodeVariants: any = {
    hidden: { scale: 0, opacity: 0 },
    visible: (customDelay: number) => ({
      scale: 1, opacity: 1,
      transition: { type: "spring", stiffness: 260, damping: 20, delay: customDelay }
    })
  };

  if (!mounted) return <div className="w-[600px] h-[500px]" />;

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible filter drop-shadow-[0_0_12px_rgba(166,75,42,0.6)]">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- Connected Glowing Threads --- */}
        {/* Main Central Branch updated to match the orange center nodes */}
        <motion.path d={mainBranchPath} fill="none" stroke="#A64B2A" strokeWidth="4" strokeLinecap="round" variants={pathVariants} initial="hidden" animate="visible" filter="url(#glow)" />
        <motion.path d={leftBranchPath} fill="none" stroke="#D7C49E" strokeWidth="4" strokeLinecap="round" variants={pathVariants} initial="hidden" animate="visible" filter="url(#glow)" />
        <motion.path d={rightBranchPath} fill="none" stroke="#D7C49E" strokeWidth="4" strokeLinecap="round" variants={pathVariants} initial="hidden" animate="visible" filter="url(#glow)" />

        {/* --- Nodes (Avatars perfectly centered on vertical branches) --- */}
        
        {/* Main Central Branch Avatars */}
        <CommitAvatar cx={250} cy={450} delay={0.8} borderColor="#A64B2A" />
        <CommitAvatar cx={250} cy={350} delay={1.4} borderColor="#A64B2A" />
        <CommitAvatar cx={250} cy={250} delay={2.0} borderColor="#A64B2A" />
        <CommitAvatar cx={250} cy={150} delay={2.6} borderColor="#A64B2A" />
        <CommitAvatar cx={250} cy={50} delay={3.2} borderColor="#A64B2A" imageSize={1.2} />

        {/* Left Subbranch Avatars */}
        <CommitAvatar cx={100} cy={250} delay={2.2} borderColor="#D7C49E" />
        <CommitAvatar cx={100} cy={120} delay={2.6} borderColor="#D7C49E" imageSize={1.1} />

        {/* Right Subbranch Avatars */}
        <CommitAvatar cx={400} cy={150} delay={2.4} borderColor="#D7C49E" />
        <CommitAvatar cx={400} cy={50} delay={2.8} borderColor="#D7C49E" imageSize={1.1} />

      </svg>
    </div>
  );

  function CommitAvatar({ cx, cy, delay, borderColor, imageSize = 1 }: { cx: number, cy: number, delay: number, borderColor: string, imageSize?: number }) {
    const size = 18 * imageSize; // Avatar circle radius
    return (
      <motion.g custom={delay} variants={nodeVariants} initial="hidden" animate="visible">
        <motion.g whileHover={{ scale: 1.15, transition: { duration: 0.15 } }} className="cursor-pointer group" style={{ transformOrigin: `${cx}px ${cy}px` }}>
          <circle cx={cx} cy={cy} r={size} fill="#1a1a1a" stroke={borderColor} strokeWidth="3" filter="url(#glow)" />
          <foreignObject x={cx - size} y={cy - size} width={size * 2} height={size * 2}>
            <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
              <User size={size * 1.1} strokeWidth={2} />
            </div>
          </foreignObject>
        </motion.g>
      </motion.g>
    );
  }
}