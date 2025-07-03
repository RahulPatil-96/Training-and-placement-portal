# Excel File Merger

A comprehensive Python-based solution for merging multiple Excel files into a single consolidated workbook with advanced validation, error handling, and formatting preservation.

## Features

### Core Functionality
- **Multi-file Processing**: Merge up to 20 Excel files (.xlsx, .xls) simultaneously
- **File Size Validation**: Maximum 50MB per file with automatic validation
- **Sheet Extraction**: Automatically processes all sheets within each uploaded file
- **Data Consolidation**: Intelligent merging with duplicate detection and removal

### Data Processing
- **Column Standardization**: Automatic column name normalization (alphanumeric, lowercase)
- **Duplicate Handling**: Smart duplicate column resolution with source file naming
- **Data Type Preservation**: Maintains original data types where possible
- **Memory Management**: Chunked processing for large datasets

### Validation & Error Handling
- **File Format Validation**: Ensures valid Excel formats using pandas.ExcelFile()
- **Corruption Detection**: Identifies and reports corrupted or password-protected files
- **Empty Sheet Handling**: Automatically skips empty sheets with warnings
- **Comprehensive Logging**: Detailed error logs with timestamps and file details

### Output Features
- **Formatted Output**: Professional Excel formatting with headers, borders, and colors
- **Metadata Sheet**: Comprehensive processing information including:
  - Source file names and sizes
  - Original sheet names and row counts
  - Processing timestamps and performance metrics
  - Error and warning summaries
- **Auto-sizing**: Automatic column width adjustment
- **Freeze Panes**: Header row freezing for better navigation

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Basic Usage

```python
from excel_merger import merge_excel_files

# Simple merge operation
result = merge_excel_files([
    'file1.xlsx',
    'file2.xlsx',
    'file3.xls'
])

if result['success']:
    print(f"✅ Merge successful! Output: {result['output_path']}")
    print(f"📊 Total rows: {result['total_rows']}")
    print(f"📋 Total columns: {result['total_columns']}")
else:
    print(f"❌ Merge failed: {result['errors']}")
```

### Advanced Usage

```python
from excel_merger import ExcelFileMerger

# Create merger with custom output directory
merger = ExcelFileMerger(output_dir="./merged_files")

# Merge files with detailed results
result = merger.merge_excel_files(file_paths)

# Access detailed metadata
for metadata in result.metadata:
    print(f"File: {metadata.filename}")
    print(f"Sheets: {metadata.sheet_count}")
    print(f"Rows: {metadata.total_rows}")
    print(f"Processing time: {metadata.processing_time:.2f}s")
```

## API Reference

### `merge_excel_files(file_paths, output_dir=None)`

Convenience function for merging Excel files.

**Parameters:**
- `file_paths` (List[str]): List of paths to Excel files
- `output_dir` (str, optional): Output directory for merged file

**Returns:**
- `Dict[str, Any]`: Merge results with success status, file path, and metadata

### `ExcelFileMerger` Class

Main class for Excel file merging operations.

#### Methods

##### `__init__(output_dir=None)`
Initialize the merger with optional output directory.

##### `merge_excel_files(file_paths)`
Merge multiple Excel files into a single consolidated file.

**Parameters:**
- `file_paths` (List[str]): List of Excel file paths to merge

**Returns:**
- `MergeResult`: Detailed results object

## Data Structures

### `MergeResult`
```python
@dataclass
class MergeResult:
    success: bool
    output_path: Optional[str]
    metadata: List[FileMetadata]
    total_rows: int
    total_columns: int
    processing_time: float
    errors: List[str]
    warnings: List[str]
```

### `FileMetadata`
```python
@dataclass
class FileMetadata:
    filename: str
    file_size: int
    sheet_count: int
    total_rows: int
    processing_time: float
    checksum: str
    errors: List[str]
    warnings: List[str]
```

## Error Handling

The merger provides comprehensive error handling for various scenarios:

### File Validation Errors
- Invalid file formats (non-Excel files)
- File size exceeding 50MB limit
- Corrupted or password-protected files
- Missing or inaccessible files

### Processing Errors
- Empty sheets or files
- Incompatible data structures
- Memory limitations
- Column mapping conflicts

### Example Error Handling
```python
result = merge_excel_files(file_paths)

if not result['success']:
    print("Errors encountered:")
    for error in result['errors']:
        print(f"  - {error}")
    
    print("Warnings:")
    for warning in result['warnings']:
        print(f"  - {warning}")
```

## Performance Considerations

### Memory Management
- Files are processed in chunks to manage memory usage
- Large datasets are handled efficiently with pandas optimization
- Automatic garbage collection for processed data

### Processing Speed
- Parallel processing where possible
- Optimized pandas operations
- Efficient data type inference and conversion

### Scalability
- Supports up to 20 files per merge operation
- Maximum 50MB per file
- Automatic progress tracking and reporting

## Integration with React Frontend

The merger integrates seamlessly with the React frontend through the `ExcelMerger` component:

```typescript
// Frontend integration example
const handleMergeFiles = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await fetch('/api/merge-excel', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  return result;
};
```

## Best Practices

### File Preparation
1. Ensure all Excel files have consistent column structures
2. Remove password protection before uploading
3. Verify file integrity and format compatibility
4. Use descriptive file names for better tracking

### Performance Optimization
1. Process files in smaller batches for very large datasets
2. Close other applications to free up memory
3. Use SSD storage for faster file I/O operations
4. Monitor system resources during processing

### Error Prevention
1. Validate file formats before processing
2. Check available disk space for output files
3. Ensure proper file permissions
4. Test with sample files before bulk processing

## Troubleshooting

### Common Issues

**"File not found" errors:**
- Verify file paths are correct and accessible
- Check file permissions
- Ensure files haven't been moved or deleted

**Memory errors:**
- Reduce the number of files processed simultaneously
- Close other memory-intensive applications
- Consider processing in smaller batches

**Format errors:**
- Ensure files are valid Excel formats (.xlsx, .xls)
- Check for file corruption
- Remove password protection

**Performance issues:**
- Monitor system resources (RAM, CPU)
- Use faster storage (SSD vs HDD)
- Process smaller file sets

## License

This project is part of the Training & Placement Portal system and follows the same licensing terms.