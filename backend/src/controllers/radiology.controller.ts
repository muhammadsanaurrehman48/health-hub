import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import RadiologyTest from '../models/RadiologyTest.model';
import Patient from '../models/Patient.model';
import Prescription from '../models/Prescription.model';

// @desc    Get all radiology test requests
// @route   GET /api/radiology/requests
// @access  Private (Radiologist)
export const getRadiologyRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, mrNo, prescriptionNo } = req.query;

    let query: any = {};

    if (status) {
      query.status = status;
    }

    if (mrNo) {
      const patient = await Patient.findOne({ mrNo: mrNo as string });
      if (patient) {
        query.patient = patient._id;
      } else {
        res.status(200).json({
          status: 'success',
          results: 0,
          data: { radiologyTests: [] },
        });
        return;
      }
    }

    if (prescriptionNo) {
      const prescription = await Prescription.findOne({ prescriptionNo: prescriptionNo as string });
      if (prescription) {
        query.prescription = prescription._id;
      } else {
        res.status(200).json({
          status: 'success',
          results: 0,
          data: { radiologyTests: [] },
        });
        return;
      }
    }

    const radiologyTests = await RadiologyTest.find(query)
      .populate('patient', 'firstName lastName mrNo forceNo')
      .populate('doctor', 'name')
      .sort({ requestedDate: -1 });

    res.status(200).json({
      status: 'success',
      results: radiologyTests.length,
      data: { radiologyTests },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch radiology requests',
    });
  }
};

// @desc    Upload radiology report
// @route   PATCH /api/radiology/:id/upload
// @access  Private (Radiologist)
export const uploadReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reportUrl, reportFile, findings, notes } = req.body;

    const radiologyTest = await RadiologyTest.findByIdAndUpdate(
      req.params.id,
      {
        reportUrl,
        reportFile,
        findings,
        notes,
        status: 'completed',
        completedDate: new Date(),
        completedBy: req.user?._id,
      },
      { new: true, runValidators: true }
    ).populate('patient doctor');

    if (!radiologyTest) {
      res.status(404).json({
        status: 'error',
        message: 'Radiology test not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Report uploaded successfully. Doctor will be notified.',
      data: { radiologyTest },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to upload report',
    });
  }
};

// @desc    Get radiology test by ID
// @route   GET /api/radiology/:id
// @access  Private (Radiologist, Doctor)
export const getRadiologyTestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const radiologyTest = await RadiologyTest.findById(req.params.id)
      .populate('patient')
      .populate('doctor', 'name email')
      .populate('prescription');

    if (!radiologyTest) {
      res.status(404).json({
        status: 'error',
        message: 'Radiology test not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { radiologyTest },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch radiology test',
    });
  }
};

// @desc    Update radiology test status
// @route   PATCH /api/radiology/:id/status
// @access  Private (Radiologist)
export const updateRadiologyTestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    const radiologyTest = await RadiologyTest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('patient doctor');

    if (!radiologyTest) {
      res.status(404).json({
        status: 'error',
        message: 'Radiology test not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { radiologyTest },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update radiology test',
    });
  }
};

