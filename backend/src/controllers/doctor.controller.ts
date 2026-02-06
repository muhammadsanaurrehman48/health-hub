import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Appointment from '../models/Appointment.model';
import Prescription from '../models/Prescription.model';
import LabTest from '../models/LabTest.model';
import RadiologyTest from '../models/RadiologyTest.model';
import Patient from '../models/Patient.model';

// Generate prescription number
const generatePrescriptionNo = async (): Promise<string> => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Prescription.countDocuments({
    createdAt: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    },
  });
  return `PRES-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Get patient medical history
// @route   GET /api/doctor/patient/:patientId/history
// @access  Private (Doctor)
export const getPatientHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    const [appointments, prescriptions, labTests, radiologyTests] = await Promise.all([
      Appointment.find({ patient: patientId })
        .populate('doctor', 'name')
        .sort({ appointmentDate: -1 }),
      Prescription.find({ patient: patientId })
        .populate('doctor', 'name')
        .sort({ createdAt: -1 }),
      LabTest.find({ patient: patientId })
        .populate('doctor', 'name')
        .sort({ createdAt: -1 }),
      RadiologyTest.find({ patient: patientId })
        .populate('doctor', 'name')
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        appointments,
        prescriptions,
        labTests,
        radiologyTests,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch patient history',
    });
  }
};

// @desc    Create prescription
// @route   POST /api/doctor/prescription
// @access  Private (Doctor)
export const createPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prescriptionNo = await generatePrescriptionNo();

    const prescription = await Prescription.create({
      ...req.body,
      prescriptionNo,
      doctor: req.user?._id,
    });

    await prescription.populate('patient doctor');

    res.status(201).json({
      status: 'success',
      data: { prescription },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create prescription',
    });
  }
};

// @desc    Request lab test
// @route   POST /api/doctor/lab-test
// @access  Private (Doctor)
export const requestLabTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const testNo = `LAB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const labTest = await LabTest.create({
      ...req.body,
      testNo,
      doctor: req.user?._id,
      status: 'requested',
    });

    await labTest.populate('patient doctor');

    res.status(201).json({
      status: 'success',
      message: 'Lab test requested successfully. Laboratory will be notified.',
      data: { labTest },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to request lab test',
    });
  }
};

// @desc    Request radiology test
// @route   POST /api/doctor/radiology-test
// @access  Private (Doctor)
export const requestRadiologyTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const testNo = `RAD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const radiologyTest = await RadiologyTest.create({
      ...req.body,
      testNo,
      doctor: req.user?._id,
      status: 'requested',
    });

    await radiologyTest.populate('patient doctor');

    res.status(201).json({
      status: 'success',
      message: 'Radiology test requested successfully. Radiologist will be notified.',
      data: { radiologyTest },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to request radiology test',
    });
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/doctor/appointments
// @access  Private (Doctor)
export const getMyAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, status } = req.query;

    let query: any = { doctor: req.user?._id };

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

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName mrNo forceNo age gender phone')
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

