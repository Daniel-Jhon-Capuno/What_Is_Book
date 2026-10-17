import React, { useRef, useState } from 'react';
import { PoemWork } from '../types';
import { toPng } from 'html-to-image';
import { Download, X, Sparkles, Image } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PoemImageModalProps {
  poem: PoemWork;
  onClose: () => void;
}

export const PoemImageModal: React.FC<PoemImageModalProps> = ({ poem, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'morning-paper' | 'silent-grove' | 'blue-monolith'>('morning-paper');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const getThemeStyles = () => {
    switch (theme) {
      case 'silent-grove':
        return {
          bg: '#215E61',
          text: '#F5FBE6',
          title: '#F5FBE6',
          accent: '#A7E1D8',
          border: 'rgba(245, 251, 230, 0.3)',
        };
      case 'blue-monolith':
        return {
          bg: '#233D4D',
          text: '#F5FBE6',
          title: '#FEE440',
          accent: '#A8C5D6',
          border: 'rgba(245, 251, 230, 0.3)',
        };
      case 'morning-paper':
      default:
        return {
          bg: '#F5FBE6',
          text: '#233D4D',
          title: '#215E61',
          accent: '#215E61',
          border: 'rgba(33, 94, 97, 0.3)',
        };
    }
  };

  const currentStyles = getThemeStyles();

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
      });

      const safeName = (poem.title || 'poem')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 20);

      const link = document.createElement('a');
      link.download = `poem_${safeName}_broadsheet.png`;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#215E61', '#F5FBE6', '#233D4D'],
      });
    } catch (err) {
      console.error('Failed to export poem image:', err);
      alert('Could not export image.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#233D4D]/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#F5FBE6] rounded-2xl shadow-2xl border border-[#215E61]/20 p-6 flex flex-col max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#215E61]/15 mb-4">
          <div className="flex items-center gap-2 text-[#215E61] font-semibold text-sm">
            <Sparkles size={16} />
            Poem Broadsheet Snapshot
          </div>
          <button onClick={onClose} className="p-1 text-[#233D4D] hover:text-[#215E61]">
            <X size={20} />
          </button>
        </div>

        {/* Theme Picker */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#215E61] font-semibold uppercase tracking-wider">Theme:</span>
            {[
              { id: 'morning-paper', name: 'Morning Paper', bg: '#F5FBE6' },
              { id: 'silent-grove', name: 'Silent Grove', bg: '#215E61' },
              { id: 'blue-monolith', name: 'Blue Monolith', bg: '#233D4D' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as 'morning-paper' | 'silent-grove' | 'blue-monolith')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  theme === t.id ? 'border-[#215E61] bg-white shadow-xs font-semibold' : 'border-[#215E61]/20 bg-[#F5FBE6]'
                }`}
              >
                <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: t.bg }} />
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="py-1.5 px-4 bg-[#215E61] hover:bg-[#1b4d50] text-[#F5FBE6] rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            {isExporting ? 'Generating...' : 'Download Broadsheet PNG'}
          </button>
        </div>

        {/* Live Card Container */}
        <div className="flex justify-center p-4 bg-[#ebf3d3]/40 rounded-xl overflow-auto">
          <div
            ref={cardRef}
            style={{
              backgroundColor: currentStyles.bg,
              color: currentStyles.text,
              fontFamily: "'EB Garamond', Georgia, serif",
              maxWidth: '560px',
              width: '100%',
            }}
            className="p-8 md:p-12 border-2 rounded-sm shadow-lg text-center relative"
          >
            {/* Inner dashed frame */}
            <div 
              className="absolute inset-2 border border-dashed pointer-events-none opacity-40"
              style={{ borderColor: currentStyles.border }}
            />

            {poem.form && (
              <div 
                className="text-[11px] font-serif uppercase tracking-[0.25em] mb-3"
                style={{ color: currentStyles.accent }}
              >
                {poem.form}
              </div>
            )}

            <h2 
              className="text-2xl md:text-3xl font-serif font-bold mb-2 tracking-wide"
              style={{ color: currentStyles.title }}
            >
              {poem.title}
            </h2>

            <div 
              className="text-sm italic mb-5"
              style={{ color: currentStyles.accent }}
            >
              by {poem.poet || 'Anonymous'}
            </div>

            {/* Flourish */}
            <div 
              className="w-12 h-[1px] mx-auto mb-6 relative"
              style={{ backgroundColor: currentStyles.accent }}
            >
              <span 
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] px-1"
                style={{ backgroundColor: currentStyles.bg, color: currentStyles.accent }}
              >
                ❦
              </span>
            </div>

            {/* Stanzas */}
            <div className="space-y-4 text-base md:text-lg leading-relaxed mb-8">
              {poem.body.split(/\n\s*\n/).map((stanza, idx) => (
                <div key={idx} className="whitespace-pre-line">
                  {stanza}
                </div>
              ))}
            </div>

            {/* Footer row with Date & Signature */}
            <div 
              className="pt-4 border-t flex justify-between items-center text-xs opacity-75"
              style={{ borderColor: currentStyles.border }}
            >
              <span className="italic">{poem.dateOrLocation || 'Morning Edition'}</span>
              <span className="font-serif tracking-widest uppercase text-[10px]">
                Scribe & Parchment
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
