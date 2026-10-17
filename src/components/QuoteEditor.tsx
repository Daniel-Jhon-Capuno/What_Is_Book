import React, { useRef, useEffect } from 'react';
import type { QuoteWork } from '../types';

interface QuoteEditorProps {
  quote: QuoteWork;
  fontFamily: string;
  fontSize: number;
  textAlignment: 'left' | 'center' | 'justify';
  onChange: (updated: QuoteWork) => void;
}

export const QuoteEditor: React.FC<QuoteEditorProps> = ({
  quote,
  fontFamily,
  fontSize,
  textAlignment,
  onChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateQuote = (fields: Partial<QuoteWork>) => {
    onChange({
      ...quote,
      ...fields,
      updatedAt: Date.now(),
    });
  };

  // Auto-resize textarea to fit text naturally without ever showing an inner scrollbar
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(160, textareaRef.current.scrollHeight)}px`;
    }
  }, [quote.quote, fontSize]);

  const wordCount = quote.quote.trim().split(/\s+/).filter(Boolean).length;
  const charCount = quote.quote.length;

  return (
    <div className="flex flex-col items-center justify-center py-6 px-2 sm:px-4 w-full">
      {/* Grand Quotation Parchment Sheet */}
      <div 
        className="w-full max-w-3xl bg-[#FAFDF3] border border-[#215E61]/25 rounded-md shadow-xl min-h-[640px] sm:min-h-[720px] p-8 sm:p-14 md:p-16 flex flex-col justify-between relative book-paper-texture"
        style={{ fontFamily }}
      >
        {/* Inner dashed classical hallmark frame */}
        <div className="absolute inset-3 sm:inset-4 border border-dashed border-[#215E61]/20 pointer-events-none rounded-xs" />

        {/* Top Hallmark Line */}
        <div className="flex items-center justify-between text-[11px] font-serif uppercase tracking-[0.25em] text-[#215E61]/70 border-b border-[#215E61]/10 pb-3 relative z-10">
          <input
            type="text"
            value={quote.category || ''}
            onChange={(e) => updateQuote({ category: e.target.value })}
            placeholder="Aphorism & Reflection (Theme)..."
            className="bg-transparent text-[11px] font-serif tracking-[0.2em] uppercase text-[#215E61]/70 hover:text-[#215E61] focus:text-[#215E61] focus:outline-none transition-colors max-w-xs"
          />
          <span className="font-semibold hidden sm:inline">Inscribed Quotation</span>
        </div>

        {/* Top: Large classical quotation mark */}
        <div className="text-center pt-4 relative z-10">
          <span className="text-5xl md:text-6xl text-[#215E61]/30 font-serif leading-none select-none">
            “
          </span>
        </div>

        {/* Middle: The Quote Body Text (ABOVE MAKER) with auto-resizing height & zero scrollbar */}
        <div className="my-auto px-2 sm:px-6 py-4 flex flex-col items-center relative z-10 w-full">
          <textarea
            ref={textareaRef}
            value={quote.quote}
            onChange={(e) => updateQuote({ quote: e.target.value })}
            placeholder="Write your quote, meditation, or reflection here..."
            style={{
              fontSize: `${Math.max(18, fontSize)}px`,
              textAlign: textAlignment,
            }}
            className="w-full bg-transparent text-[#233D4D] italic leading-relaxed resize-none overflow-hidden focus:outline-none placeholder-[#233D4D]/25 font-normal"
          />
        </div>

        {/* Bottom: Maker Name & Origin (BELOW THE QUOTE) */}
        <div className="pt-6 pb-4 text-center flex flex-col items-center relative z-10">
          {/* Ornamental Divider */}
          <div className="w-16 h-[1px] bg-[#215E61]/35 mb-4 relative">
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px] bg-[#FAFDF3] px-1.5 text-[#215E61] font-serif">
              ✦
            </span>
          </div>

          {/* Maker / Author Name */}
          <input
            type="text"
            value={quote.maker}
            onChange={(e) => updateQuote({ maker: e.target.value })}
            placeholder="Author / Maker Name..."
            className="text-lg sm:text-xl font-serif font-bold tracking-widest uppercase text-center text-[#215E61] bg-transparent border-b border-transparent hover:border-[#215E61]/25 focus:border-[#215E61] focus:outline-none transition-colors max-w-md w-full py-1"
          />

          {/* Source / Book / Context & Year */}
          <div className="flex items-center justify-center gap-2 mt-1.5 max-w-md w-full">
            <input
              type="text"
              value={quote.about || ''}
              onChange={(e) => updateQuote({ about: e.target.value })}
              placeholder="Source, speech, or context (e.g. Winter Meditations)..."
              className="text-xs text-[#536D7D] font-serif italic text-center bg-transparent border-b border-transparent hover:border-[#215E61]/20 focus:border-[#215E61] focus:outline-none transition-colors flex-1 py-0.5"
            />
            <span className="text-xs text-[#536D7D] opacity-40">·</span>
            <input
              type="text"
              value={quote.year || ''}
              onChange={(e) => updateQuote({ year: e.target.value })}
              placeholder="Year"
              className="w-14 text-xs text-[#536D7D] font-serif italic text-center bg-transparent border-b border-transparent hover:border-[#215E61]/20 focus:border-[#215E61] focus:outline-none transition-colors py-0.5"
            />
          </div>
        </div>

        {/* Footer Hallmark */}
        <div className="pt-4 border-t border-[#215E61]/10 flex items-center justify-between text-xs text-[#536D7D] font-serif relative z-10">
          <span>— Leaf of Reflection —</span>
          <span className="italic text-[11px]">
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} characters
          </span>
        </div>
      </div>
    </div>
  );
};
