import { Department, Year } from '../types';

export interface StudentRecord {
  PRN: string;
  [key: string]: any;
}

export interface ProcessedData {
  departments: {
    [key in Department]?: {
      [key in Year]?: StudentRecord[];
    };
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ProcessingStats {
  filesProcessed: number;
  recordsProcessed: number;
  errors: Array<{
    file: string;
    error: string;
  }>;
  mergedRecords: number;
  timestamp: string;
  newColumns?: ColumnMapping[];
  conflicts?: ConflictRecord[]; // Added conflicts property
}

export interface ConflictRecord {
  prn: string;
  conflicts: {
    field: string;
    existingValue: unknown;
    incomingValue: unknown;
  }[];
  existing: Record<string, unknown>;
  incoming: Record<string, unknown>;
}

export interface CacheEntry {
  data: ProcessedData;
  timestamp: number;
  stats: ProcessingStats;
}

export interface ColumnMapping {
  excelColumn: string;
  suggestedMapping: string;
  action: 'map' | 'skip' | 'pending';
  description?: string;
  dataType?: string;
  sampleValues?: string[];
}

export interface SchemaValidationResult {
  isValid: boolean;
  unmappedColumns: ColumnMapping[];
  errors: string[];
}

export interface ProcessingOptions {
  allowNewColumns: boolean;
  columnMappings?: Map<string, string>;
  validateData?: boolean;
  mergeStrategy?: 'overwrite' | 'preserve' | 'smart';
}