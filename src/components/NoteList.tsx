"use client";

import { Note } from "@/types/note";
import NoteCard from "./NoteCard";
import { Plus, Search, Filter } from "lucide-react";
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

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const matchesSearch = 
          note.title.toLowerCase().includes(search.toLowerCase()) ||
          note.content.toLowerCase().includes(search.toLowerCase()) ||
          note.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
        return matchesSearch;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
  }, [notes, search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search notes or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900/50"
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
