import express from 'express';
import {
  getPatientHistory,
  createPrescription,
  requestLabTest,
  requestRadiologyTest,
  getMyAppointments,
} from '../controllers/doctor.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require doctor authentication
router.use(authenticate);
router.use(authorize('doctor'));

router.get('/appointments', getMyAppointments);
router.get('/patient/:patientId/history', getPatientHistory);
router.post('/prescription', createPrescription);
router.post('/lab-test', requestLabTest);
router.post('/radiology-test', requestRadiologyTest);

export default router;

