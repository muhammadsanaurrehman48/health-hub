import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Package, Calendar, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const lowStockItems = [
  { id: '1', name: 'Paracetamol 500mg', category: 'Medicine', currentStock: 150, minStock: 500, unit: 'tablets' },
  { id: '2', name: 'Surgical Gloves (M)', category: 'Consumables', currentStock: 80, minStock: 200, unit: 'pairs' },
  { id: '3', name: 'IV Cannula 20G', category: 'Consumables', currentStock: 45, minStock: 100, unit: 'pieces' },
  { id: '4', name: 'Amoxicillin 500mg', category: 'Medicine', currentStock: 120, minStock: 300, unit: 'capsules' },
  { id: '5', name: 'Cotton Rolls', category: 'Consumables', currentStock: 25, minStock: 50, unit: 'rolls' },
];

const expiringItems = [
  { id: '1', name: 'Insulin Vials', batch: 'INS-2024-089', quantity: 50, expiryDate: '2025-02-15', daysLeft: 13 },
  { id: '2', name: 'Cough Syrup', batch: 'CS-2024-156', quantity: 120, expiryDate: '2025-02-28', daysLeft: 26 },
  { id: '3', name: 'Eye Drops', batch: 'ED-2024-234', quantity: 80, expiryDate: '2025-03-10', daysLeft: 36 },
  { id: '4', name: 'Antibiotics (Batch)', batch: 'AB-2024-567', quantity: 200, expiryDate: '2025-03-15', daysLeft: 41 },
];

const StockAlerts: React.FC = () => {
  const handleReorder = (itemName: string) => {
    toast.success(`Reorder request sent for ${itemName}`);
  };

  return (
    <DashboardLayout requiredRole="inventory">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Alerts</h1>
          <p className="text-muted-foreground">Monitor low stock and expiring items</p>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700">{lowStockItems.length}</p>
                  <p className="text-sm text-orange-600">Low Stock Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">{expiringItems.length}</p>
                  <p className="text-sm text-red-600">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-700">2</p>
                  <p className="text-sm text-yellow-600">Out of Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Package className="w-5 h-5" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Minimum Required</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => {
                  const percentage = (item.currentStock / item.minStock) * 100;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-orange-600 font-medium">
                        {item.currentStock} {item.unit}
                      </TableCell>
                      <TableCell>{item.minStock} {item.unit}</TableCell>
                      <TableCell>
                        <span className={percentage < 30 ? 'badge-cancelled' : 'badge-pending'}>
                          {percentage.toFixed(0)}% of min
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleReorder(item.name)} className="gap-1">
                          <ShoppingCart className="w-3 h-3" />
                          Reorder
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Expiring Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Calendar className="w-5 h-5" />
              Items Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Batch No</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.batch}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.expiryDate}</TableCell>
                    <TableCell>
                      <span className={item.daysLeft < 30 ? 'badge-cancelled' : 'badge-pending'}>
                        {item.daysLeft} days
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">Mark for Disposal</Button>
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

export default StockAlerts;
