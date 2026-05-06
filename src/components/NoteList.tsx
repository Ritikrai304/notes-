"use client";

import { Note } from "@/types/note";
import NoteCard from "./NoteCard";
import { Plus, Search, Sparkles, Loader2, X } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NoteListProps {
  notes: Note[];
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onEdit: (note: Note) => void;
  onAdd: () => void;
}

export default function NoteList({
  notes,
  onDelete,
  onPin,
  onEdit,
  onAdd,
}: NoteListProps) {
  const [search, setSearch] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [relevantIds, setRelevantIds] = useState<string[] | null>(null);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiSearching(true);
    try {
      const response = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiQuery, notes }),
      });
      const data = await response.json();
      if (data.relevantIds) {
        setRelevantIds(data.relevantIds);
      }
    } catch (error) {
      console.error("AI Search failed:", error);
    } finally {
      setIsAiSearching(false);
    }
  };

  const clearAiSearch = () => {
    setAiQuery("");
    setRelevantIds(null);
  };

  const filteredNotes = useMemo(() => {
    let result = notes;

    if (relevantIds !== null) {
      // Filter by AI results
      result = notes.filter(n => relevantIds.includes(n.id));
      // Sort by AI relevance order
      result.sort((a, b) => relevantIds.indexOf(a.id) - relevantIds.indexOf(b.id));
    } else {
      // Normal filtering
      result = notes.filter((note) => {
        const matchesSearch = 
          note.title.toLowerCase().includes(search.toLowerCase()) ||
          note.content.toLowerCase().includes(search.toLowerCase()) ||
          note.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
        return matchesSearch;
      });
      
      // Standard sorting
      result.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
    }
    
    return result;
  }, [notes, search, relevantIds]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search notes or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={relevantIds !== null}
              className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900/50 disabled:opacity-50"
            />
          </div>
          
          <button
            onClick={onAdd}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-500/40 active:scale-95"
          >
            <Plus size={20} />
            Create New Note
          </button>
        </div>

        {/* Ask AI Search Bar */}
        <form onSubmit={handleAiSearch} className="relative">
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-xl transition-all hover:shadow-indigo-500/20">
            <div className="relative flex items-center bg-white dark:bg-zinc-950 rounded-[23px] overflow-hidden">
              <Sparkles className="ml-4 text-indigo-500" size={20} />
              <input
                type="text"
                placeholder="Ask AI: 'Find notes about my last meeting' or 'What did I plan for dinner?'"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="w-full bg-transparent py-4 pl-3 pr-4 outline-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 font-medium"
              />
              {relevantIds !== null || aiQuery ? (
                <button
                  type="button"
                  onClick={clearAiSearch}
                  className="mr-2 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X size={20} />
                </button>
              ) : null}
              <button
                type="submit"
                disabled={isAiSearching || !aiQuery.trim()}
                className="mr-2 rounded-2xl bg-zinc-900 dark:bg-zinc-100 px-6 py-2 text-sm font-bold text-white dark:text-zinc-900 transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {isAiSearching ? <Loader2 size={18} className="animate-spin" /> : "Ask"}
              </button>
            </div>
          </div>
          {relevantIds !== null && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-2"
            >
              <Sparkles size={14} />
              AI found {relevantIds.length} relevant notes for your query
            </motion.p>
          )}
        </form>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-zinc-100 p-6 dark:bg-zinc-900">
            <Search size={40} className="text-zinc-300" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {search ? "No matches found" : "No notes yet"}
          </h3>
          <p className="mt-2 text-zinc-500">
            {search ? "Try searching for something else" : "Start by creating your first AI-powered note!"}
          </p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={onDelete}
                onPin={onPin}
                onClick={onEdit}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
