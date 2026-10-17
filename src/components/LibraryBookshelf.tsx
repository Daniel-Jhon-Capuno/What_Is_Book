import React, { useState } from 'react';
import type { LiteraryWork, WorkType } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  BookOpen, 
  Feather, 
  Quote, 
  X, 
  Layers 
} from 'lucide-react';

interface LibraryBookshelfProps {
  works: LiteraryWork[];
  selectedWorkId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectWork: (work: LiteraryWork) => void;
  onCreateWork: (type: WorkType) => void;
  onRequestDelete: (work: LiteraryWork) => void;
}

// Color palettes for book spine covers matching Morning Paper aesthetic
const SPINE_THEMES = [
  {
    bg: 'linear-gradient(135deg, #174245 0%, #215E61 50%, #2a7377 100%)',
    border: '#2f7e83',
    textColor: '#F5FBE6',
    ribbonColor: '#e0c068',
  },
  {
    bg: 'linear-gradient(135deg, #162631 0%, #233D4D 50%, #2f4f63 100%)',
    border: '#395e75',
    textColor: '#F5FBE6',
    ribbonColor: '#215E61',
  },
  {
    bg: 'linear-gradient(135deg, #2c423b 0%, #3a574e 50%, #4a6c62 100%)',
    border: '#567d73',
    textColor: '#F5FBE6',
    ribbonColor: '#d4af37',
  },
  {
    bg: 'linear-gradient(135deg, #44372c 0%, #574637 50%, #6e5947 100%)',
    border: '#826a54',
    textColor: '#F5FBE6',
    ribbonColor: '#215E61',
  },
  {
    bg: 'linear-gradient(135deg, #2b3a42 0%, #3b4d58 50%, #4c6270 100%)',
    border: '#5d7686',
    textColor: '#F5FBE6',
    ribbonColor: '#c59b27',
  },
  {
    bg: 'linear-gradient(135deg, #3d2c38 0%, #52394a 50%, #6b4a60 100%)',
    border: '#7c5870',
    textColor: '#F5FBE6',
    ribbonColor: '#e5c158',
  },
];

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];

