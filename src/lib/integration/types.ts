import { z } from 'zod';

export type FileFormat = 'xlsx' | 'xls' | 'csv' | 'xml' | 'json';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ValidationLevel = 'strict' | 'lenient' | 'custom';
export type ConfidenceScore = number; // 0-100

export interface ColumnMetadata {
  name: string;
  originalName: string;
  dataType: string;
  confidence: ConfidenceScore;
  statistics: DataStatistics;
  quality: QualityMetrics;
  patterns: string[];
  businessRules?: BusinessRule[];
  transformations: TransformationRule[];
}

export interface DataStatistics {
  count: number;
  nullCount: number;
  uniqueCount: number;
  min?: number | string | Date;
  max?: number | string | Date;
  mean?: number;
  median?: number;
  mode?: string[];
  standardDeviation?: number;
  outliers?: unknown[];
}

export interface QualityMetrics {
  completeness: number; // 0-100
  accuracy: number; // 0-100
  consistency: number; // 0-100
  validity: number; // 0-100
  uniqueness: number; // 0-100
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  rule: string;
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
}

export interface TransformationRule {
  id: string;
  type: 'format' | 'convert' | 'clean' | 'validate';
  config: Record<string, unknown>;
  order: number;
}

export interface ProcessingJob {
  id: string;
  status: ProcessingStatus;
  progress: number;
  startTime: Date;
  endTime?: Date;
  sourceFiles: ProcessedFile[];
  outputFormat: FileFormat;
  validationLevel: ValidationLevel;
  errors: ProcessingError[];
  warnings: ProcessingWarning[];
  metadata: JobMetadata;
}

export interface ProcessedFile {
  id: string;
  name: string;
  format: FileFormat;
  size: number;
  checksum: string;
  backupPath: string;
  columns: ColumnMetadata[];
  rowCount: number;
  processingTime: number;
  errors: ProcessingError[];
  warnings: ProcessingWarning[];
}

export interface ProcessingError {
  code: string;
  message: string;
  severity: 'critical' | 'error';
  source: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface ProcessingWarning {
  code: string;
  message: string;
  source: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface JobMetadata {
  userId: string;
  projectId: string;
  priority: number;
  tags: string[];
  configuration: ProcessingConfiguration;
  performance: PerformanceMetrics;
}

export interface ProcessingConfiguration {
  validation: ValidationConfig;
  transformation: TransformationConfig;
  output: OutputConfig;
  security: SecurityConfig;
}

export interface ValidationConfig {
  level: ValidationLevel;
  rules: BusinessRule[];
  thresholds: Record<string, number>;
}

export interface TransformationConfig {
  dateFormat: string;
  timezone: string;
  currency: string;
  encoding: string;
  locale: string;
}

export interface OutputConfig {
  format: FileFormat;
  compression: boolean;
  encryption: boolean;
  partitioning: boolean;
}

export interface SecurityConfig {
  encryption: {
    enabled: boolean;
    algorithm: string;
    keySize: number;
  };
  access: {
    roles: string[];
    permissions: string[];
  };
}

export interface PerformanceMetrics {
  processingTime: number;
  memoryUsage: number;
  cpuUsage: number;
  throughput: number;
}

// Zod Schemas for Runtime Validation
export const columnMetadataSchema = z.object({
  name: z.string(),
  originalName: z.string(),
  dataType: z.string(),
  confidence: z.number().min(0).max(100),
  statistics: z.object({
    count: z.number(),
    nullCount: z.number(),
    uniqueCount: z.number(),
    min: z.union([z.number(), z.string(), z.date()]).optional(),
    max: z.union([z.number(), z.string(), z.date()]).optional(),
    mean: z.number().optional(),
    median: z.number().optional(),
    mode: z.array(z.string()).optional(),
    standardDeviation: z.number().optional(),
    outliers: z.array(z.unknown()).optional()
  }),
  quality: z.object({
    completeness: z.number().min(0).max(100),
    accuracy: z.number().min(0).max(100),
    consistency: z.number().min(0).max(100),
    validity: z.number().min(0).max(100),
    uniqueness: z.number().min(0).max(100)
  }),
  patterns: z.array(z.string()),
  businessRules: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    rule: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
    enabled: z.boolean()
  })).optional(),
  transformations: z.array(z.object({
    id: z.string(),
    type: z.enum(['format', 'convert', 'clean', 'validate']),
    config: z.record(z.unknown()),
    order: z.number()
  }))
});

export const processedFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  format: z.enum(['xlsx', 'xls', 'csv', 'xml', 'json']),
  size: z.number(),
  checksum: z.string(),
  backupPath: z.string(),
  columns: z.array(columnMetadataSchema),
  rowCount: z.number(),
  processingTime: z.number(),
  errors: z.array(z.object({
    code: z.string(),
    message: z.string(),
    severity: z.enum(['critical', 'error']),
    source: z.string(),
    timestamp: z.date(),
    context: z.record(z.unknown()).optional()
  })),
  warnings: z.array(z.object({
    code: z.string(),
    message: z.string(),
    source: z.string(),
    timestamp: z.date(),
    context: z.record(z.unknown()).optional()
  }))
});

export const processingJobSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  startTime: z.date(),
  endTime: z.date().optional(),
  sourceFiles: z.array(processedFileSchema),
  outputFormat: z.enum(['xlsx', 'xls', 'csv', 'xml', 'json']),
  validationLevel: z.enum(['strict', 'lenient', 'custom']),
  errors: z.array(z.object({
    code: z.string(),
    message: z.string(),
    severity: z.enum(['critical', 'error']),
    source: z.string(),
    timestamp: z.date(),
    context: z.record(z.unknown()).optional()
  })),
  warnings: z.array(z.object({
    code: z.string(),
    message: z.string(),
    source: z.string(),
    timestamp: z.date(),
    context: z.record(z.unknown()).optional()
  })),
  metadata: z.object({
    userId: z.string(),
    projectId: z.string(),
    priority: z.number(),
    tags: z.array(z.string()),
    configuration: z.object({
      validation: z.object({
        level: z.enum(['strict', 'lenient', 'custom']),
        rules: z.array(z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          rule: z.string(),
          severity: z.enum(['error', 'warning', 'info']),
          enabled: z.boolean()
        })),
        thresholds: z.record(z.number())
      }),
      transformation: z.object({
        dateFormat: z.string(),
        timezone: z.string(),
        currency: z.string(),
        encoding: z.string(),
        locale: z.string()
      }),
      output: z.object({
        format: z.enum(['xlsx', 'xls', 'csv', 'xml', 'json']),
        compression: z.boolean(),
        encryption: z.boolean(),
        partitioning: z.boolean()
      }),
      security: z.object({
        encryption: z.object({
          enabled: z.boolean(),
          algorithm: z.string(),
          keySize: z.number()
        }),
        access: z.object({
          roles: z.array(z.string()),
          permissions: z.array(z.string())
        })
      })
    }),
    performance: z.object({
      processingTime: z.number(),
      memoryUsage: z.number(),
      cpuUsage: z.number(),
      throughput: z.number()
    })
  })
});