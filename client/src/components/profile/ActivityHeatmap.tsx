import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Loader2, Activity } from 'lucide-react';

interface HeatmapData {
    date: string;
    count: number;
    score: number;
}

interface ActivityHeatmapProps {
    username: string;
}

export default function ActivityHeatmap({ username }: ActivityHeatmapProps) {
    const [data, setData] = useState<HeatmapData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeatmap = async () => {
            try {
                const res = await api.get(`/users/${username}/heatmap`);
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch heatmap', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHeatmap();
    }, [username]);

    if (loading) {
        return <div className="h-40 flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin mr-2" /> Loading activity...</div>;
    }

    // Generate last 365 days
    const today = new Date();
    const days = [];
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    // Map data to days hash
    const dataMap: Record<string, number> = {};
    data.forEach(d => {
        dataMap[d.date] = d.count;
    });

    // Color intensity - Using Burnt Terracotta (Primary) scale
    const getColor = (count: number) => {
        if (!count) return 'bg-activity/50'; // Empty state
        if (count == 1) return 'bg-primary/30'; 
        if (count <= 3) return 'bg-primary/50';
        if (count <= 5) return 'bg-primary/80';
        return 'bg-primary'; // Max intensity
    };

    return (
        <div className="w-full bg-card border border-border rounded-lg p-6 overflow-x-auto shadow-sm" key="heatmap-v2">
             <h3 className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm bg-primary" /> 
                contribution graph
                <span className="ml-auto text-xs font-normal text-muted-foreground">{data.reduce((acc, curr) => acc + curr.count, 0)} contributions in the last year</span>
            </h3>
            
            <div className="flex gap-1 min-w-[max-content]">
                {/* 
                   Grid of 7 rows (days of week)
                   Columns = Weeks implied by grid-flow-col
                */}
                <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                    {days.map(dateStr => {
                         const count = dataMap[dateStr] || 0;
                         return (
                             <div 
                                key={dateStr}
                                className={`w-3 h-3 rounded-sm ${getColor(count)} hover:ring-1 hover:ring-accent transition-all`}
                                title={`${count} contributions on ${dateStr}`}
                             />
                         );
                    })}
                </div>
            </div>
        </div>
    );
}
