"use client";

import { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { X, Save, Sparkles, Loader2, Plus, Tag as TagIcon, Camera, Mic, MicOff, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Partial<Note>) => void;
  onClose: () => void;
  onGenerateAI: (content: string) => Promise<{ summary: string; tags: string[] }>;
  onCaptureImage: (base64Image: string) => Promise<string>;
}

export default function NoteEditor({
  note,
  onSave,
  onClose,
  onGenerateAI,
  onCaptureImage,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleCameraClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsCapturing(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Image = reader.result as string;
          const extractedText = await onCaptureImage(base64Image);
          if (extractedText) {
            setContent((prev) => (prev ? `${prev}\n\n${extractedText}` : extractedText));
          }
        } catch (error) {
          console.error("Failed to extract text:", error);
        } finally {
          setIsCapturing(false);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setContent((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
      }
    };

    recognition.start();

    // Auto-stop after 10 seconds of silence or if user toggles
    setTimeout(() => {
      if (isListening) recognition.stop();
    }, 15000);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("note-content-to-export");
    if (!element) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${title || "note"}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      setIsExporting(false);
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

        {/* Note Content */}
        <div id="note-content-to-export" className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-950">
          <div className="max-w-3xl mx-auto space-y-6">
            <input
              type="text"
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-3xl font-bold text-zinc-900 outline-none placeholder:text-zinc-300 dark:text-zinc-100"
            />

            <div className="flex flex-wrap gap-2">
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
              placeholder="Start writing your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] w-full resize-none bg-transparent text-lg text-zinc-600 outline-none placeholder:text-zinc-300 dark:text-zinc-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 p-4 dark:border-zinc-800">
          <div className="flex gap-2">
            <button
              onClick={handleAI}
              disabled={isGenerating || isCapturing || !content.trim()}
              className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 disabled:opacity-50 dark:bg-indigo-950/30 dark:text-indigo-400"
            >
              {isGenerating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              AI Enhance
            </button>

            <button
              onClick={handleCameraClick}
              disabled={isCapturing || isGenerating || isListening}
              className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/30 dark:text-emerald-400"
            >
              {isCapturing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Camera size={18} />
              )}
              Camera
            </button>

            <button
              onClick={toggleListening}
              disabled={isGenerating || isCapturing}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                isListening 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-950/30 dark:text-orange-400"
              )}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              {isListening ? "Listening..." : "Voice"}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting || !content.trim()}
              className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-950/30 dark:text-blue-400"
            >
              {isExporting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              Export PDF
            </button>
          </div>

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
