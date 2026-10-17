import type { LiteraryWork, RevisionHistoryItem, ArchivePackage, AutoSaveInterval } from '../types';
import { DEFAULT_WORKS } from '../data/defaultWorks';

const STORAGE_KEY_WORKS = 'scribe_and_parchment_works_v1';
const STORAGE_KEY_HISTORY = 'scribe_and_parchment_history_v1';
const STORAGE_KEY_INTERVAL = 'scribe_and_parchment_autosave_interval_v1';
const MAX_HISTORY_PER_WORK = 15;

export function loadWorks(): LiteraryWork[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORKS);
    if (!raw) {
      saveWorks(DEFAULT_WORKS);
      return DEFAULT_WORKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_WORKS;
  } catch (err) {
    console.warn('Failed to load works from localStorage:', err);
    return DEFAULT_WORKS;
  }
}

export function saveWorks(works: LiteraryWork[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_WORKS, JSON.stringify(works));
  } catch (err) {
    console.error('Failed to save works to localStorage:', err);
  }
}

export function loadAutoSaveInterval(): AutoSaveInterval {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INTERVAL);
    if (raw) {
      const val = Number(raw) as AutoSaveInterval;
      if ([1, 2, 5, 10].includes(val)) return val;
    }
    return 2; // Default 2 minutes
  } catch {
    return 2;
  }
}

export function saveAutoSaveInterval(interval: AutoSaveInterval): void {
  try {
    localStorage.setItem(STORAGE_KEY_INTERVAL, interval.toString());
  } catch (err) {
    console.error('Failed to save autosave interval:', err);
  }
}

export function loadRevisionHistory(): RevisionHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load history:', err);
    return [];
  }
}

export function saveRevisionHistory(history: RevisionHistoryItem[]): void {
  try {
    // Keep most recent 50 history entries overall
    const trimmed = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save history:', err);
  }
}

export function recordRevision(work: LiteraryWork, note?: string): void {
  try {
    const currentHistory = loadRevisionHistory();
    const workHistory = currentHistory.filter(h => h.workId === work.id);

    // If the latest snapshot is identical in text, avoid duplicate save
    if (workHistory.length > 0) {
      const latest = workHistory[0].snapshot;
      if (JSON.stringify(latest) === JSON.stringify(work)) {
        return;
      }
    }

    const title = work.type === 'quote' ? `Quote: ${work.maker}` : work.title;

    const newItem: RevisionHistoryItem = {
      id: 'rev_' + Date.now(),
      workId: work.id,
      workTitle: title,
      workType: work.type,
      timestamp: Date.now(),
      snapshot: JSON.parse(JSON.stringify(work)),
      note: note || 'Auto-saved revision',
    };

    // Filter to retain max entries per work
    const otherWorksHistory = currentHistory.filter(h => h.workId !== work.id);
    const updatedWorkHistory = [newItem, ...workHistory].slice(0, MAX_HISTORY_PER_WORK);
    const combined = [...updatedWorkHistory, ...otherWorksHistory].sort((a, b) => b.timestamp - a.timestamp);

    saveRevisionHistory(combined);
  } catch (err) {
    console.warn('Could not record revision:', err);
  }
}

// Export complete archive package to transfer to another laptop
export function exportCompleteArchive(works: LiteraryWork[]) {
  const history = loadRevisionHistory();
  const pkg: ArchivePackage = {
    version: 1,
    appName: 'Scribe & Parchment',
    exportedAt: Date.now(),
    worksCount: works.length,
    works: works,
    history: history,
  };

  const jsonStr = JSON.stringify(pkg, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `scribe_parchment_archive_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export single work for selective transfer
export function exportSingleWork(work: LiteraryWork) {
  const title = (work.type === 'quote' ? (work.maker || 'quote') : (work.title || 'work'))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 24);

  const pkg: ArchivePackage = {
    version: 1,
    appName: 'Scribe & Parchment',
    exportedAt: Date.now(),
    worksCount: 1,
    works: [work],
  };

  const jsonStr = JSON.stringify(pkg, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${work.type}_${title}_export.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Parse and validate imported file
export function parseArchiveFile(jsonText: string): {
  success: boolean;
  works: LiteraryWork[];
  history?: RevisionHistoryItem[];
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonText);

    // Check if it's an ArchivePackage format
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.works)) {
      return {
        success: true,
        works: parsed.works,
        history: Array.isArray(parsed.history) ? parsed.history : [],
      };
    }

    // Check if it's a direct array of works
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].type) {
      return {
        success: true,
        works: parsed,
      };
    }

    // Check if it's a single work object
    if (parsed && typeof parsed === 'object' && parsed.id && parsed.type) {
      return {
        success: true,
        works: [parsed],
      };
    }

    return {
      success: false,
      works: [],
      error: 'Unrecognized file format. Please upload a valid Scribe & Parchment archive or export file.',
    };
  } catch (e) {
    return {
      success: false,
      works: [],
      error: 'File could not be parsed as JSON. Please ensure it is a valid .json file.',
    };
  }
}
