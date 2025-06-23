import { 
  ColumnMetadata,
  ProcessedFile,
  ProcessingError,
  ProcessingWarning,
  ValidationConfig
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

export abstract class BaseProcessor {
  protected validationConfig: ValidationConfig;
  protected errors: ProcessingError[] = [];
  protected warnings: ProcessingWarning[] = [];

  constructor(validationConfig: ValidationConfig) {
    this.validationConfig = validationConfig;
  }

  protected abstract validateFile(file: File): Promise<boolean>;
  protected abstract extractColumns(data: unknown): Promise<ColumnMetadata[]>;
  protected abstract processData(data: unknown): Promise<unknown>;
  protected abstract transformData(data: unknown): Promise<unknown>;

  protected generateChecksum(data: Buffer): string {
    return createHash('sha256').update(data).digest('hex');
  }

  protected createBackup(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const backupPath = `backups/${uuidv4()}/${file.name}`;
        // Implement actual backup logic here
        resolve(backupPath);
      } catch (error) {
        reject(error);
      }
    });
  }

  protected addError(error: ProcessingError): void {
    this.errors.push({
      ...error,
      timestamp: new Date()
    });
  }

  protected addWarning(warning: ProcessingWarning): void {
    this.warnings.push({
      ...warning,
      timestamp: new Date()
    });
  }

  protected validateDataType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'string':
        return typeof value === 'string';
      case 'date':
        return value instanceof Date && !isNaN(value.getTime());
      case 'boolean':
        return typeof value === 'boolean';
      default:
        return false;
    }
  }

  protected calculateStatistics(values: unknown[]): {
    count: number;
    nullCount: number;
    uniqueCount: number;
  } {
    const nonNullValues = values.filter(v => v !== null && v !== undefined);
    const uniqueValues = new Set(nonNullValues);

    return {
      count: values.length,
      nullCount: values.length - nonNullValues.length,
      uniqueCount: uniqueValues.size
    };
  }

  protected async processFile(file: File): Promise<ProcessedFile> {
    const startTime = Date.now();
    const isValid = await this.validateFile(file);

    if (!isValid) {
      throw new Error('File validation failed');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const checksum = this.generateChecksum(buffer);
    const backupPath = await this.createBackup(file);

    const data = await this.processData(buffer);
    const transformedData = await this.transformData(data);
    const columns = await this.extractColumns(transformedData);

    return {
      id: uuidv4(),
      name: file.name,
      format: file.name.split('.').pop() as any,
      size: file.size,
      checksum,
      backupPath,
      columns,
      rowCount: Array.isArray(transformedData) ? transformedData.length : 0,
      processingTime: Date.now() - startTime,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}