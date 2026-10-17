import React, { useRef, useState, useEffect } from 'react';
import type { PoemWork } from '../types';
import { toPng, toBlob } from 'html-to-image';
import { 
  Download, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Maximize2, 
  Minimize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PoemImageModalProps {
  poem: PoemWork;
  onClose: () => void;
}

export const PoemImageModal: React.FC<PoemImageModalProps> = ({ poem, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<'morning-paper' | 'silent-grove' | 'blue-monolith'>('morning-paper');
  const [alignment, setAlignment] = useState<'center' | 'left' | 'right'>('center');
  const [fontSize, setFontSize] = useState<number>(16);
  const [fitToView, setFitToView] = useState<boolean>(true);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const getThemeStyles = () => {
    switch (theme) {
      case 'silent-grove':
        return {
          bg: '#215E61',
          text: '#F5FBE6',
          title: '#F5FBE6',
          accent: '#A7E1D8',
          border: 'rgba(245, 251, 230, 0.35)',
        };
      case 'blue-monolith':
        return {
          bg: '#233D4D',
          text: '#F5FBE6',
          title: '#FEE440',
          accent: '#A8C5D6',
          border: 'rgba(245, 251, 230, 0.35)',
        };
      case 'morning-paper':
      default:
        return {
          bg: '#FAFDF3',
          text: '#233D4D',
          title: '#215E61',
          accent: '#215E61',
          border: 'rgba(33, 94, 97, 0.35)',
        };
    }
  };

  const currentStyles = getThemeStyles();

  // Dynamically calculate scale factor when "fitToView" is active so the entire broadsheet is 100% visible on screen
  useEffect(() => {
    if (!fitToView) {
      setScaleFactor(1);
      return;
    }

    const updateScale = () => {
      if (cardRef.current && containerRef.current) {
        const containerH = containerRef.current.clientHeight - 40; // available height with padding
        const cardH = cardRef.current.scrollHeight;
        if (cardH > 0 && containerH > 0) {
          const ratio = Math.min(1, containerH / cardH);
          setScaleFactor(Math.max(0.65, Math.min(1, ratio)));
        }
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [fitToView, fontSize, theme, alignment, poem]);

  // Full Unclipped Export
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const el = cardRef.current;
      // Get the exact unscaled natural dimensions of the entire card
      const fullWidth = el.scrollWidth;
      const fullHeight = el.scrollHeight;

      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 3, // Ultra crisp high-DPI export
        width: fullWidth,
        height: fullHeight,
        style: {
          transform: 'none',
          margin: '0',
          maxHeight: 'none',
          height: `${fullHeight}px`,
          width: `${fullWidth}px`,
        },
      });

      const safeName = (poem.title || 'poem')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 24);

      const link = document.createElement('a');
      link.download = `poem_${safeName}_broadsheet_${alignment}.png`;
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
      alert('Could not export broadsheet image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    if (!cardRef.current) return;
    try {
      const el = cardRef.current;
      const fullWidth = el.scrollWidth;
      const fullHeight = el.scrollHeight;

      const blob = await toBlob(el, {
        pixelRatio: 2,
        width: fullWidth,
        height: fullHeight,
        style: {
          transform: 'none',
          margin: '0',
          maxHeight: 'none',
          height: `${fullHeight}px`,
          width: `${fullWidth}px`,
        },
      });

      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        alert('Clipboard image copy not supported in this browser; please use Download PNG.');
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      alert('Could not copy image. Try downloading PNG instead.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#233D4D]/75 backdrop-blur-sm overflow-hidden select-none">
      <div className="relative w-full max-w-4xl bg-[#F5FBE6] rounded-2xl shadow-2xl border border-[#215E61]/25 flex flex-col max-h-[96vh] h-full overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#215E61]/15 bg-[#FAFDF3] shrink-0">
          <div className="flex items-center gap-2 text-[#215E61] font-semibold text-sm">
            <Sparkles size={16} />
            <span>Poem Broadsheet Snapshot Studio</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-[#233D4D]/60 hover:text-[#215E61] hover:bg-[#215E61]/10 rounded-full transition-colors cursor-pointer"
            title="Close Snapshot Studio"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Themes, Alignment, Font Size, Fit Toggle, Export */}
        <div className="px-6 py-2.5 bg-[#FAFDF3]/80 border-b border-[#215E61]/10 flex items-center justify-between flex-wrap gap-3 shrink-0 text-xs">
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* Theme Palette */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#215E61] font-bold uppercase tracking-wider">Theme:</span>
              {[
                { id: 'morning-paper', name: 'Morning Paper', bg: '#F5FBE6' },
                { id: 'silent-grove', name: 'Silent Grove', bg: '#215E61' },
                { id: 'blue-monolith', name: 'Blue Monolith', bg: '#233D4D' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as 'morning-paper' | 'silent-grove' | 'blue-monolith')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                    theme === t.id 
                      ? 'border-[#215E61] bg-white shadow-2xs font-semibold text-[#215E61]' 
                      : 'border-[#215E61]/20 bg-white/50 text-[#233D4D] hover:bg-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: t.bg }} />
                  <span className="hidden sm:inline">{t.name}</span>
                </button>
              ))}
            </div>

            {/* Alignment Picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#215E61] font-bold uppercase tracking-wider">Align:</span>
              <div className="flex items-center bg-white rounded-lg border border-[#215E61]/25 p-0.5 text-xs shadow-2xs">
                <button
                  onClick={() => setAlignment('left')}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    alignment === 'left' ? 'bg-[#215E61] text-[#F5FBE6]' : 'text-[#233D4D] hover:text-[#215E61]'
                  }`}
                  title="Align Left"
                >
                  <AlignLeft size={13} />
                </button>
                <button
                  onClick={() => setAlignment('center')}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    alignment === 'center' ? 'bg-[#215E61] text-[#F5FBE6]' : 'text-[#233D4D] hover:text-[#215E61]'
                  }`}
                  title="Align Center"
                >
                  <AlignCenter size={13} />
                </button>
                <button
                  onClick={() => setAlignment('right')}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    alignment === 'right' ? 'bg-[#215E61] text-[#F5FBE6]' : 'text-[#233D4D] hover:text-[#215E61]'
                  }`}
                  title="Align Right"
                >
                  <AlignRight size={13} />
                </button>
              </div>
            </div>

            {/* Font Size controls */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#215E61] font-bold uppercase tracking-wider">Size:</span>
              <div className="flex items-center bg-white rounded-lg border border-[#215E61]/25 px-1 py-0.5 text-xs shadow-2xs">
                <button
                  onClick={() => setFontSize(Math.max(13, fontSize - 1))}
                  className="px-1.5 py-0.5 hover:bg-[#215E61]/10 rounded text-[#215E61] font-bold cursor-pointer"
                  title="Decrease Font Size"
                >
                  A-
                </button>
                <span className="px-1 font-mono text-[11px] text-[#536D7D]">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(Math.min(22, fontSize + 1))}
                  className="px-1.5 py-0.5 hover:bg-[#215E61]/10 rounded text-[#215E61] font-bold cursor-pointer"
                  title="Increase Font Size"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Fit to View Switcher */}
            <button
              onClick={() => setFitToView(!fitToView)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-serif font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                fitToView 
                  ? 'bg-[#215E61] text-[#F5FBE6] border-[#215E61]' 
                  : 'bg-white border-[#215E61]/25 text-[#215E61] hover:bg-[#215E61]/5'
              }`}
              title={fitToView ? 'Click for 100% actual size' : 'Click to auto-fit entire card in window'}
            >
              {fitToView ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              <span>{fitToView ? `Auto-fit (${Math.round(scaleFactor * 100)}%)` : '100%'}</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleCopyClipboard}
              className="py-1.5 px-3 bg-white border border-[#215E61]/30 hover:border-[#215E61] text-[#215E61] rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Copy snapshot directly to clipboard"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="py-1.5 px-4 bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Download size={13} />
              <span>{isExporting ? 'Capturing Full Card...' : 'Download PNG'}</span>
            </button>
          </div>

        </div>

        {/* Live Card Preview Stage (Scrollable if 100%, Perfectly scaled if Auto-fit) */}
        <div 
          ref={containerRef}
          className="flex-1 p-4 sm:p-8 bg-[#ebf3d3]/35 overflow-y-auto flex items-center justify-center relative"
        >
          <div 
            style={{ 
              transform: `scale(${scaleFactor})`, 
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out'
            }}
            className="shrink-0 my-auto py-2 flex items-center justify-center"
          >
            {/* The Actual Broadside Manuscript Card */}
            <div
              ref={cardRef}
              style={{
                backgroundColor: currentStyles.bg,
                color: currentStyles.text,
                fontFamily: "'EB Garamond', Georgia, serif",
                maxWidth: '560px',
                width: '560px',
                borderColor: currentStyles.border,
                textAlign: alignment,
              }}
              className="p-8 sm:p-12 border-2 rounded-sm shadow-2xl relative flex flex-col justify-between book-paper-texture"
            >
              {/* Inner dashed classical frame with comfortable inset */}
              <div 
                className="absolute inset-3 border border-dashed pointer-events-none opacity-45 rounded-xs"
                style={{ borderColor: currentStyles.border }}
              />

              {/* Form Hallmark */}
              {poem.form && (
                <div 
                  className="text-[11px] font-serif uppercase tracking-[0.25em] mb-2 font-semibold"
                  style={{ color: currentStyles.accent }}
                >
                  {poem.form}
                </div>
              )}

              {/* Poem Title */}
              <h2 
                className="text-2xl sm:text-3xl font-serif font-bold mb-1.5 tracking-wide leading-tight"
                style={{ color: currentStyles.title }}
              >
                {poem.title}
              </h2>

              {/* Poet Hallmark */}
              <div 
                className="text-sm italic mb-4 font-serif"
                style={{ color: currentStyles.accent }}
              >
                by {poem.poet || 'Anonymous'}
              </div>

              {/* Classical Flourish Ornament */}
              <div 
                className={`w-12 h-[1px] mb-6 relative opacity-80 ${
                  alignment === 'left' ? 'mr-auto' :
                  alignment === 'right' ? 'ml-auto' :
                  'mx-auto'
                }`}
                style={{ backgroundColor: currentStyles.accent }}
              >
                <span 
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] px-1 font-serif"
                  style={{ backgroundColor: currentStyles.bg, color: currentStyles.accent }}
                >
                  ❦
                </span>
              </div>

              {/* Stanzas with Custom Font Size and Alignment */}
              <div 
                style={{ fontSize: `${fontSize}px` }}
                className={`space-y-4 leading-relaxed font-serif my-auto ${
                  alignment === 'left' ? 'text-left' :
                  alignment === 'right' ? 'text-right' :
                  'text-center'
                }`}
              >
                {poem.body.split(/\n\s*\n/).map((stanza, idx) => (
                  <div key={idx} className="whitespace-pre-line">
                    {stanza}
                  </div>
                ))}
              </div>

              {/* Footer row with Date & Signature Hallmark (Always Unclipped & Spaced) */}
              <div 
                className="pt-4 mt-8 border-t flex justify-between items-center text-xs opacity-75 relative z-10 font-serif"
                style={{ borderColor: currentStyles.border }}
              >
                <span className="italic">{poem.dateOrLocation || 'Morning Edition'}</span>
                <span className="tracking-widest uppercase text-[10px] font-bold">
                  Scribe & Parchment
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Ambient Footer */}
        <div className="px-6 py-2 bg-[#FAFDF3] border-t border-[#215E61]/10 flex items-center justify-between text-[11px] text-[#536D7D] font-serif shrink-0">
          <span>Broadsheet format: 560px width · Full resolution 3x PNG export</span>
          <span className="italic hidden sm:inline">Use Auto-fit to view full broadsheet or adjust font size for long stanzas.</span>
        </div>

      </div>
    </div>
  );
};
