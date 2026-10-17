import React, { useState, useRef } from 'react';
import type { LiteraryWork, AutoSaveInterval, RevisionHistoryItem } from '../types';
import { 
  exportCompleteArchive, 
  exportSingleWork, 
  parseArchiveFile, 
  loadRevisionHistory, 
  saveAutoSaveInterval 
} from '../utils/storage';
import { 
  Download, 
  Upload, 
  X, 
  Clock, 
  History, 
  FileCheck, 
  Laptop, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  BookOpen, 
  Feather, 
  Quote, 
  ArrowRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BackupImportModalProps {
  works: LiteraryWork[];
  currentWork: LiteraryWork | null;
  autoSaveInterval: AutoSaveInterval;
  lastSavedAt: number;
  onUpdateAutoSaveInterval: (interval: AutoSaveInterval) => void;
  onImportWorks: (importedWorks: LiteraryWork[], mode: 'merge' | 'replace') => void;
  onRestoreRevision: (snapshot: LiteraryWork) => void;
  onClose: () => void;
}

export const BackupImportModal: React.FC<BackupImportModalProps> = ({
  works,
  currentWork,
  autoSaveInterval,
  lastSavedAt,
  onUpdateAutoSaveInterval,
  onImportWorks,
  onRestoreRevision,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'transfer' | 'history' | 'settings'>('transfer');
  
  // Import file staging state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    works: LiteraryWork[];
    history?: RevisionHistoryItem[];
    filename: string;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  // History list
  const historyList = loadRevisionHistory();
  const currentWorkHistory = currentWork 
    ? historyList.filter(h => h.workId === currentWork.id) 
    : historyList;

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = parseArchiveFile(text);
      if (res.success && res.works.length > 0) {
        setParsedPreview({
          works: res.works,
          history: res.history,
          filename: file.name,
        });
      } else {
        setImportError(res.error || 'Failed to read file.');
        setParsedPreview(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!parsedPreview) return;
    onImportWorks(parsedPreview.works, importMode);
    
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#215E61', '#F5FBE6', '#233D4D'],
    });

    setParsedPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#233D4D]/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#F5FBE6] rounded-2xl shadow-2xl border border-[#215E61]/20 flex flex-col overflow-hidden my-6 max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 bg-[#FAFDF3] border-b border-[#215E61]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#215E61] flex items-center justify-center text-[#F5FBE6]">
              <Laptop size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#233D4D]">
                Auto-Save & Transfer Archive
              </h3>
              <p className="text-xs text-[#536D7D]">
                Move your works across laptops, set auto-save timers, or restore past revisions
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#233D4D]/60 hover:text-[#215E61] rounded-lg hover:bg-black/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#215E61]/15 bg-[#ebf3d3]/40 px-6 pt-2">
          {[
            { id: 'transfer', label: 'Export & Import to Another Laptop', icon: Laptop },
            { id: 'history', label: 'Past Revisions & History', icon: History },
            { id: 'settings', label: 'Auto-Save Timer', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'transfer' | 'history' | 'settings')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#215E61] text-[#215E61] bg-[#FAFDF3]'
                  : 'border-transparent text-[#536D7D] hover:text-[#215E61]'
              }`}
            >
              <tab.icon size={13} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: Transfer Across Laptops (Export & Import) */}
          {activeTab === 'transfer' && (
            <div className="space-y-6">
              
              {/* Export Box */}
              <div className="p-5 bg-[#FAFDF3] rounded-xl border border-[#215E61]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#233D4D] flex items-center gap-1.5">
                      <Download size={15} className="text-[#215E61]" />
                      Step 1: Export from this Laptop
                    </h4>
                    <p className="text-xs text-[#536D7D] mt-0.5">
                      Saves all your books, poems, quotes, and settings into one portable file.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => exportCompleteArchive(works)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Export Complete Archive ({works.length} Works)</span>
                  </button>

                  {currentWork && (
                    <button
                      onClick={() => exportSingleWork(currentWork)}
                      className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#215E61]/30 hover:border-[#215E61] text-[#233D4D] rounded-xl text-xs font-medium transition-all cursor-pointer"
                    >
                      <Download size={13} className="text-[#215E61]" />
                      <span>Export Current Work Only</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Import Box */}
              <div className="p-5 bg-[#FAFDF3] rounded-xl border border-[#215E61]/20 space-y-4">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#233D4D] flex items-center gap-1.5">
                    <Upload size={15} className="text-[#215E61]" />
                    Step 2: Import into Another Laptop
                  </h4>
                  <p className="text-xs text-[#536D7D] mt-0.5">
                    Transfer the exported file to your other laptop or browser, then upload it below.
                  </p>
                </div>

                {/* Upload drag-drop button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,.scribe"
                  onChange={handleFileSelected}
                  className="hidden"
                />

                {!parsedPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-[#215E61]/30 hover:border-[#215E61] rounded-xl bg-white/50 text-center cursor-pointer transition-colors"
                  >
                    <Upload size={24} className="mx-auto text-[#215E61] mb-2 opacity-70" />
                    <p className="text-xs font-semibold text-[#215E61]">
                      Click to choose your exported Archive (.json)
                    </p>
                    <p className="text-[11px] text-[#536D7D] mt-1">
                      Works exported from any laptop will load directly into your library.
                    </p>
                  </div>
                ) : (
                  /* File staged preview */
                  <div className="p-4 bg-[#215E61]/5 border border-[#215E61]/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#215E61]">
                        <FileCheck size={16} />
                        <span>Ready to Import: {parsedPreview.filename}</span>
                      </div>
                      <button
                        onClick={() => setParsedPreview(null)}
                        className="text-xs text-[#536D7D] hover:text-red-700"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="text-xs text-[#233D4D] bg-white/70 p-3 rounded-lg border border-[#215E61]/15 space-y-1">
                      <div className="font-semibold text-[#215E61]">Archive Contents:</div>
                      <div>Total Works: <strong>{parsedPreview.works.length}</strong></div>
                      <div className="text-[11px] text-[#536D7D]">
                        • {parsedPreview.works.filter(w => w.type === 'book').length} Books &nbsp;|&nbsp;
                        • {parsedPreview.works.filter(w => w.type === 'poem').length} Poems &nbsp;|&nbsp;
                        • {parsedPreview.works.filter(w => w.type === 'quote').length} Quotes
                      </div>
                    </div>

                    {/* Choose Import Strategy */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-semibold text-[#215E61] block">
                        How should this be imported?
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2 ${
                          importMode === 'merge' ? 'bg-white border-[#215E61] font-semibold text-[#215E61]' : 'border-[#215E61]/20 bg-[#FAFDF3]'
                        }`}>
                          <input
                            type="radio"
                            name="importMode"
                            checked={importMode === 'merge'}
                            onChange={() => setImportMode('merge')}
                            className="mt-0.5 accent-[#215E61]"
                          />
                          <div>
                            <div>Merge with existing</div>
                            <div className="text-[10px] font-normal opacity-75">Keep what you have and add new works</div>
                          </div>
                        </label>

                        <label className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2 ${
                          importMode === 'replace' ? 'bg-white border-red-700 font-semibold text-red-800' : 'border-[#215E61]/20 bg-[#FAFDF3]'
                        }`}>
                          <input
                            type="radio"
                            name="importMode"
                            checked={importMode === 'replace'}
                            onChange={() => setImportMode('replace')}
                            className="mt-0.5 accent-[#215E61]"
                          />
                          <div>
                            <div>Replace Everything</div>
                            <div className="text-[10px] font-normal opacity-75">Restore exact state of the backup</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmImport}
                      className="w-full py-2.5 px-4 bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs mt-2"
                    >
                      <Check size={14} />
                      Confirm & Load Works into Library
                    </button>
                  </div>
                )}

                {importError && (
                  <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-xs text-red-800 flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{importError}</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: Past Revisions & History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#215E61]/15">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#233D4D]">
                    Saved Revisions & Snapshots
                  </h4>
                  <p className="text-xs text-[#536D7D]">
                    Every auto-save captures a timestamped copy so you can reopen past versions.
                  </p>
                </div>
                {currentWork && (
                  <span className="text-xs font-serif italic text-[#215E61] bg-[#215E61]/10 px-2.5 py-1 rounded-full">
                    {currentWork.type === 'quote' ? currentWork.maker : currentWork.title}
                  </span>
                )}
              </div>

              {currentWorkHistory.length === 0 ? (
                <div className="text-center py-12 text-[#536D7D] text-xs font-serif italic">
                  No previous snapshots recorded yet. Auto-saves will appear here as you write.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {currentWorkHistory.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 bg-[#FAFDF3] border border-[#215E61]/20 rounded-xl flex items-center justify-between text-xs hover:border-[#215E61]/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#215E61]/10 text-[#215E61] flex items-center justify-center shrink-0">
                          {rev.workType === 'book' && <BookOpen size={13} />}
                          {rev.workType === 'poem' && <Feather size={13} />}
                          {rev.workType === 'quote' && <Quote size={13} />}
                        </div>
                        <div>
                          <div className="font-serif font-bold text-[#233D4D]">
                            {rev.workTitle}
                          </div>
                          <div className="text-[11px] text-[#536D7D] flex items-center gap-2">
                            <span>{new Date(rev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            <span>·</span>
                            <span>{new Date(rev.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            <span>·</span>
                            <span className="italic">{rev.note || 'Auto-saved'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Restore the revision from ${new Date(rev.timestamp).toLocaleTimeString()}? Current unsaved changes will be replaced with this snapshot.`)) {
                            onRestoreRevision(rev.snapshot);
                            onClose();
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#215E61]/30 hover:bg-[#215E61] hover:text-[#F5FBE6] text-[#215E61] text-xs font-medium transition-all"
                      >
                        <RotateCcw size={12} />
                        <span>Restore</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Auto-Save Timer Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="p-5 bg-[#FAFDF3] rounded-xl border border-[#215E61]/20 space-y-4">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#233D4D] flex items-center gap-1.5">
                    <Clock size={15} className="text-[#215E61]" />
                    Auto-Save Frequency
                  </h4>
                  <p className="text-xs text-[#536D7D] mt-0.5">
                    Select how often you want the studio to automatically create a revision of your writing:
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { minutes: 1, label: 'Every 1 min', desc: 'Frequent' },
                    { minutes: 2, label: 'Every 2 mins', desc: 'Recommended' },
                    { minutes: 5, label: 'Every 5 mins', desc: 'Standard' },
                    { minutes: 10, label: 'Every 10 mins', desc: 'Relaxed' },
                  ].map((opt) => (
                    <button
                      key={opt.minutes}
                      onClick={() => onUpdateAutoSaveInterval(opt.minutes as AutoSaveInterval)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        autoSaveInterval === opt.minutes
                          ? 'bg-[#215E61] text-[#F5FBE6] border-[#215E61] font-semibold shadow-xs'
                          : 'bg-white/70 hover:bg-white text-[#233D4D] border-[#215E61]/20'
                      }`}
                    >
                      <div className="text-xs">{opt.label}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#215E61]/15 flex items-center justify-between text-xs text-[#536D7D]">
                  <span>Last auto-saved:</span>
                  <span className="font-medium text-[#215E61]">
                    {lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#215E61]/5 rounded-xl border border-[#215E61]/15 text-xs text-[#215E61] space-y-1">
                <div className="font-semibold font-serif">Dual Protection Guarantee</div>
                <p className="text-[11px] text-[#536D7D] leading-relaxed">
                  In addition to the interval timer, your current keystrokes are automatically cached to local storage continuously, so even if you close the tab abruptly, your text remains safe!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAFDF3] border-t border-[#215E61]/15 flex items-center justify-between text-xs text-[#536D7D]">
          <span className="italic">Scribe & Parchment Portable Archive Format v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#215E61] text-[#F5FBE6] text-xs font-semibold hover:bg-[#1a4a4d] transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
