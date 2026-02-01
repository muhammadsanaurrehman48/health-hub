import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Edit,
  AlertTriangle,
  Package,
  Boxes,
} from 'lucide-react';

const mockInventory = [
  { id: '1', name: 'Paracetamol 500mg', category: 'Tablets', stock: 1500, minStock: 500, unit: 'tablets', expiry: '2026-06-15', batchNo: 'PCM-2025-001' },
  { id: '2', name: 'Amoxicillin 500mg', category: 'Capsules', stock: 120, minStock: 200, unit: 'capsules', expiry: '2025-12-20', batchNo: 'AMX-2024-045' },
  { id: '3', name: 'Omeprazole 20mg', category: 'Capsules', stock: 800, minStock: 300, unit: 'capsules', expiry: '2026-03-10', batchNo: 'OMP-2025-012' },
  { id: '4', name: 'Metformin 500mg', category: 'Tablets', stock: 50, minStock: 100, unit: 'tablets', expiry: '2025-08-25', batchNo: 'MTF-2024-089' },
  { id: '5', name: 'Normal Saline 500ml', category: 'IV Fluids', stock: 200, minStock: 50, unit: 'bags', expiry: '2026-01-30', batchNo: 'NS-2025-033' },
];

const PharmacyInventory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < minStock) return <Badge className="bg-warning text-warning-foreground"><AlertTriangle className="w-3 h-3 mr-1" /> Low Stock</Badge>;
    return <Badge className="bg-success text-success-foreground">In Stock</Badge>;
  };

  const filteredInventory = mockInventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.batchNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="pharmacy">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Medicine Inventory</h2>
            <p className="text-muted-foreground">Manage pharmacy stock and medicines</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stock</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Medicine Name</Label>
                  <Input placeholder="Search or enter medicine name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Batch No</Label>
                    <Input placeholder="Batch number" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Input placeholder="Supplier name" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Stock added successfully!'); setIsDialogOpen(false); }}>
                  Add Stock
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Low Stock Alert */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="font-medium">Low Stock Alert:</span>
              <span className="text-muted-foreground">
                {mockInventory.filter(i => i.stock < i.minStock).length} items below minimum stock level
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inventory List</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicines..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Batch No</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min. Stock</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.batchNo}</TableCell>
                    <TableCell>
                      <span className={item.stock < item.minStock ? 'text-warning font-semibold' : ''}>
                        {item.stock} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell>{item.minStock}</TableCell>
                    <TableCell>{item.expiry}</TableCell>
                    <TableCell>{getStockStatus(item.stock, item.minStock)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyInventory;
