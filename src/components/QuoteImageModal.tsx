import React, { useRef, useState } from 'react';
import type { QuoteWork } from '../types';
import { toPng, toBlob } from 'html-to-image';
import { 
  Download, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Image, 
  Ratio, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuoteImageModalProps {
  quote: QuoteWork;
  onClose: () => void;
}

type PaletteType = 'morning-paper' | 'silent-grove' | 'blue-monolith' | 'antique-parchment';
type RatioType = '1:1' | '9:16' | '4:5' | '16:9';
type FontType = 'eb-garamond' | 'cormorant' | 'cinzel' | 'newsreader';
type AlignmentType = 'center' | 'left' | 'right' | 'justify';

export const QuoteImageModal: React.FC<QuoteImageModalProps> = ({ quote, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [palette, setPalette] = useState<PaletteType>('morning-paper');
  const [ratio, setRatio] = useState<RatioType>('1:1');
  const [font, setFont] = useState<FontType>('cinzel');
  const [alignment, setAlignment] = useState<AlignmentType>('center');
  const [verticalAlign, setVerticalAlign] = useState<'center' | 'top' | 'bottom'>('center');
  const [fontSize, setFontSize] = useState<number>(20);
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Palette color styles
  const getPaletteStyles = () => {
    switch (palette) {
      case 'silent-grove':
        return {
          bg: '#215E61',
          text: '#F5FBE6',
          maker: '#E2F3CB',
          quoteMark: '#3EA3A8',
          subtext: '#C4E1D9',
          border: 'rgba(245, 251, 230, 0.4)',
        };
      case 'blue-monolith':
        return {
          bg: '#233D4D',
          text: '#F5FBE6',
          maker: '#FEE440',
          quoteMark: '#4A7C9D',
          subtext: '#A7C4D4',
          border: 'rgba(245, 251, 230, 0.35)',
        };
      case 'antique-parchment':
        return {
          bg: '#FAF8F0',
          text: '#1F2421',
          maker: '#215E61',
          quoteMark: '#997B66',
          subtext: '#6B705C',
          border: 'rgba(33, 94, 97, 0.25)',
        };
      case 'morning-paper':
      default:
        return {
          bg: '#F5FBE6',
          text: '#233D4D',
          maker: '#215E61',
          quoteMark: 'rgba(33, 94, 97, 0.35)',
          subtext: '#536D7D',
          border: 'rgba(33, 94, 97, 0.3)',
        };
    }
  };

  const getFontFamily = () => {
    switch (font) {
      case 'cormorant':
        return "'Cormorant Garamond', Georgia, serif";
      case 'cinzel':
        return "'Cinzel', Georgia, serif";
      case 'newsreader':
        return "'Newsreader', Georgia, serif";
      case 'eb-garamond':
      default:
        return "'EB Garamond', Georgia, serif";
    }
  };

  const currentStyles = getPaletteStyles();

  // Aspect ratio dimensions for preview container
  const getRatioStyle = () => {
    switch (ratio) {
      case '9:16':
        return { width: '360px', height: '640px' };
      case '4:5':
        return { width: '400px', height: '500px' };
      case '16:9':
        return { width: '560px', height: '315px' };
      case '1:1':
      default:
        return { width: '440px', height: '440px' };
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3, // Crisp high-DPI export
      });

      const safeName = (quote.maker || 'quote')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 20);

      const link = document.createElement('a');
      link.download = `quote_${safeName}_${ratio.replace(':', 'x')}_${alignment}.png`;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#215E61', '#F5FBE6', '#233D4D'],
      });
    } catch (err) {
      console.error('Failed to export quote image:', err);
      alert('Could not export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    if (!cardRef.current) return;
    try {
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 2,
      });
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        alert('Clipboard image copy is not supported in this browser; please use Download.');
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      alert('Could not copy image. Try downloading instead.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#233D4D]/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#F5FBE6] rounded-2xl shadow-2xl border border-[#215E61]/20 flex flex-col md:flex-row overflow-hidden my-4 max-h-[94vh]">
        
        {/* Controls Sidebar */}
        <div className="w-full md:w-80 p-5 sm:p-6 bg-[#ebf3d3]/80 border-r border-[#215E61]/15 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#215E61] font-semibold tracking-wide uppercase text-xs">
                <Sparkles size={16} />
                Quote Snapshot Studio
              </div>
              <button 
                onClick={onClose}
                className="md:hidden p-1 text-[#233D4D] hover:text-[#215E61]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Writing Alignment Selection (NEW) */}
            <div>
              <label className="block text-xs font-semibold text-[#215E61] uppercase tracking-wider mb-2">
                Writing Alignment
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'center', label: 'Center', icon: AlignCenter },
                  { id: 'left', label: 'Left', icon: AlignLeft },
                  { id: 'right', label: 'Right', icon: AlignRight },
                  { id: 'justify', label: 'Justify', icon: AlignJustify },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAlignment(item.id as AlignmentType)}
                    className={`py-2 px-1 rounded-lg text-center border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      alignment === item.id
                        ? 'border-[#215E61] bg-[#215E61] text-[#F5FBE6] font-semibold shadow-2xs'
                        : 'border-[#215E61]/20 bg-white/70 text-[#233D4D] hover:bg-white text-xs'
                    }`}
                  >
                    <item.icon size={14} />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette Presets */}
            <div>
              <label className="block text-xs font-semibold text-[#215E61] uppercase tracking-wider mb-2">
                Color Palette
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'morning-paper', name: 'Morning Paper', bg: '#F5FBE6' },
                  { id: 'silent-grove', name: 'Silent Grove', bg: '#215E61' },
                  { id: 'blue-monolith', name: 'Blue Monolith', bg: '#233D4D' },
                  { id: 'antique-parchment', name: 'Parchment', bg: '#FAF8F0' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPalette(item.id as PaletteType)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all cursor-pointer ${
                      palette === item.id 
                        ? 'border-[#215E61] bg-white text-[#215E61] shadow-xs ring-1 ring-[#215E61]' 
                        : 'border-[#215E61]/20 bg-[#F5FBE6] text-[#233D4D] hover:border-[#215E61]/50'
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" 
                      style={{ backgroundColor: item.bg }}
                    />
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ratio Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#215E61] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Ratio size={14} /> Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: '1:1', label: '1:1', sub: 'Square' },
                  { id: '4:5', label: '4:5', sub: 'Portrait' },
                  { id: '9:16', label: '9:16', sub: 'Story' },
                  { id: '16:9', label: '16:9', sub: 'Wide' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRatio(item.id as RatioType)}
                    className={`p-2 rounded-lg text-center border transition-all cursor-pointer ${
                      ratio === item.id
                        ? 'border-[#215E61] bg-[#215E61] text-[#F5FBE6] font-semibold'
                        : 'border-[#215E61]/20 bg-white/70 text-[#233D4D] hover:bg-white text-xs'
                    }`}
                  >
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[10px] opacity-75">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <label className="block text-xs font-semibold text-[#215E61] uppercase tracking-wider mb-2">
                Book Typography
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cinzel', name: 'Cinzel (Classical)' },
                  { id: 'eb-garamond', name: 'EB Garamond' },
                  { id: 'cormorant', name: 'Cormorant' },
                  { id: 'newsreader', name: 'Newsreader' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFont(item.id as FontType)}
                    className={`p-2 rounded-lg text-xs border text-center transition-all cursor-pointer ${
                      font === item.id
                        ? 'border-[#215E61] bg-white text-[#215E61] font-semibold shadow-xs'
                        : 'border-[#215E61]/20 bg-[#F5FBE6] text-[#233D4D] hover:bg-white'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size & Frame Toggles */}
            <div className="space-y-3 pt-2 border-t border-[#215E61]/15">
              <div>
                <div className="flex justify-between text-xs text-[#233D4D] mb-1">
                  <span>Font Size</span>
                  <span>{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="34"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-[#215E61] cursor-pointer"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[#233D4D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBorder}
                  onChange={(e) => setShowBorder(e.target.checked)}
                  className="accent-[#215E61] rounded"
                />
                <span>Include Ornamental Border</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-5 border-t border-[#215E61]/15">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full py-2.5 px-4 bg-[#215E61] hover:bg-[#1b4d50] text-[#F5FBE6] rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Download size={16} />
              {isExporting ? 'Generating High-Res...' : 'Download Image (.PNG)'}
            </button>

            <button
              onClick={handleCopyClipboard}
              className="w-full py-2.5 px-4 bg-white/80 hover:bg-white text-[#233D4D] border border-[#215E61]/30 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check size={16} className="text-[#215E61]" /> : <Copy size={16} />}
              {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>

        {/* Live Card Preview Area */}
        <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center bg-[#F5FBE6] overflow-auto relative">
          <button
            onClick={onClose}
            className="hidden md:flex absolute top-5 right-5 p-2 text-[#233D4D]/60 hover:text-[#215E61] rounded-full hover:bg-black/5 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="text-[11px] uppercase tracking-wider text-[#215E61] font-semibold mb-3 flex items-center gap-1.5 opacity-80">
            <Image size={13} /> Live Snapshot Preview ({alignment.toUpperCase()})
          </div>

          {/* The Actual Rendered Card */}
          <div
            ref={cardRef}
            style={{
              ...getRatioStyle(),
              backgroundColor: currentStyles.bg,
              color: currentStyles.text,
              fontFamily: getFontFamily(),
            }}
            className="relative flex flex-col justify-between p-8 md:p-10 shadow-xl transition-all duration-300 select-none overflow-hidden shrink-0"
          >
            {/* Optional ornamental border */}
            {showBorder && (
              <div 
                className="absolute inset-3 border pointer-events-none rounded-sm transition-colors duration-200"
                style={{ borderColor: currentStyles.border }}
              >
                <div 
                  className="absolute inset-1.5 border border-dashed pointer-events-none opacity-50"
                  style={{ borderColor: currentStyles.border }}
                />
              </div>
            )}

            {/* Top: Large quotation mark aligned with setting */}
            <div className={`flex pt-2 ${
              alignment === 'left' ? 'justify-start pl-2' : 
              alignment === 'right' ? 'justify-end pr-2' : 
              'justify-center'
            }`}>
              <span 
                className="text-5xl md:text-6xl leading-none font-serif select-none"
                style={{ color: currentStyles.quoteMark }}
              >
                “
              </span>
            </div>

            {/* Middle: The Quote Body Text (ABOVE) with custom alignment */}
            <div className={`my-auto px-4 ${
              alignment === 'left' ? 'text-left' :
              alignment === 'right' ? 'text-right' :
              alignment === 'justify' ? 'text-justify' :
              'text-center'
            }`}>
              <p
                style={{ 
                  fontSize: `${fontSize}px`,
                  textAlign: alignment === 'justify' ? 'justify' : alignment,
                }}
                className="leading-relaxed italic font-normal"
              >
                “{quote.quote}”
              </p>
            </div>

            {/* Bottom: Maker Name & Context (BELOW) aligned with setting */}
            <div className={`pt-4 pb-2 flex flex-col ${
              alignment === 'left' ? 'items-start text-left pl-4' :
              alignment === 'right' ? 'items-end text-right pr-4' :
              'items-center text-center'
            }`}>
              {/* Divider line / flourish */}
              <div 
                className={`w-12 h-[1px] mb-3 relative opacity-60 ${
                  alignment === 'left' ? 'mr-auto' :
                  alignment === 'right' ? 'ml-auto' :
                  'mx-auto'
                }`}
                style={{ backgroundColor: currentStyles.maker }}
              >
                <span 
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] px-1"
                  style={{ backgroundColor: currentStyles.bg, color: currentStyles.maker }}
                >
                  ✦
                </span>
              </div>

              {/* Name of the Maker (BELOW THE QUOTE) */}
              <h4 
                className="text-base md:text-lg font-bold tracking-widest uppercase font-serif"
                style={{ color: currentStyles.maker }}
              >
                {quote.maker || 'Unknown Maker'}
              </h4>

              {/* Source / Context / Year */}
              {(quote.about || quote.year) && (
                <p 
                  className="text-xs md:text-sm mt-1 max-w-[85%] italic truncate"
                  style={{ color: currentStyles.subtext }}
                >
                  {quote.about}
                  {quote.year ? ` (${quote.year})` : ''}
                </p>
              )}

              {/* Small discrete watermarking / hallmark */}
              <div 
                className={`text-[9px] uppercase tracking-widest mt-4 opacity-40 font-sans ${
                  alignment === 'left' ? 'mr-auto' :
                  alignment === 'right' ? 'ml-auto' :
                  'mx-auto'
                }`}
                style={{ color: currentStyles.text }}
              >
                Scribe & Parchment
              </div>
            </div>

          </div>

          <p className="text-xs text-[#536D7D] mt-4 italic">
            Exports crisp high-resolution 300 DPI image ready for posting or printing.
          </p>
        </div>

      </div>
    </div>
  );
};
