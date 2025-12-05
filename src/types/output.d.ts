/**
 * ZyWiki CLI JSON Output Schemas
 * TypeScript definitions for documentation purposes
 */

/** Base output fields included in all JSON responses */
interface BaseOutput {
  /** ZyWiki version */
  version: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Operation success status */
  success: boolean;
}

/** Status command output */
export interface StatusOutput extends BaseOutput {
  stats: {
    /** Number of tracked source files */
    trackedFiles: number;
    /** Number of generated documents */
    documents: number;
    /** Number of files with pending updates */
    pendingUpdates: number;
  };
  techStack: {
    /** Primary programming language */
    primaryLanguage: string;
    /** Total number of detected frameworks */
    totalFrameworks: number;
    /** Total number of detected services */
    totalServices: number;
    /** Top 3 languages by file count */
    topLanguages: string[];
  };
  pending: {
    /** Source files that have changed */
    changedFiles: string[];
    /** Documents affected by changes */
    affectedDocs: string[];
  };
}

/** Build result for a single document */
interface BuildResult {
  /** Group key */
  group: string;
  /** Document title */
  title: string;
  /** Output file path */
  path: string;
  /** Build status */
  status: 'success' | 'error' | 'skipped';
  /** Error message if status is 'error' */
  error?: string;
  /** Build duration in milliseconds */
  durationMs: number;
}

/** Build command output */
export interface BuildOutput extends BaseOutput {
  /** AI provider used */
  provider: 'claude' | 'gemini';
  /** Total number of groups */
  totalGroups: number;
  /** Number of successfully generated documents */
  generated: number;
  /** Number of failed documents */
  errors: number;
  /** Number of skipped documents */
  skipped: number;
  /** Total build duration in milliseconds */
  totalDurationMs: number;
  /** Individual build results */
  results: BuildResult[];
}

/** Stack command output */
export interface StackOutput extends BaseOutput {
  languages: Array<{
    /** Language name */
    name: string;
    /** Number of files */
    count: number;
    /** Percentage of total files */
    percentage: number;
  }>;
  frameworks: {
    [category: string]: Array<{
      /** Framework name */
      name: string;
      /** Description */
      description: string;
    }>;
  };
  services: {
    [category: string]: Array<{
      /** Service name */
      name: string;
      /** Description */
      description: string;
    }>;
  };
  summary: {
    /** Primary language */
    primaryLanguage: string;
    /** Total frameworks count */
    totalFrameworks: number;
    /** Total services count */
    totalServices: number;
  };
}

/** Manifest file schema */
export interface Manifest {
  /** ZyWiki version */
  version: string;
  /** Generation timestamp */
  generatedAt: string;
  /** Project root path */
  projectRoot: string;
  /** Wiki directory name */
  wikiDir: string;
  stats: {
    /** Total tracked source files */
    trackedFiles: number;
    /** Total generated documents */
    documents: number;
    /** Documentation coverage percentage */
    coveragePercent: number;
  };
  /** Document-to-source file mappings */
  documents: Array<{
    /** Document path relative to wiki dir */
    path: string;
    /** Source files this document covers */
    sources: string[];
    /** Last modified timestamp */
    lastModified: string;
  }>;
}
