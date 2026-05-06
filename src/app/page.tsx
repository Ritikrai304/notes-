"use client";

import { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";
import NoteList from "@/components/NoteList";
import NoteEditor from "@/components/NoteEditor";
import { Plus, Sparkles, Layout, Clock, Star, Settings, User, LogOut, Menu, X, BookOpen, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const stats = {
    total: notes.length,
    pinned: notes.filter(n => n.isPinned).length,
    tags: Array.from(new Set(notes.flatMap(n => n.tags))).length,
    recent: notes.filter(n => (Date.now() - n.updatedAt) < 86400000).length
  };

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

  const handlePinNote = (id: string) => {
    setNotes(
      notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
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

  const uploadPDF = async (pdf: string) => {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "PDF processing failed");
      }
      
      const data = await response.json();
      return data.extractedText;
    } catch (error: any) {
      console.error("PDF Error:", error);
      alert(`PDF Error: ${error.message}. Please check your API key and internet connection.`);
      throw error;
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-zinc-200 transition-transform duration-300 lg:relative lg:translate-x-0 dark:bg-zinc-900 dark:border-zinc-800",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-12">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              AI Notes
            </h1>
          </div>

          <nav className="flex-1 space-y-2">
            <button className="flex w-full items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
              <Layout size={20} /> Dashboard
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <BookOpen size={20} /> All Notes
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Star size={20} /> Favorites
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Clock size={20} /> Recent
            </button>
          </nav>

          <div className="mt-auto pt-6 space-y-4">
            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Storage</p>
              <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden dark:bg-zinc-700">
                <div className="h-full w-[45%] bg-indigo-600" />
              </div>
              <p className="text-[10px] mt-2 font-semibold text-zinc-500">45% of free plan used</p>
            </div>
            
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center text-xs font-bold">RR</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">Ritik Rai</p>
                <p className="text-[10px] text-zinc-500 truncate">Pro Account</p>
              </div>
              <Settings size={18} className="text-zinc-400 hover:text-zinc-600 cursor-pointer" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto z-10">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 lg:hidden dark:bg-zinc-950/80 dark:border-zinc-800">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <BrainCircuit className="text-indigo-600" size={24} />
              <span className="text-lg font-black">AI Notes</span>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-12">
          {/* Hero Section & Stats Dashboard */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 mb-2"
                >
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Ritik</span> 👋
                </motion.h2>
                <p className="text-zinc-500 font-medium">You have {stats.recent} new notes today. Let's create something amazing!</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: "Total Notes", value: stats.total, icon: BookOpen, color: "blue" },
                { label: "Pinned", value: stats.pinned, icon: Star, color: "amber" },
                { label: "AI Tags", value: stats.tags, icon: Sparkles, color: "purple" },
                { label: "Recent", value: stats.recent, icon: Clock, color: "emerald" }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all dark:bg-zinc-900 dark:border-zinc-800 group"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-12",
                    stat.color === "blue" ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30" :
                    stat.color === "amber" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30" :
                    stat.color === "purple" ? "bg-purple-50 text-purple-600 dark:bg-purple-950/30" :
                    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                  )}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <NoteList
            notes={notes}
            onDelete={handleDeleteNote}
            onPin={handlePinNote}
            onEdit={handleEditNote}
            onAdd={handleAddNote}
          />
        </main>
      </div>

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
