import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Patient from '../models/Patient.model';

// @desc    Register new patient
// @route   POST /api/patients
// @access  Private (Receptionist, Admin)
export const registerPatient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientData = req.body;

    // Check if Force No already exists
    if (patientData.forceNo) {
      const existingForceNo = await Patient.findOne({ forceNo: patientData.forceNo });
      if (existingForceNo) {
        res.status(400).json({
          status: 'error',
          message: 'Patient with this Force No already exists',
        });
        return;
      }
    }

    // Check if MR No already exists
    if (patientData.mrNo) {
      const existingMRNo = await Patient.findOne({ mrNo: patientData.mrNo });
      if (existingMRNo) {
        res.status(400).json({
          status: 'error',
          message: 'Patient with this MR No already exists',
        });
        return;
      }
    }

    const patient = await Patient.create(patientData);

    res.status(201).json({
      status: 'success',
      data: { patient },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to register patient',
    });
  }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
export const getAllPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, forceNo, mrNo } = req.query;

    let query: any = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { mrNo: { $regex: search, $options: 'i' } },
      ];
    }

    if (forceNo) {
      query.forceNo = forceNo;
    }

    if (mrNo) {
      query.mrNo = mrNo;
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: patients.length,
      data: { patients },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch patients',
    });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
export const getPatientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      res.status(404).json({
        status: 'error',
        message: 'Patient not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { patient },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch patient',
    });
  }
};

// @desc    Search patients by Force No
// @route   GET /api/patients/search/force/:forceNo
// @access  Private
export const searchByForceNo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { forceNo } = req.params;

    const patients = await Patient.find({
      $or: [
        { forceNo: { $regex: forceNo, $options: 'i' } },
      ],
    }).populate('familyMembers');

    res.status(200).json({
      status: 'success',
      results: patients.length,
      data: { patients },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to search patients',
    });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (Receptionist, Admin)
export const updatePatient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      res.status(404).json({
        status: 'error',
        message: 'Patient not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { patient },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update patient',
    });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin)
export const deletePatient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      res.status(404).json({
        status: 'error',
        message: 'Patient not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Patient deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete patient',
    });
  }
};

