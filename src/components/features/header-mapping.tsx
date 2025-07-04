import { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Edit2, 
  HelpCircle,
  XCircle,
  Plus,
  Save,
  RefreshCw,
  Database
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ColumnMapping, ConflictRecord } from '@/lib/data-pipeline/types';
import { DataMappingManager } from './data-mapping-manager';
import { MappingValidationResult, DataTransferResult } from '@/lib/data-mapping/data-mapper';

interface HeaderMappingProps {
  newColumns?: ColumnMapping[];
  conflicts?: ConflictRecord[];
  rawData?: Record<string, unknown>[];
  onUpdateMapping?: (mapping: ColumnMapping) => void;
  onSaveMappings?: () => void;
  onRefreshData?: () => void;
}

function areMappingsEqual(a: ColumnMapping[], b: ColumnMapping[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const aItem = a[i];
    const bItem = b[i];
    if (
      aItem.excelColumn !== bItem.excelColumn ||
      aItem.suggestedMapping !== bItem.suggestedMapping ||
      aItem.action !== bItem.action ||
      aItem.description !== bItem.description ||
      aItem.dataType !== bItem.dataType
    ) {
      return false;
    }
  }
  return true;
}

export function HeaderMapping({ 
  newColumns = [], 
  conflicts = [],
  rawData = [],
  onUpdateMapping = () => {},
  onSaveMappings = () => {},
  onRefreshData = () => {}
}: HeaderMappingProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<ColumnMapping | null>(null);
  const [showNewColumnDialog, setShowNewColumnDialog] = useState(false);
  const [showDataMappingManager, setShowDataMappingManager] = useState(false);
  const [validationResult, setValidationResult] = useState<MappingValidationResult | null>(null);
  const [transferResult, setTransferResult] = useState<DataTransferResult | null>(null);
  const [newColumnData, setNewColumnData] = useState({
    name: '',
    type: 'string',
    description: '',
    required: false
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!areMappingsEqual(newColumns, mappings)) {
      setMappings(newColumns || []);
    }
  }, [newColumns, mappings]);

  const handleUpdateMapping = (index: number, action: 'map' | 'skip') => {
    const updatedMappings = [...mappings];
    updatedMappings[index] = {
      ...updatedMappings[index],
      action
    };
    setMappings(updatedMappings);
    onUpdateMapping(updatedMappings[index]);
  };

  const handleResolveConflict = (prn: string, field: string, value: unknown) => {
    // Implementation for conflict resolution
    console.log('Resolving conflict:', { prn, field, value });
  };

  const handleAddNewColumn = () => {
    const newColumn: ColumnMapping = {
      excelColumn: newColumnData.name,
      suggestedMapping: newColumnData.name.toLowerCase().replace(/\s+/g, '_'),
      action: 'map',
      description: newColumnData.description,
      dataType: newColumnData.type
    };
    
    setMappings(prev => [...prev, newColumn]);
    setShowNewColumnDialog(false);
    setNewColumnData({
      name: '',
      type: 'string',
      description: '',
      required: false
    });
    
    toast({
      title: "New column added",
      description: "The column has been added to the mapping list."
    });
  };

  const handleSaveAll = () => {
    if (!Array.isArray(mappings)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid mapping data. Please try refreshing the page."
      });
      return;
    }

    const unmappedColumns = mappings.filter(m => m.action === 'pending');
    if (unmappedColumns.length > 0) {
      toast({
        variant: "destructive",
        title: "Unmapped columns found",
        description: "Please map or skip all columns before saving."
      });
      return;
    }
    
    // Show the data mapping manager instead of just calling onSaveMappings
    setShowDataMappingManager(true);
  };

  const handleMappingComplete = (result: DataTransferResult) => {
    setTransferResult(result);
    setShowDataMappingManager(false);
    
    if (result.success) {
      toast({
        title: "Data mapping completed successfully",
        description: `${result.transferredCount} new records added, ${result.duplicateCount} records updated.`
      });
    }
  };

  const handleValidationResult = (result: MappingValidationResult) => {
    setValidationResult(result);
  };

  const mappedCount = Array.isArray(mappings) ? mappings.filter(m => m.action === 'map').length : 0;
  const pendingCount = Array.isArray(mappings) ? mappings.filter(m => m.action === 'pending').length : 0;
  const skippedCount = Array.isArray(mappings) ? mappings.filter(m => m.action === 'skip').length : 0;
  const hasPendingMappings = pendingCount > 0;

  return (
    <div className="space-y-6" id="header-mapping">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Excel Header Mapping</h3>
          <p className="text-sm text-muted-foreground">
            Map Excel columns to system fields or add new column definitions.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onRefreshData}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowNewColumnDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Column
          </Button>
        </div>
      </div>
      
      {hasPendingMappings && (
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-amber-500">Unmapped Columns Found</CardTitle>
            </div>
            <CardDescription>
              Some columns need to be mapped or skipped before proceeding.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {conflicts.length > 0 && (
        <Card className="bg-red-100 border-red-300">
          <CardHeader>
            <CardTitle>Conflicts Detected</CardTitle>
            <CardDescription>
              Please resolve the following conflicts before proceeding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conflicts.map((conflict, idx) => (
              <div key={idx} className="mb-4 border p-4 rounded bg-white">
                <h4 className="font-semibold mb-2">PRN: {conflict.prn}</h4>
                {conflict.conflicts.map(({ field, existingValue, incomingValue }) => (
                  <div key={field} className="mb-2">
                    <p><strong>{field}</strong></p>
                    <div className="flex gap-4">
                      <button
                        className="px-3 py-1 bg-green-200 rounded"
                        onClick={() => handleResolveConflict(conflict.prn, field, existingValue)}
                      >
                        Keep Existing: {String(existingValue)}
                      </button>
                      <button
                        className="px-3 py-1 bg-yellow-200 rounded"
                        onClick={() => handleResolveConflict(conflict.prn, field, incomingValue)}
                      >
                        Use Incoming: {String(incomingValue)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Header Mapping</CardTitle>
              <CardDescription>
                Match Excel headers to system fields or define new columns
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {mappedCount} Mapped
              </Badge>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                <HelpCircle className="mr-1 h-3 w-3" />
                {pendingCount} Pending
              </Badge>
              <Badge variant="outline" className="bg-slate-500/10 text-slate-500">
                <XCircle className="mr-1 h-3 w-3" />
                {skippedCount} Skipped
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Excel Header</TableHead>
                <TableHead>System Field</TableHead>
                <TableHead>Data Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((mapping, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">
                    {mapping.excelColumn}
                  </TableCell>
                  <TableCell>
                    {mapping.suggestedMapping}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {mapping.dataType || 'string'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {mapping.description}
                  </TableCell>
                  <TableCell>
                    {mapping.action === 'map' && (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Mapped
                      </Badge>
                    )}
                    {mapping.action === 'pending' && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                        <HelpCircle className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                    {mapping.action === 'skip' && (
                      <Badge variant="outline" className="bg-slate-500/10 text-slate-500">
                        <XCircle className="mr-1 h-3 w-3" />
                        Skipped
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {mapping.action === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => handleUpdateMapping(i, 'map')}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Map
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => handleUpdateMapping(i, 'skip')}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Skip
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => setSelectedColumn(mapping)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setMappings(newColumns || [])}>
            Reset Mapping
          </Button>
          <Button onClick={handleSaveAll} className="gap-2">
            <Database className="h-4 w-4" />
            Save All Mappings
          </Button>
        </CardFooter>
      </Card>

      {/* Data Mapping Manager Dialog */}
      <Dialog open={showDataMappingManager} onOpenChange={setShowDataMappingManager}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Mapping & Transfer</DialogTitle>
            <DialogDescription>
              Validate and transfer mapped data to the student table
            </DialogDescription>
          </DialogHeader>
          
          <DataMappingManager
            rawData={rawData}
            columnMappings={mappings}
            onMappingComplete={handleMappingComplete}
            onValidationResult={handleValidationResult}
          />
        </DialogContent>
      </Dialog>

      {/* Add New Column Dialog */}
      <Dialog open={showNewColumnDialog} onOpenChange={setShowNewColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
            <DialogDescription>
              Define a new column to be added to the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="column-name">Column Name</Label>
              <Input
                id="column-name"
                value={newColumnData.name}
                onChange={(e) => setNewColumnData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                placeholder="Enter column name..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="column-type">Data Type</Label>
              <Select
                value={newColumnData.type}
                onValueChange={(value) => setNewColumnData(prev => ({
                  ...prev,
                  type: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="column-description">Description</Label>
              <Textarea
                id="column-description"
                value={newColumnData.description}
                onChange={(e) => setNewColumnData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Enter column description..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="column-required"
                checked={newColumnData.required}
                onCheckedChange={(checked) => setNewColumnData(prev => ({
                  ...prev,
                  required: checked
                }))}
              />
              <Label htmlFor="column-required">Required Field</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewColumnDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewColumn}>
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Column Dialog */}
      <Dialog open={!!selectedColumn} onOpenChange={() => setSelectedColumn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Column Mapping</DialogTitle>
            <DialogDescription>
              Modify the mapping details for this column.
            </DialogDescription>
          </DialogHeader>
          
          {selectedColumn && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Excel Header</Label>
                <Input value={selectedColumn.excelColumn} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>System Field</Label>
                <Input
                  value={selectedColumn.suggestedMapping}
                  onChange={(e) => setSelectedColumn({
                    ...selectedColumn,
                    suggestedMapping: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Data Type</Label>
                <Select
                  value={selectedColumn.dataType}
                  onValueChange={(value) => setSelectedColumn({
                    ...selectedColumn,
                    dataType: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={selectedColumn.description}
                  onChange={(e) => setSelectedColumn({
                    ...selectedColumn,
                    description: e.target.value
                  })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedColumn(null)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (selectedColumn) {
                const index = mappings.findIndex(
                  m => m.excelColumn === selectedColumn.excelColumn
                );
                const updatedMappings = [...mappings];
                updatedMappings[index] = selectedColumn;
                setMappings(updatedMappings);
                onUpdateMapping(selectedColumn);
              }
              setSelectedColumn(null);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}