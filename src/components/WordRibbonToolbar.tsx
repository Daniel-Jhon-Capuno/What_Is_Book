import React, { useState } from 'react';
import type { LiteraryWork, BookWork, AutoSaveInterval } from '../types';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignJustify, 
  BookOpen, 
  Eye, 
  Download, 
  FileCode, 
  Image, 
  SlidersHorizontal, 
  Plus, 
  ChevronDown, 
  Maximize2, 
  Minimize2, 
  Check, 
  Library, 
  Layers 
} from 'lucide-react';

interface WordRibbonToolbarProps {
  work: LiteraryWork;
  fontFamily: string;
  fontSize: number;
  textAlignment: 'left' | 'center' | 'justify';
  hasDropcap: boolean;
  isZenMode: boolean;
  autoSaveInterval: AutoSaveInterval;
  lastSavedAt: number;
  isSaving?: boolean;
  onFontFamilyChange: (font: string) => void;
  onFontSizeChange: (size: number) => void;
  onTextAlignmentChange: (align: 'left' | 'center' | 'justify') => void;
  onToggleDropcap: () => void;
  onInsertOrnament: (ornament: string) => void;
  onToggleZenMode: () => void;
  onOpenDetails: () => void;
  onOpenSimulation: () => void;
  onOpenBookshelf: () => void;
  onExportHtml: () => void;
  onOpenSnapshot?: () => void;
  onOpenBackupModal: () => void;
  // Chapter specific for Books
  activeChapterId?: string;
  onSelectChapter?: (chId: string) => void;
  onAddChapter?: () => void;
}

