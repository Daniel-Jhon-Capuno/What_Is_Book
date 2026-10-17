import React, { useState } from 'react';
import type { LiteraryWork, WorkType } from '../types';
import { 
  BookOpen, 
  Feather, 
  Quote, 
  Plus, 
  Search, 
  Trash2, 
  PanelLeftClose, 
  PanelLeft, 
  Laptop, 
  Volume2, 
  VolumeX, 
  Rocket, 
  Library, 
  ChevronRight, 
  Check 
} from 'lucide-react';
import { soundEngine } from '../utils/ambientSound';

interface CollapsibleSidebarProps {
  works: LiteraryWork[];
  selectedWorkId: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectWork: (id: string) => void;
  onCreateWork: (type: WorkType) => void;
  onDeleteWork: (id: string) => void;
  onOpenBackupModal: () => void;
  onOpenVercelGuide: () => void;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  works,
  selectedWorkId,
  isCollapsed,
  onToggleCollapse,
  onSelectWork,
  onCreateWork,
  onDeleteWork,
  onOpenBackupModal,
  onOpenVercelGuide,
}) => {
  const [filter, setFilter] = useState<WorkType | 'all'>('all');
  const [search, setSearch] = useState<string>('');
  const [showNewMenu, setShowNewMenu] = useState<boolean>(false);
  const [rainActive, setRainActive] = useState<boolean>(false);

  const toggleRain = () => {
    const active = soundEngine.toggleRainAmbiance();
    setRainActive(active);
  };

  const filteredWorks = works.filter((w) => {
    if (filter !== 'all' && w.type !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (w.type === 'book') return w.title.toLowerCase().includes(q) || w.author.toLowerCase().includes(q);
    if (w.type === 'poem') return w.title.toLowerCase().includes(q) || w.poet.toLowerCase().includes(q);
    return w.quote.toLowerCase().includes(q) || w.maker.toLowerCase().includes(q);
  });

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#ebf3d3]/70 border-r border-[#215E61]/15 transition-all duration-300 flex flex-col justify-between shrink-0 z-40 ${
        isCollapsed ? 'w-14' : 'w-72'
      }`}
    >
      {/* Top Header Section */}
      <div>
        <div className="p-3 border-b border-[#215E61]/15 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-[#215E61] flex items-center justify-center text-[#F5FBE6] shrink-0">
                <BookOpen size={14} />
              </div>
              <span className="font-serif font-bold text-sm text-[#233D4D] truncate">
                Manuscript Shelf
              </span>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-lg text-[#215E61] hover:bg-[#215E61]/10 transition-colors cursor-pointer ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? 'Expand Shelf' : 'Collapse Shelf'}
          >
            {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Action Buttons: New Work */}
        <div className="p-2 border-b border-[#215E61]/15">
          {isCollapsed ? (
            <button
              onClick={() => {
                onToggleCollapse();
                setShowNewMenu(true);
              }}
              className="w-10 h-10 mx-auto rounded-xl bg-[#215E61] text-[#F5FBE6] flex items-center justify-center hover:bg-[#1a4a4d] shadow-2xs transition-colors cursor-pointer"
              title="Create New Work"
            >
              <Plus size={18} />
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowNewMenu(!showNewMenu)}
                className="w-full py-2 px-3 bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <Plus size={15} />
                <span>Create New Work</span>
              </button>

              {showNewMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNewMenu(false)} />
                  <div className="absolute left-0 right-0 mt-1 bg-[#F5FBE6] border border-[#215E61]/25 rounded-xl shadow-xl z-40 p-1.5 space-y-1 text-xs">
                    <button
                      onClick={() => {
                        onCreateWork('book');
                        setShowNewMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 text-[#233D4D] font-medium"
                    >
                      <BookOpen size={14} className="text-[#215E61]" />
                      <span>New Book</span>
                    </button>
                    <button
                      onClick={() => {
                        onCreateWork('poem');
                        setShowNewMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 text-[#233D4D] font-medium"
                    >
                      <Feather size={14} className="text-[#215E61]" />
                      <span>New Poem</span>
                    </button>
                    <button
                      onClick={() => {
                        onCreateWork('quote');
                        setShowNewMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 text-[#233D4D] font-medium"
                    >
                      <Quote size={14} className="text-[#215E61]" />
                      <span>New Quote</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Expanded Shelf Content */}
        {!isCollapsed && (
          <div className="p-3 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#536D7D]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search works..."
                className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg bg-white/70 border border-[#215E61]/20 focus:border-[#215E61] focus:outline-none text-[#233D4D]"
              />
            </div>

            {/* Type Filters */}
            <div className="flex gap-1 p-0.5 bg-[#F5FBE6] rounded-lg border border-[#215E61]/15 text-[11px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'book', label: 'Books' },
                { id: 'poem', label: 'Poems' },
                { id: 'quote', label: 'Quotes' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id as WorkType | 'all')}
                  className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer ${
                    filter === t.id
                      ? 'bg-[#215E61] text-[#F5FBE6] font-semibold'
                      : 'text-[#233D4D] hover:text-[#215E61]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Works List */}
            <div className="space-y-1 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
              {filteredWorks.map((w) => {
                const isSelected = w.id === selectedWorkId;
                let title = '';
                let Icon = BookOpen;
                if (w.type === 'book') {
                  title = w.title || 'Untitled Book';
                  Icon = BookOpen;
                } else if (w.type === 'poem') {
                  title = w.title || 'Untitled Poem';
                  Icon = Feather;
                } else {
                  title = w.maker ? `“${w.quote.slice(0, 24)}...”` : 'Quote';
                  Icon = Quote;
                }

                return (
                  <div
                    key={w.id}
                    onClick={() => onSelectWork(w.id)}
                    className={`group flex items-center justify-between p-2 rounded-xl text-xs font-serif transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#215E61] text-[#F5FBE6] font-semibold shadow-2xs'
                        : 'hover:bg-white/70 text-[#233D4D]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate mr-1">
                      <Icon size={13} className={isSelected ? 'text-[#F5FBE6]' : 'text-[#215E61]'} />
                      <span className="truncate">{title}</span>
                    </div>

                    {works.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${title}"?`)) {
                            onDeleteWork(w.id);
                          }
                        }}
                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10 text-red-700`}
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tools & Ambient Sounds */}
      <div className="p-2 border-t border-[#215E61]/15 space-y-1">
        {/* Transfer / Laptop Archive */}
        <button
          onClick={onOpenBackupModal}
          className={`w-full p-2 rounded-xl hover:bg-white text-xs font-medium text-[#215E61] flex items-center transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center' : 'gap-2.5 px-3'
          }`}
          title="Transfer across laptops / Backup & Restore"
        >
          <Laptop size={16} />
          {!isCollapsed && <span>Transfer Archive</span>}
        </button>

        {/* Calm Rain Ambiance Toggle */}
        <button
          onClick={toggleRain}
          className={`w-full p-2 rounded-xl text-xs font-medium flex items-center transition-colors cursor-pointer ${
            rainActive
              ? 'bg-[#215E61] text-[#F5FBE6]'
              : 'hover:bg-white text-[#215E61]'
          } ${isCollapsed ? 'justify-center' : 'gap-2.5 px-3'}`}
          title={rainActive ? 'Mute rain sound' : 'Turn on calm rain ambiance'}
        >
          {rainActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          {!isCollapsed && <span>{rainActive ? 'Rain Active' : 'Rain Ambiance'}</span>}
        </button>

        {/* Vercel Publish */}
        <button
          onClick={onOpenVercelGuide}
          className={`w-full p-2 rounded-xl bg-[#233D4D] hover:bg-[#1a2f3c] text-[#F5FBE6] text-xs font-semibold flex items-center transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center' : 'gap-2.5 px-3'
          }`}
          title="Publish to Vercel"
        >
          <Rocket size={15} className="text-[#E2F3CB]" />
          {!isCollapsed && <span>Publish Vercel</span>}
        </button>
      </div>
    </aside>
  );
};
