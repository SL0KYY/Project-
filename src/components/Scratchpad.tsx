import React, { useState } from 'react';
import { Note, Task } from '../types';
import { Plus, Pin, Trash2, Copy, Check, FileText, ArrowRight, Search } from 'lucide-react';

interface ScratchpadProps {
  notes: Note[];
  onSaveNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onConvertToTask: (note: Note) => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
  onConvertToTask,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: '',
      tags: ['General'],
      pinned: false,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onSaveNote(newNote);
    setSelectedNoteId(newNote.id);
    setIsPreview(false);
  };

  const handleUpdateTitle = (title: string) => {
    if (!selectedNote) return;
    onSaveNote({
      ...selectedNote,
      title,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  const handleUpdateContent = (content: string) => {
    if (!selectedNote) return;
    onSaveNote({
      ...selectedNote,
      content,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  const handleTogglePin = () => {
    if (!selectedNote) return;
    onSaveNote({
      ...selectedNote,
      pinned: !selectedNote.pinned,
    });
  };

  const handleCopy = () => {
    if (!selectedNote) return;
    navigator.clipboard.writeText(`${selectedNote.title}\n\n${selectedNote.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Word count & read time
  const text = selectedNote?.content || '';
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readTimeMin = Math.ceil(wordCount / 200);

  // Filter notes
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Executive Scratchpad & Notes
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Capture specs, meeting highlights, and architectural scratchpad
          </p>
        </div>

        <button
          onClick={handleCreateNote}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left: Notes Sidebar List */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {filteredNotes.map((note) => {
              const isSelected = note.id === selectedNote?.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold truncate flex items-center gap-1.5">
                      {note.pinned && <Pin className="w-3 h-3 text-amber-500 fill-current shrink-0" />}
                      <span>{note.title || 'Untitled Note'}</span>
                    </h4>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-1">
                    {note.content || 'Empty note...'}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono tabular-nums mt-1.5">
                    <span>{note.updatedAt}</span>
                    <span>·</span>
                    <span>{note.tags.join(', ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Note Editor & Preview (2 cols) */}
        {selectedNote ? (
          <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
            {/* Editor Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
                >
                  {isPreview ? 'Edit Mode' : 'Markdown Preview'}
                </button>
                <button
                  onClick={handleTogglePin}
                  className={`p-1.5 rounded-md transition-colors ${
                    selectedNote.pinned
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
                      : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                  title={selectedNote.pinned ? 'Unpin' : 'Pin note'}
                >
                  <Pin className="w-4 h-4 fill-current" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => onConvertToTask(selectedNote)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  title="Convert this note into a Sprint Task"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>To Task</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Delete this note?')) {
                      onDeleteNote(selectedNote.id);
                    }
                  }}
                  className="p-1.5 text-neutral-400 hover:text-red-500 rounded-md transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Title Input */}
            <input
              type="text"
              value={selectedNote.title}
              onChange={(e) => handleUpdateTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full text-base font-semibold bg-transparent border-0 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />

            {/* Note Content */}
            {isPreview ? (
              <div className="prose dark:prose-invert max-w-none min-h-[350px] p-2 text-sm leading-relaxed whitespace-pre-wrap font-sans text-neutral-800 dark:text-neutral-200">
                {selectedNote.content || '(Empty note content)'}
              </div>
            ) : (
              <textarea
                rows={16}
                value={selectedNote.content}
                onChange={(e) => handleUpdateContent(e.target.value)}
                placeholder="Start writing markdown notes, architecture decisions, or meeting briefs..."
                className="w-full p-2 text-sm font-mono leading-relaxed bg-neutral-50/50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-neutral-400 resize-none"
              />
            )}

            {/* Footer Metrics */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono tabular-nums">
              <span>{wordCount} words · {readTimeMin}m read</span>
              <span>Last updated: {selectedNote.updatedAt}</span>
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 p-12 text-center text-neutral-400 text-xs">
            Select or create a note to start editing.
          </div>
        )}
      </div>
    </div>
  );
};
