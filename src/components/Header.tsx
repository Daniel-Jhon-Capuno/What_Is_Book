import React, { useState } from 'react';
import { 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Rocket, 
  Library, 
  Edit3, 
  Clock, 
  Laptop 
} from 'lucide-react';
import { soundEngine } from '../utils/ambientSound';
import type { AutoSaveInterval } from '../types';

interface HeaderProps {
  currentView: 'editor' | 'library';
  onViewChange: (view: 'editor' | 'library') => void;
  onOpenVercelGuide: () => void;
  onOpenBackupModal: () => void;
  autoSaveInterval: AutoSaveInterval;
  lastSavedAt: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenVercelGuide,
  onOpenBackupModal,
  autoSaveInterval,
  lastSavedAt,
}) => {
  const [rainActive, setRainActive] = useState<boolean>(false);

  const toggleRain = () => {
    const active = soundEngine.toggleRainAmbiance();
    setRainActive(active);
  };

  const formattedTime = lastSavedAt 
    ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <header className="sticky top-0 z-40 bg-[#F5FBE6]/95 backdrop-blur-md border-b border-[#215E61]/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        
        {/* Brand & Emblem */}
        <div 
          onClick={() => onViewChange('library')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#215E61] flex items-center justify-center text-[#F5FBE6] shadow-sm group-hover:bg-[#1b4e51] transition-colors">
            <BookOpen size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-lg md:text-xl text-[#233D4D] tracking-tight">
                Scribe & Parchment
              </span>
              <span className="text-[10px] uppercase font-sans font-bold px-1.5 py-0.5 rounded bg-[#215E61]/10 text-[#215E61]">
                Press
              </span>
            </div>
            <p className="text-[11px] text-[#536D7D] font-serif italic -mt-0.5 hidden sm:block">
              Books, Poetry & Quotation Atelier
            </p>
          </div>
        </div>

        {/* View Switcher: Editor vs Library */}
        <div className="flex items-center bg-[#ebf3d3]/70 p-1 rounded-xl border border-[#215E61]/20">
          <button
            onClick={() => onViewChange('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'editor'
                ? 'bg-[#215E61] text-[#F5FBE6] shadow-xs'
                : 'text-[#233D4D] hover:text-[#215E61]'
            }`}
          >
            <Edit3 size={13} />
            <span>Studio</span>
          </button>
          <button
            onClick={() => onViewChange('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'library'
                ? 'bg-[#215E61] text-[#F5FBE6] shadow-xs'
                : 'text-[#233D4D] hover:text-[#215E61]'
            }`}
          >
            <Library size={13} />
            <span>Library</span>
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          
          {/* Auto-Save Status Badge (Click to open timer / history) */}
          <button
            onClick={onOpenBackupModal}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#215E61]/20 bg-white/60 hover:bg-white text-xs text-[#215E61] transition-all cursor-pointer"
            title={`Auto-saving every ${autoSaveInterval} mins. Click to change interval or view past revisions.`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Clock size={12} className="text-[#215E61]" />
            <span className="text-[11px] font-medium">Saved ({formattedTime})</span>
          </button>

          {/* Transfer & Archive Modal Trigger */}
          <button
            onClick={onOpenBackupModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-[#215E61]/30 text-[#215E61] text-xs font-semibold transition-all cursor-pointer"
            title="Export or Import works to another laptop"
          >
            <Laptop size={14} />
            <span className="hidden sm:inline">Transfer / Archive</span>
          </button>

          {/* Calming Rain Ambiance Button */}
          <button
            onClick={toggleRain}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              rainActive
                ? 'bg-[#215E61] text-[#F5FBE6] border-[#215E61]'
                : 'bg-white/60 hover:bg-white text-[#215E61] border-[#215E61]/20'
            }`}
            title={rainActive ? 'Mute gentle rain ambiance' : 'Play calming rain ambiance'}
          >
            {rainActive ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="hidden lg:inline text-[11px] font-medium">
              {rainActive ? 'Rain Active' : 'Calm Ambiance'}
            </span>
          </button>

          {/* Deploy to Vercel Guide */}
          <button
            onClick={onOpenVercelGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#233D4D] hover:bg-[#1a2f3c] text-[#F5FBE6] text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Rocket size={13} className="text-[#E2F3CB]" />
            <span className="hidden sm:inline">Vercel</span>
          </button>
        </div>

      </div>
    </header>
  );
};
