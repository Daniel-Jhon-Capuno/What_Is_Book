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
  Sparkles,
  ChevronLeft
} from 'lucide-react';

interface LibraryBookshelfProps {
  works: LiteraryWork[];
  selectedWorkId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectWork: (work: LiteraryWork) => void;
  onCreateWork: (type: WorkType) => void;
  onDeleteWork: (id: string) => void;
}

// Color palettes for book spine covers matching Morning Paper aesthetic
const SPINE_THEMES = [
  {
    bg: 'linear-gradient(135deg, #174245 0%, #215E61 50%, #2a7377 100%)',
    border: '#2f7e83',
    textColor: '#F5FBE6',
    ribbonColor: '#e0c068',
    leatherTexture: 'rgba(255,255,255,0.06)',
  },
  {
    bg: 'linear-gradient(135deg, #162631 0%, #233D4D 50%, #2f4f63 100%)',
    border: '#395e75',
    textColor: '#F5FBE6',
    ribbonColor: '#215E61',
    leatherTexture: 'rgba(255,255,255,0.05)',
  },
  {
    bg: 'linear-gradient(135deg, #2c423b 0%, #3a574e 50%, #4a6c62 100%)',
    border: '#567d73',
    textColor: '#F5FBE6',
    ribbonColor: '#d4af37',
    leatherTexture: 'rgba(255,255,255,0.07)',
  },
  {
    bg: 'linear-gradient(135deg, #44372c 0%, #574637 50%, #6e5947 100%)',
    border: '#826a54',
    textColor: '#F5FBE6',
    ribbonColor: '#215E61',
    leatherTexture: 'rgba(255,255,255,0.06)',
  },
  {
    bg: 'linear-gradient(135deg, #2b3a42 0%, #3b4d58 50%, #4c6270 100%)',
    border: '#5d7686',
    textColor: '#F5FBE6',
    ribbonColor: '#c59b27',
    leatherTexture: 'rgba(255,255,255,0.05)',
  },
];

