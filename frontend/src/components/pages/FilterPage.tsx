import { useState } from "react";
import type { FilterPageProps } from "../../types/pages";
import { MONTH_NAMES, WEEKDAY_LABELS, buildCalendarGrid } from "../../utils/calendarUtils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function FilterPage({ stats, calendar, notes, isLoading, onNoteSelect }: FilterPageProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const datesWithNotes = new Set(Object.values(calendar.dates));
    const grid = buildCalendarGrid(currentYear, currentMonth, datesWithNotes, selectedDate);

    function getDayTextColor(d: { isSelected: boolean; isToday: boolean; hasNotes: boolean }) {
        if (d.isSelected) return 'text-accent-foreground font-semibold';
        if (d.hasNotes) return 'text-foreground';
        return 'text-foreground/40';
    }

    function goToPreviousMonth() {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear((prev) => prev - 1);
        } else {
            setCurrentMonth((prev) => prev - 1);
        }
    }

    function goToNextMonth() {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear((prev) => prev + 1);
        } else {
            setCurrentMonth((prev) => prev + 1);
        }
    }

    function handleDayClick(day: number) {
        const monthStr = String(currentMonth).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
        setSelectedDate((prev) => (prev === dateKey ? null : dateKey));
    }

    function toggleTag(tag: string) {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    }

    function clearFilters() {
        setSelectedDate(null);
        setSelectedTags([]);
    }

    const hasActiveFilters = selectedDate !== null || selectedTags.length > 0;

    const filteredNotes = notes.filter((note) => {
        if (selectedDate && note.created_at !== selectedDate) return false;
        if (selectedTags.length > 0 && !selectedTags.every((tag) => note.tags.includes(tag))) return false;
        return true;
    });

    if (isLoading || !stats || !calendar) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-[13px] text-foreground/40">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex overflow-hidden">

            <div className="w-80 shrink-0 border-r border-border-hairline p-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-surface-2 border border-border-hairline rounded-xl p-4 text-center">
                        <p className="font-serif italic text-2xl text-foreground">{stats.total}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-foreground/50 mt-1">
                            Notas Totais
                        </p>
                    </div>
                    <div className="bg-surface-2 border border-border-hairline rounded-xl p-4 text-center">
                        <p className="font-serif italic text-2xl text-foreground">{stats.orphans}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-foreground/50 mt-1">
                            Órfãs
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/50">
                            {MONTH_NAMES[currentMonth - 1]} {currentYear}
                        </p>
                        <div className="flex gap-1">
                            <button onClick={goToPreviousMonth} className="text-foreground/40 hover:text-foreground/80 mt-1"><ChevronLeft size={12} /></button>
                            <button onClick={goToNextMonth} className="text-foreground/40 hover:text-foreground/80 mt-1"><ChevronRight size={12} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-y-2 text-center">
                        {WEEKDAY_LABELS.map((label, i) => (
                            <span key={i} className="text-[10px] text-foreground/40">{label}</span>
                        ))}
                        {grid.map((d, i) => (
                            <div key={i} className="flex items-center justify-center h-8">
                                {!d.isEmpty && (
                                    <button
                                        onClick={() => handleDayClick(d.day)}
                                        className={`
                                        relative w-10 h-7 flex items-center justify-center text-[13px] rounded-md
                                        ${getDayTextColor(d)}
                                        ${d.isToday ? 'ring-1 ring-accent' : ''}
                                        ${d.isSelected ? 'bg-accent' : ''}
                                      `}
                                    >
                                        {d.day}
                                        {d.hasNotes && !d.isSelected && (
                                            <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-foreground/30"></span>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-foreground/50 mb-3">
                        Filtrar por tag
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(stats.tags).map(([tag, count]) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] transition-colors
                                ${selectedTags.includes(tag)
                                        ? 'border-accent text-accent bg-accent-soft'
                                        : 'border-border-hairline text-foreground/80 hover:border-accent/40'
                                    }`}
                            >
                                #{tag}
                                <span className="text-foreground/40">{count}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>


            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-serif italic text-2xl text-foreground">
                        {hasActiveFilters ? 'Notas filtradas' : 'Todas as notas'}
                    </h2>

                    <div className="flex items-center gap-3">
                        <span className="text-[13px] text-foreground/40">{filteredNotes.length} resultados</span>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-[12px] text-foreground/40 hover:text-foreground/80 transition-colors"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {selectedDate && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border-hairline text-[12px] text-foreground/70">
                                {selectedDate}
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className="text-foreground/40 hover:text-foreground/80"
                                >
                                    <X size={10} />
                                </button>
                            </span>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {filteredNotes.map((note) => (
                        <button
                            key={note.title}
                            onClick={() => onNoteSelect(note.title)}
                            className="w-full text-left p-4 rounded-xl border border-border-hairline bg-surface/40 hover:border-accent/40 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[14px] font-medium text-foreground">{note.title}</p>
                                <p className="text-[14px] text-foreground/40">{note.created_at}</p>
                            </div>
                            <p className="text-[12px] text-foreground/40 mb-1">{note.title}.md</p>
                            {note.tags.length > 0 && (
                                <p className="text-[12px] text-foreground/50">
                                    {note.tags.map((tag) => `#${tag}`).join(' ')}
                                </p>
                            )}
                        </button>
                    ))}

                    {filteredNotes.length === 0 && (
                        <p className="text-[13px] text-foreground/40 text-center py-8">
                            Nenhuma nota corresponde aos filtros atuais.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
