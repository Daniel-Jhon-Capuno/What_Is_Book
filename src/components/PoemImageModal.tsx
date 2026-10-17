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
  Palette,
  Type
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PoemImageModalProps {
  poem: PoemWork;
  onClose: () => void;
}

const PRESET_THEMES = [
  { id: 'morning-paper', name: 'Morning Paper', bg: '#FAFDF3', text: '#233D4D', title: '#215E61', accent: '#215E61' },
  { id: 'pure-white', name: 'White & Black', bg: '#FFFFFF', text: '#111827', title: '#000000', accent: '#374151' },
  { id: 'dark-obsidian', name: 'Obsidian Black', bg: '#11171C', text: '#F5FBE6', title: '#F5FBE6', accent: '#E0C068' },
  { id: 'silent-grove', name: 'Silent Grove', bg: '#215E61', text: '#F5FBE6', title: '#F5FBE6', accent: '#A7E1D8' },
  { id: 'blue-monolith', name: 'Blue Monolith', bg: '#233D4D', text: '#F5FBE6', title: '#FEE440', accent: '#A8C5D6' },
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

export const PoemImageModal: React.FC<PoemImageModalProps> = ({ poem, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Background and Text colors with custom control
  const [bgColor, setBgColor] = useState<string>('#FAFDF3');
  const [textColor, setTextColor] = useState<string>('#233D4D');
  const [titleColor, setTitleColor] = useState<string>('#215E61');
  const [accentColor, setAccentColor] = useState<string>('#215E61');

  const [alignment, setAlignment] = useState<'center' | 'left' | 'right'>('center');
  const [fontSize, setFontSize] = useState<number>(16);
  const [fitToView, setFitToView] = useState<boolean>(true);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Apply a preset theme
  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setBgColor(preset.bg);
    setTextColor(preset.text);
    setTitleColor(preset.title);
    setAccentColor(preset.accent);
  };

  // When user picks a custom background color, adapt title & accent if contrast is low
  const handleBgColorChange = (newBg: string) => {
    setBgColor(newBg);
    const dark = isColorDark(newBg);
    if (dark && !isColorDark(textColor)) {
      // already good contrast
    } else if (dark && isColorDark(textColor)) {
      setTextColor('#F5FBE6');
      setTitleColor('#FEE440');
      setAccentColor('#A7E1D8');
    } else if (!dark && !isColorDark(textColor)) {
      setTextColor('#233D4D');
      setTitleColor('#215E61');
      setAccentColor('#215E61');
    }
  };

  const handleTextColorChange = (newText: string) => {
    setTextColor(newText);
    setTitleColor(newText);
    setAccentColor(newText);
  };

  // Derive border color with comfortable opacity
  const darkBg = isColorDark(bgColor);
  const borderColor = darkBg ? 'rgba(245, 251, 230, 0.35)' : 'rgba(33, 94, 97, 0.35)';

  // Calculate auto-fit scale
  useEffect(() => {
    if (!fitToView) {
      setScaleFactor(1);
      return;
    }

    const updateScale = () => {
      if (cardRef.current && containerRef.current) {
        const containerH = containerRef.current.clientHeight - 40;
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
  }, [fitToView, fontSize, bgColor, textColor, alignment, poem]);

  // Full Unclipped Export
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
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#215E61]/15 bg-[#FAFDF3] shrink-0">
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

        {/* Studio Controls Header */}
        <div className="px-6 py-2.5 bg-[#FAFDF3]/90 border-b border-[#215E61]/15 flex flex-col gap-2.5 shrink-0 text-xs">
          
          {/* Row 1: Themes, Alignment, Font Size, Fit, Export Actions */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Preset Themes */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#215E61] font-bold uppercase tracking-wider">Presets:</span>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#215E61]/20">
                  {PRESET_THEMES.map(preset => {
                    const isSelected = bgColor.toLowerCase() === preset.bg.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#215E61] text-[#F5FBE6] font-semibold shadow-2xs' 
                            : 'text-[#233D4D] hover:bg-black/5'
                        }`}
                        title={preset.name}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: preset.bg }} />
                        <span className="hidden md:inline">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Alignment */}
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

              {/* Font Size */}
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

              {/* Auto-Fit Toggle */}
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

            {/* Action Buttons */}
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

          {/* Row 2: Granular Color Controls for Background and Text */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-[#215E61]/10">
            
            {/* Background Color Swatches + Color Picker */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-[11px] font-serif font-bold text-[#215E61] uppercase tracking-wider">
                <Palette size={13} />
                <span>Paper Background:</span>
              </div>
              <div className="flex items-center gap-1.5">
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
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: s.value }} />
                    <span>{s.label}</span>
                  </button>
                ))}

                {/* Custom Color Picker input */}
                <label className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border border-[#215E61]/25 hover:border-[#215E61] bg-white cursor-pointer" title="Choose custom background color">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => handleBgColorChange(e.target.value)}
                    className="w-4 h-4 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-[10px] text-[#536D7D]">{bgColor}</span>
                </label>
              </div>
            </div>

            {/* Text Color Swatches + Color Picker */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-[11px] font-serif font-bold text-[#215E61] uppercase tracking-wider">
                <Type size={13} />
                <span>Text / Ink Color:</span>
              </div>
              <div className="flex items-center gap-1.5">
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
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: s.value }} />
                    <span>{s.label}</span>
                  </button>
                ))}

                {/* Custom Text Color Picker input */}
                <label className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border border-[#215E61]/25 hover:border-[#215E61] bg-white cursor-pointer" title="Choose custom text/ink color">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => handleTextColorChange(e.target.value)}
                    className="w-4 h-4 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-[10px] text-[#536D7D]">{textColor}</span>
                </label>
              </div>
            </div>

          </div>

        </div>

        {/* Live Card Preview Stage (Perfect Contrast, No overridden background) */}
        <div 
          ref={containerRef}
          className="flex-1 p-4 sm:p-8 bg-[#182329]/15 overflow-y-auto flex items-center justify-center relative"
        >
          <div 
            style={{ 
              transform: `scale(${scaleFactor})`, 
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out'
            }}
            className="shrink-0 my-auto py-2 flex items-center justify-center"
          >
            {/* The Actual Broadside Manuscript Card (Colors applied with 100% purity) */}
            <div
              ref={cardRef}
              style={{
                backgroundColor: bgColor,
                color: textColor,
                fontFamily: "'EB Garamond', Georgia, serif",
                maxWidth: '560px',
                width: '560px',
                borderColor: borderColor,
                textAlign: alignment,
              }}
              className="p-8 sm:p-12 border-2 rounded-sm shadow-2xl relative flex flex-col justify-between"
            >
              {/* Inner dashed classical frame with comfortable inset */}
              <div 
                className="absolute inset-3 border border-dashed pointer-events-none opacity-40 rounded-xs"
                style={{ borderColor: borderColor }}
              />

              {/* Form Hallmark */}
              {poem.form && (
                <div 
                  className="text-[11px] font-serif uppercase tracking-[0.25em] mb-2 font-semibold"
                  style={{ color: accentColor }}
                >
                  {poem.form}
                </div>
              )}

              {/* Poem Title */}
              <h2 
                className="text-2xl sm:text-3xl font-serif font-bold mb-1.5 tracking-wide leading-tight"
                style={{ color: titleColor }}
              >
                {poem.title}
              </h2>

              {/* Poet Hallmark */}
              <div 
                className="text-sm italic mb-4 font-serif"
                style={{ color: accentColor }}
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
                style={{ backgroundColor: accentColor }}
              >
                <span 
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] px-1 font-serif"
                  style={{ backgroundColor: bgColor, color: accentColor }}
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

              {/* Footer row with Date & Signature Hallmark */}
              <div 
                className="pt-4 mt-8 border-t flex justify-between items-center text-xs opacity-75 relative z-10 font-serif"
                style={{ borderColor: borderColor }}
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
          <span className="italic hidden sm:inline">Choose any background (white, cream, black, etc.) and text color freely.</span>
        </div>

      </div>
    </div>
  );
};
