import { useState, useEffect, useRef } from 'react';
import type { LiteraryWork, WorkType, BookWork, PoemWork, QuoteWork, AutoSaveInterval } from './types';
import { 
  loadWorks, 
  saveWorks, 
  loadAutoSaveInterval, 
  saveAutoSaveInterval, 
  recordRevision 
} from './utils/storage';
import { downloadHtmlFile } from './utils/htmlExporter';
import { WordRibbonToolbar } from './components/WordRibbonToolbar';
import { LibraryBookshelf } from './components/LibraryBookshelf';
import { BookFetchTransition } from './components/BookFetchTransition';
import { ManuscriptDetailsModal } from './components/ManuscriptDetailsModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { BookEditor } from './components/BookEditor';
import { PoemEditor } from './components/PoemEditor';
import { QuoteEditor } from './components/QuoteEditor';
import { BookSimulationReader } from './components/BookSimulationReader';
import { QuoteImageModal } from './components/QuoteImageModal';
import { PoemImageModal } from './components/PoemImageModal';
import { VercelDeployGuideModal } from './components/VercelDeployGuideModal';
import { BackupImportModal } from './components/BackupImportModal';
import { soundEngine } from './utils/ambientSound';
import { Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

export function App() {
  const [works, setWorks] = useState<LiteraryWork[]>(() => loadWorks());
  const [selectedWorkId, setSelectedWorkId] = useState<string>(() => works[0]?.id || '');
  
  // Library Bookshelf Menu State
  const [showBookshelf, setShowBookshelf] = useState<boolean>(false);
  const [fetchingWork, setFetchingWork] = useState<LiteraryWork | null>(null);

  // Focus & Zen Mode State
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Workspace Zoom State (scales desk manuscript without scaling top ribbon)
  const [zoom, setZoom] = useState<number>(100);

  // Book View Mode: 'single' (focused chapter) vs 'all' (continuous multi-chapter manuscript)
  const [bookViewMode, setBookViewMode] = useState<'single' | 'all'>('single');

  // Microsoft Word-Style Formatting State
  const [fontFamily, setFontFamily] = useState<string>("'EB Garamond', Georgia, serif");
  const [fontSize, setFontSize] = useState<number>(18);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'justify'>('justify');
  const [hasDropcap, setHasDropcap] = useState<boolean>(true);

  // Auto-save interval, status, and state indicator
  const [autoSaveInterval, setAutoSaveInterval] = useState<AutoSaveInterval>(() => loadAutoSaveInterval());
  const [lastSavedAt, setLastSavedAt] = useState<number>(Date.now());
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Custom Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Chapter tracking for books
  const currentWork = works.find((w) => w.id === selectedWorkId) || works[0];
  const [activeChapterId, setActiveChapterId] = useState<string>(() => {
    if (currentWork?.type === 'book') {
      return (currentWork as BookWork).chapters[0]?.id || '';
    }
    return '';
  });

  // Keep activeChapterId in sync when switching works
  useEffect(() => {
    if (currentWork?.type === 'book') {
      const book = currentWork as BookWork;
      const exists = book.chapters.some(c => c.id === activeChapterId);
      if (!exists && book.chapters.length > 0) {
        setActiveChapterId(book.chapters[0].id);
      }
    }
  }, [currentWork, activeChapterId]);

  // Modals state
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [simulationWork, setSimulationWork] = useState<LiteraryWork | null>(null);
  const [quoteSnapshotWork, setQuoteSnapshotWork] = useState<QuoteWork | null>(null);
  const [poemSnapshotWork, setPoemSnapshotWork] = useState<PoemWork | null>(null);
  const [showVercelGuide, setShowVercelGuide] = useState<boolean>(false);
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);

  const worksRef = useRef(works);
  worksRef.current = works;
  const currentWorkRef = useRef(currentWork);
  currentWorkRef.current = currentWork;

  // Browser beforeunload tab quit protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaving]);

  // Debounced auto-save to localStorage with visual saving indicator
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSave = (updatedWorks: LiteraryWork[]) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveWorks(updatedWorks);
      setLastSavedAt(Date.now());
      setIsSaving(false);
    }, 450);
  };

  // Periodic interval revision recorder
  useEffect(() => {
    const intervalMs = autoSaveInterval * 60 * 1000;
    const timer = setInterval(() => {
      saveWorks(worksRef.current);
      if (currentWorkRef.current) {
        recordRevision(currentWorkRef.current, `Auto-saved at ${autoSaveInterval}m interval`);
      }
      setLastSavedAt(Date.now());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoSaveInterval]);

  const handleUpdateAutoSaveInterval = (interval: AutoSaveInterval) => {
    setAutoSaveInterval(interval);
    saveAutoSaveInterval(interval);
  };

  const handleUpdateWork = (updated: LiteraryWork) => {
    const newWorks = works.map((w) => (w.id === updated.id ? updated : w));
    setWorks(newWorks);
    triggerSave(newWorks);
  };

  // Chapter specific handlers for Books
  const handleUpdateChapter = (
    fields: Partial<{ title: string; subtitle: string; content: string }>,
    chapterId?: string
  ) => {
    if (!currentWork || currentWork.type !== 'book') return;
    const book = currentWork as BookWork;
    const targetId = chapterId || activeChapterId || book.chapters[0]?.id;
    const updatedChapters = book.chapters.map((ch) =>
      ch.id === targetId ? { ...ch, ...fields } : ch
    );
    handleUpdateWork({
      ...book,
      chapters: updatedChapters,
      updatedAt: Date.now(),
    });
  };

  const handleAddChapter = () => {
    if (!currentWork || currentWork.type !== 'book') return;
    const book = currentWork as BookWork;
    const newNum = book.chapters.length + 1;
    const newCh = {
      id: 'ch_' + Date.now(),
      title: `Chapter ${newNum}`,
      subtitle: '',
      content: '',
    };
    handleUpdateWork({
      ...book,
      chapters: [...book.chapters, newCh],
      updatedAt: Date.now(),
    });
    setActiveChapterId(newCh.id);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!currentWork || currentWork.type !== 'book') return;
    const book = currentWork as BookWork;
    if (book.chapters.length <= 1) return;
    const targetChapter = book.chapters.find((c) => c.id === chapterId);
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Chapter',
      message: `Are you sure you wish to delete "${targetChapter?.title || 'this chapter'}"? Any text within this chapter will be permanently removed.`,
      confirmLabel: 'Delete Chapter',
      isDestructive: true,
      onConfirm: () => {
        const remaining = book.chapters.filter((c) => c.id !== chapterId);
        handleUpdateWork({
          ...book,
          chapters: remaining,
          updatedAt: Date.now(),
        });
        if (activeChapterId === chapterId) {
          setActiveChapterId(remaining[0]?.id || '');
        }
        setConfirmDialog((d) => ({ ...d, isOpen: false }));
      },
    });
  };

  const handleMoveChapter = (chapterId: string, direction: 'up' | 'down') => {
    if (!currentWork || currentWork.type !== 'book') return;
    const book = currentWork as BookWork;
    const idx = book.chapters.findIndex((c) => c.id === chapterId);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === book.chapters.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newChapters = [...book.chapters];
    const [removed] = newChapters.splice(idx, 1);
    newChapters.splice(targetIdx, 0, removed);
    handleUpdateWork({
      ...book,
      chapters: newChapters,
      updatedAt: Date.now(),
    });
  };

  // Workspace Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(160, z + 10));
  const handleZoomOut = () => setZoom((z) => Math.max(60, z - 10));
  const handleResetZoom = () => setZoom(100);

  const handleInsertOrnament = (ornament: string) => {
    if (!currentWork) return;
    if (currentWork.type === 'book') {
      const book = currentWork as BookWork;
      const targetId = activeChapterId || book.chapters[0]?.id;
      const ch = book.chapters.find((c) => c.id === targetId) || book.chapters[0];
      if (ch) {
        handleUpdateChapter({ content: ch.content + ornament });
      }
    } else if (currentWork.type === 'poem') {
      const poem = currentWork as PoemWork;
      handleUpdateWork({ ...poem, body: poem.body + ornament });
    }
  };

  const handleCreateWork = (type: WorkType) => {
    const timestamp = Date.now();
    let newWork: LiteraryWork;

    if (type === 'book') {
      newWork = {
        id: 'book_' + timestamp,
        type: 'book',
        title: 'Untitled Book',
        subtitle: 'A New Volume of Thoughts',
        author: 'Your Name',
        about: 'Provide context, historical setting, or thematic overview for your book...',
        dedication: 'For those who read with an open heart.',
        genre: 'Literary Prose',
        year: new Date().getFullYear().toString(),
        chapters: [
          {
            id: 'ch_' + timestamp,
            title: 'Chapter I: The First Morning',
            subtitle: 'On beginnings and silent horizons',
            content: 'Write the opening lines of your book here. In the morning light, words come gently like river mist...',
          },
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setActiveChapterId('ch_' + timestamp);
    } else if (type === 'poem') {
      newWork = {
        id: 'poem_' + timestamp,
        type: 'poem',
        title: 'Untitled Verse',
        poet: 'Your Name',
        about: 'What inspired these lines? Setting, atmosphere, or quiet memory.',
        form: 'Lyric Poetry',
        dateOrLocation: 'Autumn Dawn',
        body: `The pale sky holds the promise of the day,\nThe harbor mists begin to drift away;\nA single sparrow calls from branch and wire,\nBefore the sun ignites its gentle fire.`,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    } else {
      newWork = {
        id: 'quote_' + timestamp,
        type: 'quote',
        quote: 'Silence is not the absence of sound, but the presence of stillness where words find their true weight.',
        maker: 'Your Name',
        about: 'Morning Reflections',
        year: new Date().getFullYear().toString(),
        category: 'Stillness & Wisdom',
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    }

    const newWorks = [newWork, ...works];
    setWorks(newWorks);
    setSelectedWorkId(newWork.id);
    triggerSave(newWorks);
    recordRevision(newWork, 'Initial creation');
    setShowBookshelf(false);
  };

  // Safe delete with custom confirmation popup
  const handleRequestDeleteWork = (workToDelete: LiteraryWork) => {
    const title = workToDelete.type === 'quote' 
      ? `Quote by ${workToDelete.maker || 'Unknown'}` 
      : workToDelete.title;

    setConfirmDialog({
      isOpen: true,
      title: 'Remove Volume from Bookshelf?',
      message: `Are you sure you want to remove "${title}" from your library? Its contents and past revisions on this device will be deleted.`,
      confirmLabel: 'Delete Volume',
      cancelLabel: 'Keep Volume',
      isDestructive: true,
      onConfirm: () => {
        setWorks((prev) => {
          const filtered = prev.filter((w) => w.id !== workToDelete.id);
          if (selectedWorkId === workToDelete.id && filtered.length > 0) {
            setSelectedWorkId(filtered[0].id);
          }
          triggerSave(filtered);
          return filtered;
        });
        setConfirmDialog((d) => ({ ...d, isOpen: false }));
      },
    });
  };

  // Taking a book off the shelf with loading screen simulation
  const handleSelectBookFromShelf = (work: LiteraryWork) => {
    soundEngine.playPageTurn();
    setShowBookshelf(false);
    setFetchingWork(work);
  };

  const handleFinishBookFetch = () => {
    if (fetchingWork) {
      setSelectedWorkId(fetchingWork.id);
      setFetchingWork(null);
    }
  };

  // Import works across laptops
  const handleImportWorks = (importedWorks: LiteraryWork[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setWorks(importedWorks);
      if (importedWorks.length > 0) {
        setSelectedWorkId(importedWorks[0].id);
      }
      triggerSave(importedWorks);
    } else {
      const existingIds = new Set(works.map(w => w.id));
      const adjustedImports = importedWorks.map(w => {
        if (existingIds.has(w.id)) {
          return { ...w, id: `${w.id}_imported_${Date.now()}` };
        }
        return w;
      });

      const merged = [...adjustedImports, ...works];
      setWorks(merged);
      if (adjustedImports.length > 0) {
        setSelectedWorkId(adjustedImports[0].id);
      }
      triggerSave(merged);
    }
  };

  const handleRestoreRevision = (snapshot: LiteraryWork) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restore Past Revision?',
      message: 'Restoring this version will replace the current draft on your desk with the snapshot from that moment.',
      confirmLabel: 'Restore Revision',
      cancelLabel: 'Cancel',
      isDestructive: false,
      onConfirm: () => {
        setWorks((prev) => prev.map((w) => (w.id === snapshot.id ? snapshot : w)));
        setSelectedWorkId(snapshot.id);
        triggerSave(worksRef.current);
        recordRevision(snapshot, 'Restored from history');
        setConfirmDialog((d) => ({ ...d, isOpen: false }));
      },
    });
  };

  const handleOpenSnapshot = () => {
    if (!currentWork) return;
    if (currentWork.type === 'quote') {
      setQuoteSnapshotWork(currentWork as QuoteWork);
    } else if (currentWork.type === 'poem') {
      setPoemSnapshotWork(currentWork as PoemWork);
    } else {
      setSimulationWork(currentWork);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FBE6] text-[#233D4D] flex flex-col selection:bg-[#215E61]/20 selection:text-[#215E61] relative">
      
      {/* 1. FIXED TOP BAR WITH PERMANENT DIVIDER BORDER & SINGLE BOOKSHELF BUTTON */}
      {!isZenMode && currentWork && (
        <WordRibbonToolbar
          work={currentWork}
          fontFamily={fontFamily}
          fontSize={fontSize}
          textAlignment={textAlignment}
          hasDropcap={hasDropcap}
          isZenMode={isZenMode}
          autoSaveInterval={autoSaveInterval}
          lastSavedAt={lastSavedAt}
          isSaving={isSaving}
          onFontFamilyChange={setFontFamily}
          onFontSizeChange={setFontSize}
          onTextAlignmentChange={setTextAlignment}
          onToggleDropcap={() => setHasDropcap(!hasDropcap)}
          onInsertOrnament={handleInsertOrnament}
          onToggleZenMode={() => setIsZenMode(true)}
          onOpenDetails={() => setShowDetailsModal(true)}
          onOpenSimulation={() => setSimulationWork(currentWork)}
          onOpenBookshelf={() => setShowBookshelf(true)}
          onExportHtml={() => downloadHtmlFile(currentWork)}
          onOpenSnapshot={handleOpenSnapshot}
          onOpenBackupModal={() => setShowBackupModal(true)}
          activeChapterId={activeChapterId}
          onSelectChapter={(id) => setActiveChapterId(id)}
          onAddChapter={handleAddChapter}
          bookViewMode={bookViewMode}
          onToggleBookViewMode={setBookViewMode}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
        />
      )}

      {/* Floating Zen Mode Exit Button */}
      {isZenMode && (
        <button
          onClick={() => setIsZenMode(false)}
          className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-[#215E61] text-[#F5FBE6] shadow-lg hover:bg-[#1a4a4d] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Exit Zen Focus Mode"
        >
          <Minimize2 size={16} />
          <span>Exit Zen Mode</span>
        </button>
      )}

      {/* 2. CENTER DESK / WRITING CANVAS (Scrolls smoothly beneath fixed bar, scales with zoom) */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 relative pb-28">
        <div 
          style={{ 
            transform: `scale(${zoom / 100})`, 
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="w-full flex flex-col items-center"
        >
          {currentWork ? (
            <>
              {currentWork.type === 'book' && (
                <BookEditor
                  book={currentWork as BookWork}
                  activeChapterId={activeChapterId}
                  fontFamily={fontFamily}
                  fontSize={fontSize}
                  textAlignment={textAlignment}
                  hasDropcap={hasDropcap}
                  bookViewMode={bookViewMode}
                  onToggleBookViewMode={setBookViewMode}
                  onSelectChapter={(id) => setActiveChapterId(id)}
                  onAddChapter={handleAddChapter}
                  onDeleteChapter={handleDeleteChapter}
                  onMoveChapter={handleMoveChapter}
                  onChange={handleUpdateWork}
                  onUpdateChapterTitle={(title, chId) => handleUpdateChapter({ title }, chId)}
                  onUpdateChapterSubtitle={(subtitle, chId) => handleUpdateChapter({ subtitle }, chId)}
                  onUpdateChapterContent={(content, chId) => handleUpdateChapter({ content }, chId)}
                />
              )}

              {currentWork.type === 'poem' && (
                <PoemEditor
                  poem={currentWork as PoemWork}
                  fontFamily={fontFamily}
                  fontSize={fontSize}
                  textAlignment={textAlignment}
                  onChange={handleUpdateWork}
                />
              )}

              {currentWork.type === 'quote' && (
                <QuoteEditor
                  quote={currentWork as QuoteWork}
                  fontFamily={fontFamily}
                  fontSize={fontSize}
                  textAlignment={textAlignment}
                  onChange={handleUpdateWork}
                />
              )}
            </>
          ) : (
            <div className="text-center py-24 font-serif text-[#536D7D]">
              <p className="mb-4">No volume selected on your shelf.</p>
              <button
                onClick={() => setShowBookshelf(true)}
                className="px-4 py-2 bg-[#215E61] text-[#F5FBE6] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Browse Library Bookshelf
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Floating Desk Zoom Controls (Scales workspace without affecting top bar) */}
      <div className="fixed bottom-4 right-5 z-30 flex items-center bg-[#FAFDF3]/95 backdrop-blur-md border border-[#215E61]/30 rounded-xl shadow-lg px-2 py-1 text-xs text-[#215E61] select-none gap-1">
        <button
          onClick={handleZoomOut}
          className="p-1 hover:bg-[#215E61]/10 rounded font-bold cursor-pointer transition-colors"
          title="Zoom Out Workspace (-10%)"
        >
          <ZoomOut size={13} />
        </button>
        <button
          onClick={handleResetZoom}
          className="px-1.5 py-0.5 hover:bg-[#215E61]/10 rounded font-mono text-[11px] font-semibold cursor-pointer transition-colors"
          title="Reset Zoom to 100%"
        >
          {zoom}%
        </button>
        <button
          onClick={handleZoomIn}
          className="p-1 hover:bg-[#215E61]/10 rounded font-bold cursor-pointer transition-colors"
          title="Zoom In Workspace (+10%)"
        >
          <ZoomIn size={13} />
        </button>
      </div>

      {/* 3. MULTI-TIER SCROLLABLE LIBRARY BOOKSHELF MENU */}
      <LibraryBookshelf
        works={works}
        selectedWorkId={selectedWorkId}
        isOpen={showBookshelf}
        onClose={() => setShowBookshelf(false)}
        onSelectWork={handleSelectBookFromShelf}
        onCreateWork={handleCreateWork}
        onRequestDelete={handleRequestDeleteWork}
      />

      {/* 4. ATMOSPHERIC BOOK FETCHING / LOADING TRANSITION */}
      {fetchingWork && (
        <BookFetchTransition
          work={fetchingWork}
          onFinished={handleFinishBookFetch}
        />
      )}

      {/* 5. CUSTOM CONFIRMATION POPUP DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((d) => ({ ...d, isOpen: false }))}
      />

      {/* Slide-over Manuscript Details & Context Modal */}
      {showDetailsModal && currentWork && (
        <ManuscriptDetailsModal
          work={currentWork}
          onChange={handleUpdateWork}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* Book Simulation Reader */}
      {simulationWork && (
        <BookSimulationReader
          work={simulationWork}
          onClose={() => setSimulationWork(null)}
        />
      )}

      {/* Quote Image Snapshot Studio */}
      {quoteSnapshotWork && (
        <QuoteImageModal
          quote={quoteSnapshotWork}
          onClose={() => setQuoteSnapshotWork(null)}
        />
      )}

      {/* Poem Broadsheet Snapshot Studio */}
      {poemSnapshotWork && (
        <PoemImageModal
          poem={poemSnapshotWork}
          onClose={() => setPoemSnapshotWork(null)}
        />
      )}

      {/* Vercel Deploy Guide */}
      {showVercelGuide && (
        <VercelDeployGuideModal
          onClose={() => setShowVercelGuide(false)}
        />
      )}

      {/* Transfer & Auto-save Archive Modal */}
      {showBackupModal && (
        <BackupImportModal
          works={works}
          currentWork={currentWork}
          autoSaveInterval={autoSaveInterval}
          lastSavedAt={lastSavedAt}
          onUpdateAutoSaveInterval={handleUpdateAutoSaveInterval}
          onImportWorks={handleImportWorks}
          onRestoreRevision={handleRestoreRevision}
          onClose={() => setShowBackupModal(false)}
        />
      )}
    </div>
  );
}

export default App;
