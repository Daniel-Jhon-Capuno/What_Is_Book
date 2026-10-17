import React, { useState } from 'react';
import { LiteraryWork, WorkType, BookWork, PoemWork, QuoteWork } from '../types';
import { 
  BookOpen, 
  Feather, 
  Quote, 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  FileCode, 
  Image, 
  Calendar 
} from 'lucide-react';

interface WorkSelectorProps {
  works: LiteraryWork[];
  selectedWorkId: string;
  onSelectWork: (id: string) => void;
  onCreateWork: (type: WorkType) => void;
  onDeleteWork: (id: string) => void;
  onOpenSimulation: (work: LiteraryWork) => void;
  onOpenSnapshot: (work: LiteraryWork) => void;
  onExportHtml: (work: LiteraryWork) => void;
}

export const WorkSelector: React.FC<WorkSelectorProps> = ({
  works,
  selectedWorkId,
  onSelectWork,
  onCreateWork,
  onDeleteWork,
  onOpenSimulation,
  onOpenSnapshot,
  onExportHtml,
}) => {
  const [filter, setFilter] = useState<WorkType | 'all'>('all');
  const [search, setSearch] = useState<string>('');
  const [showNewMenu, setShowNewMenu] = useState<boolean>(false);

  const filteredWorks = works.filter((w) => {
    if (filter !== 'all' && w.type !== filter) return false;
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    if (w.type === 'book') {
      return (
        w.title.toLowerCase().includes(query) ||
        w.author.toLowerCase().includes(query) ||
        w.about.toLowerCase().includes(query)
      );
    } else if (w.type === 'poem') {
      return (
        w.title.toLowerCase().includes(query) ||
        w.poet.toLowerCase().includes(query) ||
        w.body.toLowerCase().includes(query)
      );
    } else {
      return (
        w.quote.toLowerCase().includes(query) ||
        w.maker.toLowerCase().includes(query) ||
        w.about.toLowerCase().includes(query)
      );
    }
  });

  return (
    <div className="space-y-5">
      {/* Search and Filter Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAFDF3] border border-[#215E61]/20 rounded-xl">
          {[
            { id: 'all', label: 'All Works' },
            { id: 'book', label: 'Books', icon: BookOpen },
            { id: 'poem', label: 'Poems', icon: Feather },
            { id: 'quote', label: 'Quotes', icon: Quote },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as WorkType | 'all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                filter === item.id
                  ? 'bg-[#215E61] text-[#F5FBE6] font-semibold shadow-xs'
                  : 'text-[#233D4D] hover:text-[#215E61]'
              }`}
            >
              {item.icon && <item.icon size={12} />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Search input and Create button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#536D7D]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search library..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#FAFDF3] border border-[#215E61]/20 focus:border-[#215E61] focus:outline-none text-[#233D4D]"
            />
          </div>

          {/* New Work Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="px-3.5 py-1.5 bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Create New</span>
            </button>

            {showNewMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowNewMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-48 bg-[#F5FBE6] border border-[#215E61]/20 rounded-xl shadow-xl z-40 p-1.5 space-y-1 text-xs">
                  <button
                    onClick={() => {
                      onCreateWork('book');
                      setShowNewMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 text-[#233D4D] hover:text-[#215E61] font-medium"
                  >
                    <BookOpen size={14} className="text-[#215E61]" />
                    <span>New Book</span>
                  </button>
                  <button
                    onClick={() => {
                      onCreateWork('poem');
                      setShowNewMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 text-[#233D4D] hover:text-[#215E61] font-medium"
                  >
                    <Feather size={14} className="text-[#215E61]" />
                    <span>New Poem</span>
                  </button>
                  <button
                    onClick={() => {
                      onCreateWork('quote');
                      setShowNewMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-[#215E61]/10 text-[#233D4D] hover:text-[#215E61] font-medium"
                  >
                    <Quote size={14} className="text-[#215E61]" />
                    <span>New Quote</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Work Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorks.map((w) => {
          const isSelected = w.id === selectedWorkId;

          let title = '';
          let author = '';
          let snippet = '';
          let badge = '';

          if (w.type === 'book') {
            title = w.title || 'Untitled Book';
            author = w.author || 'Anonymous';
            snippet = w.chapters[0]?.content || w.about || 'No content yet...';
            badge = `${w.chapters.length} ${w.chapters.length === 1 ? 'Chapter' : 'Chapters'}`;
          } else if (w.type === 'poem') {
            title = w.title || 'Untitled Poem';
            author = w.poet || 'Anonymous';
            snippet = w.body || w.about || 'No lines written yet...';
            badge = w.form || 'Poem';
          } else {
            title = `“${w.quote.slice(0, 50)}${w.quote.length > 50 ? '...' : ''}”`;
            author = w.maker || 'Unknown Maker';
            snippet = w.about || 'Quote';
            badge = 'Quote';
          }

          return (
            <div
              key={w.id}
              onClick={() => onSelectWork(w.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-[#FAFDF3] border-[#215E61] shadow-md ring-1 ring-[#215E61]'
                  : 'bg-[#FAFDF3]/80 hover:bg-[#FAFDF3] border-[#215E61]/20 hover:border-[#215E61]/50 shadow-xs'
              }`}
            >
              <div>
                {/* Type Badge & Action Menu */}
                <div className="flex items-center justify-between text-[11px] mb-2.5">
                  <span className="flex items-center gap-1 font-serif uppercase tracking-wider text-[#215E61] font-bold">
                    {w.type === 'book' && <BookOpen size={12} />}
                    {w.type === 'poem' && <Feather size={12} />}
                    {w.type === 'quote' && <Quote size={12} />}
                    <span>{badge}</span>
                  </span>

                  <span className="text-[#536D7D] flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(w.updatedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif font-bold text-lg text-[#233D4D] leading-snug line-clamp-2 mb-1">
                  {title}
                </h3>

                {/* Author / Maker */}
                <p className="text-xs text-[#215E61] font-serif italic mb-3">
                  by {author}
                </p>

                {/* Excerpt Snippet */}
                <p className="text-xs text-[#536D7D] line-clamp-3 leading-relaxed font-serif">
                  {snippet}
                </p>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-4 mt-4 border-t border-[#215E61]/15 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSimulation(w);
                    }}
                    className="p-1.5 rounded-lg text-[#215E61] hover:bg-[#215E61]/10 transition-colors"
                    title="Simulate Book / Reader View"
                  >
                    <Eye size={14} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportHtml(w);
                    }}
                    className="p-1.5 rounded-lg text-[#215E61] hover:bg-[#215E61]/10 transition-colors"
                    title="Export Standalone HTML Reader"
                  >
                    <FileCode size={14} />
                  </button>

                  {(w.type === 'quote' || w.type === 'poem') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSnapshot(w);
                      }}
                      className="p-1.5 rounded-lg text-[#215E61] hover:bg-[#215E61]/10 transition-colors"
                      title="Export Snapshot Image"
                    >
                      <Image size={14} />
                    </button>
                  )}
                </div>

                {works.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete "${title}"?`)) {
                        onDeleteWork(w.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-red-700/60 hover:text-red-700 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Work"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
