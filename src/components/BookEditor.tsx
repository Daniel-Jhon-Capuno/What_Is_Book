import React from 'react';
import type { BookWork } from '../types';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  BookOpen, 
  Layers, 
  Eye, 
  Clock, 
  FileText 
} from 'lucide-react';

interface BookEditorProps {
  book: BookWork;
  activeChapterId: string;
  fontFamily: string;
  fontSize: number;
  textAlignment: 'left' | 'center' | 'justify';
  hasDropcap: boolean;
  bookViewMode: 'single' | 'all';
  onToggleBookViewMode: (mode: 'single' | 'all') => void;
  onSelectChapter: (chapterId: string) => void;
  onAddChapter: () => void;
  onDeleteChapter?: (chapterId: string) => void;
  onMoveChapter?: (chapterId: string, direction: 'up' | 'down') => void;
  onChange: (updated: BookWork) => void;
  onUpdateChapterTitle: (title: string, chapterId?: string) => void;
  onUpdateChapterSubtitle: (subtitle: string, chapterId?: string) => void;
  onUpdateChapterContent: (content: string, chapterId?: string) => void;
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];

export const BookEditor: React.FC<BookEditorProps> = ({
  book,
  activeChapterId,
  fontFamily,
  fontSize,
  textAlignment,
  hasDropcap,
  bookViewMode,
  onToggleBookViewMode,
  onSelectChapter,
  onAddChapter,
  onDeleteChapter,
  onMoveChapter,
  onUpdateChapterTitle,
  onUpdateChapterSubtitle,
  onUpdateChapterContent,
}) => {
  const currentChapter = book.chapters.find((c) => c.id === activeChapterId) || book.chapters[0];
  const chapterIdx = book.chapters.findIndex((c) => c.id === activeChapterId);
  const displayChapterNum = chapterIdx >= 0 ? chapterIdx + 1 : 1;

  // Calculate book-wide stats
  const totalWords = book.chapters.reduce((sum, ch) => {
    return sum + ch.content.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
  const totalReadingTime = Math.max(1, Math.ceil(totalWords / 200));

  const scrollToChapter = (chId: string) => {
    const el = document.getElementById(`chapter-sheet-${chId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-2 sm:px-4 w-full">
      
      {/* Workspace Sub-Header: Mode Switcher & Chapter Quick Jump */}
      <div className="w-full max-w-3xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAFDF3]/80 backdrop-blur-xs border border-[#215E61]/20 rounded-xl px-4 py-2.5 shadow-2xs">
        
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-[#215E61]/10 p-1 rounded-lg text-xs">
          <button
            onClick={() => onToggleBookViewMode('single')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-serif font-semibold transition-all cursor-pointer ${
              bookViewMode === 'single'
                ? 'bg-[#215E61] text-[#F5FBE6] shadow-xs'
                : 'text-[#233D4D] hover:text-[#215E61]'
            }`}
            title="Focus on a single chapter"
          >
            <BookOpen size={13} />
            <span>Single Chapter</span>
          </button>

          <button
            onClick={() => onToggleBookViewMode('all')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-serif font-semibold transition-all cursor-pointer ${
              bookViewMode === 'all'
                ? 'bg-[#215E61] text-[#F5FBE6] shadow-xs'
                : 'text-[#233D4D] hover:text-[#215E61]'
            }`}
            title="View and write all chapters sequentially in one continuous workspace"
          >
            <Layers size={13} />
            <span>All Chapters ({book.chapters.length})</span>
          </button>
        </div>

        {/* Right: Quick Chapter Jump Pills (in All Chapters Mode) or Stats */}
        {bookViewMode === 'all' ? (
          <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
            <span className="text-[11px] font-serif text-[#536D7D] mr-1 hidden md:inline">Jump:</span>
            {book.chapters.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => scrollToChapter(ch.id)}
                className="px-2 py-0.5 rounded text-[11px] font-serif bg-white hover:bg-[#215E61] hover:text-[#F5FBE6] text-[#215E61] border border-[#215E61]/25 transition-colors cursor-pointer shrink-0"
                title={`Jump to Chapter ${idx + 1}: ${ch.title}`}
              >
                Ch. {idx + 1}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs font-serif text-[#536D7D] flex items-center gap-2">
            <span>Volume: {totalWords.toLocaleString()} words</span>
            <span>·</span>
            <span>~{totalReadingTime} min read</span>
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* MODE 1: ALL CHAPTERS CONTINUOUS WORKSPACE                      */}
      {/* ============================================================== */}
      {bookViewMode === 'all' ? (
        <div className="w-full max-w-3xl space-y-12">
          {book.chapters.map((ch, idx) => {
            const chWords = ch.content.trim().split(/\s+/).filter(Boolean).length;
            const chReading = Math.max(1, Math.ceil(chWords / 200));
            const roman = ROMAN_NUMERALS[idx] || `${idx + 1}`;

            return (
              <div key={ch.id} id={`chapter-sheet-${ch.id}`} className="space-y-6">
                
                {/* The Individual Chapter Manuscript Sheet */}
                <div 
                  className="w-full bg-[#FAFDF3] border border-[#215E61]/25 rounded-md shadow-lg min-h-[720px] p-8 sm:p-14 md:p-16 flex flex-col justify-between relative book-paper-texture"
                  style={{ fontFamily }}
                >
                  {/* Top Hallmark and Action Controls */}
                  <div className="flex items-center justify-between border-b border-[#215E61]/10 pb-3 text-[11px] font-serif uppercase tracking-[0.2em] text-[#215E61]/70">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#215E61]">{book.title || 'Untitled Book'}</span>
                      <span>·</span>
                      <span>Chapter {roman}</span>
                    </div>

                    {/* Chapter Reorder & Action Controls */}
                    <div className="flex items-center gap-1.5 non-printable">
                      {onMoveChapter && (
                        <>
                          <button
                            onClick={() => onMoveChapter(ch.id, 'up')}
                            disabled={idx === 0}
                            className={`p-1 rounded hover:bg-[#215E61]/10 transition-colors ${
                              idx === 0 ? 'opacity-25 cursor-not-allowed' : 'text-[#215E61] cursor-pointer'
                            }`}
                            title="Move Chapter Up"
                          >
                            <ChevronUp size={13} />
                          </button>
                          <button
                            onClick={() => onMoveChapter(ch.id, 'down')}
                            disabled={idx === book.chapters.length - 1}
                            className={`p-1 rounded hover:bg-[#215E61]/10 transition-colors ${
                              idx === book.chapters.length - 1 ? 'opacity-25 cursor-not-allowed' : 'text-[#215E61] cursor-pointer'
                            }`}
                            title="Move Chapter Down"
                          >
                            <ChevronDown size={13} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          onSelectChapter(ch.id);
                          onToggleBookViewMode('single');
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-sans font-medium text-[#215E61] hover:bg-[#215E61]/10 transition-colors cursor-pointer ml-1"
                        title="Focus only this chapter in Single Chapter mode"
                      >
                        Focus
                      </button>

                      {onDeleteChapter && book.chapters.length > 1 && (
                        <button
                          onClick={() => onDeleteChapter(ch.id)}
                          className="p-1 rounded text-red-700/60 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer ml-1"
                          title="Delete this chapter"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chapter Header Area */}
                  <div className="pt-6 pb-6 text-center space-y-2">
                    <div className="text-xs uppercase font-serif tracking-[0.3em] text-[#215E61] font-semibold">
                      Chapter {roman}
                    </div>

                    <input
                      type="text"
                      value={ch.title}
                      onChange={(e) => onUpdateChapterTitle(e.target.value, ch.id)}
                      placeholder={`Chapter ${idx + 1} Title...`}
                      className="w-full text-2xl sm:text-3xl font-serif font-bold text-center text-[#215E61] bg-transparent border-b border-transparent hover:border-[#215E61]/20 focus:border-[#215E61] focus:outline-none transition-colors py-1"
                    />

                    <input
                      type="text"
                      value={ch.subtitle || ''}
                      onChange={(e) => onUpdateChapterSubtitle(e.target.value, ch.id)}
                      placeholder="Chapter Epigraph or Subtitle (optional)..."
                      className="w-full text-xs font-serif italic text-center text-[#536D7D] bg-transparent border-b border-transparent hover:border-[#215E61]/20 focus:border-[#215E61] focus:outline-none transition-colors py-0.5"
                    />
                  </div>

                  {/* Chapter Writing Canvas */}
                  <div className="flex-1 flex flex-col">
                    <textarea
                      value={ch.content}
                      onChange={(e) => onUpdateChapterContent(e.target.value, ch.id)}
                      placeholder="Begin this chapter here... Press Enter twice for standard novel paragraph breaks."
                      style={{
                        fontSize: `${fontSize}px`,
                        textAlign: textAlignment,
                      }}
                      className={`w-full flex-1 min-h-[460px] bg-transparent text-[#233D4D] leading-relaxed resize-y focus:outline-none placeholder-[#233D4D]/25 font-normal ${
                        hasDropcap ? 'dropcap' : ''
                      }`}
                    />
                  </div>

                  {/* Page Footer & Word Count Hallmark */}
                  <div className="pt-6 mt-6 border-t border-[#215E61]/10 flex items-center justify-between text-xs text-[#536D7D] font-serif">
                    <span>— Chapter {idx + 1} —</span>
                    <span className="italic text-[11px]">
                      {chWords.toLocaleString()} words · ~{chReading} min read
                    </span>
                  </div>
                </div>

                {/* Classical Chapter End Flourish Separator */}
                {idx < book.chapters.length - 1 && (
                  <div className="flex items-center justify-center gap-3 py-4 text-[#215E61]/40 select-none">
                    <div className="h-[1px] w-20 bg-[#215E61]/20" />
                    <span className="font-serif italic text-xs tracking-widest text-[#215E61]/70">
                      ❦  End of Chapter {roman}  ❦
                    </span>
                    <div className="h-[1px] w-20 bg-[#215E61]/20" />
                  </div>
                )}

              </div>
            );
          })}

          {/* Add New Chapter Button at End of Continuous Manuscript */}
          <div className="pt-6 pb-12 flex justify-center">
            <button
              onClick={onAddChapter}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] text-sm font-serif font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Inscribe Chapter {book.chapters.length + 1} into Manuscript</span>
            </button>
          </div>

        </div>
      ) : (
        /* ============================================================== */
        /* MODE 2: FOCUSED SINGLE CHAPTER VIEW                             */
        /* ============================================================== */
        <div className="w-full max-w-3xl space-y-4">
          <div 
            className="w-full bg-[#FAFDF3] border border-[#215E61]/25 rounded-md shadow-lg min-h-[750px] p-8 sm:p-14 md:p-16 flex flex-col justify-between relative book-paper-texture"
            style={{ fontFamily }}
          >
            {/* Corner Hallmark */}
            <div className="flex items-center justify-between text-[11px] font-serif uppercase tracking-[0.2em] text-[#215E61]/60 border-b border-[#215E61]/10 pb-2">
              <span>{book.title || 'Untitled Book'}</span>
              <span>Chapter {displayChapterNum} of {book.chapters.length}</span>
            </div>

            {/* Chapter Header Area */}
            <div className="pt-6 pb-8 text-center space-y-2">
              <div className="text-xs uppercase font-serif tracking-[0.3em] text-[#215E61] font-semibold">
                Chapter {ROMAN_NUMERALS[chapterIdx] || displayChapterNum}
              </div>

              <input
                type="text"
                value={currentChapter.title}
                onChange={(e) => onUpdateChapterTitle(e.target.value, currentChapter.id)}
                placeholder="Chapter Title..."
                className="w-full text-2xl sm:text-3xl font-serif font-bold text-center text-[#215E61] bg-transparent border-b border-transparent hover:border-[#215E61]/20 focus:border-[#215E61] focus:outline-none transition-colors py-1"
              />

              <input
                type="text"
                value={currentChapter.subtitle || ''}
                onChange={(e) => onUpdateChapterSubtitle(e.target.value, currentChapter.id)}
                placeholder="Chapter Epigraph or Subtitle (optional)..."
                className="w-full text-xs font-serif italic text-center text-[#536D7D] bg-transparent border-b border-transparent hover:border-[#215E61]/20 focus:border-[#215E61] focus:outline-none transition-colors py-0.5"
              />
            </div>

            {/* Chapter Writing Canvas */}
            <div className="flex-1 flex flex-col">
              <textarea
                value={currentChapter.content}
                onChange={(e) => onUpdateChapterContent(e.target.value, currentChapter.id)}
                placeholder="Begin your chapter here... Press Enter twice for standard novel paragraph breaks."
                style={{
                  fontSize: `${fontSize}px`,
                  textAlign: textAlignment,
                }}
                className={`w-full flex-1 min-h-[460px] bg-transparent text-[#233D4D] leading-relaxed resize-none focus:outline-none placeholder-[#233D4D]/25 font-normal ${
                  hasDropcap ? 'dropcap' : ''
                }`}
              />
            </div>

            {/* Page Footer & Word Count Hallmark */}
            <div className="pt-6 mt-6 border-t border-[#215E61]/10 flex items-center justify-between text-xs text-[#536D7D] font-serif">
              <span>— Page {displayChapterNum} —</span>
              <span className="italic text-[11px]">
                {currentChapter.content.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} words · ~{Math.max(1, Math.ceil(currentChapter.content.trim().split(/\s+/).filter(Boolean).length / 200))} min read
              </span>
            </div>
          </div>

          {/* Single Chapter Navigation Bottom Bar */}
          <div className="flex items-center justify-between pt-2 px-2 text-xs font-serif">
            <button
              onClick={() => {
                if (chapterIdx > 0) {
                  onSelectChapter(book.chapters[chapterIdx - 1].id);
                }
              }}
              disabled={chapterIdx <= 0}
              className={`px-3 py-1.5 rounded-lg border border-[#215E61]/20 font-semibold transition-colors ${
                chapterIdx <= 0
                  ? 'opacity-30 cursor-not-allowed'
                  : 'text-[#215E61] hover:bg-white cursor-pointer'
              }`}
            >
              ← Previous Chapter
            </button>

            <button
              onClick={() => onToggleBookViewMode('all')}
              className="text-[#215E61] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Layers size={13} />
              <span>Expand to All Chapters Workspace</span>
            </button>

            <button
              onClick={() => {
                if (chapterIdx < book.chapters.length - 1) {
                  onSelectChapter(book.chapters[chapterIdx + 1].id);
                } else {
                  onAddChapter();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-[#215E61] text-[#F5FBE6] font-semibold hover:bg-[#1a4a4d] transition-colors cursor-pointer"
            >
              {chapterIdx < book.chapters.length - 1 ? 'Next Chapter →' : '+ Add Next Chapter'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
