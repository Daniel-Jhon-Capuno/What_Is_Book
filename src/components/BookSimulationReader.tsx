import React, { useState, useEffect } from 'react';
import { LiteraryWork, BookWork, PoemWork, QuoteWork } from '../types';
import { soundEngine } from '../utils/ambientSound';
import { downloadHtmlFile } from '../utils/htmlExporter';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  Download, 
  X, 
  Menu, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Printer 
} from 'lucide-react';

interface BookSimulationReaderProps {
  work: LiteraryWork;
  onClose: () => void;
}

export const BookSimulationReader: React.FC<BookSimulationReaderProps> = ({ work, onClose }) => {
  const [spreadIndex, setSpreadIndex] = useState<number>(0);
  const [isTwoPage, setIsTwoPage] = useState<boolean>(true);
  const [showToc, setShowToc] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Prepare pages
  const pages = React.useMemo(() => {
    if (work.type === 'book') {
      const book = work as BookWork;
      return [
        {
          type: 'cover' as const,
          title: book.title,
          subtitle: book.subtitle,
          author: book.author,
          genre: book.genre,
          year: book.year,
        },
        {
          type: 'about' as const,
          title: 'Context & Dedication',
          about: book.about,
          dedication: book.dedication,
        },
        ...book.chapters.map((ch, idx) => ({
          type: 'chapter' as const,
          num: idx + 1,
          title: ch.title,
          subtitle: ch.subtitle,
          content: ch.content,
        })),
      ];
    } else if (work.type === 'poem') {
      const poem = work as PoemWork;
      return [
        {
          type: 'poem-front' as const,
          title: poem.title,
          poet: poem.poet,
          form: poem.form,
          body: poem.body,
          dateOrLocation: poem.dateOrLocation,
        },
        {
          type: 'poem-about' as const,
          title: 'About This Poem',
          about: poem.about,
          poet: poem.poet,
        },
      ];
    } else {
      const quote = work as QuoteWork;
      return [
        {
          type: 'quote-card' as const,
          quote: quote.quote,
          maker: quote.maker,
          about: quote.about,
          year: quote.year,
          category: quote.category,
        },
      ];
    }
  }, [work]);

  const totalSpreads = isTwoPage ? Math.ceil(pages.length / 2) : pages.length;

  const handleNext = () => {
    if (spreadIndex < totalSpreads - 1) {
      if (soundEnabled) soundEngine.playPageTurn();
      setSpreadIndex(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (spreadIndex > 0) {
      if (soundEnabled) soundEngine.playPageTurn();
      setSpreadIndex(s => s - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spreadIndex, totalSpreads, soundEnabled]);

  // Adjust two-page mode based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 850) {
        setIsTwoPage(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderSinglePage = (pageIndex: number, position: 'left' | 'right' | 'single') => {
    const page = pages[pageIndex];
    if (!page) {
      return (
        <div className="flex-1 flex items-center justify-center text-[#215E61]/40 italic font-serif">
          [ End of Volume ]
        </div>
      );
    }

    if (page.type === 'cover') {
      return (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border-2 border-[#215E61]/40 m-2 relative bg-[#F5FBE6]">
          <div className="absolute inset-2 border border-dashed border-[#215E61]/25 pointer-events-none" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#215E61] font-serif mb-4">
            {page.genre || 'Original Work'}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#233D4D] mb-3 leading-tight">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="text-base text-[#215E61] italic mb-6 max-w-sm">
              {page.subtitle}
            </p>
          )}
          <div className="w-12 h-[1px] bg-[#215E61] mx-auto my-4 relative">
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] bg-[#F5FBE6] px-1 text-[#215E61]">✦</span>
          </div>
          <p className="text-sm font-serif uppercase tracking-widest text-[#233D4D]">
            By {page.author || 'Anonymous'}
          </p>
          {page.year && (
            <span className="text-xs text-[#536D7D] mt-2 italic">{page.year}</span>
          )}
        </div>
      );
    }

    if (page.type === 'about') {
      return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="text-center pb-3 border-b border-[#215E61]/15 mb-6">
            <span className="text-xs font-serif uppercase tracking-widest text-[#215E61]">
              Context & Inscription
            </span>
          </div>

          {page.dedication && (
            <div className="p-4 mb-6 bg-[#215E61]/5 border-l-2 border-[#215E61] text-[#215E61] italic text-sm text-center">
              "{page.dedication}"
            </div>
          )}

          <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-[#215E61] mb-2">
            About This Book
          </h3>
          <div className="text-sm leading-relaxed text-[#233D4D] font-serif space-y-3">
            {page.about.split(/\n\s*\n/).map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="mt-auto pt-6 text-center text-xs text-[#536D7D] font-serif italic">
            — {pageIndex + 1} —
          </div>
        </div>
      );
    }

    if (page.type === 'chapter') {
      return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
          <div className="text-center pb-2 border-b border-[#215E61]/15 mb-4">
            <span className="text-[11px] font-serif uppercase tracking-widest text-[#215E61]">
              {(work as BookWork).title}
            </span>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#215E61]">
              Chapter {page.num}: {page.title}
            </h2>
            {page.subtitle && (
              <p className="text-xs text-[#536D7D] italic mt-1">{page.subtitle}</p>
            )}
          </div>

          <div className="text-base leading-relaxed text-[#233D4D] font-serif space-y-4 text-justify">
            {page.content.split(/\n\s*\n/).map((p, idx) => (
              <p 
                key={idx} 
                className={idx === 0 ? 'dropcap' : 'indent-6'}
              >
                {p}
              </p>
            ))}
          </div>

          <div className="mt-auto pt-6 text-center text-xs text-[#536D7D] font-serif italic">
            — {pageIndex + 1} —
          </div>
        </div>
      );
    }

    if (page.type === 'poem-front') {
      return (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-6 md:p-10 overflow-y-auto">
          {page.form && (
            <span className="text-xs font-serif uppercase tracking-[0.2em] text-[#215E61] mb-2">
              {page.form}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#233D4D] mb-1">
            {page.title}
          </h2>
          <p className="text-sm text-[#215E61] italic mb-6">by {page.poet}</p>

          <div className="space-y-4 text-base md:text-lg leading-relaxed text-[#233D4D] font-serif mb-8">
            {page.body.split(/\n\s*\n/).map((stanza, idx) => (
              <div key={idx} className="whitespace-pre-line">
                {stanza}
              </div>
            ))}
          </div>

          <div className="w-full max-w-sm pt-4 border-t border-[#215E61]/20 flex justify-between text-xs italic text-[#536D7D]">
            <span>{page.dateOrLocation}</span>
            <span className="font-serif uppercase tracking-widest text-[10px] text-[#215E61] font-bold">
              {page.poet}
            </span>
          </div>
        </div>
      );
    }

    if (page.type === 'poem-about') {
      return (
        <div className="flex-1 flex flex-col justify-center p-8 text-center max-w-md mx-auto">
          <span className="text-xs font-serif uppercase tracking-widest text-[#215E61] mb-2">
            Context & Background
          </span>
          <h3 className="text-xl font-serif font-bold text-[#233D4D] mb-4">
            Notes on the Work
          </h3>
          <p className="text-sm font-serif leading-relaxed text-[#233D4D] italic bg-[#215E61]/5 p-6 rounded-lg border-l-2 border-[#215E61]">
            {page.about || 'No additional notes provided for this poem.'}
          </p>
        </div>
      );
    }

    if (page.type === 'quote-card') {
      return (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8 md:p-12 relative">
          <div className="absolute inset-4 border border-dashed border-[#215E61]/30 rounded-sm pointer-events-none" />
          
          <span className="text-6xl text-[#215E61]/30 font-serif leading-none select-none mb-2">
            “
          </span>
          
          {/* Quote Body (ABOVE) */}
          <p className="text-2xl md:text-3xl font-serif italic text-[#233D4D] leading-relaxed max-w-xl mb-8">
            “{page.quote}”
          </p>

          <div className="w-12 h-[1px] bg-[#215E61] mx-auto mb-4 relative">
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] bg-[#F5FBE6] px-1 text-[#215E61]">✦</span>
          </div>

          {/* Maker Name (BELOW) */}
          <h3 className="text-lg font-serif font-bold tracking-widest uppercase text-[#215E61]">
            {page.maker}
          </h3>

          {page.about && (
            <p className="text-xs text-[#536D7D] italic mt-1 max-w-sm">
              {page.about} {page.year ? `(${page.year})` : ''}
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  const leftPageIndex = isTwoPage ? spreadIndex * 2 : spreadIndex;
  const rightPageIndex = isTwoPage ? spreadIndex * 2 + 1 : -1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#233D4D]/90 backdrop-blur-md">
      {/* Simulation Top Bar */}
      <header className="px-6 py-3 bg-[#F5FBE6] border-b border-[#215E61]/20 flex items-center justify-between text-[#233D4D]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowToc(!showToc)}
            className="p-1.5 rounded-md hover:bg-[#215E61]/10 text-[#215E61] transition-colors"
            title="Table of Contents"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#215E61]" />
            <span className="font-serif font-semibold text-sm truncate max-w-xs md:max-w-md">
              {work.type === 'quote' ? `Quote by ${work.maker}` : work.title}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg text-xs text-[#215E61] hover:bg-[#215E61]/10"
            title={soundEnabled ? 'Disable page sound' : 'Enable page sound'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* 1-Page / 2-Page view switcher */}
          <button
            onClick={() => setIsTwoPage(!isTwoPage)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#215E61]/30 hover:bg-[#215E61]/10 text-[#215E61]"
          >
            <Maximize2 size={13} />
            <span>{isTwoPage ? 'Single Page' : 'Two-Page Spread'}</span>
          </button>

          {/* Export standalone HTML */}
          <button
            onClick={() => downloadHtmlFile(work)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] transition-all shadow-xs"
            title="Download Standalone HTML Reader file"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export Standalone HTML</span>
          </button>

          {/* Close modal */}
          <button
            onClick={onClose}
            className="p-1.5 ml-1 rounded-md text-[#233D4D]/70 hover:text-[#215E61] hover:bg-black/5"
            title="Close Simulation"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Reading Stage */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative overflow-hidden select-none">
        
        {/* Table of contents slide-over */}
        {showToc && (
          <div className="absolute top-0 left-0 bottom-0 w-72 bg-[#F5FBE6] border-r border-[#215E61]/20 shadow-2xl z-40 p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#215E61]/20 mb-4">
              <span className="font-serif font-bold text-sm text-[#215E61]">Contents</span>
              <button onClick={() => setShowToc(false)} className="text-xs text-[#233D4D]">✕</button>
            </div>
            <div className="space-y-1">
              {pages.map((p, idx) => {
                let label = `Page ${idx + 1}`;
                if (p.type === 'cover') label = 'Title & Cover';
                else if (p.type === 'about') label = 'About & Dedication';
                else if (p.type === 'chapter') label = `Ch. ${p.num}: ${p.title}`;
                else if (p.type === 'poem-front') label = 'Poem Broadsheet';
                else if (p.type === 'poem-about') label = 'Poem Notes';
                else if (p.type === 'quote-card') label = 'Quote Card';

                const targetSpread = isTwoPage ? Math.floor(idx / 2) : idx;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSpreadIndex(targetSpread);
                      setShowToc(false);
                      if (soundEnabled) soundEngine.playPageTurn();
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-xs transition-colors truncate ${
                      (isTwoPage ? spreadIndex === targetSpread : spreadIndex === idx)
                        ? 'bg-[#215E61] text-[#F5FBE6] font-semibold'
                        : 'text-[#233D4D] hover:bg-[#215E61]/10'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Previous page arrow */}
        <button
          onClick={handlePrev}
          disabled={spreadIndex === 0}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#F5FBE6] border border-[#215E61]/30 text-[#215E61] flex items-center justify-center shadow-lg hover:bg-[#215E61] hover:text-[#F5FBE6] transition-all disabled:opacity-20 disabled:pointer-events-none z-30 cursor-pointer"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Next page arrow */}
        <button
          onClick={handleNext}
          disabled={spreadIndex >= totalSpreads - 1}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#F5FBE6] border border-[#215E61]/30 text-[#215E61] flex items-center justify-center shadow-lg hover:bg-[#215E61] hover:text-[#F5FBE6] transition-all disabled:opacity-20 disabled:pointer-events-none z-30 cursor-pointer"
        >
          <ChevronRight size={24} />
        </button>

        {/* The Realistic Book Volume Container */}
        <div 
          className={`w-full max-w-5xl h-[80vh] bg-[#F5FBE6] rounded-md shadow-2xl border border-[#215E61]/30 flex relative overflow-hidden book-paper-texture ${
            isTwoPage ? 'flex-row' : 'flex-col'
          }`}
        >
          {/* Middle spine shadow crease for realistic 2-page book feel */}
          {isTwoPage && (
            <div className="absolute top-0 bottom-0 left-1/2 -ml-4 w-8 pointer-events-none z-20 bg-gradient-to-r from-transparent via-[#233D4D]/15 to-transparent" />
          )}

          {/* Left Page (or single page) */}
          <div className={`flex-1 flex flex-col h-full overflow-hidden ${isTwoPage ? 'border-r border-[#215E61]/15 book-spine-effect' : ''}`}>
            {renderSinglePage(leftPageIndex, isTwoPage ? 'left' : 'single')}
          </div>

          {/* Right Page (if two-page mode active) */}
          {isTwoPage && (
            <div className="flex-1 flex flex-col h-full overflow-hidden book-spine-right-effect">
              {renderSinglePage(rightPageIndex, 'right')}
            </div>
          )}
        </div>

      </div>

      {/* Bottom Progress Bar */}
      <footer className="px-6 py-2.5 bg-[#F5FBE6]/95 border-t border-[#215E61]/20 flex items-center justify-between text-xs text-[#536D7D]">
        <div>
          Page {isTwoPage ? `${leftPageIndex + 1}${rightPageIndex < pages.length ? `–${rightPageIndex + 1}` : ''}` : leftPageIndex + 1} of {pages.length}
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">Use Arrow keys (← / →) or Spacebar to flip pages</span>
          <div className="w-32 bg-[#215E61]/15 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#215E61] h-full transition-all duration-300"
              style={{ width: `${((spreadIndex + 1) / totalSpreads) * 100}%` }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};
