import express from 'express';
import {
  getLabRequests,
  updateLabTestStatus,
  recordSampleCollection,
  enterTestResults,
  getLabTestById,
} from '../controllers/laboratory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);
router.use(authorize('laboratory', 'doctor'));

router.get('/requests', authorize('laboratory'), getLabRequests);
router.get('/:id', getLabTestById);
router.patch('/:id/status', authorize('laboratory'), updateLabTestStatus);
router.patch('/:id/sample', authorize('laboratory'), recordSampleCollection);
router.patch('/:id/results', authorize('laboratory'), enterTestResults);

export default router;

