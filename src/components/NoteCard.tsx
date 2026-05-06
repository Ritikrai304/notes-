import { Note } from "@/types/note";
import { formatDate } from "@/lib/utils";
import { Trash2, Tag, Calendar, Sparkles, Pin, PinOff } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onClick: (note: Note) => void;
}

export default function NoteCard({ note, onDelete, onPin, onClick }: NoteCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      onClick={() => onClick(note)}
      className="group relative flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-xl cursor-pointer dark:border-zinc-800 dark:bg-zinc-900/50 dark:backdrop-blur-sm"
    >
      {note.isPinned && (
        <div className="absolute -top-2 -right-2 rounded-full bg-indigo-600 p-1.5 text-white shadow-lg z-10">
          <Pin size={14} fill="currentColor" />
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {note.title || "Untitled Note"}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin(note.id);
            }}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30"
          >
            {note.isPinned ? <PinOff size={18} /> : <Pin size={18} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="prose prose-sm dark:prose-invert line-clamp-3 text-zinc-600 dark:text-zinc-400">
          <ReactMarkdown>{note.content || "No content..."}</ReactMarkdown>
        </div>
      </div>

      {note.summary && (
        <div className="mt-2 rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950/30">
          <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles size={12} />
            AI Summary
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 italic">
            {note.summary}
          </p>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-zinc-400">
          <Calendar size={12} />
          {formatDate(note.updatedAt)}
        </div>
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-indigo-50/50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