export const LibraryBookshelf: React.FC<LibraryBookshelfProps> = ({
  works,
  selectedWorkId,
  isOpen,
  onClose,
  onSelectWork,
  onCreateWork,
  onRequestDelete,
}) => {
  const [filter, setFilter] = useState<WorkType | 'all'>('all');
  const [search, setSearch] = useState<string>('');
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);
  const [hoveredWorkId, setHoveredWorkId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredWorks = works.filter((w) => {
    if (filter !== 'all' && w.type !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (w.type === 'book') return w.title.toLowerCase().includes(q) || w.author.toLowerCase().includes(q);
    if (w.type === 'poem') return w.title.toLowerCase().includes(q) || w.poet.toLowerCase().includes(q);
    return w.quote.toLowerCase().includes(q) || w.maker.toLowerCase().includes(q);
  });

  // Group books into tiers (e.g. 7-8 books per shelf tier)
  const BOOKS_PER_SHELF = 7;
  const shelves: LiteraryWork[][] = [];
  for (let i = 0; i < filteredWorks.length; i += BOOKS_PER_SHELF) {
    shelves.push(filteredWorks.slice(i, i + BOOKS_PER_SHELF));
  }
  if (shelves.length === 0) {
    shelves.push([]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#16242c]/85 backdrop-blur-md overflow-hidden animate-fadeIn select-none">
      <div className="relative w-full max-w-5xl bg-[#1b2b33] rounded-2xl shadow-2xl border-4 border-[#2b4452] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Bookshelf Header */}
        <div className="px-5 py-3.5 bg-[#142027] border-b border-[#2d4757] flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#215E61] flex items-center justify-center text-[#F5FBE6] shadow-sm">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#F5FBE6] tracking-wide flex items-center gap-2">
                <span>The Grand Library Bookcase</span>
                <span className="text-xs font-sans font-normal text-[#8faec0] bg-[#223642] px-2 py-0.5 rounded-full">
                  {filteredWorks.length} {filteredWorks.length === 1 ? 'Volume' : 'Volumes'} · {shelves.length} {shelves.length === 1 ? 'Shelf' : 'Shelves'}
                </span>
              </h2>
              <p className="text-[11px] text-[#8faec0] font-serif italic hidden sm:block">
                Scroll through multiple shelves to browse your collection. Hover over any book to pull it out.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter buttons */}
            <div className="flex items-center bg-[#0d161b] p-0.5 rounded-xl border border-[#2b4452] text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'book', label: 'Books' },
                { id: 'poem', label: 'Poems' },
                { id: 'quote', label: 'Quotes' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id as WorkType | 'all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                    filter === t.id
                      ? 'bg-[#215E61] text-[#F5FBE6] font-semibold shadow-2xs'
                      : 'text-[#8faec0] hover:text-[#F5FBE6]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-36 sm:w-44">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#688899]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search volumes..."
                className="w-full pl-7 pr-2.5 py-1 text-xs rounded-xl bg-[#0d161b] border border-[#2b4452] focus:border-[#215E61] text-[#F5FBE6] focus:outline-none placeholder-[#688899]"
              />
            </div>

            {/* Bind New Volume Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span className="hidden sm:inline">Add Volume</span>
              </button>

              {showAddMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-[#F5FBE6] border border-[#215E61]/30 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 text-xs text-[#233D4D]">
                    <button
                      onClick={() => {
                        onCreateWork('book');
                        setShowAddMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 font-medium cursor-pointer"
                    >
                      <BookOpen size={14} className="text-[#215E61]" />
                      <span>Bind New Book</span>
                    </button>
                    <button
                      onClick={() => {
                        onCreateWork('poem');
                        setShowAddMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 font-medium cursor-pointer"
                    >
                      <Feather size={14} className="text-[#215E61]" />
                      <span>Pen New Poem</span>
                    </button>
                    <button
                      onClick={() => {
                        onCreateWork('quote');
                        setShowAddMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 font-medium cursor-pointer"
                    >
                      <Quote size={14} className="text-[#215E61]" />
                      <span>Inscribe New Quote</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8faec0] hover:text-[#F5FBE6] hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Bookshelf"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Multi-Tier Shelves Chamber */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-14 bg-radial from-[#1e303a] to-[#111a20]">
          
          {shelves.map((shelfBooks, shelfIndex) => {
            const roman = ROMAN_NUMERALS[shelfIndex] || `${shelfIndex + 1}`;
            const isLastShelf = shelfIndex === shelves.length - 1;

            return (
              <div key={shelfIndex} className="relative pt-6">
                
                {/* Brass Shelf Nameplate Banner */}
                <div className="flex items-center justify-between mb-2 px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c59b27]" />
                    <span className="text-[11px] font-serif uppercase tracking-[0.25em] text-[#c59b27] font-bold">
                      Shelf {roman}
                    </span>
                    <span className="text-[10px] text-[#698a9c] font-serif italic">
                      ({shelfBooks.length} {shelfBooks.length === 1 ? 'item' : 'items'})
                    </span>
                  </div>
                </div>

                {/* Books standing on this shelf row */}
                <div className="w-full flex items-end justify-start gap-3 sm:gap-4 px-3 sm:px-6 overflow-x-auto pb-1 pt-6 min-h-[190px]">
                  
                  {shelfBooks.map((w, bookIdx) => {
                    const globalIdx = shelfIndex * BOOKS_PER_SHELF + bookIdx;
                    const isSelected = w.id === selectedWorkId;
                    const isHovered = hoveredWorkId === w.id;
                    const theme = SPINE_THEMES[globalIdx % SPINE_THEMES.length];

                    let title = '';
                    let author = '';
                    let height = 'h-52 sm:h-60';
                    let width = 'w-13 sm:w-15';

                    if (w.type === 'book') {
                      title = w.title || 'Untitled Book';
                      author = w.author || 'Author';
                      height = bookIdx % 2 === 0 ? 'h-56 sm:h-64' : 'h-52 sm:h-60';
                      width = 'w-14 sm:w-16';
                    } else if (w.type === 'poem') {
                      title = w.title || 'Poetry';
                      author = w.poet || 'Poet';
                      height = 'h-48 sm:h-56';
                      width = 'w-12 sm:w-14';
                    } else {
                      title = w.maker ? `“${w.quote.slice(0, 16)}...”` : 'Quote';
                      author = w.maker || 'Maker';
                      height = 'h-44 sm:h-52';
                      width = 'w-11 sm:w-13';
                    }

                    return (
                      <div
                        key={w.id}
                        onMouseEnter={() => setHoveredWorkId(w.id)}
                        onMouseLeave={() => setHoveredWorkId(null)}
                        onClick={() => onSelectWork(w)}
                        style={{
                          background: theme.bg,
                          borderColor: theme.border,
                          transform: isHovered 
                            ? 'translateY(-22px) scale(1.04)' 
                            : isSelected 
                            ? 'translateY(-10px)' 
                            : 'translateY(0)',
                          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        className={`relative ${width} ${height} rounded-t-md border-x-2 border-t-2 shadow-xl cursor-pointer select-none shrink-0 flex flex-col justify-between items-center py-3 px-1 group`}
                      >
                        {/* Spine Ribs */}
                        <div className="w-full h-[2px] bg-black/40 shadow-xs" />
                        <div className="w-full h-[2px] bg-black/40 shadow-xs mt-2" />

                        {/* Bookmark Ribbon */}
                        <div 
                          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2 h-5 rounded-b-xs shadow-md"
                          style={{ backgroundColor: theme.ribbonColor }}
                        />

                        {/* Embossed Title */}
                        <div className="flex-1 flex items-center justify-center overflow-hidden my-2">
                          <span
                            style={{
                              writingMode: 'vertical-rl',
                              textOrientation: 'mixed',
                              color: theme.textColor,
                            }}
                            className="font-serif text-[11px] font-bold tracking-widest uppercase transform rotate-180 truncate max-h-36 drop-shadow-sm"
                          >
                            {title}
                          </span>
                        </div>

                        {/* Author */}
                        <div className="w-full text-center px-0.5 overflow-hidden">
                          <span 
                            style={{ color: theme.textColor }}
                            className="text-[8px] font-serif uppercase tracking-wider opacity-75 truncate block"
                          >
                            {author}
                          </span>
                        </div>

                        {/* Bottom Ribs */}
                        <div className="w-full h-[2px] bg-black/40 shadow-xs mb-2" />
                        <div className="w-full h-[2px] bg-black/40 shadow-xs" />

                        {/* Hover Tooltip Card */}
                        {isHovered && (
                          <div className="absolute -top-11 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#F5FBE6] text-[#233D4D] rounded-lg shadow-xl text-xs font-serif font-bold whitespace-nowrap z-50 border border-[#215E61] animate-bounce-short">
                            Open "{title}"
                          </div>
                        )}

                        {/* Delete button (calls custom confirmation modal) */}
                        {works.length > 1 && isHovered && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRequestDelete(w);
                            }}
                            className="absolute top-1.5 right-1 p-1 rounded-full bg-black/60 text-red-400 hover:text-red-200 hover:bg-black/80 transition-colors"
                            title="Remove Volume"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Slot on the last shelf tier */}
                  {isLastShelf && (
                    <button
                      onClick={() => setShowAddMenu(true)}
                      className="w-12 sm:w-14 h-48 sm:h-54 border-2 border-dashed border-[#3a5869] hover:border-[#F5FBE6] hover:bg-white/5 rounded-t-md flex flex-col items-center justify-center gap-1.5 text-[#6f92a5] hover:text-[#F5FBE6] transition-all cursor-pointer shrink-0 group mb-0"
                      title="Add a new volume to this shelf"
                    >
                      <Plus size={16} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-serif uppercase tracking-wider text-center">
                        Add
                      </span>
                    </button>
                  )}

                </div>

                {/* Rich Heavy Wooden Shelf Ledge Beam */}
                <div className="w-full h-6 rounded-xs bg-gradient-to-r from-[#4d2f19] via-[#6e4425] to-[#4d2f19] border-t-2 border-[#91623d] shadow-2xl relative">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute -bottom-2 left-0 right-0 h-2 bg-[#2a190d] shadow-inner" />
                  
                  {/* Brass Corner End Brackets */}
                  <div className="absolute left-1 top-0 bottom-0 w-2 bg-[#c59b27] opacity-60" />
                  <div className="absolute right-1 top-0 bottom-0 w-2 bg-[#c59b27] opacity-60" />
                </div>

              </div>
            );
          })}

        </div>

        {/* Shelf Footer */}
        <div className="px-5 py-3 bg-[#142027] border-t border-[#2d4757] flex items-center justify-between text-xs text-[#8faec0] shrink-0">
          <span className="font-serif italic text-[11px] sm:text-xs">
            Tip: Click any volume to take it from the shelf to your desk.
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] font-semibold transition-colors cursor-pointer"
          >
            <span>Back to Writing Desk</span>
          </button>
        </div>

      </div>
    </div>
  );
};
