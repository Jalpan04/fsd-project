import React from "react";

interface LeetCodeStatsProps {
    stats: {
        total_solved?: number;
        easy_solved?: number;
        medium_solved?: number;
        hard_solved?: number;
        total_questions?: number;
        easy_questions?: number;
        medium_questions?: number;
        hard_questions?: number;
    };
    username: string;
}

export default function LeetCodeStatsCard({ stats }: LeetCodeStatsProps) {
    if (!stats || stats.total_solved === undefined) {
        return (
            <div className="text-sm text-muted-foreground">
                Data not synced yet.
            </div>
        );
    }

    /* ---------- DATA ---------- */
    const totalQ = stats.total_questions || 3817;
    const easyQ = stats.easy_questions || 922;
    const medQ = stats.medium_questions || 1993;
    const hardQ = stats.hard_questions || 902;

    const easySolved = stats.easy_solved || 0;
    const mediumSolved = stats.medium_solved || 0;
    const hardSolved = stats.hard_solved || 0;
    const totalSolved = stats.total_solved || 0;

    /* ---------- SVG ---------- */
    const radius = 54;
    const stroke = 6;
    const circumference = 2 * Math.PI * radius;
    const gap = 3;

    const easyLen = (easySolved / totalQ) * circumference;
    const medLen = (mediumSolved / totalQ) * circumference;
    const hardLen = (hardSolved / totalQ) * circumference;

    /* ---------- FONT SCALING ---------- */
    const solvedDigits = totalSolved.toString().length;

    const solvedFontSize =
        solvedDigits <= 2
            ? "text-3xl"
            : solvedDigits === 3
                ? "text-2xl"
                : solvedDigits === 4
                    ? "text-xl"
                    : "text-lg";

    return (
        <div className="w-full overflow-hidden">
            <div className="flex items-center gap-6 bg-[#1a1a1a] rounded-xl px-5 py-5">

                {/* LEFT: CIRCLE */}
                <div className="flex flex-col items-center shrink-0">
                    <div className="relative w-[120px] h-[120px]">
                        <svg
                            viewBox="0 0 120 120"
                            className="w-full h-full -rotate-90"
                        >
                            {/* Track */}
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                stroke="#2e2e2e"
                                strokeWidth={stroke}
                                fill="none"
                            />

                            {/* Easy */}
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                stroke="#00b8a3"
                                strokeWidth={stroke}
                                fill="none"
                                strokeDasharray={`${Math.max(0, easyLen - gap)} ${circumference}`}
                                strokeLinecap="round"
                            />

                            {/* Medium */}
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                stroke="#ffc01e"
                                strokeWidth={stroke}
                                fill="none"
                                strokeDasharray={`${Math.max(0, medLen - gap)} ${circumference}`}
                                strokeDashoffset={-easyLen}
                                strokeLinecap="round"
                            />

                            {/* Hard */}
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                stroke="#ef4743"
                                strokeWidth={stroke}
                                fill="none"
                                strokeDasharray={`${Math.max(0, hardLen - gap)} ${circumference}`}
                                strokeDashoffset={-(easyLen + medLen)}
                                strokeLinecap="round"
                            />
                        </svg>

                        {/* CENTER TEXT */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2px]">
                            <div className="flex items-baseline gap-1">
                                <span className={`${solvedFontSize} font-bold text-white leading-none`}>
                                    {totalSolved}
                                </span>
                                <span className="text-[9px] text-gray-500 font-mono leading-none">
                                    /{totalQ}
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                <span className="text-green-500 text-xs">✔</span>
                                <span className="text-[9px] text-gray-400 uppercase tracking-wide">
                                    Solved
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ATTEMPTING */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <span className="w-2 h-2 rounded-full bg-cyan-500/60" />
                        0 Attempting
                    </div>
                </div>

                {/* RIGHT: STATS */}
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                    <StatRow label="Easy" color="#00b8a3" value={easySolved} total={easyQ} />
                    <StatRow label="Med." color="#ffc01e" value={mediumSolved} total={medQ} />
                    <StatRow label="Hard" color="#ef4743" value={hardSolved} total={hardQ} />
                </div>
            </div>
        </div>
    );
}

/* ---------- STAT ROW ---------- */
function StatRow({
    label,
    color,
    value,
    total,
}: {
    label: string;
    color: string;
    value: number;
    total: number;
}) {
    return (
        <div className="bg-[#262626] rounded-lg px-3 py-2">
            <div className="flex justify-between items-center">
                <span className="text-xs font-medium" style={{ color }}>
                    {label}
                </span>
                <span className="text-sm font-bold text-white">
                    {value}
                    <span className="text-[10px] text-gray-500 font-mono ml-1">
                        /{total}
                    </span>
                </span>
            </div>
        </div>
    );
}
