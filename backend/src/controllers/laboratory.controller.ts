import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import LabTest from '../models/LabTest.model';
import Patient from '../models/Patient.model';
import Prescription from '../models/Prescription.model';

// @desc    Get all lab test requests
// @route   GET /api/laboratory/requests
// @access  Private (Laboratory)
export const getLabRequests = async (req: AuthRequest, res: Response): Promise<void> => {
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
          data: { labTests: [] },
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
          data: { labTests: [] },
        });
        return;
      }
    }

    const labTests = await LabTest.find(query)
      .populate('patient', 'firstName lastName mrNo forceNo')
      .populate('doctor', 'name')
      .sort({ requestedDate: -1 });

    res.status(200).json({
      status: 'success',
      results: labTests.length,
      data: { labTests },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch lab requests',
    });
  }
};

// @desc    Update lab test status
// @route   PATCH /api/laboratory/:id/status
// @access  Private (Laboratory)
export const updateLabTestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('patient doctor');

    if (!labTest) {
      res.status(404).json({
        status: 'error',
        message: 'Lab test not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { labTest },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update lab test',
    });
  }
};

// @desc    Record sample collection
// @route   PATCH /api/laboratory/:id/sample
// @access  Private (Laboratory)
export const recordSampleCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      {
        sampleCollectedDate: new Date(),
        sampleCollectedBy: req.user?._id,
        status: 'sample-collected',
      },
      { new: true, runValidators: true }
    ).populate('patient doctor');

    if (!labTest) {
      res.status(404).json({
        status: 'error',
        message: 'Lab test not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { labTest },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to record sample collection',
    });
  }
};

// @desc    Enter test results
// @route   PATCH /api/laboratory/:id/results
// @access  Private (Laboratory)
export const enterTestResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { results, notes } = req.body;

    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      {
        results,
        notes,
        status: 'completed',
        completedDate: new Date(),
        completedBy: req.user?._id,
      },
      { new: true, runValidators: true }
    ).populate('patient doctor');

    if (!labTest) {
      res.status(404).json({
        status: 'error',
        message: 'Lab test not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Test results entered successfully. Doctor will be notified.',
      data: { labTest },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to enter test results',
    });
  }
};

// @desc    Get lab test by ID
// @route   GET /api/laboratory/:id
// @access  Private (Laboratory, Doctor)
export const getLabTestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const labTest = await LabTest.findById(req.params.id)
      .populate('patient')
      .populate('doctor', 'name email')
      .populate('prescription');

    if (!labTest) {
      res.status(404).json({
        status: 'error',
        message: 'Lab test not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { labTest },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch lab test',
    });
  }
};

