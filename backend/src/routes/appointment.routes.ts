import express from 'express';
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getDoctorAppointments,
} from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, authorize('admin', 'receptionist'), createAppointment);
router.get('/', authenticate, getAllAppointments);
router.get('/doctor/:doctorId', authenticate, getDoctorAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.patch('/:id/status', authenticate, authorize('admin', 'receptionist', 'doctor'), updateAppointmentStatus);

export default router;

