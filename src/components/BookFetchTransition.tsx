import React, { useEffect } from 'react';
import type { LiteraryWork } from '../types';
import { BookOpen, Feather, Sparkles } from 'lucide-react';

interface BookFetchTransitionProps {
  work: LiteraryWork;
  onFinished: () => void;
}

export const BookFetchTransition: React.FC<BookFetchTransitionProps> = ({ work, onFinished }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinished();
    }, 700);

    return () => clearTimeout(timer);
  }, [onFinished]);

  const title = work.type === 'quote' 
    ? (work.maker ? `Words of ${work.maker}` : 'Quotation')
    : (work.title || 'Volume');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#233D4D]/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#FAFDF3] border-2 border-[#215E61] rounded-2xl p-8 sm:p-10 shadow-2xl max-w-sm w-full text-center flex flex-col items-center book-paper-texture relative animate-scaleUp">
        
        {/* Book Opening Icon with soft pulsing glow */}
        <div className="w-16 h-16 rounded-2xl bg-[#215E61] text-[#F5FBE6] flex items-center justify-center shadow-lg mb-5 animate-pulse">
          {work.type === 'poem' ? <Feather size={28} /> : <BookOpen size={28} />}
        </div>

        <span className="text-[11px] uppercase font-serif tracking-[0.25em] text-[#215E61] font-bold mb-1">
          Taking From Shelf
        </span>

        <h3 className="text-xl font-serif font-bold text-[#233D4D] mb-2 leading-snug">
          {title}
        </h3>

        <div className="w-10 h-[1px] bg-[#215E61]/40 mx-auto my-3" />

        <div className="flex items-center gap-2 text-xs font-serif italic text-[#536D7D]">
          <span className="w-2 h-2 rounded-full bg-[#215E61] animate-ping" />
          <span>Opening pages on your desk...</span>
        </div>

      </div>
    </div>
  );
};
