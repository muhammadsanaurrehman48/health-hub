import express from 'express';
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  processPayment,
  getBillingReports,
} from '../controllers/billing.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('billing', 'receptionist', 'admin'), createInvoice);
router.get('/', authorize('billing', 'receptionist', 'admin'), getAllInvoices);
router.get('/reports', authorize('billing', 'admin'), getBillingReports);
router.get('/:id', authorize('billing', 'receptionist', 'admin'), getInvoiceById);
router.patch('/:id/payment', authorize('billing', 'receptionist', 'admin'), processPayment);

export default router;

