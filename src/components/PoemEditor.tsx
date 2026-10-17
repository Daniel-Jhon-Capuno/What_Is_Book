import React from 'react';
import type { PoemWork } from '../types';

interface PoemEditorProps {
  poem: PoemWork;
  fontFamily: string;
  fontSize: number;
  textAlignment: 'left' | 'center' | 'justify';
  onChange: (updated: PoemWork) => void;
}

export const PoemEditor: React.FC<PoemEditorProps> = ({
  poem,
  fontFamily,
  fontSize,
  textAlignment,
  onChange,
}) => {
  const updatePoem = (fields: Partial<PoemWork>) => {
    onChange({
      ...poem,
      ...fields,
      updatedAt: Date.now(),
    });
  };

  const lineCount = poem.body.split('\n').filter(Boolean).length;
  const stanzaCount = poem.body.split(/\n\s*\n/).filter(Boolean).length;

  return (
    <div className="flex flex-col items-center justify-center py-6 px-2 sm:px-4">
      {/* Broadsheet Sheet */}
      <div 
        className="w-full max-w-2xl bg-[#FAFDF3] border border-[#215E61]/25 rounded-md shadow-lg min-h-[700px] p-8 sm:p-14 flex flex-col justify-between relative book-paper-texture"
        style={{ fontFamily }}
      >
        {/* Top Header Hallmark */}
        <div className="text-center pt-2 pb-6 space-y-2">
          {poem.form && (
            <div className="text-xs uppercase font-serif tracking-[0.25em] text-[#215E61] font-semibold">
              {poem.form}
            </div>
          )}

          <input
            type="text"
            value={poem.title}
            onChange={(e) => updatePoem({ title: e.target.value })}
            placeholder="Poem Title..."
            className="w-full text-2xl sm:text-3xl font-serif font-bold text-center text-[#215E61] bg-transparent border-b border-transparent hover:border-[#215E61]/20 focus:border-[#215E61] focus:outline-none transition-colors py-1"
          />

          <div className="text-sm font-serif italic text-[#536D7D]">
            by {poem.poet || 'Anonymous'}
          </div>

          {/* Ornamental flourish */}
          <div className="w-12 h-[1px] bg-[#215E61]/40 mx-auto my-3 relative">
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] bg-[#FAFDF3] px-1 text-[#215E61]">❦</span>
          </div>
        </div>

        {/* Verses Writing Canvas */}
        <div className="flex-1 flex flex-col items-center">
          <textarea
            value={poem.body}
            onChange={(e) => updatePoem({ body: e.target.value })}
            placeholder="Type your stanzas here... Press Enter twice between verses."
            style={{
              fontSize: `${fontSize}px`,
              textAlign: textAlignment,
            }}
            className="w-full max-w-lg flex-1 min-h-[420px] bg-transparent text-[#233D4D] leading-relaxed resize-none focus:outline-none placeholder-[#233D4D]/25 font-normal"
          />
        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-[#215E61]/10 flex items-center justify-between text-xs text-[#536D7D] font-serif">
          <span className="italic">{poem.dateOrLocation || 'Morning Edition'}</span>
          <span className="text-[11px]">
            {lineCount} lines · {stanzaCount} stanzas
          </span>
        </div>
      </div>
    </div>
  );
};
