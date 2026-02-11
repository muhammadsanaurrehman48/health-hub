import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/utils/api';
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
  Trash2,
  AlertTriangle,
  Package,
  Boxes,
  TrendingDown,
  ArrowRightLeft,
  Loader2,
  RefreshCw,
  Clock,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  _id?: string;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  price: number;
  category: string;
  batchNo?: string;
  expiryDate?: string;
  supplier?: string;
  department?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

const InventoryItems: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Real-time polling - fetch inventory every 5 seconds
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await api.getInventory();
        if (response.success && Array.isArray(response.data)) {
          setInventoryItems(response.data);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchInventory();

    // Set up polling every 5 seconds
    const pollInterval = setInterval(fetchInventory, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.getInventory();
      if (response.success && Array.isArray(response.data)) {
        setInventoryItems(response.data);
        setLastUpdated(new Date());
        toast.success('Inventory refreshed successfully');
      }
    } catch (error) {
      console.error('Error refreshing inventory:', error);
      toast.error('Failed to refresh inventory');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (item.quantity <= item.minStock) return <Badge className="bg-yellow-500 text-white"><AlertTriangle className="w-3 h-3 mr-1" /> Low Stock</Badge>;
    return <Badge className="bg-green-500 text-white">In Stock</Badge>;
  };

  const isExpired = (expiryDate: string | undefined) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringoon = (expiryDate: string | undefined) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category?.toLowerCase() === categoryFilter.toLowerCase();
    const matchesDepartment = departmentFilter === 'all' || item.department === departmentFilter;
    return matchesSearch && matchesCategory && matchesDepartment;
  });

  const lowStockItems = inventoryItems.filter(i => i.quantity <= i.minStock);
  const expiredItems = inventoryItems.filter(i => isExpired(i.expiryDate));
  const expiringItems = inventoryItems.filter(i => isExpiringoon(i.expiryDate));

  if (loading) {
    return (
      <DashboardLayout requiredRole="inventory">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="inventory">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
            <p className="text-muted-foreground">Real-time inventory tracking with database synchronization</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">Use the "Add Stock" section for adding items to inventory</p>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Last Updated Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Last updated: {lastUpdated.toLocaleTimeString()}
          <span className="ml-2 text-xs">• Auto-refreshing every 5 seconds</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Boxes className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inventoryItems.length}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lowStockItems.length}</p>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{expiredItems.length}</p>
                  <p className="text-sm text-muted-foreground">Expired Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{expiringItems.length}</p>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {expiredItems.length > 0 && (
          <Card className="border-red-500/30 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <span className="font-medium text-red-900 dark:text-red-100">Expired Items Alert:</span>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {expiredItems.map(i => i.name).join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {expiringItems.length > 0 && (
          <Card className="border-orange-500/30 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <span className="font-medium text-orange-900 dark:text-orange-100">Expiring Soon Alert:</span>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    {expiringItems.map(i => i.name).join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {lowStockItems.length > 0 && (
          <Card className="border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <span className="font-medium text-yellow-900 dark:text-yellow-100">Low Stock Alert:</span>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {lowStockItems.map(i => i.name).join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <CardTitle>Inventory Items</CardTitle>
              <div className="flex gap-4 flex-wrap">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Medicine">Medicine</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Consumables">Consumables</SelectItem>
                    <SelectItem value="Surgical">Surgical</SelectItem>
                    <SelectItem value="Lab Supplies">Lab Supplies</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="Laboratory">Laboratory</SelectItem>
                    <SelectItem value="OT">OT</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, batch, or supplier..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Min Stock</TableHead>
                    <TableHead>Batch No</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <TableRow key={item.id || item._id} className={isExpired(item.expiryDate) ? 'bg-red-50 dark:bg-red-950/20' : isExpiringoon(item.expiryDate) ? 'bg-orange-50 dark:bg-orange-950/20' : ''}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.department}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={item.quantity <= item.minStock ? 'text-red-600 font-semibold' : 'font-medium'}>
                            {item.quantity} {item.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{item.minStock}</TableCell>
                        <TableCell className="text-sm">{item.batchNo || '-'}</TableCell>
                        <TableCell className="text-sm">{item.supplier || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{formatDate(item.expiryDate)}</span>
                            {isExpired(item.expiryDate) && (
                              <Badge variant="destructive" className="text-xs">Expired</Badge>
                            )}
                            {isExpiringoon(item.expiryDate) && (
                              <Badge className="bg-orange-500 text-white text-xs">Expiring</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">Rs. {item.price.toFixed(2)}</TableCell>
                        <TableCell>{getStockStatus(item)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        No inventory items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredItems.length} of {inventoryItems.length} items
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InventoryItems;
