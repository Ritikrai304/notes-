"use client";

import { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { X, Save, Sparkles, Loader2, Plus, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Partial<Note>) => void;
  onClose: () => void;
  onGenerateAI: (content: string) => Promise<{ summary: string; tags: string[] }>;
}

export default function NoteEditor({
  note,
  onSave,
  onClose,
  onGenerateAI,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
    } else {
      setTitle("");
      setContent("");
      setTags([]);
    }
  }, [note]);

  const handleSave = () => {
    onSave({
      title,
      content,
      tags,
    });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAI = async () => {
    if (!content.trim()) return;
    setIsGenerating(true);
    try {
      const result = await onGenerateAI(content);
      onSave({
        title,
        content,
        tags: [...new Set([...tags, ...result.tags])],
        summary: result.summary,
      });
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex h-full max-h-[800px] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {note ? "Edit Note" : "New Note"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4 w-full bg-transparent text-2xl font-bold outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
          />

          <div className="mb-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {tag}
                <button onClick={() => removeTag(tag)}>
                  <X size={14} />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-2 rounded-full border border-dashed border-zinc-300 px-3 py-1 dark:border-zinc-700">
              <TagIcon size={14} className="text-zinc-400" />
              <input
                type="text"
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-20 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <textarea
            placeholder="Start writing..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-[300px] w-full resize-none bg-transparent text-lg outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
          />
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 p-4 dark:border-zinc-800">
          <button
            onClick={handleAI}
            disabled={isGenerating || !content.trim()}
            className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 disabled:opacity-50 dark:bg-indigo-950/30 dark:text-indigo-400"
          >
            {isGenerating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            AI Enhance
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Save size={18} />
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
