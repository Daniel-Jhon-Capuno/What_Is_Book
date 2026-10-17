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
import { BookEditor } from './components/BookEditor';
import { PoemEditor } from './components/PoemEditor';
import { QuoteEditor } from './components/QuoteEditor';
import { BookSimulationReader } from './components/BookSimulationReader';
import { QuoteImageModal } from './components/QuoteImageModal';
import { PoemImageModal } from './components/PoemImageModal';
import { VercelDeployGuideModal } from './components/VercelDeployGuideModal';
import { BackupImportModal } from './components/BackupImportModal';
import { soundEngine } from './utils/ambientSound';
import { Library, Minimize2 } from 'lucide-react';

export function App() {
  const [works, setWorks] = useState<LiteraryWork[]>(() => loadWorks());
  const [selectedWorkId, setSelectedWorkId] = useState<string>(() => works[0]?.id || '');
  
  // Library Bookshelf Menu State
  const [showBookshelf, setShowBookshelf] = useState<boolean>(false);
  const [fetchingWork, setFetchingWork] = useState<LiteraryWork | null>(null);

  // Focus & Zen Mode State
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Microsoft Word-Style Formatting State
  const [fontFamily, setFontFamily] = useState<string>("'EB Garamond', Georgia, serif");
  const [fontSize, setFontSize] = useState<number>(18);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'justify'>('justify');
  const [hasDropcap, setHasDropcap] = useState<boolean>(true);

  // Auto-save interval and status
  const [autoSaveInterval, setAutoSaveInterval] = useState<AutoSaveInterval>(() => loadAutoSaveInterval());
  const [lastSavedAt, setLastSavedAt] = useState<number>(Date.now());

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

  // Immediate save on edit to localStorage
  useEffect(() => {
    saveWorks(works);
  }, [works]);

  // Periodic interval auto-save and revision recorder
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
    setWorks((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    setLastSavedAt(Date.now());
  };

  // Chapter specific handlers for Books
  const handleUpdateChapter = (fields: Partial<{ title: string; subtitle: string; content: string }>) => {
    if (!currentWork || currentWork.type !== 'book') return;
    const book = currentWork as BookWork;
    const targetId = activeChapterId || book.chapters[0]?.id;
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

    setWorks((prev) => [newWork, ...prev]);
    setSelectedWorkId(newWork.id);
    recordRevision(newWork, 'Initial creation');
    setShowBookshelf(false);
  };

  const handleDeleteWork = (id: string) => {
    setWorks((prev) => {
      const filtered = prev.filter((w) => w.id !== id);
      if (selectedWorkId === id && filtered.length > 0) {
        setSelectedWorkId(filtered[0].id);
      }
      return filtered;
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
      saveWorks(importedWorks);
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
      saveWorks(merged);
    }
    setLastSavedAt(Date.now());
  };

  const handleRestoreRevision = (snapshot: LiteraryWork) => {
    setWorks((prev) => prev.map((w) => (w.id === snapshot.id ? snapshot : w)));
    setSelectedWorkId(snapshot.id);
    saveWorks(worksRef.current);
    recordRevision(snapshot, 'Restored from history');
    setLastSavedAt(Date.now());
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
      
      {/* 1. FIXED TOP BAR WITH PERMANENT DIVIDER BORDER */}
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

      {/* Discreet Floating Bookshelf Tab on Left Screen Edge */}
      {!isZenMode && (
        <button
          onClick={() => setShowBookshelf(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-30 px-2 py-3 rounded-r-xl bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6] shadow-lg border-y border-r border-[#3a7e82] transition-all cursor-pointer flex flex-col items-center gap-1.5 group select-none opacity-85 hover:opacity-100"
          title="Open Library Bookshelf Menu"
        >
          <Library size={16} />
          <span 
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            className="text-[10px] font-serif uppercase tracking-widest font-bold rotate-180"
          >
            Bookshelf
          </span>
        </button>
      )}

      {/* 2. CENTER DESK / WRITING CANVAS (Scrolls smoothly beneath fixed bar) */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6">
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
                onChange={handleUpdateWork}
                onUpdateChapterTitle={(title) => handleUpdateChapter({ title })}
                onUpdateChapterSubtitle={(subtitle) => handleUpdateChapter({ subtitle })}
                onUpdateChapterContent={(content) => handleUpdateChapter({ content })}
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
      </main>

      {/* 3. THE 3D INTERACTIVE LIBRARY BOOKSHELF MENU */}
      <LibraryBookshelf
        works={works}
        selectedWorkId={selectedWorkId}
        isOpen={showBookshelf}
        onClose={() => setShowBookshelf(false)}
        onSelectWork={handleSelectBookFromShelf}
        onCreateWork={handleCreateWork}
        onDeleteWork={handleDeleteWork}
      />

      {/* 4. ATMOSPHERIC BOOK FETCHING / LOADING TRANSITION */}
      {fetchingWork && (
        <BookFetchTransition
          work={fetchingWork}
          onFinished={handleFinishBookFetch}
        />
      )}

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
