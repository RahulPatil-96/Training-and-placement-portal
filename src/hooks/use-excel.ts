import { useState, useCallback } from 'react';
import { read, utils } from 'xlsx';
import { HeaderMapping, ValidationRule } from '@/lib/types';

interface ExcelData {
  headers: string[];
  rows: Record<string, unknown>[];
}

interface ValidationError {
  row: number;
  column: string;
  value: unknown;
  message: string;
}

export function useExcel() {
  const [data, setData] = useState<ExcelData | null>(null);
  const [headerMappings, setHeaderMappings] = useState<HeaderMapping[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const processExcelFile = useCallback(async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new Error('Excel file must contain at least headers and one row of data');
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as Record<string, unknown>[];

      // Generate initial header mappings with confidence scores
      const mappings = headers.map(header => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        const systemFields = Object.keys(EXCEL_VALIDATION_RULES);
        
        // Find best matching system field
        const match = systemFields.find(field => {
          const normalizedField = field.toLowerCase();
          return normalizedHeader.includes(normalizedField) || 
                 normalizedField.includes(normalizedHeader);
        });

        return {
          excelHeader: header,
          systemField: match || '',
          matched: !!match,
          confidence: match ? 0.8 : 0,
          suggestions: systemFields
            .filter(field => field !== match)
            .slice(0, 3)
        };
      });

      setHeaderMappings(mappings);
      setData({ headers, rows });
      validateData(rows, headers, mappings);

    } catch (error) {
      console.error('Error processing Excel file:', error);
      throw error;
    }
  }, []);

  const validateData = useCallback((
    rows: Record<string, unknown>[],
    headers: string[],
    mappings: HeaderMapping[]
  ) => {
    const errors: ValidationError[] = [];

    rows.forEach((row, rowIndex) => {
      headers.forEach((header, colIndex) => {
        const mapping = mappings.find(m => m.excelHeader === header);
        if (!mapping?.systemField) return;

        const value = row[header];
        const rules = mapping.validationRules;

        if (rules) {
          rules.forEach(rule => {
            if (!validateValue(value, rule)) {
              errors.push({
                row: rowIndex + 2,
                column: header,
                value,
                message: rule.message
              });
            }
          });
        }
      });
    });

    setValidationErrors(errors);
  }, []);

  const validateValue = (value: unknown, rule: ValidationRule): boolean => {
    switch (rule.type) {
      case 'required':
        return value !== undefined && value !== null && value !== '';
      case 'format':
        return typeof rule.value === 'string' && 
               new RegExp(rule.value).test(String(value));
      case 'range':
        if (typeof value === 'number' && typeof rule.value === 'object') {
          const { min, max } = rule.value as { min: number; max: number };
          return value >= min && value <= max;
        }
        return false;
      case 'enum':
        return Array.isArray(rule.value) && rule.value.includes(value);
      case 'unique':
        // Unique validation would need access to all values in the column
        return true;
      default:
        return true;
    }
  };

  const updateHeaderMapping = useCallback((
    excelHeader: string,
    systemField: string
  ) => {
    setHeaderMappings(prev => prev.map(mapping => 
      mapping.excelHeader === excelHeader
        ? { ...mapping, systemField, matched: true }
        : mapping
    ));
  }, []);

  const getTransformedData = useCallback(() => {
    if (!data) return [];

    return data.rows.map(row => {
      const transformedRow: Record<string, unknown> = {};
      
      data.headers.forEach((header, index) => {
        const mapping = headerMappings.find(m => m.excelHeader === header);
        if (mapping?.systemField) {
          transformedRow[mapping.systemField] = row[header];
        }
      });

      return transformedRow;
    });
  }, [data, headerMappings]);

  return {
    data,
    headerMappings,
    validationErrors,
    processExcelFile,
    updateHeaderMapping,
    getTransformedData
  };
}

const EXCEL_VALIDATION_RULES: Record<string, ValidationRule[]> = {
  rollNo: [{
    type: 'format',
    value: '^[A-Z]{2}\\d{3}$',
    message: 'Roll number must be in format: XX000'
  }],
  email: [{
    type: 'format',
    value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    message: 'Invalid email format'
  }],
  phone: [{
    type: 'format',
    value: '^\\d{10}$',
    message: 'Phone number must be 10 digits'
  }],
  cgpa: [{
    type: 'range',
    value: { min: 0, max: 10 },
    message: 'CGPA must be between 0 and 10'
  }]
};