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
import { Plus, Package, Calendar, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';

// Standard inventory categories
const CATEGORIES = ['Medicine', 'Equipment', 'Consumables', 'Surgical', 'Lab Supplies'];
const SUPPLIERS = ['MedSupply Co.', 'HealthCare Distributors', 'PharmaTech', 'Medical Essentials'];
const DEPARTMENTS = ['General', 'Pharmacy', 'Laboratory', 'OT', 'Emergency'];

const AddStock: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({
    itemsAdded: 0,
    totalPurchases: 0,
    activeSuppliers: 0,
  });
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

  const handleSubmit = async () => {
    if (!formData.itemName || !formData.quantity || !formData.unitPrice) {
      toast.error('Please fill in required fields (Item Name, Quantity, Unit Price)');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.itemName,
        quantity: parseInt(formData.quantity),
        unit: 'units',
        category: formData.category || 'general',
        supplier: formData.supplier,
        price: parseFloat(formData.unitPrice),
        batchNo: formData.batchNo,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        department: formData.department || 'General',
        minStock: 10, // Default minimum stock
      };

      const response = await api.addInventoryItem(payload);
      
      if (response.success) {
        toast.success(`Stock added successfully: ${formData.quantity} units of ${formData.itemName}`);
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
        
        // Update stats
        setStats(prev => ({
          itemsAdded: prev.itemsAdded + parseInt(formData.quantity),
          totalPurchases: prev.totalPurchases + (parseInt(formData.quantity) * parseFloat(formData.unitPrice)),
          activeSuppliers: formData.supplier ? prev.activeSuppliers + 1 : prev.activeSuppliers,
        }));
      } else {
        toast.error(response.message || 'Failed to add stock');
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Failed to add stock. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // No dummy data - all data flows from database

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
                        {CATEGORIES.map(cat => (
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
                      {SUPPLIERS.map(sup => (
                        <SelectItem key={sup} value={sup}>{sup}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Adding...' : 'Add Stock'}
                </Button>
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
                  <p className="text-2xl font-bold">{stats.itemsAdded}</p>
                  <p className="text-sm text-muted-foreground">Items Added This Session</p>
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
                  <p className="text-2xl font-bold">Rs. {(stats.totalPurchases / 100000).toFixed(1)}L</p>
                  <p className="text-sm text-muted-foreground">Total Purchases Value</p>
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
                  <p className="text-2xl font-bold">{stats.activeSuppliers}</p>
                  <p className="text-sm text-muted-foreground">Suppliers Used</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Note: Recent Stock Additions will be fetched from database when available */}
      </div>
    </DashboardLayout>
  );
};

export default AddStock;
