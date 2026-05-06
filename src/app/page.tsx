"use client";

import { useState, useEffect } from "react";
import { Note } from "@/types/note";
import NoteList from "@/components/NoteList";
import NoteEditor from "@/components/NoteEditor";
import { Sparkles } from "lucide-react";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load notes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ai-notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ai-notes", JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  const handleAddNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      setNotes(notes.filter((n) => n.id !== id));
    }
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    if (editingNote) {
      // Update existing
      setNotes(
        notes.map((n) =>
          n.id === editingNote.id
            ? { ...n, ...noteData, updatedAt: Date.now() } as Note
            : n
        )
      );
    } else {
      // Create new
      const newNote: Note = {
        id: Math.random().toString(36).substr(2, 9),
        title: noteData.title || "Untitled",
        content: noteData.content || "",
        tags: noteData.tags || [],
        summary: noteData.summary,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setNotes([newNote, ...notes]);
    }
    setIsEditorOpen(false);
  };

  const generateAI = async (content: string) => {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "AI failed to process the request");
      }
      
      return response.json();
    } catch (error: any) {
      console.error("AI Error:", error);
      alert(`AI Error: ${error.message}. Please check your API key and internet connection.`);
      throw error;
    }
  };

  const captureImage = async (image: string) => {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Vision failed to process the request");
      }
      
      const data = await response.json();
      return data.extractedText;
    } catch (error: any) {
      console.error("Vision Error:", error);
      alert(`Vision Error: ${error.message}. Please check your API key and internet connection.`);
      throw error;
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-indigo-600 p-2 text-white">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI Notes</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-500">
              {notes.length} Notes
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <NoteList
          notes={notes}
          onDelete={handleDeleteNote}
          onEdit={handleEditNote}
          onAdd={handleAddNote}
        />
      </main>

      {isEditorOpen && (
        <NoteEditor
          note={editingNote}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveNote}
          onGenerateAI={generateAI}
          onCaptureImage={captureImage}
        />
      )}
    </div>
  );
}
