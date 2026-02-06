import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import NurseRecord from '../models/NurseRecord.model';
import Patient from '../models/Patient.model';

// @desc    Record vital signs
// @route   POST /api/nurse/vitals
// @access  Private (Nurse)
export const recordVitalSigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const nurseRecord = await NurseRecord.create({
      ...req.body,
      recordedBy: req.user?._id,
    });

    await nurseRecord.populate('patient appointment');

    res.status(201).json({
      status: 'success',
      data: { nurseRecord },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to record vital signs',
    });
  }
};

// @desc    Get all nurse records
// @route   GET /api/nurse/records
// @access  Private (Nurse, Doctor)
export const getNurseRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patient, date } = req.query;

    let query: any = {};

    if (patient) {
      query.patient = patient;
    }

    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const records = await NurseRecord.find(query)
      .populate('patient', 'firstName lastName mrNo')
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: records.length,
      data: { records },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch nurse records',
    });
  }
};

// @desc    Add medication record
// @route   PATCH /api/nurse/records/:id/medication
// @access  Private (Nurse)
export const addMedicationRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { medicineName, dosage, time } = req.body;

    const record = await NurseRecord.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          medicationRecords: {
            medicineName,
            dosage,
            time,
            administeredBy: req.user?._id,
          },
        },
      },
      { new: true, runValidators: true }
    ).populate('patient');

    if (!record) {
      res.status(404).json({
        status: 'error',
        message: 'Record not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { nurseRecord: record },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to add medication record',
    });
  }
};

// @desc    Update care notes
// @route   PATCH /api/nurse/records/:id/notes
// @access  Private (Nurse)
export const updateCareNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { careNotes } = req.body;

    const record = await NurseRecord.findByIdAndUpdate(
      req.params.id,
      { careNotes },
      { new: true, runValidators: true }
    ).populate('patient');

    if (!record) {
      res.status(404).json({
        status: 'error',
        message: 'Record not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { nurseRecord: record },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update care notes',
    });
  }
};

// @desc    Get nurse record by ID
// @route   GET /api/nurse/records/:id
// @access  Private (Nurse, Doctor)
export const getNurseRecordById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const record = await NurseRecord.findById(req.params.id)
      .populate('patient')
      .populate('recordedBy', 'name email')
      .populate('appointment');

    if (!record) {
      res.status(404).json({
        status: 'error',
        message: 'Record not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { nurseRecord: record },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch record',
    });
  }
};

