import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Appointment from '../models/Appointment.model';
import Patient from '../models/Patient.model';

// Generate unique token number
const generateTokenNo = async (): Promise<string> => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Appointment.countDocuments({
    appointmentDate: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    },
  });
  return `TKN-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (Receptionist, Admin)
export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tokenNo = await generateTokenNo();

    const appointment = await Appointment.create({
      ...req.body,
      tokenNo,
      createdBy: req.user?._id,
    });

    await appointment.populate('patient doctor');

    res.status(201).json({
      status: 'success',
      data: { appointment },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create appointment',
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
export const getAllAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, status, doctor, patient } = req.query;

    let query: any = {};

    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    if (status) {
      query.status = status;
    }

    if (doctor) {
      query.doctor = doctor;
    }

    if (patient) {
      query.patient = patient;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName mrNo forceNo phone')
      .populate('doctor', 'name email')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: { appointments },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch appointments',
    });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate('doctor', 'name email department')
      .populate('createdBy', 'name');

    if (!appointment) {
      res.status(404).json({
        status: 'error',
        message: 'Appointment not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { appointment },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch appointment',
    });
  }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private (Doctor, Receptionist, Admin)
export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('patient doctor');

    if (!appointment) {
      res.status(404).json({
        status: 'error',
        message: 'Appointment not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { appointment },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update appointment',
    });
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/appointments/doctor/:doctorId
// @access  Private
export const getDoctorAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    let query: any = { doctor: doctorId };

    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.appointmentDate = { $gte: today, $lt: tomorrow };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName mrNo forceNo age gender')
      .sort({ appointmentTime: 1 });

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: { appointments },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch appointments',
    });
  }
};

