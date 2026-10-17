import React from 'react';
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
  const updateQuote = (fields: Partial<QuoteWork>) => {
    onChange({
      ...quote,
      ...fields,
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-2 sm:px-4">
      {/* Quotation Parchment Card */}
      <div 
        className="w-full max-w-xl bg-[#FAFDF3] border-2 border-[#215E61]/30 rounded-lg shadow-xl p-8 sm:p-14 text-center relative flex flex-col justify-between min-h-[500px] book-paper-texture"
        style={{ fontFamily }}
      >
        {/* Inner dashed frame */}
        <div className="absolute inset-3 border border-dashed border-[#215E61]/20 pointer-events-none rounded-sm" />

        {/* Top: Large quotation mark */}
        <div className="pt-2">
          <span className="text-5xl md:text-6xl text-[#215E61]/35 font-serif leading-none select-none">
            “
          </span>
        </div>

        {/* Middle: The Quote Text (ABOVE) */}
        <div className="my-auto px-2">
          <textarea
            value={quote.quote}
            onChange={(e) => updateQuote({ quote: e.target.value })}
            placeholder="Write your quote or reflection here..."
            style={{
              fontSize: `${Math.max(18, fontSize)}px`,
              textAlign: textAlignment,
            }}
            rows={4}
            className="w-full bg-transparent text-[#233D4D] italic leading-relaxed resize-none focus:outline-none placeholder-[#233D4D]/25 font-normal text-center"
          />
        </div>

        {/* Bottom: Maker Name (BELOW) & Source */}
        <div className="pt-6 pb-2 text-center flex flex-col items-center">
          {/* Ornamental Divider */}
          <div className="w-12 h-[1px] bg-[#215E61]/40 mb-3 relative">
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] bg-[#FAFDF3] px-1 text-[#215E61]">✦</span>
          </div>

          {/* Maker Name */}
          <input
            type="text"
            value={quote.maker}
            onChange={(e) => updateQuote({ maker: e.target.value })}
            placeholder="Author / Maker Name..."
            className="text-base sm:text-lg font-serif font-bold tracking-widest uppercase text-center text-[#215E61] bg-transparent border-b border-transparent hover:border-[#215E61]/20 focus:border-[#215E61] focus:outline-none transition-colors max-w-sm"
          />

          {(quote.about || quote.year) && (
            <p className="text-xs text-[#536D7D] font-serif italic mt-1 max-w-xs truncate">
              {quote.about} {quote.year ? `(${quote.year})` : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
