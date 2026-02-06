import express from 'express';
import {
  getAllInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getStockAlerts,
  getInventoryById,
} from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('inventory', 'admin'), getAllInventory);
router.get('/alerts', authorize('inventory', 'admin'), getStockAlerts);
router.get('/:id', authorize('inventory', 'admin'), getInventoryById);
router.post('/', authorize('inventory', 'admin'), createInventoryItem);
router.put('/:id', authorize('inventory', 'admin'), updateInventoryItem);
router.delete('/:id', authorize('admin'), deleteInventoryItem);

export default router;

