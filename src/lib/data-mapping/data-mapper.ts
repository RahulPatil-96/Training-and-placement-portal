import { Student, Department, Year } from '@/lib/types';
import { ColumnMapping, ConflictRecord } from '@/lib/data-pipeline/types';
import { v4 as uuidv4 } from 'uuid';

export interface MappingValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  processedRecords: ProcessedRecord[];
}

export interface ValidationError {
  id: string;
  row: number;
  field: string;
  value: unknown;
  message: string;
  severity: 'critical' | 'error';
}

export interface ValidationWarning {
  id: string;
  row: number;
  field: string;
  value: unknown;
  message: string;
}

export interface ProcessedRecord {
  id: string;
  originalData: Record<string, unknown>;
  mappedData: Partial<Student>;
  validationStatus: 'valid' | 'warning' | 'error';
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface DataTransferResult {
  success: boolean;
  transferredCount: number;
  skippedCount: number;
  duplicateCount: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  auditTrail: AuditEntry[];
  timestamp: string;
}

export interface AuditEntry {
  id: string;
  action: 'insert' | 'update' | 'skip' | 'error';
  recordId: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  timestamp: string;
  userId?: string;
}

export class DataMapper {
  private validationRules: ValidationRuleSet;
  private auditTrail: AuditEntry[] = [];

  constructor() {
    this.validationRules = this.initializeValidationRules();
  }

  private initializeValidationRules(): ValidationRuleSet {
    return {
      rollNo: {
        required: true,
        pattern: /^[A-Z]{2,4}\d{3,4}$/,
        unique: true,
        message: 'Roll number must be in format: XX000 or XXXX0000'
      },
      name: {
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-Z\s.'-]+$/,
        message: 'Name must contain only letters, spaces, dots, apostrophes, and hyphens'
      },
      email: {
        required: false,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Invalid email format'
      },
      phone: {
        required: false,
        pattern: /^\d{10}$/,
        message: 'Phone number must be exactly 10 digits'
      },
      department: {
        required: true,
        enum: ['CS', 'IT', 'CSBS', 'ENTC', 'Electrical', 'A&R', 'Mechanical'],
        message: 'Invalid department'
      },
      year: {
        required: true,
        enum: ['FY', 'SY', 'TY', 'Fourth Year'],
        message: 'Invalid year'
      },
      cgpa: {
        required: true,
        type: 'number',
        min: 0,
        max: 10,
        message: 'CGPA must be between 0 and 10'
      },
      dateOfBirth: {
        required: false,
        type: 'date',
        message: 'Invalid date format'
      },
      gender: {
        required: false,
        enum: ['male', 'female', 'other'],
        message: 'Invalid gender'
      },
      bloodGroup: {
        required: false,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: 'Invalid blood group'
      }
    };
  }

  async validateAndMapData(
    rawData: Record<string, unknown>[],
    columnMappings: ColumnMapping[],
    existingStudents: Student[]
  ): Promise<MappingValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const processedRecords: ProcessedRecord[] = [];

    // Create mapping lookup
    const mappingLookup = new Map<string, string>();
    columnMappings.forEach(mapping => {
      if (mapping.action === 'map' && mapping.suggestedMapping) {
        mappingLookup.set(mapping.excelColumn, mapping.suggestedMapping);
      }
    });

    // Track unique values for validation
    const uniqueTracker = new Map<string, Set<unknown>>();
    const existingRollNos = new Set(existingStudents.map(s => s.rollNo));

