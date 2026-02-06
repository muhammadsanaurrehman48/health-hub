import express from 'express';
import {
  getPrescriptions,
  dispensePrescription,
  getPharmacyInventory,
  getPrescriptionById,
} from '../controllers/pharmacy.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);
router.use(authorize('pharmacy'));

router.get('/prescriptions', getPrescriptions);
router.get('/prescription/:id', getPrescriptionById);
router.get('/inventory', getPharmacyInventory);
router.patch('/prescription/:id/dispense', dispensePrescription);

export default router;

