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
  AlignJustify,
  Palette,
  Type
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuoteImageModalProps {
  quote: QuoteWork;
  onClose: () => void;
}

type RatioType = '1:1' | '9:16' | '4:5' | '16:9';
type FontType = 'eb-garamond' | 'cormorant' | 'cinzel' | 'newsreader';
type AlignmentType = 'center' | 'left' | 'right' | 'justify';

const PRESET_THEMES = [
  { id: 'morning-paper', name: 'Morning Paper', bg: '#FAFDF3', text: '#233D4D', maker: '#215E61' },
  { id: 'pure-white', name: 'White & Black', bg: '#FFFFFF', text: '#111827', maker: '#000000' },
  { id: 'dark-obsidian', name: 'Obsidian Black', bg: '#11171C', text: '#F5FBE6', maker: '#E0C068' },
  { id: 'silent-grove', name: 'Silent Grove', bg: '#215E61', text: '#F5FBE6', maker: '#A7E1D8' },
  { id: 'blue-monolith', name: 'Blue Monolith', bg: '#233D4D', text: '#F5FBE6', maker: '#FEE440' },
  { id: 'antique-parchment', name: 'Parchment', bg: '#F6F1E5', text: '#2A241E', maker: '#785434' },
];

const BG_SWATCHES = [
  { label: 'Cream', value: '#FAFDF3' },
  { label: 'White', value: '#FFFFFF' },
  { label: 'Black', value: '#11171C' },
  { label: 'Teal', value: '#215E61' },
  { label: 'Navy', value: '#233D4D' },
];

const TEXT_SWATCHES = [
  { label: 'Charcoal', value: '#233D4D' },
  { label: 'Black', value: '#000000' },
  { label: 'White', value: '#FFFFFF' },
  { label: 'Cream', value: '#F5FBE6' },
  { label: 'Gold', value: '#E0C068' },
  { label: 'Teal', value: '#215E61' },
];

function isColorDark(hexColor: string): boolean {
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
}