    for (let rowIndex = 0; rowIndex < rawData.length; rowIndex++) {
      const row = rawData[rowIndex];
      const recordId = uuidv4();
      const recordErrors: ValidationError[] = [];
      const recordWarnings: ValidationWarning[] = [];

      // Map raw data to student fields
      const mappedData: Partial<Student> = {
        id: recordId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Process each field in the row
      for (const [excelColumn, value] of Object.entries(row)) {
        const systemField = mappingLookup.get(excelColumn);
        if (!systemField) continue;

        try {
          const convertedValue = this.convertDataType(value, systemField);
          const validationResult = this.validateField(
            systemField,
            convertedValue,
            rowIndex,
            uniqueTracker,
            existingRollNos
          );

          if (validationResult.isValid) {
            (mappedData as any)[systemField] = convertedValue;
            
            // Track unique values
            if (this.validationRules[systemField]?.unique) {
              if (!uniqueTracker.has(systemField)) {
                uniqueTracker.set(systemField, new Set());
              }
              uniqueTracker.get(systemField)!.add(convertedValue);
            }
          } else {
            recordErrors.push(...validationResult.errors);
            recordWarnings.push(...validationResult.warnings);
          }
        } catch (error) {
          recordErrors.push({
            id: uuidv4(),
            row: rowIndex + 1,
            field: systemField,
            value,
            message: `Data conversion error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'error'
          });
        }
      }

      // Set default values for required fields
      this.setDefaultValues(mappedData);

      // Validate required fields
      const requiredFieldErrors = this.validateRequiredFields(mappedData, rowIndex);
      recordErrors.push(...requiredFieldErrors);

      // Process skills array
      if (mappedData.skills && typeof mappedData.skills === 'string') {
        mappedData.skills = (mappedData.skills as string)
          .split(/[,;|]/)
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0);
      }

      const validationStatus = recordErrors.length > 0 ? 'error' : 
                              recordWarnings.length > 0 ? 'warning' : 'valid';

      processedRecords.push({
        id: recordId,
        originalData: row,
        mappedData,
        validationStatus,
        errors: recordErrors,
        warnings: recordWarnings
      });

      errors.push(...recordErrors);
      warnings.push(...recordWarnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      processedRecords
    };
  }

  private convertDataType(value: unknown, fieldName: string): unknown {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const rule = this.validationRules[fieldName];
    if (!rule) return value;

    switch (rule.type) {
      case 'number':
        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
        if (isNaN(numValue)) throw new Error(`Cannot convert "${value}" to number`);
        return numValue;

      case 'date':
        if (value instanceof Date) return value.toISOString().split('T')[0];
        const dateValue = new Date(String(value));
        if (isNaN(dateValue.getTime())) throw new Error(`Cannot convert "${value}" to date`);
        return dateValue.toISOString().split('T')[0];

      case 'boolean':
        if (typeof value === 'boolean') return value;
        const strValue = String(value).toLowerCase();
        if (['true', '1', 'yes', 'y'].includes(strValue)) return true;
        if (['false', '0', 'no', 'n'].includes(strValue)) return false;
        throw new Error(`Cannot convert "${value}" to boolean`);

      default:
        return String(value).trim();
    }
  }

  private validateField(
    fieldName: string,
    value: unknown,
    rowIndex: number,
    uniqueTracker: Map<string, Set<unknown>>,
    existingRollNos: Set<string>
  ): { isValid: boolean; errors: ValidationError[]; warnings: ValidationWarning[] } {
    const rule = this.validationRules[fieldName];
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!rule) return { isValid: true, errors, warnings };

    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({
        id: uuidv4(),
        row: rowIndex + 1,
        field: fieldName,
        value,
        message: `${fieldName} is required`,
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    if (value === undefined || value === null || value === '') {
      return { isValid: true, errors, warnings };
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors.push({
        id: uuidv4(),
        row: rowIndex + 1,
        field: fieldName,
        value,
        message: rule.message || `Invalid format for ${fieldName}`,
        severity: 'error'
      });
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(value as string)) {
      errors.push({
        id: uuidv4(),
        row: rowIndex + 1,
        field: fieldName,
        value,
        message: `${fieldName} must be one of: ${rule.enum.join(', ')}`,
        severity: 'error'
      });
    }

    // Range validation for numbers
    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push({
          id: uuidv4(),
          row: rowIndex + 1,
          field: fieldName,
          value,
          message: `${fieldName} must be at least ${rule.min}`,
          severity: 'error'
        });
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push({
          id: uuidv4(),
          row: rowIndex + 1,
          field: fieldName,
          value,
          message: `${fieldName} must be at most ${rule.max}`,
          severity: 'error'
        });
      }
    }

    // Length validation for strings
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push({
          id: uuidv4(),
          row: rowIndex + 1,
          field: fieldName,
          value,
          message: `${fieldName} must be at least ${rule.minLength} characters`,
          severity: 'error'
        });
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push({
          id: uuidv4(),
          row: rowIndex + 1,
          field: fieldName,
          value,
          message: `${fieldName} must be at most ${rule.maxLength} characters`,
          severity: 'error'
        });
      }
    }

    // Unique validation
    if (rule.unique) {
      const tracker = uniqueTracker.get(fieldName);
      if (tracker && tracker.has(value)) {
        errors.push({
          id: uuidv4(),
          row: rowIndex + 1,
          field: fieldName,
          value,
          message: `Duplicate ${fieldName} found in uploaded data`,
          severity: 'error'
        });
      }

      // Check against existing data
      if (fieldName === 'rollNo' && existingRollNos.has(String(value))) {
        warnings.push({
          id: uuidv4(),
          row: rowIndex + 1,
          field: fieldName,
          value,
          message: `${fieldName} already exists in database - will be updated`
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  private setDefaultValues(mappedData: Partial<Student>): void {
    // Set default values for arrays
    if (!mappedData.skills) mappedData.skills = [];
    if (!mappedData.certifications) mappedData.certifications = [];
    if (!mappedData.testScores) mappedData.testScores = [];
    if (!mappedData.achievements) mappedData.achievements = [];
    if (!mappedData.internships) mappedData.internships = [];
    if (!mappedData.projects) mappedData.projects = [];

    // Set default numeric values
    if (mappedData.attendance === undefined) mappedData.attendance = 0;
    if (mappedData.backlogCount === undefined) mappedData.backlogCount = 0;

    // Set default boolean values
    if (mappedData.isEligibleForPlacements === undefined) {
      mappedData.isEligibleForPlacements = false;
    }

    // Set default placement status
    if (!mappedData.placementStatus) {
      mappedData.placementStatus = 'not_eligible';
    }

    // Set default gender
    if (!mappedData.gender) {
      mappedData.gender = 'other';
    }
  }

  private validateRequiredFields(
    mappedData: Partial<Student>,
    rowIndex: number
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const requiredFields = ['rollNo', 'name', 'department', 'year', 'cgpa'];

    for (const field of requiredFields) {
      if (!mappedData[field as keyof Student]) {
        errors.push({
          id: uuidv4(),
          row: rowIndex + 1,
          field,
          value: mappedData[field as keyof Student],
          message: `${field} is required but not mapped or empty`,
          severity: 'critical'
        });
      }
    }

    return errors;
  }

  async transferDataToStudentTable(
    validationResult: MappingValidationResult,
    existingStudents: Student[]
  ): Promise<DataTransferResult> {
    const startTime = new Date().toISOString();
    let transferredCount = 0;
    let skippedCount = 0;
    let duplicateCount = 0;
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Create lookup for existing students
    const existingStudentsMap = new Map<string, Student>();
    existingStudents.forEach(student => {
      existingStudentsMap.set(student.rollNo, student);
    });

    const newStudents: Student[] = [];
    const updatedStudents: Student[] = [];

    for (const record of validationResult.processedRecords) {
      if (record.validationStatus === 'error') {
        skippedCount++;
        errors.push(...record.errors);
        this.addAuditEntry('skip', record.id, {}, 'Validation errors');
        continue;
      }

      const studentData = record.mappedData as Student;
      const existingStudent = existingStudentsMap.get(studentData.rollNo);

      if (existingStudent) {
        // Update existing student
        const updatedStudent = this.mergeStudentData(existingStudent, studentData);
        updatedStudents.push(updatedStudent);
        duplicateCount++;
        
        this.addAuditEntry('update', record.id, 
          this.calculateChanges(existingStudent, updatedStudent), 
          'Updated existing student'
        );
      } else {
        // Add new student
        newStudents.push(studentData);
        transferredCount++;
        
        this.addAuditEntry('insert', record.id, {}, 'Added new student');
      }

      warnings.push(...record.warnings);
    }

    // Combine all students
    const allStudents = [
      ...existingStudents.filter(s => !updatedStudents.some(u => u.rollNo === s.rollNo)),
      ...updatedStudents,
      ...newStudents
    ];

    return {
      success: errors.length === 0,
      transferredCount,
      skippedCount,
      duplicateCount,
      errors,
      warnings,
      auditTrail: this.auditTrail,
      timestamp: startTime
    };
  }

  private mergeStudentData(existing: Student, incoming: Student): Student {
    const merged = { ...existing };

    // Update non-empty fields
    Object.keys(incoming).forEach(key => {
      const value = incoming[key as keyof Student];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && Array.isArray(merged[key as keyof Student])) {
          // Merge arrays and remove duplicates
          const existingArray = merged[key as keyof Student] as unknown[];
          const newArray = [...new Set([...existingArray, ...value])];
          (merged as any)[key] = newArray;
        } else {
          (merged as any)[key] = value;
        }
      }
    });

    merged.updatedAt = new Date().toISOString();
    return merged;
  }

  private calculateChanges(
    oldData: Student,
    newData: Student
  ): Record<string, { old: unknown; new: unknown }> {
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    Object.keys(newData).forEach(key => {
      const oldValue = oldData[key as keyof Student];
      const newValue = newData[key as keyof Student];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });

    return changes;
  }

  private addAuditEntry(
    action: AuditEntry['action'],
    recordId: string,
    changes: Record<string, { old: unknown; new: unknown }>,
    note?: string
  ): void {
    this.auditTrail.push({
      id: uuidv4(),
      action,
      recordId,
      changes,
      timestamp: new Date().toISOString(),
      userId: 'current-user' // This should come from auth context
    });
  }

  getAuditTrail(): AuditEntry[] {
    return [...this.auditTrail];
  }

  clearAuditTrail(): void {
    this.auditTrail = [];
  }
}

interface ValidationRuleSet {
  [fieldName: string]: {
    required?: boolean;
    type?: 'string' | 'number' | 'date' | 'boolean';
    pattern?: RegExp;
    enum?: string[];
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    unique?: boolean;
    message?: string;
  };
}