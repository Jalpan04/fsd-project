import React, { useState } from 'react';
import { Code, Plus, X } from 'lucide-react';

interface TechStackDisplayProps {
    initialSkills?: string[];
    editable?: boolean;
    onUpdate?: (skills: string[]) => void;
}

export default function TechStackDisplay({ initialSkills = [], editable = false, onUpdate }: TechStackDisplayProps) {
    const [skills, setSkills] = useState<string[]>(initialSkills || []);
    const [newSkill, setNewSkill] = useState('');

    const handleAdd = () => {
        if (newSkill && !skills.includes(newSkill)) {
            const updated = [...skills, newSkill];
            setSkills(updated);
            setNewSkill('');
            if (onUpdate) onUpdate(updated);
        }
    };

    const handleRemove = (skillToRemove: string) => {
        const updated = skills.filter(s => s !== skillToRemove);
        setSkills(updated);
        if (onUpdate) onUpdate(updated);
    };

    // If read-only and empty, show nothing or placeholder? 
    // Show nothing for cleaner UI if not editable
    if (!editable && (!skills || skills.length === 0)) return null;

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm h-full">
            <div className="p-4 border-b border-border bg-black/20 flex items-center gap-2">
                <Code size={18} className="text-accent" />
                <h3 className="font-bold text-foreground">Tech Stack</h3>
            </div>
            
            <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                    {skills.map(skill => (
                        <span 
                            key={skill} 
                            className="group px-3 py-1.5 rounded-md bg-secondary text-foreground text-sm font-medium border border-border hover:border-accent/50 transition-colors flex items-center gap-2"
                        >
                            {skill}
                            {editable && (
                                <button 
                                    onClick={() => handleRemove(skill)}
                                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </span>
                    ))}
                    {skills.length === 0 && <span className="text-muted-foreground italic text-sm">No skills added yet.</span>}
                </div>

                {editable && (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            placeholder="Add skill (e.g. React)..."
                            className="flex-1 bg-activity border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground"
                        />
                        <button 
                            onClick={handleAdd}
                            disabled={!newSkill}
                            className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-md transition-colors disabled:opacity-50"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
