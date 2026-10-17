import React, { useState, useEffect } from 'react';
import type { LiteraryWork, WorkType, BookWork, PoemWork, QuoteWork } from '../types';
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
  Check, 
  Calendar, 
  Clock, 
  FileText 
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
    gradient: 'linear-gradient(to right, #102e30 0%, #215E61 45%, #2a7377 75%, #153c3e 100%)',
    border: '#2f7e83',
    textColor: '#F5FBE6',
    ribbonColor: '#e0c068',
    accentGold: '#ebd27d',
  },
  {
    gradient: 'linear-gradient(to right, #121e27 0%, #233D4D 45%, #2e4d61 75%, #16242e 100%)',
    border: '#3b617a',
    textColor: '#F5FBE6',
    ribbonColor: '#215E61',
    accentGold: '#f0d78c',
  },
  {
    gradient: 'linear-gradient(to right, #33171b 0%, #52272e 45%, #6e333d 75%, #33171b 100%)',
    border: '#7a3e47',
    textColor: '#F5FBE6',
    ribbonColor: '#d4af37',
    accentGold: '#f3d995',
  },
  {
    gradient: 'linear-gradient(to right, #1b2e23 0%, #2e4a3b 45%, #3d614e 75%, #1b2e23 100%)',
    border: '#4c7861',
    textColor: '#F5FBE6',
    ribbonColor: '#e5c158',
    accentGold: '#ebd27d',
  },
  {
    gradient: 'linear-gradient(to right, #38261b 0%, #543b2b 45%, #6e4e39 75%, #38261b 100%)',
    border: '#7d5941',
    textColor: '#F5FBE6',
    ribbonColor: '#215E61',
    accentGold: '#f0d78c',
  },
  {
    gradient: 'linear-gradient(to right, #242030 0%, #3d3652 45%, #52496e 75%, #242030 100%)',
    border: '#625882',
    textColor: '#F5FBE6',
    ribbonColor: '#e0c068',
    accentGold: '#ebd27d',
  },
];

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];

