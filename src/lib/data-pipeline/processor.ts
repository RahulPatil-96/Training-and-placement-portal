import { read, utils } from 'xlsx';
import { 
  StudentRecord, 
  ProcessedData, 
  ProcessingStats, 
  ColumnMapping,
  ProcessingOptions,
  SchemaValidationResult 
} from './types';
import { FileValidator } from './validator';
import { Department, Year } from '../types';

export class DataProcessor {
  private cache: Map<string, ProcessedData> = new Map();
  private lastProcessed = 0;
  private readonly knownColumns = new Set([
    'PRN', 'name', 'email', 'department', 'year', 'cgpa', 'phone',
    'skills', 'certifications', 'projects', 'internships'
  ]);
  private processingStats: ProcessingStats = {
    filesProcessed: 0,
    recordsProcessed: 0,
    errors: [],
    mergedRecords: 0,
    timestamp: new Date().toISOString(),
    newColumns: [],
    conflicts: [] // Added conflicts array to track conflicts
  };
  
  private resetStats(): void {
    this.processingStats = {
      filesProcessed: 0,
      recordsProcessed: 0,
      errors: [],
      mergedRecords: 0,
      timestamp: new Date().toISOString(),
      newColumns: [],
      conflicts: [] // Added conflicts array to track conflicts
    };
  }

