import React from 'react';
import type { BookWork } from '../types';

interface BookEditorProps {
  book: BookWork;
  activeChapterId: string;
  fontFamily: string;
  fontSize: number;
  textAlignment: 'left' | 'center' | 'justify';
  hasDropcap: boolean;
  onChange: (updated: BookWork) => void;
  onUpdateChapterTitle: (title: string) => void;
  onUpdateChapterSubtitle: (subtitle: string) => void;
  onUpdateChapterContent: (content: string) => void;
}

export const BookEditor: React.FC<BookEditorProps> = ({
  book,
  activeChapterId,
  fontFamily,
  fontSize,
  textAlignment,
  hasDropcap,
  onUpdateChapterTitle,
  onUpdateChapterSubtitle,
  onUpdateChapterContent,
}) => {
  const currentChapter = book.chapters.find((c) => c.id === activeChapterId) || book.chapters[0];
  const chapterIdx = book.chapters.findIndex((c) => c.id === activeChapterId);
  const displayChapterNum = chapterIdx >= 0 ? chapterIdx + 1 : 1;

  if (!currentChapter) return null;

  const wordCount = currentChapter.content.trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-col items-center justify-center py-6 px-2 sm:px-4">
      {/* The Manuscript Book Sheet (Like a Page in Microsoft Word / Classical Novel) */}
      <div 
        className="w-full max-w-3xl bg-[#FAFDF3] border border-[#215E61]/25 rounded-md shadow-lg min-h-[750px] p-8 sm:p-14 md:p-16 flex flex-col justify-between relative book-paper-texture"
        style={{ fontFamily }}
      >
        {/* Subtle decorative inner corner hallmark */}
        <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-[11px] font-serif uppercase tracking-[0.2em] text-[#215E61]/60 border-b border-[#215E61]/10 pb-2">
          <span>{book.title || 'Untitled Book'}</span>
          <span>Chapter {displayChapterNum}</span>
        </div>

        {/* Chapter Header Area */}
        <div className="pt-6 pb-8 text-center space-y-2">
          <div className="text-xs uppercase font-serif tracking-[0.3em] text-[#215E61] font-semibold">
            Chapter {displayChapterNum}
          </div>

          <input
            type="text"
            value={currentChapter.title}
            onChange={(e) => onUpdateChapterTitle(e.target.value)}
            placeholder="Chapter Title..."
            className="w-full text-2xl sm:text-3xl font-serif font-bold text-center text-[#215E61] bg-transparent border-b border-transparent hover:border-[#215E61]/20 focus:border-[#215E61] focus:outline-none transition-colors py-1"
          />

          <input
            type="text"
            value={currentChapter.subtitle || ''}
            onChange={(e) => onUpdateChapterSubtitle(e.target.value)}
            placeholder="Chapter Epigraph or Subtitle (optional)..."
            className="w-full text-xs font-serif italic text-center text-[#536D7D] bg-transparent border-b border-transparent hover:border-[#215E61]/20 focus:border-[#215E61] focus:outline-none transition-colors py-0.5"
          />
        </div>

        {/* Chapter Writing Canvas */}
        <div className="flex-1 flex flex-col">
          <textarea
            value={currentChapter.content}
            onChange={(e) => onUpdateChapterContent(e.target.value)}
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
            {wordCount.toLocaleString()} words · ~{readingTimeMin} min read
          </span>
        </div>
      </div>
    </div>
  );
};