// Calculate spine width dynamically based on number of chapters
function getBookSpineThickness(work: LiteraryWork): {
  widthClass: string;
  heightClass: string;
  thicknessLabel: string;
} {
  if (work.type === 'book') {
    const chCount = (work as BookWork).chapters?.length || 1;
    if (chCount <= 1) {
      return { widthClass: 'w-16 sm:w-20', heightClass: 'h-64 sm:h-76', thicknessLabel: 'Slender Volume' };
    } else if (chCount <= 3) {
      return { widthClass: 'w-20 sm:w-24', heightClass: 'h-68 sm:h-80', thicknessLabel: 'Standard Volume' };
    } else if (chCount <= 6) {
      return { widthClass: 'w-24 sm:w-28', heightClass: 'h-72 sm:h-84', thicknessLabel: 'Substantial Volume' };
    } else {
      return { widthClass: 'w-28 sm:w-34', heightClass: 'h-76 sm:h-88', thicknessLabel: 'Grand Tome' };
    }
  } else if (work.type === 'poem') {
    return { widthClass: 'w-16 sm:w-18', heightClass: 'h-60 sm:h-72', thicknessLabel: 'Poetry Folio' };
  } else {
    return { widthClass: 'w-14 sm:w-16', heightClass: 'h-56 sm:h-68', thicknessLabel: 'Pocket Inscription' };
  }
}

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
  const [showShelfPicker, setShowShelfPicker] = useState<boolean>(false);
  const [hoveredWorkId, setHoveredWorkId] = useState<string | null>(null);

  // Close menus when filter changes
  useEffect(() => {
    setShowAddMenu(false);
    setShowShelfPicker(false);
  }, [filter]);

  // Inspected book detail modal state
  const [inspectedWork, setInspectedWork] = useState<LiteraryWork | null>(null);

  // Keyboard escape listener to close inspect modal or bookshelf
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectedWork) {
          setInspectedWork(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inspectedWork, onClose]);

  if (!isOpen) return null;

  const filteredWorks = works.filter((w) => {
    if (filter !== 'all' && w.type !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (w.type === 'book') return w.title.toLowerCase().includes(q) || w.author.toLowerCase().includes(q);
    if (w.type === 'poem') return w.title.toLowerCase().includes(q) || w.poet.toLowerCase().includes(q);
    return w.quote.toLowerCase().includes(q) || w.maker.toLowerCase().includes(q);
  });

  // Organize works into shelves (e.g. 6 to 7 books per shelf beam so books breathe naturally)
  const VOLUMES_PER_SHELF = 6;
  const shelfRows: LiteraryWork[][] = [];
  for (let i = 0; i < filteredWorks.length; i += VOLUMES_PER_SHELF) {
    shelfRows.push(filteredWorks.slice(i, i + VOLUMES_PER_SHELF));
  }
  if (shelfRows.length === 0) {
    shelfRows.push([]);
  }

  const handleOpenInspectedBook = () => {
    if (inspectedWork) {
      const target = inspectedWork;
      setInspectedWork(null);
      onSelectWork(target);
    }
  };

  const handleCreateDirectOrMenu = () => {
    if (filter === 'quote') {
      onCreateWork('quote');
    } else if (filter === 'poem') {
      onCreateWork('poem');
    } else if (filter === 'book') {
      onCreateWork('book');
    } else {
      setShowAddMenu((prev) => !prev);
    }
  };

  const handleShelfSlotClick = () => {
    if (filter === 'quote') {
      onCreateWork('quote');
    } else if (filter === 'poem') {
      onCreateWork('poem');
    } else if (filter === 'book') {
      onCreateWork('book');
    } else {
      setShowShelfPicker((prev) => !prev);
    }
  };

  let slotLabel = 'New Volume';
  let SlotIcon = Plus;
  let topButtonLabel = 'Bind New Volume';
  let TopButtonIcon = Plus;

  if (filter === 'quote') {
    slotLabel = 'New Quote';
    SlotIcon = Quote;
    topButtonLabel = 'Inscribe New Quote';
    TopButtonIcon = Quote;
  } else if (filter === 'poem') {
    slotLabel = 'New Poem';
    SlotIcon = Feather;
    topButtonLabel = 'Pen New Poem';
    TopButtonIcon = Feather;
  } else if (filter === 'book') {
    slotLabel = 'New Book';
    SlotIcon = BookOpen;
    topButtonLabel = 'Bind New Book';
    TopButtonIcon = BookOpen;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0e171c] text-[#F5FBE6] animate-fadeIn select-none overflow-hidden">
      
      {/* 1. TOP LIBRARY CROWN NAVIGATION BAR */}
      <header className="h-16 px-4 sm:px-8 bg-[#15222a] border-b-2 border-[#2b424f] flex items-center justify-between shadow-xl shrink-0 z-20">
        
        {/* Left: Writing Desk Return Button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Desk</span>
          </button>

          <div className="flex items-center gap-2.5 ml-2">
            <div className="w-8 h-8 rounded-lg bg-[#215E61] flex items-center justify-center text-[#F5FBE6] shadow-sm">
              <BookOpen size={16} />
            </div>
            <div>
              <h1 className="font-serif font-bold text-base sm:text-lg text-[#F5FBE6] tracking-wide flex items-center gap-2">
                <span>The Private Library Shelves</span>
                <span className="text-[11px] font-sans font-normal text-[#8faec0] bg-[#223642] px-2 py-0.5 rounded-full">
                  {filteredWorks.length} Volumes
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Search & Filter Tabs */}
        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          <div className="hidden md:flex items-center bg-[#0d161b] p-1 rounded-xl border border-[#273d4a] text-xs">
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
              placeholder="Search by title or author..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0d161b] border border-[#273d4a] focus:border-[#215E61] text-[#F5FBE6] focus:outline-none placeholder-[#688899]"
            />
          </div>
        </div>

        {/* Right: Bind Volume & Exit */}
        <div className="flex items-center gap-2">
          {/* Add Volume Button */}
          <div className="relative">
            <button
              onClick={handleCreateDirectOrMenu}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title={filter === 'all' ? 'Choose type of volume to bind' : `Immediately create ${slotLabel.toLowerCase()}`}
            >
              <TopButtonIcon size={14} />
              <span>{topButtonLabel}</span>
            </button>

            {showAddMenu && filter === 'all' && (
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

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8faec0] hover:text-[#F5FBE6] hover:bg-white/10 transition-colors cursor-pointer"
            title="Exit Bookshelf (ESC)"
          >
            <X size={20} />
          </button>
        </div>

      </header>

      {/* 2. GRAND MULTI-SHELF SCROLLABLE LIBRARY CHAMBER */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-12 md:px-16 py-10 relative bg-radial from-[#18262f] via-[#111a20] to-[#0a1014] flex flex-col justify-between">
        
        <div className="max-w-6xl w-full mx-auto space-y-20 py-4">
          
          {shelfRows.map((shelfBooks, shelfIndex) => {
            const roman = ROMAN_NUMERALS[shelfIndex] || `${shelfIndex + 1}`;
            const isLastShelf = shelfIndex === shelfRows.length - 1;

            return (
              <section key={shelfIndex} className="relative">
                
                {/* Brass Plaque on Shelf Ledge Top */}
                <div className="flex items-center justify-between mb-3 px-4">
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
                    Handbound Inscriptions
                  </span>
                </div>

                {/* THE BOOKS ON THIS SHELF (Balanced & with ample top headroom so tooltips are never cut) */}
                <div className="w-full relative bg-[#131d24]/60 rounded-t-lg border-x-4 border-t-2 border-[#2b4452]/50 pt-24 pb-0 px-6 sm:px-12 flex items-end justify-center sm:justify-start gap-4 sm:gap-6 md:gap-8 overflow-x-auto min-h-[360px] sm:min-h-[400px]">
                  
                  {/* Left Antique Brass Bookend */}
                  <div className="w-5 h-48 bg-gradient-to-r from-[#997328] via-[#d4af37] to-[#73531b] rounded-t-xs shadow-lg shrink-0 opacity-80 self-end mb-0 hidden sm:block" />

                  {shelfBooks.map((w, bookIdx) => {
                    const globalIdx = shelfIndex * VOLUMES_PER_SHELF + bookIdx;
                    const isSelected = w.id === selectedWorkId;
                    const isHovered = hoveredWorkId === w.id;
                    const theme = BOOK_SPINE_STYLES[globalIdx % BOOK_SPINE_STYLES.length];
                    const { widthClass, heightClass, thicknessLabel } = getBookSpineThickness(w);

                    let title = '';
                    let author = '';
                    let badge = '';

                    if (w.type === 'book') {
                      const book = w as BookWork;
                      title = book.title || 'Untitled Book';
                      author = book.author || 'Author';
                      badge = `${book.chapters?.length || 1} Ch.`;
                    } else if (w.type === 'poem') {
                      title = w.title || 'Poetry';
                      author = w.poet || 'Poet';
                      badge = w.form || 'Poem';
                    } else {
                      title = w.maker ? `“${w.quote.slice(0, 18)}...”` : 'Quote';
                      author = w.maker || 'Maker';
                      badge = 'Quote';
                    }

                    return (
                      <div
                        key={w.id}
                        onMouseEnter={() => setHoveredWorkId(w.id)}
                        onMouseLeave={() => setHoveredWorkId(null)}
                        onClick={() => setInspectedWork(w)}
                        style={{
                          background: theme.gradient,
                          boxShadow: isHovered 
                            ? '0 25px 45px -10px rgba(0,0,0,0.85), 0 0 25px rgba(255,255,255,0.12), inset 6px 0 12px rgba(255,255,255,0.22), inset -6px 0 12px rgba(0,0,0,0.5)' 
                            : '0 12px 24px -5px rgba(0,0,0,0.6), inset 4px 0 8px rgba(255,255,255,0.14), inset -4px 0 8px rgba(0,0,0,0.4)',
                          transform: isHovered 
                            ? 'translateY(-34px) scale(1.05)' 
                            : isSelected 
                            ? 'translateY(-12px)' 
                            : 'translateY(0)',
                          transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        className={`relative ${widthClass} ${heightClass} rounded-t-sm border-t border-x cursor-pointer shrink-0 flex flex-col justify-between items-center py-4 px-1.5 group select-none`}
                      >
                        {/* 1. Raised Leather/Cloth Ribs at Top */}
                        <div className="w-full space-y-1">
                          <div className="w-full h-[3px] bg-black/50 shadow-xs rounded-full" />
                          <div className="w-full h-[1px] bg-white/20 shadow-xs" />
                        </div>

                        {/* Top Category / Chapter count badge */}
                        <div 
                          className="text-[9px] uppercase font-serif tracking-[0.2em] font-bold text-center opacity-90 px-1 truncate w-full"
                          style={{ color: theme.accentGold }}
                        >
                          {badge}
                        </div>

                        {/* Hanging Ribbon Bookmark Over Shelf */}
                        <div 
                          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3 h-8 rounded-b-xs shadow-md transition-transform group-hover:scale-y-115"
                          style={{ backgroundColor: theme.ribbonColor }}
                        />

                        {/* 2. Spine Gold Debossed Title */}
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
                            className="text-[9px] sm:text-[10px] font-serif uppercase tracking-wider opacity-85 truncate block"
                          >
                            {author}
                          </span>
                        </div>

                        {/* 4. Raised Leather/Cloth Ribs at Bottom */}
                        <div className="w-full space-y-1 mt-2">
                          <div className="w-full h-[1px] bg-white/20 shadow-xs" />
                          <div className="w-full h-[3px] bg-black/50 shadow-xs rounded-full" />
                        </div>

                        {/* Floating Pull-Out Tag & Details Preview on Hover (Full Room - NEVER Cut) */}
                        {isHovered && (
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#F5FBE6] text-[#233D4D] rounded-xl shadow-2xl text-xs font-serif font-bold whitespace-nowrap z-50 border-2 border-[#215E61] flex items-center gap-2 animate-bounce-short">
                            <Sparkles size={13} className="text-[#215E61]" />
                            <span>Click to Inspect "{title}"</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Volume Slot (styled like an empty volume book jacket) */}
                  {isLastShelf && (
                    <div className="relative shrink-0 mb-0">
                      <button
                        onClick={handleShelfSlotClick}
                        className="w-18 sm:w-22 h-60 sm:h-72 border-2 border-dashed border-[#406173] hover:border-[#F5FBE6] hover:bg-white/5 rounded-t-sm flex flex-col items-center justify-center gap-2 text-[#799fb5] hover:text-[#F5FBE6] transition-all cursor-pointer group"
                        title={filter === 'all' ? 'Choose a volume type to add on this shelf' : `Click to add ${slotLabel}`}
                      >
                        <div className="w-9 h-9 rounded-full bg-[#1b2b34] group-hover:bg-[#215E61] flex items-center justify-center text-[#F5FBE6] shadow-sm transition-colors">
                          <SlotIcon size={18} />
                        </div>
                        <span className="text-[10px] font-serif uppercase tracking-widest text-center px-1 font-semibold leading-tight">
                          {slotLabel}
                        </span>
                      </button>

                      {/* In-shelf Popover Menu right above the slot (ONLY when in 'all' view) */}
                      {showShelfPicker && filter === 'all' && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowShelfPicker(false);
                            }} 
                          />
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute -top-36 left-1/2 -translate-x-1/2 w-52 bg-[#FAFDF3] text-[#233D4D] rounded-xl shadow-2xl border-2 border-[#215E61] p-1.5 z-50 animate-scaleUp select-none book-paper-texture"
                          >
                            <div className="text-[10px] font-serif uppercase tracking-widest text-[#215E61] font-bold px-2 py-1 border-b border-[#215E61]/15 mb-1 text-center">
                              Select Volume Type
                            </div>
                            <button
                              onClick={() => {
                                onCreateWork('book');
                                setShowShelfPicker(false);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#215E61]/10 text-xs font-serif font-semibold text-[#215E61] transition-colors cursor-pointer"
                            >
                              <BookOpen size={13} />
                              <span>New Book Volume</span>
                            </button>
                            <button
                              onClick={() => {
                                onCreateWork('poem');
                                setShowShelfPicker(false);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#215E61]/10 text-xs font-serif font-semibold text-[#215E61] transition-colors cursor-pointer"
                            >
                              <Feather size={13} />
                              <span>New Poetry Broadsheet</span>
                            </button>
                            <button
                              onClick={() => {
                                onCreateWork('quote');
                                setShowShelfPicker(false);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#215E61]/10 text-xs font-serif font-semibold text-[#215E61] transition-colors cursor-pointer"
                            >
                              <Quote size={13} />
                              <span>New Inscribed Quote</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Right Antique Brass Bookend */}
                  <div className="w-5 h-48 bg-gradient-to-r from-[#73531b] via-[#d4af37] to-[#997328] rounded-t-xs shadow-lg shrink-0 opacity-80 self-end mb-0 hidden sm:block ml-auto" />

                </div>

                {/* HEAVY SOLID CEDAR / MAHOGANY WOODEN SHELF LEDGE */}
                <div className="w-full h-8 rounded-b-xs bg-gradient-to-r from-[#3e2413] via-[#61391e] to-[#3e2413] border-t-3 border-[#8c572f] shadow-2xl relative flex items-center justify-between px-4">
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
            Tip: Book thickness on shelf reflects chapter count. Click any volume to inspect its contents.
          </span>
          <span className="hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[#1c2d37] border border-[#2e4757] text-[10px] text-[#F5FBE6]">ESC</kbd> to return to desk.
          </span>
        </div>

      </div>

      {/* 3. BOOK INSPECTION DOSSIER MODAL (Shows details + Continue button!) */}
      {inspectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1116]/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#FAFDF3] rounded-2xl shadow-2xl border-2 border-[#215E61]/30 p-6 sm:p-8 book-paper-texture animate-scaleUp text-[#233D4D]">
            
            {/* Close Button */}
            <button
              onClick={() => setInspectedWork(null)}
              className="absolute top-4 right-4 p-1.5 text-[#233D4D]/50 hover:text-[#215E61] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              title="Close and inspect other books"
            >
              <X size={20} />
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#215E61]" />
              <span className="text-xs uppercase font-serif tracking-[0.25em] text-[#215E61] font-bold">
                {inspectedWork.type === 'book' && 'Bound Book Volume'}
                {inspectedWork.type === 'poem' && 'Poetry Broadsheet'}
                {inspectedWork.type === 'quote' && 'Inscribed Quotation'}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#233D4D] leading-tight mb-1">
              {inspectedWork.type === 'quote' 
                ? `Words of ${inspectedWork.maker || 'Unknown'}` 
                : inspectedWork.title}
            </h2>

            {inspectedWork.type === 'book' && (inspectedWork as BookWork).subtitle && (
              <p className="text-xs font-serif italic text-[#536D7D] mb-4">
                {(inspectedWork as BookWork).subtitle}
              </p>
            )}

            {/* Author / Maker Hallmark */}
            <p className="text-sm font-serif text-[#215E61] font-semibold mb-4">
              by {inspectedWork.type === 'quote' 
                ? (inspectedWork.maker || 'Unknown') 
                : (inspectedWork.type === 'poem' ? inspectedWork.poet : (inspectedWork as BookWork).author)}
              {inspectedWork.type === 'book' && (inspectedWork as BookWork).year && ` · ${(inspectedWork as BookWork).year}`}
            </p>

            <div className="w-full h-[1px] bg-[#215E61]/20 my-4" />

            {/* Body Content / Summary */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs font-serif leading-relaxed text-[#233D4D]/90">
              {inspectedWork.type === 'book' && (
                <>
                  <div className="bg-[#215E61]/5 p-3 rounded-xl border border-[#215E61]/15 space-y-1">
                    <div className="font-bold text-[#215E61] uppercase tracking-wider text-[10px]">
                      Structure & Contents
                    </div>
                    <div>Total Chapters: <strong>{(inspectedWork as BookWork).chapters.length}</strong></div>
                    <div className="text-[#536D7D] italic">
                      {(inspectedWork as BookWork).chapters.map((c, i) => `${i + 1}. ${c.title}`).join(' · ')}
                    </div>
                  </div>

                  {(inspectedWork as BookWork).about && (
                    <div>
                      <strong className="text-[#215E61] block mb-1">About & Context:</strong>
                      <p className="italic text-[#536D7D]">{(inspectedWork as BookWork).about}</p>
                    </div>
                  )}
                </>
              )}

              {inspectedWork.type === 'poem' && (
                <div className="bg-[#215E61]/5 p-4 rounded-xl border border-[#215E61]/15 italic">
                  {(inspectedWork as PoemWork).body.split('\n').slice(0, 4).join('\n')}
                  {(inspectedWork as PoemWork).body.split('\n').length > 4 && '\n...'}
                </div>
              )}

              {inspectedWork.type === 'quote' && (
                <div className="bg-[#215E61]/5 p-4 rounded-xl border border-[#215E61]/15 italic text-sm text-center">
                  “{(inspectedWork as QuoteWork).quote}”
                </div>
              )}
            </div>

            {/* Action Buttons: Continue to Desk vs Cancel */}
            <div className="mt-6 pt-4 border-t border-[#215E61]/20 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  const target = inspectedWork;
                  setInspectedWork(null);
                  onRequestDelete(target);
                }}
                className="p-2 text-red-700/60 hover:text-red-700 hover:bg-red-50 rounded-xl text-xs transition-colors cursor-pointer"
                title="Remove Volume from Shelf"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectedWork(null)}
                  className="px-4 py-2 rounded-xl border border-[#215E61]/25 hover:bg-black/5 text-[#233D4D] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Inspect Other Books
                </button>

                <button
                  onClick={handleOpenInspectedBook}
                  className="px-5 py-2 rounded-xl bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Open & Write in This Volume</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
