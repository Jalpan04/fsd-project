import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    isToday,
    setMonth,
    setYear,
    getYear
} from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    label?: string;
    placeholder?: string;
}

export default function DatePicker({ value, onChange, label, placeholder = "Select date" }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    // Initialize viewDate to selected date or today
    const [viewDate, setViewDate] = useState(() => value ? new Date(value) : new Date());
    const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('day'); // Current step

    const containerRef = useRef<HTMLDivElement>(null);

    // Reset flow when opening
    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setViewMode('year'); // Start with Year as requested
        }
    };

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Calendar generation logic
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Generate a range of years (e.g., current year - 100 to current year + 10)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 60 }, (_, i) => currentYear - 50 + i); 

    const handleDayClick = (day: Date) => {
        onChange(format(day, 'yyyy-MM-dd'));
        setIsOpen(false);
    };

    const nextMonth = () => setViewDate(addMonths(viewDate, 1));
    const prevMonth = () => setViewDate(subMonths(viewDate, 1));

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = setMonth(viewDate, monthIndex);
        setViewDate(newDate);
        setViewMode('day'); // Advance to Day
    };

    const handleYearSelect = (year: number) => {
        const newDate = setYear(viewDate, year);
        setViewDate(newDate);
        setViewMode('month'); // Advance to Month
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && (
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    {label}
                </label>
            )}
            
            {/* Input Trigger - Sleek Glass-like Button */}
            <div 
                onClick={handleOpen}
                className={twMerge(
                    "flex items-center w-full px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 border",
                    "bg-secondary/20 border-border hover:bg-secondary/40 hover:border-primary/50 text-foreground",
                    "backdrop-blur-sm shadow-sm",
                    isOpen && "border-primary ring-1 ring-primary/20 bg-secondary/50"
                )}
            >
                <CalendarIcon size={18} className={clsx("mr-3 transition-colors", isOpen ? "text-primary" : "text-muted-foreground")} />
                <span className={clsx("font-medium", !value && "text-muted-foreground opacity-70")}>
                    {value ? format(new Date(value), 'PPP') : placeholder}
                </span>
            </div>

            {/* Premium Dropdown Calendar */}
            {isOpen && (
                <div className="absolute z-50 mt-2 p-4 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl w-[320px] animate-in fade-in zoom-in-95 duration-200 origin-top-left overflow-hidden">
                    
                    {/* Header: Dynamic based on View Mode */}
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                        {viewMode === 'day' && (
                            <button 
                                type="button"
                                onClick={prevMonth} 
                                className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all active:scale-95"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        )}
                        
                        {/* Title Logic */}
                        <div className="flex-1 text-center">
                             {viewMode === 'year' && <span className="font-bold text-foreground">Select Year</span>}
                             {viewMode === 'month' && (
                                <button onClick={() => setViewMode('year')} className="font-bold text-foreground hover:text-primary transition-colors">
                                    {format(viewDate, 'yyyy')}
                                </button>
                             )}
                             {viewMode === 'day' && (
                                <button onClick={() => setViewMode('month')} className="font-bold text-foreground hover:text-primary transition-colors">
                                    {format(viewDate, 'MMMM yyyy')}
                                </button>
                             )}
                        </div>

                        {viewMode === 'day' && (
                            <button 
                                type="button"
                                onClick={nextMonth} 
                                className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all active:scale-95"
                            >
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </div>

                    {/* VIEW: YEARS */}
                    {viewMode === 'year' && (
                        <div className="grid grid-cols-4 gap-2 h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent animate-in slide-in-from-left-2">
                             {years.map((year) => (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => handleYearSelect(year)}
                                    // Auto scroll to selected year logic could be added here
                                    className={twMerge(
                                        "text-sm py-2 rounded-md transition-colors",
                                        year === getYear(viewDate)
                                            ? "bg-primary/20 text-primary font-bold border border-primary/30"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* VIEW: MONTHS */}
                    {viewMode === 'month' && (
                        <div className="grid grid-cols-3 gap-3 h-[200px] content-start animate-in slide-in-from-right-2">
                            {months.map((m, idx) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => handleMonthSelect(idx)}
                                    className={twMerge(
                                        "text-sm py-2 rounded-md transition-colors",
                                        idx === viewDate.getMonth() 
                                            ? "bg-primary/20 text-primary font-bold border border-primary/30"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    {m.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* VIEW: DAYS */}
                    {viewMode === 'day' && (
                        <div className="animate-in slide-in-from-right-2">
                            {/* Weekdays */}
                            <div className="grid grid-cols-7 mb-3">
                                {weekDays.map(day => (
                                    <div key={day} className="text-center text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, idx) => {
                                    const isSelected = value ? isSameDay(day, new Date(value)) : false;
                                    const isCurrentMonth = isSameMonth(day, monthStart);
                                    const isTodayDate = isToday(day);

                                    return (
                                        <button
                                            key={day.toString()}
                                            type="button"
                                            onClick={() => handleDayClick(day)}
                                            className={twMerge(
                                                "h-9 w-9 text-sm rounded-lg flex items-center justify-center transition-all duration-200 relative group",
                                                !isCurrentMonth && "text-muted-foreground/10 font-normal",
                                                isCurrentMonth && "text-foreground font-medium hover:bg-secondary hover:text-accent",
                                                isTodayDate && !isSelected && "text-primary font-bold border border-primary/30",
                                                isSelected && "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-105 active:scale-95 font-bold"
                                            )}
                                        >
                                            {format(day, 'd')}
                                            {isTodayDate && !isSelected && (
                                                <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