export const QuoteImageModal: React.FC<QuoteImageModalProps> = ({ quote, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Background and Text color states with granular control
  const [bgColor, setBgColor] = useState<string>('#FAFDF3');
  const [textColor, setTextColor] = useState<string>('#233D4D');
  const [makerColor, setMakerColor] = useState<string>('#215E61');

  const [ratio, setRatio] = useState<RatioType>('1:1');
  const [font, setFont] = useState<FontType>('cinzel');
  const [alignment, setAlignment] = useState<AlignmentType>('center');
  const [fontSize, setFontSize] = useState<number>(20);
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setBgColor(preset.bg);
    setTextColor(preset.text);
    setMakerColor(preset.maker);
  };

  const handleBgColorChange = (newBg: string) => {
    setBgColor(newBg);
    const dark = isColorDark(newBg);
    if (dark && isColorDark(textColor)) {
      setTextColor('#F5FBE6');
      setMakerColor('#E0C068');
    } else if (!dark && !isColorDark(textColor)) {
      setTextColor('#233D4D');
      setMakerColor('#215E61');
    }
  };

  const handleTextColorChange = (newText: string) => {
    setTextColor(newText);
    setMakerColor(newText);
  };

  const darkBg = isColorDark(bgColor);
  const borderColor = darkBg ? 'rgba(245, 251, 230, 0.35)' : 'rgba(33, 94, 97, 0.35)';
  const quoteMarkColor = darkBg ? 'rgba(245, 251, 230, 0.35)' : 'rgba(33, 94, 97, 0.3)';

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

  // Dimensions for preview container
  const getRatioStyle = () => {
    switch (ratio) {
      case '9:16':
        return { width: '360px', minHeight: '640px' };
      case '4:5':
        return { width: '400px', minHeight: '500px' };
      case '16:9':
        return { width: '560px', minHeight: '315px' };
      case '1:1':
      default:
        return { width: '440px', minHeight: '440px' };
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const el = cardRef.current;
      const fullWidth = el.scrollWidth;
      const fullHeight = el.scrollHeight;

      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 3,
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
        alert('Clipboard image copy is not supported in this browser; please use Download.');
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      alert('Could not copy image. Try downloading instead.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#233D4D]/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#F5FBE6] rounded-2xl shadow-2xl border border-[#215E61]/25 flex flex-col md:flex-row overflow-hidden my-4 max-h-[94vh]">
        
        {/* Controls Sidebar */}
        <div className="w-full md:w-88 p-5 sm:p-6 bg-[#FAFDF3] border-r border-[#215E61]/15 flex flex-col justify-between overflow-y-auto space-y-5">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#215E61]/10">
              <div className="flex items-center gap-2 text-[#215E61] font-semibold tracking-wide uppercase text-xs">
                <Sparkles size={16} />
                <span>Quote Snapshot Studio</span>
              </div>
              <button 
                onClick={onClose}
                className="md:hidden p-1 text-[#233D4D] hover:text-[#215E61] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Preset Themes */}
            <div>
              <label className="block text-xs font-semibold text-[#215E61] uppercase tracking-wider mb-1.5">
                Preset Themes
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_THEMES.map((preset) => {
                  const isSelected = bgColor.toLowerCase() === preset.bg.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#215E61] bg-white text-[#215E61] shadow-2xs font-bold ring-1 ring-[#215E61]' 
                          : 'border-[#215E61]/20 bg-white/60 text-[#233D4D] hover:bg-white'
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0" 
                        style={{ backgroundColor: preset.bg }}
                      />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Background Color Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#215E61] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Palette size={13} />
                <span>Paper Background:</span>
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {BG_SWATCHES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => handleBgColorChange(s.value)}
                    className={`px-2 py-0.5 rounded text-[11px] border flex items-center gap-1 transition-all cursor-pointer ${
                      bgColor.toLowerCase() === s.value.toLowerCase()
                        ? 'border-[#215E61] ring-2 ring-[#215E61]/30 font-bold bg-white'
                        : 'border-[#215E61]/20 hover:border-[#215E61] bg-white/60'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: s.value }} />
                    <span>{s.label}</span>
                  </button>
                ))}
                {/* Custom Color Input */}
                <label className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border border-[#215E61]/25 hover:border-[#215E61] bg-white cursor-pointer" title="Pick custom background color">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => handleBgColorChange(e.target.value)}
                    className="w-3.5 h-3.5 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-[10px] text-[#536D7D]">{bgColor}</span>
                </label>
              </div>
            </div>

            {/* Custom Text Color Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#215E61] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Type size={13} />
                <span>Text / Ink Color:</span>
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {TEXT_SWATCHES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => handleTextColorChange(s.value)}
                    className={`px-2 py-0.5 rounded text-[11px] border flex items-center gap-1 transition-all cursor-pointer ${
                      textColor.toLowerCase() === s.value.toLowerCase()
                        ? 'border-[#215E61] ring-2 ring-[#215E61]/30 font-bold bg-white'
                        : 'border-[#215E61]/20 hover:border-[#215E61] bg-white/60'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: s.value }} />
                    <span>{s.label}</span>
                  </button>
                ))}
                {/* Custom Text Input */}
                <label className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border border-[#215E61]/25 hover:border-[#215E61] bg-white cursor-pointer" title="Pick custom text/ink color">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => handleTextColorChange(e.target.value)}
                    className="w-3.5 h-3.5 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-[10px] text-[#536D7D]">{textColor}</span>
                </label>
              </div>
            </div>

            {/* Writing Alignment Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#215E61] uppercase tracking-wider mb-1.5">
                Alignment
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
                    className={`py-1.5 px-1 rounded-lg text-center border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      alignment === item.id
                        ? 'border-[#215E61] bg-[#215E61] text-[#F5FBE6] font-semibold shadow-2xs'
                        : 'border-[#215E61]/20 bg-white/70 text-[#233D4D] hover:bg-white text-xs'
                    }`}
                  >
                    <item.icon size={13} />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ratio Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#215E61] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
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
                    className={`p-1.5 rounded-lg text-center border transition-all cursor-pointer ${
                      ratio === item.id
                        ? 'border-[#215E61] bg-[#215E61] text-[#F5FBE6] font-semibold shadow-2xs'
                        : 'border-[#215E61]/20 bg-white/70 text-[#233D4D] hover:bg-white text-xs'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] opacity-75">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font & Size */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-[#215E61] uppercase tracking-wider mb-1">
                  Typography
                </label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value as FontType)}
                  className="w-full bg-white border border-[#215E61]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#233D4D] focus:outline-none focus:border-[#215E61]"
                >
                  <option value="cinzel">Cinzel (Classical Heading)</option>
                  <option value="eb-garamond">EB Garamond (Fine Literature)</option>
                  <option value="cormorant">Cormorant Garamond (Poetic)</option>
                  <option value="newsreader">Newsreader (Editorial)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#215E61]">Font Size</span>
                  <span className="font-mono text-[#536D7D]">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="32"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-[#215E61] cursor-pointer"
                />
              </div>
            </div>

          </div>

          {/* Action Export Buttons */}
          <div className="pt-4 border-t border-[#215E61]/15 space-y-2">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full py-2.5 bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Download size={14} />
              <span>{isExporting ? 'Generating High-Res PNG...' : 'Download PNG Snapshot'}</span>
            </button>

            <button
              onClick={handleCopyClipboard}
              className="w-full py-2 bg-white border border-[#215E61]/30 hover:border-[#215E61] text-[#215E61] rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
            </button>
          </div>

        </div>

        {/* Live Card Preview Area */}
        <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center bg-[#182329]/15 overflow-auto relative">
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
              backgroundColor: bgColor,
              color: textColor,
              fontFamily: getFontFamily(),
            }}
            className="relative flex flex-col justify-between p-8 md:p-10 shadow-2xl transition-all duration-200 select-none shrink-0"
          >
            {/* Optional ornamental border */}
            {showBorder && (
              <div 
                className="absolute inset-3 border pointer-events-none rounded-sm transition-colors duration-200"
                style={{ borderColor: borderColor }}
              >
                <div 
                  className="absolute inset-1.5 border border-dashed pointer-events-none opacity-45"
                  style={{ borderColor: borderColor }}
                />
              </div>
            )}

            {/* Top: Large quotation mark */}
            <div className={`flex pt-2 ${
              alignment === 'left' ? 'justify-start pl-2' : 
              alignment === 'right' ? 'justify-end pr-2' : 
              'justify-center'
            }`}>
              <span 
                className="text-5xl md:text-6xl leading-none font-serif select-none"
                style={{ color: quoteMarkColor }}
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

            {/* Bottom: Maker Name & Context (BELOW) */}
            <div className={`pt-4 pb-2 flex flex-col ${
              alignment === 'left' ? 'items-start text-left pl-4' :
              alignment === 'right' ? 'items-end text-right pr-4' :
              'items-center text-center'
            }`}>
              {/* Divider line / flourish */}
              <div 
                className={`w-12 h-[1px] mb-3 relative opacity-70 ${
                  alignment === 'left' ? 'mr-auto' :
                  alignment === 'right' ? 'ml-auto' :
                  'mx-auto'
                }`}
                style={{ backgroundColor: makerColor }}
              >
                <span 
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] px-1"
                  style={{ backgroundColor: bgColor, color: makerColor }}
                >
                  ✦
                </span>
              </div>

              {/* Name of the Maker (BELOW THE QUOTE) */}
              <h4 
                className="text-base md:text-lg font-bold tracking-widest uppercase font-serif"
                style={{ color: makerColor }}
              >
                {quote.maker || 'Unknown'}
              </h4>

              {/* Origin / Context / Year */}
              {(quote.about || quote.year) && (
                <p 
                  className="text-xs italic mt-1 font-serif opacity-80"
                  style={{ color: textColor }}
                >
                  {quote.about} {quote.year && `(${quote.year})`}
                </p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