export const LibraryBookshelf: React.FC<LibraryBookshelfProps> = ({
  works,
  selectedWorkId,
  isOpen,
  onClose,
  onSelectWork,
  onCreateWork,
  onDeleteWork,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#233D4D]/75 backdrop-blur-md overflow-hidden animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#1e2f38] rounded-2xl shadow-2xl border-4 border-[#324f5e] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Bookshelf Header */}
        <div className="px-6 py-4 bg-[#18272f] border-b border-[#365363] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#215E61] flex items-center justify-center text-[#F5FBE6] shadow-sm">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#F5FBE6] tracking-wide flex items-center gap-2">
                <span>The Private Library Shelf</span>
                <span className="text-xs font-sans font-normal text-[#9db9c9] bg-[#233d4d] px-2 py-0.5 rounded-full">
                  {works.length} {works.length === 1 ? 'Volume' : 'Volumes'}
                </span>
              </h2>
              <p className="text-xs text-[#9db9c9] font-serif italic">
                Hover over any spine to pull it from the shelf, then click to open and write.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter buttons */}
            <div className="hidden sm:flex items-center bg-[#101b22] p-1 rounded-xl border border-[#324f5e] text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'book', label: 'Books' },
                { id: 'poem', label: 'Poems' },
                { id: 'quote', label: 'Quotes' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id as WorkType | 'all')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    filter === t.id
                      ? 'bg-[#215E61] text-[#F5FBE6] font-semibold'
                      : 'text-[#9db9c9] hover:text-[#F5FBE6]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-40 sm:w-48">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#718f9f]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shelf..."
                className="w-full pl-7 pr-2.5 py-1 text-xs rounded-xl bg-[#101b22] border border-[#324f5e] focus:border-[#215E61] text-[#F5FBE6] focus:outline-none placeholder-[#718f9f]"
              />
            </div>

            {/* Close shelf button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9db9c9] hover:text-[#F5FBE6] hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Bookshelf"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Shelf Interior Stage */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-radial from-[#1f313c] to-[#121c22] flex flex-col justify-end min-h-[460px]">
          
          {/* Books Row standing on the shelf ledge */}
          <div className="w-full relative flex items-end justify-center gap-3 sm:gap-4 pb-2 overflow-x-auto pt-16">
            
            {filteredWorks.map((w, idx) => {
              const isSelected = w.id === selectedWorkId;
              const isHovered = hoveredWorkId === w.id;
              const theme = SPINE_THEMES[idx % SPINE_THEMES.length];

              // Title and author on spine
              let title = '';
              let author = '';
              let height = 'h-72 sm:h-80'; // Realistic varied book heights
              let width = 'w-14 sm:w-16';

              if (w.type === 'book') {
                title = w.title || 'Untitled Book';
                author = w.author || 'Author';
                height = idx % 2 === 0 ? 'h-76 sm:h-84' : 'h-72 sm:h-80';
                width = 'w-16 sm:w-18';
              } else if (w.type === 'poem') {
                title = w.title || 'Poetry';
                author = w.poet || 'Poet';
                height = 'h-68 sm:h-76';
                width = 'w-13 sm:w-15';
              } else {
                title = w.maker ? `“${w.quote.slice(0, 18)}...”` : 'Quote';
                author = w.maker || 'Maker';
                height = 'h-64 sm:h-70';
                width = 'w-12 sm:w-14';
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
                      ? 'translateY(-24px) scale(1.03)' 
                      : isSelected 
                      ? 'translateY(-10px)' 
                      : 'translateY(0)',
                    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className={`relative ${width} ${height} rounded-t-md border-x-2 border-t-2 shadow-2xl cursor-pointer select-none shrink-0 flex flex-col justify-between items-center py-4 px-1 group`}
                >
                  {/* Spine Ribs (Raised bands common on leather bound antique books) */}
                  <div className="w-full h-[2px] bg-black/40 shadow-xs" />
                  <div className="w-full h-[2px] bg-black/40 shadow-xs mt-3" />

                  {/* Bookmark ribbon hanging out of the bottom */}
                  <div 
                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-2.5 h-6 rounded-b-xs shadow-md"
                    style={{ backgroundColor: theme.ribbonColor }}
                  />

                  {/* Spine Gold Embossed Title (Rotated 90 degrees vertically) */}
                  <div className="flex-1 flex items-center justify-center overflow-hidden my-3">
                    <span
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        color: theme.textColor,
                      }}
                      className="font-serif text-xs font-bold tracking-widest uppercase transform rotate-180 truncate max-h-48 drop-shadow-sm"
                    >
                      {title}
                    </span>
                  </div>

                  {/* Author at the base */}
                  <div className="w-full text-center px-1 overflow-hidden">
                    <span 
                      style={{ color: theme.textColor }}
                      className="text-[9px] font-serif uppercase tracking-wider opacity-75 truncate block"
                    >
                      {author}
                    </span>
                  </div>

                  {/* Spine Bottom Ribs */}
                  <div className="w-full h-[2px] bg-black/40 shadow-xs mb-3" />
                  <div className="w-full h-[2px] bg-black/40 shadow-xs" />

                  {/* Hover Tag Tooltip hovering above the pulled book */}
                  {isHovered && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#F5FBE6] text-[#233D4D] rounded-lg shadow-xl text-xs font-serif font-bold whitespace-nowrap z-50 border border-[#215E61] animate-bounce-short">
                      Take "{title}"
                    </div>
                  )}

                  {/* Delete button (discrete) */}
                  {works.length > 1 && isHovered && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove "${title}" from shelf?`)) {
                          onDeleteWork(w.id);
                        }
                      }}
                      className="absolute top-2 right-1 p-1 rounded-full bg-black/60 text-red-400 hover:text-red-200 hover:bg-black/80 transition-colors"
                      title="Remove Volume"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Empty book placeholder slot: "+ Bind New Book" */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-14 sm:w-16 h-64 sm:h-72 border-2 border-dashed border-[#43677b] hover:border-[#F5FBE6] hover:bg-white/5 rounded-t-md flex flex-col items-center justify-center gap-2 text-[#799fb5] hover:text-[#F5FBE6] transition-all cursor-pointer group"
                title="Add a new volume to this shelf"
              >
                <div className="w-8 h-8 rounded-full bg-[#233d4d] group-hover:bg-[#215E61] flex items-center justify-center text-[#F5FBE6] transition-colors">
                  <Plus size={16} />
                </div>
                <span className="text-[10px] font-serif uppercase tracking-wider text-center px-1">
                  New Volume
                </span>
              </button>

              {/* Add menu popover */}
              {showAddMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-[#F5FBE6] border border-[#215E61]/30 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 text-xs">
                    <button
                      onClick={() => {
                        onCreateWork('book');
                        setShowAddMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 text-[#233D4D] font-medium"
                    >
                      <BookOpen size={14} className="text-[#215E61]" />
                      <span>Bind New Book</span>
                    </button>
                    <button
                      onClick={() => {
                        onCreateWork('poem');
                        setShowAddMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 text-[#233D4D] font-medium"
                    >
                      <Feather size={14} className="text-[#215E61]" />
                      <span>Pen New Poem</span>
                    </button>
                    <button
                      onClick={() => {
                        onCreateWork('quote');
                        setShowAddMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 text-[#233D4D] font-medium"
                    >
                      <Quote size={14} className="text-[#215E61]" />
                      <span>Inscribe New Quote</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Realistic Wooden Shelf Ledge (Books rest on this beam) */}
          <div className="w-full h-7 rounded-sm bg-gradient-to-r from-[#593922] via-[#754c2e] to-[#593922] border-t-2 border-[#946540] shadow-2xl relative">
            {/* Shelf Wood Grain Depth & Shadow */}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute -bottom-2 left-0 right-0 h-2 bg-[#331f12] shadow-inner" />
          </div>

        </div>

        {/* Shelf Footer */}
        <div className="px-6 py-3 bg-[#18272f] border-t border-[#365363] flex items-center justify-between text-xs text-[#9db9c9]">
          <span className="font-serif italic">
            Select any book on the shelf to bring it to your desk.
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
