import { DownloadCloud, Eye, FileSpreadsheet, Filter, MoreHorizontal, Search, Trash2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mockUploadLogs } from '@/lib/mock-data';

export function UploadHistory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search uploads..."
              className="pl-8 w-[250px]"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-1 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <CardDescription>
            View and manage past data uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Records Processed</TableHead>
                <TableHead>Conflicts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUploadLogs.map((log) => {
                const uploadDate = new Date(log.uploadDate);
                const formattedDate = uploadDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
                const formattedTime = uploadDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                
                const totalConflicts = log.conflicts.duplicates + log.conflicts.unmatched + log.conflicts.invalid;
                
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                        <span>{log.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formattedDate}</span>
                        <span className="text-xs text-muted-foreground">{formattedTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>{log.recordsProcessed}</TableCell>
                    <TableCell>
                      {totalConflicts > 0 ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Badge variant="outline" className="cursor-pointer bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                              {totalConflicts} conflicts
                            </Badge>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Conflicts Report</DialogTitle>
                              <DialogDescription>
                                Details of conflicts for {log.fileName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-4">
                                <Card>
                                  <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm">Duplicates</CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold">{log.conflicts.duplicates}</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm">Unmatched</CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold">{log.conflicts.unmatched}</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm">Invalid</CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold">{log.conflicts.invalid}</p>
                                  </CardContent>
                                </Card>
                              </div>
                              
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Conflict Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Resolution</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {log.conflicts.duplicates > 0 && (
                                        <TableRow>
                                          <TableCell>
                                            <Badge>Duplicate</Badge>
                                          </TableCell>
                                          <TableCell>Row 15: Student with Roll No. CS2001 already exists</TableCell>
                                          <TableCell>Kept existing data</TableCell>
                                        </TableRow>
                                      )}
                                      {log.conflicts.unmatched > 0 && (
                                        <TableRow>
                                          <TableCell>
                                            <Badge variant="outline">Unmatched</Badge>
                                          </TableCell>
                                          <TableCell>Header "Course Level" could not be matched to any system field</TableCell>
                                          <TableCell>Ignored</TableCell>
                                        </TableRow>
                                      )}
                                      {log.conflicts.invalid > 0 && (
                                        <TableRow>
                                          <TableCell>
                                            <Badge variant="destructive">Invalid</Badge>
                                          </TableCell>
                                          <TableCell>Row 23: CGPA value "11.2" is invalid (must be between 0-10)</TableCell>
                                          <TableCell>Skipped row</TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </CardContent>
                              </Card>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
                          No conflicts
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DownloadCloud className="mr-2 h-4 w-4" />
                            Download Original
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {mockUploadLogs.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}