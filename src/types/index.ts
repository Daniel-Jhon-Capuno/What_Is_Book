export type WorkType = 'book' | 'poem' | 'quote';

export interface Chapter {
  id: string;
  title: string;
  subtitle?: string;
  content: string; // Markdown or plain text with paragraphs
}

export interface BookWork {
  id: string;
  type: 'book';
  title: string;
  subtitle?: string;
  author: string;
  about: string; // Synopsis, context, background
  dedication?: string;
  genre?: string;
  year?: string;
  chapters: Chapter[];
  createdAt: number;
  updatedAt: number;
}

export interface PoemWork {
  id: string;
  type: 'poem';
  title: string;
  poet: string;
  about: string; // Context, background, inspiration
  body: string; // Stanzas separated by double linebreaks
  form?: string; // Free verse, Sonnet, Haiku, etc.
  dateOrLocation?: string;
  createdAt: number;
  updatedAt: number;
}

export interface QuoteWork {
  id: string;
  type: 'quote';
  quote: string; // The quote body text
  maker: string; // Name of the maker / author / speaker
  about: string; // Context / source / book / speech
  year?: string;
  category?: string;
  createdAt: number;
  updatedAt: number;
}

export type LiteraryWork = BookWork | PoemWork | QuoteWork;

export interface RevisionHistoryItem {
  id: string;
  workId: string;
  workTitle: string;
  workType: WorkType;
  timestamp: number;
  snapshot: LiteraryWork;
  note?: string;
}

export type AutoSaveInterval = 1 | 2 | 5 | 10; // in minutes

export interface ArchivePackage {
  version: number;
  appName: string;
  exportedAt: number;
  worksCount: number;
  works: LiteraryWork[];
  history?: RevisionHistoryItem[];
}

export type ReaderTheme = 'morning-paper' | 'silent-grove' | 'blue-monolith' | 'candlelight';
export type ReaderFont = 'eb-garamond' | 'cormorant' | 'cinzel' | 'newsreader';
export type CardRatio = '1:1' | '4:5' | '9:16' | '16:9';