  async processFiles(
    files: File[], 
    options: ProcessingOptions = { allowNewColumns: true }
  ): Promise<ProcessingStats> {
    const records = new Map<string, StudentRecord>();
    this.resetStats();

    for (const file of files) {
      try {
        const validation = await FileValidator.validateExcelFile(file);
        
        if (!validation.isValid) {
          this.processingStats.errors.push({
            file: file.name,
            error: validation.errors.join(', ')
          });
          continue;
        }
        // Fix for possible undefined conflicts array
        if (!this.processingStats.conflicts) {
          this.processingStats.conflicts = [];
        }

        const buffer = await file.arrayBuffer();
        const workbook = read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = utils.sheet_to_json(worksheet, { header: 1 });
        
        const headers = rawData[0] as string[];
        const schemaValidation = this.validateSchema(headers, options);

        if (!schemaValidation.isValid && !options.allowNewColumns) {
          this.processingStats.errors.push({
            file: file.name,
            error: 'Unmapped columns found and new columns are not allowed'
          });
          continue;
        }

        if (schemaValidation.unmappedColumns.length > 0) {
          this.processingStats.newColumns = [
            ...(this.processingStats.newColumns || []),
            ...schemaValidation.unmappedColumns
          ];
        }

        const columnMappings = options.columnMappings || new Map<string, string>();
        const data = utils.sheet_to_json(worksheet) as Record<string, unknown>[];

        data.forEach(record => {
          const processedRecord = this.processRecord(record, columnMappings);
          
          if (processedRecord.PRN && records.has(processedRecord.PRN)) {
            const existing = records.get(processedRecord.PRN)!;
            // Detect conflicts between existing and incoming record
            const conflicts = this.detectConflicts(existing, processedRecord);
            if (conflicts.length > 0) {
              if (!this.processingStats.conflicts) {
                this.processingStats.conflicts = [];
              }
              this.processingStats.conflicts.push({
                prn: processedRecord.PRN,
                conflicts,
                existing,
                incoming: processedRecord
              });
            }
            records.set(processedRecord.PRN!, this.mergeRecords(
              existing, 
              processedRecord,
              options.mergeStrategy || 'smart'
            ));
            this.processingStats.mergedRecords++;
          } else if (processedRecord.PRN) {
            records.set(processedRecord.PRN!, processedRecord);
          }
          this.processingStats.recordsProcessed++;
        });

        this.processingStats.filesProcessed++;
      } catch (error) {
        this.processingStats.errors.push({
          file: file.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const processedData = this.organizeData(Array.from(records.values()));
    console.log('DataProcessor: processedData', processedData);
    this.cache.set('latest', processedData);
    this.lastProcessed = Date.now();

    return this.processingStats;
  }

  private validateSchema(
    headers: string[], 
    options: ProcessingOptions
  ): SchemaValidationResult {
    const unmappedColumns: ColumnMapping[] = [];
    const errors: string[] = [];

    headers.forEach(header => {
      if (!this.knownColumns.has(header) && !options.columnMappings?.has(header)) {
        const suggestion = this.suggestColumnMapping(header);
        unmappedColumns.push({
          excelColumn: header,
          suggestedMapping: suggestion,
          action: 'pending',
          description: this.generateColumnDescription(header),
          dataType: this.inferDataType(header),
          sampleValues: []
        });
      }
    });

    return {
      isValid: unmappedColumns.length === 0,
      unmappedColumns,
      errors
    };
  }

  private suggestColumnMapping(column: string): string {
    const normalized = column.toLowerCase().replace(/[^a-z0-9]/g, '');
    const suggestions = Array.from(this.knownColumns).map(known => ({
      column: known,
      similarity: this.calculateSimilarity(normalized, known.toLowerCase())
    }));
    
    suggestions.sort((a, b) => b.similarity - a.similarity);
    return suggestions[0].similarity > 0.6 ? suggestions[0].column : '';
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    return (longer.length - this.editDistance(longer, shorter)) / longer.length;
  }

  private editDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }
    return matrix[str2.length][str1.length];
  }

  private generateColumnDescription(column: string): string {
    const patterns = new Map([
      [/phone|mobile|contact/i, 'Contact information field'],
      [/email|mail/i, 'Email address field'],
      [/score|grade|marks/i, 'Academic performance metric'],
      [/date|dob|joined/i, 'Date-related field'],
      [/address|location/i, 'Location information'],
      [/skill|technology|language/i, 'Skills or competencies'],
      [/certification|course/i, 'Educational qualification'],
      [/project|work/i, 'Project or work experience']
    ]);

    for (const [pattern, description] of patterns) {
      if (pattern.test(column)) return description;
    }
    return 'Unclassified data field';
  }

  private inferDataType(column: string): string {
    const patterns = new Map([
      [/date|dob|joined/i, 'date'],
      [/email/i, 'email'],
      [/phone|mobile/i, 'phone'],
      [/score|grade|cgpa|percentage/i, 'number'],
      [/is|has|can|should/i, 'boolean'],
      [/skills|technologies|languages/i, 'array'],
      [/description|details|address/i, 'text']
    ]);

    for (const [pattern, type] of patterns) {
      if (pattern.test(column)) return type;
    }
    return 'string';
  }

  private processRecord(
    record: Record<string, unknown>,
    columnMappings: Map<string, string>
  ): StudentRecord {
    const processed: StudentRecord = { PRN: record.PRN as string };

    Object.entries(record).forEach(([key, value]) => {
      const mappedKey = columnMappings.get(key) || key;
      
      if (this.knownColumns.has(mappedKey) || columnMappings.has(key)) {
        processed[mappedKey] = this.normalizeValue(value, this.inferDataType(mappedKey));
      }
    });

    return processed;
  }

  private normalizeValue(value: unknown, type: string): unknown {
    switch (type) {
      case 'date':
        return value instanceof Date ? value.toISOString() : value;
      case 'number':
        return typeof value === 'number' ? value : parseFloat(String(value)) || value;
      case 'boolean':
        if (typeof value === 'string') {
          const normalized = value.toLowerCase();
          if (['yes', 'true', '1'].includes(normalized)) return true;
          if (['no', 'false', '0'].includes(normalized)) return false;
        }
        return value;
      case 'array':
        if (typeof value === 'string') {
          return value.split(/[,;|]/).map(item => item.trim());
        }
        return Array.isArray(value) ? value : [value];
      default:
        return value;
    }
  }

  private mergeRecords(
    existing: StudentRecord,
    incoming: StudentRecord,
    strategy: 'overwrite' | 'preserve' | 'smart'
  ): StudentRecord {
    switch (strategy) {
      case 'overwrite':
        return { ...existing, ...incoming };
      case 'preserve':
        return { ...incoming, ...existing };
      case 'smart': {
        const merged = { ...existing };
        Object.entries(incoming).forEach(([key, value]) => {
          if (!merged[key] || (value !== null && value !== undefined && value !== '')) {
            if (Array.isArray(merged[key]) && Array.isArray(value)) {
              merged[key] = [...new Set([...merged[key], ...value])];
            } else {
              merged[key] = value;
            }
          }
        });
        return merged;
      }
      default:
        return existing;
    }
  }

  private detectConflicts(
    existing: StudentRecord,
    incoming: StudentRecord
  ): { field: string; existingValue: unknown; incomingValue: unknown }[] {
    const conflicts: { field: string; existingValue: unknown; incomingValue: unknown }[] = [];
    Object.keys(incoming).forEach(key => {
      if (
        existing[key] !== undefined &&
        existing[key] !== null &&
        existing[key] !== '' &&
        incoming[key] !== undefined &&
        incoming[key] !== null &&
        incoming[key] !== '' &&
        existing[key] !== incoming[key]
      ) {
        conflicts.push({
          field: key,
          existingValue: existing[key],
          incomingValue: incoming[key]
        });
      }
    });
    return conflicts;
  }

  private organizeData(records: StudentRecord[]): ProcessedData {
    const organized: ProcessedData = { departments: {} };

    records.forEach(record => {
      const department = record.department as Department;
      const year = record.year as Year;

      if (department && year) {
        if (!organized.departments[department]) {
          organized.departments[department] = {};
        }

        if (!organized.departments[department]![year]) {
          organized.departments[department]![year] = [];
        }

        organized.departments[department]![year]!.push(record);
      }
    });

    return organized;
  }

  getData(department?: Department, year?: Year): ProcessedData | null {
    const data = this.cache.get('latest');
    if (!data) return null;

    if (!department) return data;

    const filteredData: ProcessedData = { departments: {} };
    
    if (department && !year) {
      filteredData.departments[department] = data.departments[department];
    } else if (department && year) {
      filteredData.departments[department] = {
        [year]: data.departments[department]?.[year]
      };
    }

    return filteredData;
  }

  shouldRefresh(): boolean {
    return Date.now() - this.lastProcessed > 24 * 60 * 60 * 1000;
  }
}
