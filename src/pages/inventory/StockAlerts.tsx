import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle, Package, Calendar, ShoppingCart, Loader2, Clock, Printer } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';
import { PrintHeader, PrintHide } from '@/components/common/PrintHeader';

interface AlertItem {
  id: string;
  _id?: string;
  name: string;
  category?: string;
  quantity: number;
  unit?: string;
  minStock?: number;
  batchNo?: string;
  expiryDate?: string;
  disposalStatus?: string;
  supplier?: string;
}

interface AlertSummary {
  lowStockCount: number;
  expiredCount: number;
  expiringCount: number;
  outOfStockCount: number;
}

const StockAlerts: React.FC = () => {
  const [lowStockItems, setLowStockItems] = useState<AlertItem[]>([]);
  const [expiringItems, setExpiringItems] = useState<AlertItem[]>([]);
  const [summary, setSummary] = useState<AlertSummary>({
    lowStockCount: 0,
    expiredCount: 0,
    expiringCount: 0,
    outOfStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Disposal dialog state
  const [isDisposalDialogOpen, setIsDisposalDialogOpen] = useState(false);
  const [itemToDispose, setItemToDispose] = useState<AlertItem | null>(null);
  const [disposalReason, setDisposalReason] = useState('');
  const [isDisposing, setIsDisposing] = useState(false);

  // Fetch alerts data
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [lowStockRes, expiringRes, summaryRes] = await Promise.all([
          api.getLowStockAlerts(),
          api.getExpiringAlerts(),
          api.getAlertsummary(),
        ]);

        if (lowStockRes.success) {
          setLowStockItems(lowStockRes.data);
        }
        if (expiringRes.success) {
          setExpiringItems(expiringRes.data);
        }
        if (summaryRes.success) {
          setSummary(summaryRes.data);
        }
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchAlerts();

    // Set up polling every 5 seconds
    const pollInterval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleDisposalClick = (item: AlertItem) => {
    setItemToDispose(item);
    setDisposalReason('');
    setIsDisposalDialogOpen(true);
  };

  const handleConfirmDisposal = async () => {
    if (!itemToDispose) return;

    setIsDisposing(true);
    try {
      const response = await api.markForDisposal(itemToDispose.id || itemToDispose._id || '', disposalReason);

      if (response.success) {
        toast.success(`${itemToDispose.name} marked for disposal`);
        setIsDisposalDialogOpen(false);
        setItemToDispose(null);
        setDisposalReason('');

        // Refresh data
        const [lowStockRes, expiringRes, summaryRes] = await Promise.all([
          api.getLowStockAlerts(),
          api.getExpiringAlerts(),
          api.getAlertsummary(),
        ]);

        if (lowStockRes.success) setLowStockItems(lowStockRes.data);
        if (expiringRes.success) setExpiringItems(expiringRes.data);
        if (summaryRes.success) setSummary(summaryRes.data);
        setLastUpdated(new Date());
      } else {
        toast.error(response.message || 'Failed to mark item for disposal');
      }
    } catch (error) {
      console.error('Error marking for disposal:', error);
      toast.error('Failed to mark item for disposal');
    } finally {
      setIsDisposing(false);
    }
  };

  const handleReorder = (itemName: string) => {
    toast.success(`Reorder request sent for ${itemName}`);
  };

  const getDaysUntilExpiry = (expiryDate: string | undefined) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const isExpired = (daysLeft: number | null) => {
    return daysLeft !== null && daysLeft < 0;
  };

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
      <PrintHeader title="Stock Alerts Report" subtitle="Low Stock & Expiring Items" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Stock Alerts</h1>
            <p className="text-muted-foreground">Monitor low stock and expiring items in real-time</p>
          </div>
          <PrintHide>
            <Button onClick={() => window.print()} className="gap-2">
              <Printer className="w-4 h-4" />
              Print Report
            </Button>
          </PrintHide>
        </div>

        {/* Last Updated Info */}
        <PrintHide>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdated.toLocaleTimeString()}
            <span className="ml-2 text-xs">• Auto-refreshing every 5 seconds</span>
          </div>
        </PrintHide>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <Package className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{summary.lowStockCount}</p>
                  <p className="text-sm text-orange-600 dark:text-orange-300">Low Stock Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{summary.expiredCount}</p>
                  <p className="text-sm text-red-600 dark:text-red-300">Expired Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                  <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{summary.expiringCount}</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{summary.outOfStockCount}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-300">Out of Stock</p>
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
              Low Stock Items ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Current Stock</TableHead>
                      <TableHead className="text-center">Minimum Required</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.map((item) => {
                      const percentage = item.minStock ? (item.quantity / item.minStock) * 100 : 0;
                      return (
                        <TableRow key={item.id || item._id} className={item.disposalStatus === 'marked-for-disposal' ? 'bg-gray-100 dark:bg-gray-800 opacity-60' : ''}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell><Badge variant="outline">{item.category || '-'}</Badge></TableCell>
                          <TableCell className="text-center text-orange-600 font-medium">
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell className="text-center">{item.minStock} {item.unit}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{percentage.toFixed(0)}% of min</span>
                              {item.disposalStatus === 'marked-for-disposal' && (
                                <Badge className="bg-red-500 text-white">Marked for Disposal</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{item.supplier || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {item.disposalStatus !== 'marked-for-disposal' ? (
                                <>
                                  <Button size="sm" onClick={() => handleReorder(item.name)} className="gap-1">
                                    <ShoppingCart className="w-3 h-3" />
                                    Reorder
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDisposalClick(item)}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    Mark Disposal
                                  </Button>
                                </>
                              ) : (
                                <Badge className="bg-red-500 text-white">Disposal Pending</Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No low stock items. All items are well-stocked.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Calendar className="w-5 h-5" />
              Items Expiring Soon ({expiringItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiringItems.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Batch No</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-center">Days Left</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringItems.map((item) => {
                      const daysLeft = getDaysUntilExpiry(item.expiryDate);
                      return (
                        <TableRow
                          key={item.id || item._id}
                          className={
                            item.disposalStatus === 'marked-for-disposal'
                              ? 'bg-gray-100 dark:bg-gray-800 opacity-60'
                              : isExpired(daysLeft)
                              ? 'bg-red-50 dark:bg-red-950/20'
                              : daysLeft && daysLeft <= 7
                              ? 'bg-orange-50 dark:bg-orange-950/20'
                              : ''
                          }
                        >
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-sm">{item.batchNo || '-'}</TableCell>
                          <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                          <TableCell className="text-sm">{formatDate(item.expiryDate)}</TableCell>
                          <TableCell className="text-center">
                            {daysLeft !== null ? (
                              <Badge
                                className={
                                  isExpired(daysLeft)
                                    ? 'bg-red-500 text-white'
                                    : daysLeft <= 7
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-yellow-500 text-white'
                                }
                              >
                                {isExpired(daysLeft) ? 'EXPIRED' : `${daysLeft} days`}
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.disposalStatus !== 'marked-for-disposal' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDisposalClick(item)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                Mark Disposal
                              </Button>
                            ) : (
                              <Badge className="bg-red-500 text-white">Disposal Pending</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No items expiring soon. All items are valid.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disposal Confirmation Dialog */}
        <Dialog open={isDisposalDialogOpen} onOpenChange={setIsDisposalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Item for Disposal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <p className="text-muted-foreground">
                  Are you sure you want to mark <span className="font-semibold text-foreground">{itemToDispose?.name}</span> for disposal?
                </p>
              </div>
              {itemToDispose && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Current Stock:</span>
                    <span className="font-medium">{itemToDispose.quantity} {itemToDispose.unit}</span>
                    <span className="text-muted-foreground">Batch No:</span>
                    <span className="font-medium">{itemToDispose.batchNo || '-'}</span>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{itemToDispose.category || '-'}</span>
                    {itemToDispose.expiryDate && (
                      <>
                        <span className="text-muted-foreground">Expiry Date:</span>
                        <span className="font-medium">{formatDate(itemToDispose.expiryDate)}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Reason for Disposal</Label>
                <Input
                  placeholder="e.g., Expired, Damaged, Contaminated, etc."
                  value={disposalReason}
                  onChange={(e) => setDisposalReason(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will mark the item as "Marked for Disposal" and it will be highlighted differently in the inventory.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDisposalDialogOpen(false)} disabled={isDisposing}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDisposal}
                disabled={isDisposing}
                className="gap-2"
              >
                {isDisposing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDisposing ? 'Marking...' : 'Mark for Disposal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StockAlerts;
