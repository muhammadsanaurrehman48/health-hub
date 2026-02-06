import express from 'express';
import {
  registerPatient,
  getAllPatients,
  getPatientById,
  searchByForceNo,
  updatePatient,
  deletePatient,
} from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, authorize('admin', 'receptionist'), registerPatient);
router.get('/', authenticate, getAllPatients);
router.get('/search/force/:forceNo', authenticate, searchByForceNo);
router.get('/:id', authenticate, getPatientById);
router.put('/:id', authenticate, authorize('admin', 'receptionist'), updatePatient);
router.delete('/:id', authenticate, authorize('admin'), deletePatient);

export default router;

