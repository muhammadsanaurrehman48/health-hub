import express from 'express';
import {
  getRadiologyRequests,
  uploadReport,
  getRadiologyTestById,
  updateRadiologyTestStatus,
} from '../controllers/radiology.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);
router.use(authorize('radiologist', 'doctor'));

router.get('/requests', authorize('radiologist'), getRadiologyRequests);
router.get('/:id', getRadiologyTestById);
router.patch('/:id/status', authorize('radiologist'), updateRadiologyTestStatus);
router.patch('/:id/upload', authorize('radiologist'), uploadReport);

export default router;

