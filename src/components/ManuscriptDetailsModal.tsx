import React from 'react';
import type { LiteraryWork, BookWork, PoemWork, QuoteWork } from '../types';
import { X, SlidersHorizontal, Check } from 'lucide-react';

interface ManuscriptDetailsModalProps {
  work: LiteraryWork;
  onChange: (updated: LiteraryWork) => void;
  onClose: () => void;
}

export const ManuscriptDetailsModal: React.FC<ManuscriptDetailsModalProps> = ({
  work,
  onChange,
  onClose,
}) => {
  const updateWork = (fields: Record<string, any>) => {
    onChange({
      ...work,
      ...fields,
      updatedAt: Date.now(),
    } as LiteraryWork);
  };

  const isBook = work.type === 'book';
  const isPoem = work.type === 'poem';
  const isQuote = work.type === 'quote';

  const book = isBook ? (work as BookWork) : null;
  const poem = isPoem ? (work as PoemWork) : null;
  const quote = isQuote ? (work as QuoteWork) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#233D4D]/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#F5FBE6] rounded-2xl shadow-2xl border border-[#215E61]/25 flex flex-col overflow-hidden my-6 max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-[#FAFDF3] border-b border-[#215E61]/15 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#215E61]">
            <SlidersHorizontal size={16} />
            <h3 className="font-serif font-bold text-base text-[#233D4D]">
              Manuscript Information & Context
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-[#233D4D]/60 hover:text-[#215E61] rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#233D4D]">
          
          {/* BOOK FIELDS */}
          {book && (
            <>
              <div>
                <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  value={book.title}
                  onChange={(e) => updateWork({ title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#215E61]/20 font-serif font-bold text-sm text-[#233D4D] focus:border-[#215E61] focus:outline-none"
                  placeholder="e.g. The Quiet Cartographer"
                />
              </div>

              <div>
                <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={book.subtitle || ''}
                  onChange={(e) => updateWork({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#215E61]/20 font-serif italic text-xs text-[#233D4D] focus:border-[#215E61] focus:outline-none"
                  placeholder="e.g. Chronicles of Forgotten Coastlines"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={book.author}
                    onChange={(e) => updateWork({ author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#215E61]/20 text-xs text-[#233D4D] focus:border-[#215E61] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                    Genre / Style
                  </label>
                  <input
                    type="text"
                    value={book.genre || ''}
                    onChange={(e) => updateWork({ genre: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#215E61]/20 text-xs text-[#233D4D] focus:border-[#215E61] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                  Dedication / Epigraph
                </label>
                <textarea
                  value={book.dedication || ''}
                  onChange={(e) => updateWork({ dedication: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-white border border-[#215E61]/20 font-serif italic text-xs text-[#233D4D] focus:border-[#215E61] focus:outline-none"
                  placeholder="For those who measure distance by stillness..."
                />
              </div>

              <div>
                <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                  About & Historical Context
                </label>
                <textarea
                  value={book.about}
                  onChange={(e) => updateWork({ about: e.target.value })}
                  rows={4}
                  className="w-full p-3 rounded-xl bg-white border border-[#215E61]/20 font-serif text-xs leading-relaxed text-[#233D4D] focus:border-[#215E61] focus:outline-none"
                  placeholder="Explain the background setting, inspiration, or themes..."
                />
              </div>
            </>
          )}

          {/* POEM FIELDS */}
          {poem && (
            <>
              <div>
                <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                  Poem Title
                </label>
                <input
                  type="text"
                  value={poem.title}
                  onChange={(e) => updateWork({ title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#215E61]/20 font-serif font-bold text-sm text-[#233D4D] focus:border-[#215E61] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                    Poet / Author
                  </label>
                  <input
                    type="text"
                    value={poem.poet}
                    onChange={(e) => updateWork({ poet: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#215E61]/20 text-xs text-[#233D4D] focus:border-[#215E61] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                    Poetic Form
                  </label>
                  <input
                    type="text"
                    value={poem.form || ''}
                    onChange={(e) => updateWork({ form: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#215E61]/20 text-xs text-[#233D4D] focus:border-[#215E61] focus:outline-none"
                    placeholder="e.g. Sonnet, Free Verse, Haiku"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                  Date / Inscription Location
                </label>
                <input
                  type="text"
                  value={poem.dateOrLocation || ''}
                  onChange={(e) => updateWork({ dateOrLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#215E61]/20 text-xs text-[#233D4D] focus:border-[#215E61] focus:outline-none"
                  placeholder="e.g. Cape Solitude, Autumn Dawn"
                />
              </div>

              <div>
                <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                  Context & Inspiration
                </label>
                <textarea
                  value={poem.about}
                  onChange={(e) => updateWork({ about: e.target.value })}
                  rows={4}
                  className="w-full p-3 rounded-xl bg-white border border-[#215E61]/20 font-serif text-xs leading-relaxed text-[#233D4D] focus:border-[#215E61] focus:outline-none"
                />
              </div>
            </>
          )}

          {/* QUOTE FIELDS */}
          {quote && (
            <>
              <div>
                <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                  Maker / Author Name (Below Quote)
                </label>
                <input
                  type="text"
                  value={quote.maker}
                  onChange={(e) => updateWork({ maker: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#215E61]/20 font-serif font-bold text-sm text-[#215E61] focus:border-[#215E61] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                    Context / Source Book
                  </label>
                  <input
                    type="text"
                    value={quote.about}
                    onChange={(e) => updateWork({ about: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#215E61]/20 text-xs text-[#233D4D] focus:border-[#215E61] focus:outline-none"
                    placeholder="e.g. Winter Meditations"
                  />
                </div>
                <div>
                  <label className="block text-[#536D7D] font-bold uppercase tracking-wider text-[10px] mb-1">
                    Year / Era
                  </label>
                  <input
                    type="text"
                    value={quote.year || ''}
                    onChange={(e) => updateWork({ year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#215E61]/20 text-xs text-[#233D4D] focus:border-[#215E61] focus:outline-none"
                    placeholder="e.g. 1912"
                  />
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAFDF3] border-t border-[#215E61]/15 flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] text-xs font-semibold cursor-pointer transition-colors"
          >
            <Check size={14} /> Done
          </button>
        </div>

      </div>
    </div>
  );
};
