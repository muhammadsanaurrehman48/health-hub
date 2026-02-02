import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, ShoppingCart, Clock } from 'lucide-react';
import { toast } from 'sonner';

const lowStockMedicines = [
  { id: '1', name: 'Paracetamol 500mg', currentStock: 150, minStock: 500, unit: 'tablets' },
  { id: '2', name: 'Amoxicillin 500mg', currentStock: 80, minStock: 300, unit: 'capsules' },
  { id: '3', name: 'Omeprazole 20mg', currentStock: 45, minStock: 200, unit: 'capsules' },
  { id: '4', name: 'Metformin 500mg', currentStock: 120, minStock: 400, unit: 'tablets' },
  { id: '5', name: 'Azithromycin 500mg', currentStock: 25, minStock: 100, unit: 'tablets' },
];

const expiringMedicines = [
  { id: '1', name: 'Insulin Vials', batch: 'INS-2024-089', quantity: 50, expiryDate: '2025-02-15', daysLeft: 13 },
  { id: '2', name: 'Cough Syrup', batch: 'CS-2024-156', quantity: 120, expiryDate: '2025-02-28', daysLeft: 26 },
  { id: '3', name: 'Eye Drops', batch: 'ED-2024-234', quantity: 80, expiryDate: '2025-03-10', daysLeft: 36 },
];

const PharmacyAlerts: React.FC = () => {
  const handleReorder = (medicineName: string) => {
    toast.success(`Reorder request sent for ${medicineName}`);
  };

  return (
    <DashboardLayout requiredRole="pharmacy">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Alerts</h1>
          <p className="text-muted-foreground">Monitor low stock and expiring medicines</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700">{lowStockMedicines.length}</p>
                  <p className="text-sm text-orange-600">Low Stock Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">{expiringMedicines.length}</p>
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
                  <p className="text-2xl font-bold text-yellow-700">1</p>
                  <p className="text-sm text-yellow-600">Out of Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Package className="w-5 h-5" />
              Low Stock Medicines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockMedicines.map((medicine) => {
                const percentage = (medicine.currentStock / medicine.minStock) * 100;
                return (
                  <div key={medicine.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{medicine.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: <span className="text-orange-600 font-medium">{medicine.currentStock}</span> / 
                        Min: {medicine.minStock} {medicine.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={percentage < 30 ? 'badge-cancelled' : 'badge-pending'}>
                        {percentage.toFixed(0)}%
                      </span>
                      <Button size="sm" onClick={() => handleReorder(medicine.name)} className="gap-1">
                        <ShoppingCart className="w-3 h-3" />
                        Reorder
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Clock className="w-5 h-5" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringMedicines.map((medicine) => (
                <div key={medicine.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{medicine.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Batch: {medicine.batch} | Qty: {medicine.quantity} | Expires: {medicine.expiryDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={medicine.daysLeft < 30 ? 'badge-cancelled' : 'badge-pending'}>
                      {medicine.daysLeft} days left
                    </span>
                    <Button size="sm" variant="outline">Mark for Disposal</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyAlerts;
