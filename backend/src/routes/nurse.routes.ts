import express from 'express';
import {
  recordVitalSigns,
  getNurseRecords,
  addMedicationRecord,
  updateCareNotes,
  getNurseRecordById,
} from '../controllers/nurse.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.post('/vitals', authorize('nurse'), recordVitalSigns);
router.get('/records', authorize('nurse', 'doctor'), getNurseRecords);
router.get('/records/:id', authorize('nurse', 'doctor'), getNurseRecordById);
router.patch('/records/:id/medication', authorize('nurse'), addMedicationRecord);
router.patch('/records/:id/notes', authorize('nurse'), updateCareNotes);

export default router;

