import React, { useState, useEffect } from 'react';
import type { LiteraryWork, WorkType } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  BookOpen, 
  Feather, 
  Quote, 
  X, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  Check, 
  Calendar 
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

// Rich antique leather and cloth bound palettes
const BOOK_SPINE_STYLES = [
  {
    gradient: 'linear-gradient(to right, #123335 0%, #215E61 45%, #2a7377 75%, #184245 100%)',
    border: '#2f7e83',
    textColor: '#F5FBE6',
    ribbonColor: '#e0c068',
    texture: 'emerald-cloth',
    accentGold: '#ebd27d',
  },
  {
    gradient: 'linear-gradient(to right, #14222b 0%, #233D4D 45%, #2e4d61 75%, #182833 100%)',
    border: '#3b617a',
    textColor: '#F5FBE6',
    ribbonColor: '#215E61',
    texture: 'navy-morocco',
    accentGold: '#f0d78c',
  },
  {
    gradient: 'linear-gradient(to right, #381a1f 0%, #52272e 45%, #6e333d 75%, #381a1f 100%)',
    border: '#7a3e47',
    textColor: '#F5FBE6',
    ribbonColor: '#d4af37',
    texture: 'burgundy-calf',
    accentGold: '#f3d995',
  },
  {
    gradient: 'linear-gradient(to right, #1f3328 0%, #2e4a3b 45%, #3d614e 75%, #1f3328 100%)',
    border: '#4c7861',
    textColor: '#F5FBE6',
    ribbonColor: '#e5c158',
    texture: 'forest-buckram',
    accentGold: '#ebd27d',
  },
  {
    gradient: 'linear-gradient(to right, #3d2b1f 0%, #543b2b 45%, #6e4e39 75%, #3d2b1f 100%)',
    border: '#7d5941',
    textColor: '#F5FBE6',
    ribbonColor: '#215E61',
    texture: 'antique-cedar',
    accentGold: '#f0d78c',
  },
  {
    gradient: 'linear-gradient(to right, #2a2538 0%, #3d3652 45%, #52496e 75%, #2a2538 100%)',
    border: '#625882',
    textColor: '#F5FBE6',
    ribbonColor: '#e0c068',
    texture: 'plum-velvet',
    accentGold: '#ebd27d',
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

  // Keyboard escape listener to close bookshelf
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredWorks = works.filter((w) => {
    if (filter !== 'all' && w.type !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (w.type === 'book') return w.title.toLowerCase().includes(q) || w.author.toLowerCase().includes(q);
    if (w.type === 'poem') return w.title.toLowerCase().includes(q) || w.poet.toLowerCase().includes(q);
    return w.quote.toLowerCase().includes(q) || w.maker.toLowerCase().includes(q);
  });

  // Organize works into shelves (e.g. 6 to 8 volumes per shelf beam)
  const VOLUMES_PER_SHELF = 8;
  const shelfRows: LiteraryWork[][] = [];
  for (let i = 0; i < filteredWorks.length; i += VOLUMES_PER_SHELF) {
    shelfRows.push(filteredWorks.slice(i, i + VOLUMES_PER_SHELF));
  }
  if (shelfRows.length === 0) {
    shelfRows.push([]);
  }

  const hoveredWork = works.find((w) => w.id === hoveredWorkId);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f181e] text-[#F5FBE6] animate-fadeIn select-none overflow-hidden">
      
      {/* 1. TOP LIBRARY CROWN CORNICE & NAVIGATION BAR */}
      <header className="h-16 px-6 bg-[#16232b] border-b-2 border-[#2b424f] flex items-center justify-between shadow-xl shrink-0 z-20">
        
        {/* Left: Library Plaque */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] text-xs font-semibold shadow-xs transition-colors cursor-pointer mr-2"
          >
            <ArrowLeft size={14} />
            <span>Writing Desk</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#215E61] flex items-center justify-center text-[#F5FBE6] shadow-sm">
              <BookOpen size={16} />
            </div>
            <div>
              <h1 className="font-serif font-bold text-base md:text-lg text-[#F5FBE6] tracking-wide flex items-center gap-2">
                <span>The Library Bookshelf</span>
                <span className="text-[11px] font-sans font-normal text-[#8faec0] bg-[#223642] px-2 py-0.5 rounded-full">
                  {filteredWorks.length} {filteredWorks.length === 1 ? 'Volume' : 'Volumes'}
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Search & Filter Tabs */}
        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          <div className="hidden md:flex items-center bg-[#0d161c] p-1 rounded-xl border border-[#273d4a] text-xs">
            {[
              { id: 'all', label: 'All Volumes' },
              { id: 'book', label: 'Books', icon: BookOpen },
              { id: 'poem', label: 'Poems', icon: Feather },
              { id: 'quote', label: 'Quotes', icon: Quote },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id as WorkType | 'all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filter === t.id
                    ? 'bg-[#215E61] text-[#F5FBE6] font-semibold shadow-2xs'
                    : 'text-[#8faec0] hover:text-[#F5FBE6]'
                }`}
              >
                {t.icon && <t.icon size={11} />}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-44 sm:w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#688899]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shelf by title or author..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0d161c] border border-[#273d4a] focus:border-[#215E61] text-[#F5FBE6] focus:outline-none placeholder-[#688899]"
            />
          </div>
        </div>

        {/* Right: Bind Volume & Exit */}
        <div className="flex items-center gap-2">
          {/* Add Volume Button */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Bind New Volume</span>
            </button>

            {showAddMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-[#F5FBE6] border border-[#215E61]/30 rounded-xl shadow-2xl z-50 p-2 space-y-1 text-xs text-[#233D4D]">
                  <button
                    onClick={() => {
                      onCreateWork('book');
                      setShowAddMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 font-medium cursor-pointer"
                  >
                    <BookOpen size={14} className="text-[#215E61]" />
                    <span>Bind New Book Volume</span>
                  </button>
                  <button
                    onClick={() => {
                      onCreateWork('poem');
                      setShowAddMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 font-medium cursor-pointer"
                  >
                    <Feather size={14} className="text-[#215E61]" />
                    <span>Pen New Poetry Broadsheet</span>
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
            className="p-1.5 rounded-xl text-[#8faec0] hover:text-[#F5FBE6] hover:bg-white/10 transition-colors cursor-pointer"
            title="Exit Bookshelf"
          >
            <X size={20} />
          </button>
        </div>

      </header>

      {/* 2. THE GRAND LIBRARY BOOKCASE CHAMBER (Expansive Full Height & Width) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-12 md:px-20 py-8 relative bg-radial from-[#18262f] via-[#111a20] to-[#0a1014] flex flex-col justify-between">
        
        {/* Bookshelf Wooden Outer Frame Columns */}
        <div className="max-w-6xl w-full mx-auto space-y-16 py-4">
          
          {shelfRows.map((shelfBooks, shelfIndex) => {
            const roman = ROMAN_NUMERALS[shelfIndex] || `${shelfIndex + 1}`;
            const isLastShelf = shelfIndex === shelfRows.length - 1;

            return (
              <section key={shelfIndex} className="relative">
                
                {/* Brass Plaque on Shelf Ledge Top */}
                <div className="flex items-center justify-between mb-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#d4af37] shadow-xs" />
                    <span className="text-xs font-serif uppercase tracking-[0.3em] text-[#d4af37] font-bold drop-shadow-xs">
                      Shelf {roman}
                    </span>
                    <span className="text-xs text-[#7091a4] font-serif italic">
                      · {shelfBooks.length} {shelfBooks.length === 1 ? 'Volume' : 'Volumes'}
                    </span>
                  </div>

                  <span className="text-[11px] font-serif text-[#7091a4] italic hidden sm:inline">
                    Cedar Beam Collection
                  </span>
                </div>

                {/* The Books on this shelf level */}
                <div className="w-full relative bg-[#131d24]/60 rounded-t-lg border-x-4 border-t-2 border-[#2b4452]/50 pt-10 pb-0 px-6 sm:px-10 flex items-end justify-start gap-4 sm:gap-6 md:gap-7 overflow-x-auto min-h-[300px] sm:min-h-[340px]">
                  
                  {/* Left Brass Bookend */}
                  <div className="w-4 h-48 bg-gradient-to-r from-[#997328] via-[#d4af37] to-[#73531b] rounded-t-xs shadow-lg shrink-0 opacity-80 self-end mb-0 hidden sm:block" />

                  {shelfBooks.map((w, bookIdx) => {
                    const globalIdx = shelfIndex * VOLUMES_PER_SHELF + bookIdx;
                    const isSelected = w.id === selectedWorkId;
                    const isHovered = hoveredWorkId === w.id;
                    const theme = BOOK_SPINE_STYLES[globalIdx % BOOK_SPINE_STYLES.length];

                    // Substantial book sizing
                    let title = '';
                    let author = '';
                    let height = 'h-64 sm:h-76 md:h-84';
                    let width = 'w-18 sm:w-22 md:w-24';
                    let badge = '';

                    if (w.type === 'book') {
                      title = w.title || 'Untitled Book';
                      author = w.author || 'Author';
                      height = bookIdx % 2 === 0 ? 'h-68 sm:h-80 md:h-88' : 'h-64 sm:h-76 md:h-84';
                      width = 'w-20 sm:w-24 md:w-26';
                      badge = `${w.chapters.length} Ch.`;
                    } else if (w.type === 'poem') {
                      title = w.title || 'Poetry';
                      author = w.poet || 'Poet';
                      height = 'h-60 sm:h-70 md:h-78';
                      width = 'w-16 sm:w-20 md:w-22';
                      badge = w.form || 'Poem';
                    } else {
                      title = w.maker ? `“${w.quote.slice(0, 20)}...”` : 'Quote';
                      author = w.maker || 'Maker';
                      height = 'h-56 sm:h-66 md:h-74';
                      width = 'w-16 sm:w-18 md:w-20';
                      badge = 'Quote';
                    }

                    return (
                      <div
                        key={w.id}
                        onMouseEnter={() => setHoveredWorkId(w.id)}
                        onMouseLeave={() => setHoveredWorkId(null)}
                        onClick={() => onSelectWork(w)}
                        style={{
                          background: theme.gradient,
                          boxShadow: isHovered 
                            ? '0 25px 40px -10px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.1), inset 5px 0 10px rgba(255,255,255,0.2), inset -5px 0 10px rgba(0,0,0,0.5)' 
                            : '0 12px 24px -5px rgba(0,0,0,0.6), inset 4px 0 8px rgba(255,255,255,0.12), inset -4px 0 8px rgba(0,0,0,0.4)',
                          transform: isHovered 
                            ? 'translateY(-30px) scale(1.05)' 
                            : isSelected 
                            ? 'translateY(-12px)' 
                            : 'translateY(0)',
                          transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        className={`relative ${width} ${height} rounded-t-sm border-t border-x cursor-pointer shrink-0 flex flex-col justify-between items-center py-4 px-1.5 group select-none`}
                      >
                        {/* 1. Raised Leather/Cloth Ribs at Top */}
                        <div className="w-full space-y-1">
                          <div className="w-full h-[3px] bg-black/50 shadow-xs rounded-full" />
                          <div className="w-full h-[1px] bg-white/20 shadow-xs" />
                        </div>

                        {/* Top Category / Type Emblem */}
                        <div className="text-[9px] uppercase font-serif tracking-[0.2em] font-bold text-center opacity-85 px-1 truncate w-full" style={{ color: theme.accentGold }}>
                          {badge}
                        </div>

                        {/* Hanging Ribbon Bookmark Over Shelf */}
                        <div 
                          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3 h-8 rounded-b-xs shadow-md transition-transform group-hover:scale-y-110"
                          style={{ backgroundColor: theme.ribbonColor }}
                        />

                        {/* 2. Main Spine Gold Debossed Title */}
                        <div className="flex-1 flex items-center justify-center overflow-hidden my-3 w-full">
                          <span
                            style={{
                              writingMode: 'vertical-rl',
                              textOrientation: 'mixed',
                              color: theme.textColor,
                            }}
                            className="font-serif text-xs sm:text-sm font-bold tracking-widest uppercase transform rotate-180 truncate max-h-48 drop-shadow-md text-center"
                          >
                            {title}
                          </span>
                        </div>

                        {/* 3. Author Name at the Foot */}
                        <div className="w-full text-center px-1 overflow-hidden">
                          <span 
                            style={{ color: theme.textColor }}
                            className="text-[9px] sm:text-[10px] font-serif uppercase tracking-wider opacity-80 truncate block"
                          >
                            {author}
                          </span>
                        </div>

                        {/* 4. Raised Leather/Cloth Ribs at Bottom */}
                        <div className="w-full space-y-1 mt-2">
                          <div className="w-full h-[1px] bg-white/20 shadow-xs" />
                          <div className="w-full h-[3px] bg-black/50 shadow-xs rounded-full" />
                        </div>

                        {/* Floating Pull-Out Tag & Details Preview on Hover */}
                        {isHovered && (
                          <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#F5FBE6] text-[#233D4D] rounded-xl shadow-2xl text-xs font-serif font-bold whitespace-nowrap z-50 border-2 border-[#215E61] flex items-center gap-1.5 animate-bounce-short">
                            <Sparkles size={12} className="text-[#215E61]" />
                            <span>Pull "{title}" to Desk</span>
                          </div>
                        )}

                        {/* Delete volume action */}
                        {works.length > 1 && isHovered && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRequestDelete(w);
                            }}
                            className="absolute top-2 right-1.5 p-1.5 rounded-full bg-black/70 text-red-300 hover:text-white hover:bg-red-800 transition-colors shadow-sm"
                            title="Remove Volume from Shelf"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Volume Slot (styled like an empty volume book jacket) */}
                  {isLastShelf && (
                    <button
                      onClick={() => setShowAddMenu(true)}
                      className="w-18 sm:w-22 md:w-24 h-60 sm:h-70 md:h-78 border-2 border-dashed border-[#406173] hover:border-[#F5FBE6] hover:bg-white/5 rounded-t-sm flex flex-col items-center justify-center gap-2 text-[#799fb5] hover:text-[#F5FBE6] transition-all cursor-pointer shrink-0 group mb-0"
                      title="Bind a new volume on this shelf"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#1b2b34] group-hover:bg-[#215E61] flex items-center justify-center text-[#F5FBE6] shadow-sm transition-colors">
                        <Plus size={18} />
                      </div>
                      <span className="text-[10px] font-serif uppercase tracking-widest text-center px-1 font-semibold">
                        New Volume
                      </span>
                    </button>
                  )}

                  {/* Right Brass Bookend */}
                  <div className="w-4 h-48 bg-gradient-to-r from-[#73531b] via-[#d4af37] to-[#997328] rounded-t-xs shadow-lg shrink-0 opacity-80 self-end mb-0 hidden sm:block ml-auto" />

                </div>

                {/* HEAVY SOLID CEDAR / MAHOGANY WOODEN SHELF LEDGE */}
                <div className="w-full h-8 rounded-b-xs bg-gradient-to-r from-[#3e2413] via-[#61391e] to-[#3e2413] border-t-3 border-[#8c572f] shadow-2xl relative flex items-center justify-between px-4">
                  {/* Wood Grain & Depth Inner Shadow */}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute -bottom-3 left-0 right-0 h-3 bg-[#1e1108] shadow-inner" />
                  
                  {/* Brass Corner Brackets */}
                  <div className="w-6 h-full bg-gradient-to-b from-[#d4af37] to-[#805f15] opacity-80 z-10" />
                  <div className="w-6 h-full bg-gradient-to-b from-[#d4af37] to-[#805f15] opacity-80 z-10" />
                </div>

              </section>
            );
          })}

        </div>

        {/* Bottom Ambient Hallmarks */}
        <div className="max-w-6xl w-full mx-auto pt-6 border-t border-[#233742] flex items-center justify-between text-xs text-[#7091a4] font-serif shrink-0">
          <span className="italic">
            Tip: Pulling a book smoothly opens it on your writing desk with autosave active.
          </span>
          <span className="hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[#1c2d37] border border-[#2e4757] text-[10px] text-[#F5FBE6]">ESC</kbd> or click Writing Desk to return.
          </span>
        </div>

      </div>

    </div>
  );
};
