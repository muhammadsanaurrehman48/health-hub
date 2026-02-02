import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Package, Calendar, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const categories = ['Medicine', 'Equipment', 'Consumables', 'Surgical', 'Lab Supplies'];
const suppliers = ['MedSupply Co.', 'HealthCare Distributors', 'PharmaTech', 'Medical Essentials'];

const AddStock: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    supplier: '',
    quantity: '',
    unitPrice: '',
    batchNo: '',
    expiryDate: '',
    department: '',
  });

  const handleSubmit = () => {
    if (!formData.itemName || !formData.quantity || !formData.unitPrice) {
      toast.error('Please fill in required fields');
      return;
    }
    toast.success(`Stock added: ${formData.quantity} units of ${formData.itemName}`);
    setIsAddDialogOpen(false);
    setFormData({
      itemName: '',
      category: '',
      supplier: '',
      quantity: '',
      unitPrice: '',
      batchNo: '',
      expiryDate: '',
      department: '',
    });
  };

  const recentAdditions = [
    { item: 'Paracetamol 500mg', quantity: 5000, supplier: 'MedSupply Co.', date: '2025-02-01' },
    { item: 'Surgical Gloves (L)', quantity: 2000, supplier: 'HealthCare Distributors', date: '2025-02-01' },
    { item: 'Syringes 5ml', quantity: 3000, supplier: 'Medical Essentials', date: '2025-01-31' },
    { item: 'Bandages (Medium)', quantity: 1000, supplier: 'MedSupply Co.', date: '2025-01-31' },
  ];

  return (
    <DashboardLayout requiredRole="inventory">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add Stock</h1>
            <p className="text-muted-foreground">Record new inventory purchases and additions</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add New Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Stock</DialogTitle>
                <DialogDescription>Enter stock purchase details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Item Name *</Label>
                    <Input
                      placeholder="Enter item name"
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price (Rs.) *</Label>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Batch No</Label>
                    <Input
                      placeholder="Enter batch number"
                      value={formData.batchNo}
                      onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select value={formData.supplier} onValueChange={(v) => setFormData({ ...formData, supplier: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(sup => (
                        <SelectItem key={sup} value={sup}>{sup}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>Add Stock</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Items Added This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Rs. 2.4M</p>
                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Active Suppliers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Additions */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Stock Additions</h3>
          <div className="space-y-3">
            {recentAdditions.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{item.item}</p>
                  <p className="text-sm text-muted-foreground">{item.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">+{item.quantity.toLocaleString()} units</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddStock;
