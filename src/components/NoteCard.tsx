import { Note } from "@/types/note";
import { formatDate } from "@/lib/utils";
import { Trash2, Tag, Calendar, Sparkles } from "lucide-react";

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onClick: (note: Note) => void;
}

export default function NoteCard({ note, onDelete, onClick }: NoteCardProps) {
  return (
    <div
      onClick={() => onClick(note)}
      className="group relative flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md cursor-pointer dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between">
        <h3 className="line-clamp-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {note.title || "Untitled Note"}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="rounded-lg p-1.5 text-zinc-400 transition-opacity hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
        {note.content || "No content..."}
      </p>

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
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Calendar size={14} />
          {formatDate(note.updatedAt)}
        </div>
        {note.tags.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Tag size={14} />
            <div className="flex gap-1">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
