import express from 'express';
import { getDashboardStats, getAllBills } from '../controllers/receptionist.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);
router.use(authorize('receptionist', 'admin'));

router.get('/dashboard', getDashboardStats);
router.get('/bills', getAllBills);

export default router;