export const WordRibbonToolbar: React.FC<WordRibbonToolbarProps> = ({
  work,
  fontFamily,
  fontSize,
  textAlignment,
  hasDropcap,
  isZenMode,
  autoSaveInterval,
  lastSavedAt,
  isSaving = false,
  onFontFamilyChange,
  onFontSizeChange,
  onTextAlignmentChange,
  onToggleDropcap,
  onInsertOrnament,
  onToggleZenMode,
  onOpenDetails,
  onOpenSimulation,
  onOpenBookshelf,
  onExportHtml,
  onOpenSnapshot,
  onOpenBackupModal,
  activeChapterId,
  onSelectChapter,
  onAddChapter,
}) => {
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [showChapterMenu, setShowChapterMenu] = useState<boolean>(false);

  const isBook = work.type === 'book';
  const bookWork = isBook ? (work as BookWork) : null;
  const currentChapter = bookWork?.chapters.find((c) => c.id === activeChapterId) || bookWork?.chapters[0];

  const formattedTime = lastSavedAt 
    ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <div className="bg-[#FAFDF3] border-b-2 border-[#215E61]/25 px-4 py-2 sticky top-0 z-40 shadow-xs backdrop-blur-md select-none shrink-0">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        
        {/* Left Section: Bookshelf Trigger & Word-style Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Bookshelf Menu Button (Pulls up the 3D Library Bookshelf) */}
          <button
            onClick={onOpenBookshelf}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] text-xs font-serif font-bold shadow-xs transition-all cursor-pointer"
            title="Open Interactive Library Bookshelf"
          >
            <Library size={14} />
            <span>Bookshelf Menu</span>
          </button>

          <div className="h-5 w-[1px] bg-[#215E61]/25 mx-1 hidden sm:block" />

          {/* Chapter Selector Dropdown (for Books) */}
          {isBook && bookWork && (
            <div className="relative">
              <button
                onClick={() => setShowChapterMenu(!showChapterMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#215E61]/25 hover:border-[#215E61] bg-white text-xs font-serif font-bold text-[#215E61] shadow-2xs transition-all cursor-pointer"
              >
                <BookOpen size={13} />
                <span className="max-w-[140px] truncate">{currentChapter?.title || 'Chapter 1'}</span>
                <ChevronDown size={12} className="opacity-60" />
              </button>

              {showChapterMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowChapterMenu(false)} />
                  <div className="absolute left-0 mt-1 w-64 bg-[#F5FBE6] border border-[#215E61]/25 rounded-xl shadow-xl z-40 p-2 space-y-1">
                    <div className="text-[10px] uppercase font-serif tracking-widest text-[#536D7D] px-2 py-1">
                      Book Chapters
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {bookWork.chapters.map((ch, idx) => (
                        <button
                          key={ch.id}
                          onClick={() => {
                            onSelectChapter?.(ch.id);
                            setShowChapterMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-serif flex items-center justify-between transition-colors ${
                            ch.id === currentChapter?.id
                              ? 'bg-[#215E61] text-[#F5FBE6] font-semibold'
                              : 'text-[#233D4D] hover:bg-[#215E61]/10'
                          }`}
                        >
                          <span className="truncate">{idx + 1}. {ch.title}</span>
                          {ch.id === currentChapter?.id && <Check size={12} />}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        onAddChapter?.();
                        setShowChapterMenu(false);
                      }}
                      className="w-full mt-1.5 pt-1.5 border-t border-[#215E61]/15 flex items-center justify-center gap-1.5 py-1.5 text-xs text-[#215E61] font-semibold hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus size={13} /> Add Chapter
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Font Selector */}
          <div className="flex items-center bg-white rounded-lg border border-[#215E61]/20 px-1 py-0.5 text-xs">
            <select
              value={fontFamily}
              onChange={(e) => onFontFamilyChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#233D4D] focus:outline-none cursor-pointer pr-1 py-1"
            >
              <option value="'EB Garamond', Georgia, serif">EB Garamond (Classic Book)</option>
              <option value="'Cormorant Garamond', Georgia, serif">Cormorant Garamond (Fine Print)</option>
              <option value="'Cinzel', Georgia, serif">Cinzel (Classical Heading)</option>
              <option value="'Newsreader', Georgia, serif">Newsreader (Editorial)</option>
            </select>
          </div>

          {/* Font Size controls */}
          <div className="flex items-center bg-white rounded-lg border border-[#215E61]/20 px-1 py-0.5 text-xs">
            <button
              onClick={() => onFontSizeChange(Math.max(14, fontSize - 1))}
              className="px-2 py-0.5 hover:bg-[#215E61]/10 rounded text-[#215E61] font-bold cursor-pointer"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="px-1.5 font-mono text-[11px] text-[#536D7D]">{fontSize}px</span>
            <button
              onClick={() => onFontSizeChange(Math.min(32, fontSize + 1))}
              className="px-2 py-0.5 hover:bg-[#215E61]/10 rounded text-[#215E61] font-bold cursor-pointer"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          <div className="h-5 w-[1px] bg-[#215E61]/20 mx-1 hidden sm:block" />

          {/* Text Alignment */}
          <div className="flex items-center bg-white rounded-lg border border-[#215E61]/20 p-0.5 text-xs">
            <button
              onClick={() => onTextAlignmentChange('left')}
              className={`p-1.5 rounded transition-colors ${
                textAlignment === 'left' ? 'bg-[#215E61] text-[#F5FBE6]' : 'text-[#233D4D] hover:text-[#215E61]'
              }`}
              title="Align Left"
            >
              <AlignLeft size={13} />
            </button>
            <button
              onClick={() => onTextAlignmentChange('center')}
              className={`p-1.5 rounded transition-colors ${
                textAlignment === 'center' ? 'bg-[#215E61] text-[#F5FBE6]' : 'text-[#233D4D] hover:text-[#215E61]'
              }`}
              title="Align Center"
            >
              <AlignCenter size={13} />
            </button>
            <button
              onClick={() => onTextAlignmentChange('justify')}
              className={`p-1.5 rounded transition-colors ${
                textAlignment === 'justify' ? 'bg-[#215E61] text-[#F5FBE6]' : 'text-[#233D4D] hover:text-[#215E61]'
              }`}
              title="Justify"
            >
              <AlignJustify size={13} />
            </button>
          </div>

          {/* Drop Cap Toggle */}
          <button
            onClick={onToggleDropcap}
            className={`px-2.5 py-1 rounded-lg border text-xs font-serif font-bold transition-all cursor-pointer ${
              hasDropcap
                ? 'bg-[#215E61] text-[#F5FBE6] border-[#215E61]'
                : 'bg-white hover:bg-[#215E61]/5 border-[#215E61]/20 text-[#215E61]'
            }`}
            title="Toggle Classic Drop Cap for opening chapter lines"
          >
            Dropcap ¶
          </button>

          {/* Insert Flourish Ornaments */}
          <div className="flex items-center bg-white rounded-lg border border-[#215E61]/20 p-0.5 text-xs">
            <button
              onClick={() => onInsertOrnament('\n\n✦ ✦ ✦\n\n')}
              className="px-2 py-0.5 hover:bg-[#215E61]/10 rounded text-[#215E61] cursor-pointer"
              title="Insert Stars Divider (✦ ✦ ✦)"
            >
              ✦
            </button>
            <button
              onClick={() => onInsertOrnament('\n\n❦\n\n')}
              className="px-2 py-0.5 hover:bg-[#215E61]/10 rounded text-[#215E61] cursor-pointer"
              title="Insert Floral Heart Ornament (❦)"
            >
              ❦
            </button>
            <button
              onClick={() => onInsertOrnament('\n\n— — —\n\n')}
              className="px-2 py-0.5 hover:bg-[#215E61]/10 rounded text-[#215E61] cursor-pointer"
              title="Insert Classic Dash Divider"
            >
              —
            </button>
          </div>
        </div>

        {/* Right Section: Clean Action Buttons & Menus */}
        <div className="flex items-center gap-2">
          
          {/* Details & Context Drawer Button */}
          <button
            onClick={onOpenDetails}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#215E61]/30 hover:border-[#215E61] bg-white text-xs font-semibold text-[#215E61] transition-all cursor-pointer shadow-2xs"
            title="Edit Title, Author, Dedication & Context"
          >
            <SlidersHorizontal size={13} />
            <span className="hidden md:inline">Manuscript Info</span>
          </button>

          {/* Simulate / Read Book Volume */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Read in physical book simulation"
          >
            <Eye size={13} />
            <span className="hidden sm:inline">Simulate Book</span>
          </button>

          {/* Clean Unified Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#215E61]/30 hover:border-[#215E61] bg-white text-xs font-semibold text-[#233D4D] shadow-2xs transition-all cursor-pointer"
            >
              <Download size={13} className="text-[#215E61]" />
              <span>Export</span>
              <ChevronDown size={11} className="opacity-60" />
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-1 w-56 bg-[#F5FBE6] border border-[#215E61]/25 rounded-xl shadow-xl z-40 p-1.5 space-y-1 text-xs">
                  <button
                    onClick={() => {
                      onExportHtml();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 text-[#233D4D] font-medium"
                  >
                    <FileCode size={14} className="text-[#215E61]" />
                    <div>
                      <div className="font-semibold">Standalone HTML Book</div>
                      <div className="text-[10px] text-[#536D7D]">Self-contained offline reader</div>
                    </div>
                  </button>

                  {onOpenSnapshot && (
                    <button
                      onClick={() => {
                        onOpenSnapshot();
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 text-[#233D4D] font-medium"
                    >
                      <Image size={14} className="text-[#215E61]" />
                      <div>
                        <div className="font-semibold">Snapshot Image (.PNG)</div>
                        <div className="text-[10px] text-[#536D7D]">High-resolution card for social/print</div>
                      </div>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Zen Focus Mode Toggle */}
          <button
            onClick={onToggleZenMode}
            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              isZenMode 
                ? 'bg-[#215E61] text-[#F5FBE6] border-[#215E61]' 
                : 'bg-white border-[#215E61]/20 text-[#536D7D] hover:text-[#215E61]'
            }`}
            title={isZenMode ? 'Exit Zen Focus Mode' : 'Enter Zen Focus Mode (Distraction-free)'}
          >
            {isZenMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Auto-save status indicator with distinct 'Saving...' vs 'Saved' state */}
          <button
            onClick={onOpenBackupModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#215E61]/20 bg-white/70 hover:bg-white text-[11px] text-[#233D4D] shadow-2xs transition-all cursor-pointer"
            title={`Auto-saving every ${autoSaveInterval}m. Click to configure interval or view revisions.`}
          >
            {isSaving ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-amber-700 font-semibold">Saving...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-[#215E61] font-medium hidden sm:inline">Saved</span>
                <span className="text-[#536D7D] hidden md:inline">({formattedTime})</span>
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
};
