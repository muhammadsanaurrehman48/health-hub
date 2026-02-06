import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Prescription from '../models/Prescription.model';
import Patient from '../models/Patient.model';
import Inventory from '../models/Inventory.model';

// @desc    Get all prescriptions
// @route   GET /api/pharmacy/prescriptions
// @access  Private (Pharmacy)
export const getPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
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
          data: { prescriptions: [] },
        });
        return;
      }
    }

    if (prescriptionNo) {
      query.prescriptionNo = prescriptionNo;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName mrNo forceNo phone')
      .populate('doctor', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: prescriptions.length,
      data: { prescriptions },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch prescriptions',
    });
  }
};

// @desc    Dispense prescription
// @route   PATCH /api/pharmacy/prescription/:id/dispense
// @access  Private (Pharmacy)
export const dispensePrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status: 'dispensed' },
      { new: true, runValidators: true }
    ).populate('patient doctor');

    if (!prescription) {
      res.status(404).json({
        status: 'error',
        message: 'Prescription not found',
      });
      return;
    }

    // Update inventory for each medicine (if tracking is needed)
    // This is a simplified version - you may want to add more logic here

    res.status(200).json({
      status: 'success',
      message: 'Prescription dispensed successfully',
      data: { prescription },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to dispense prescription',
    });
  }
};

// @desc    Get pharmacy inventory
// @route   GET /api/pharmacy/inventory
// @access  Private (Pharmacy)
export const getPharmacyInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, lowStock } = req.query;

    let query: any = { category: 'medicine' };

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } },
      ];
    }

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stockQuantity', '$minStockLevel'] };
    }

    const inventory = await Inventory.find(query).sort({ itemName: 1 });

    res.status(200).json({
      status: 'success',
      results: inventory.length,
      data: { inventory },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch inventory',
    });
  }
};

// @desc    Get prescription by ID
// @route   GET /api/pharmacy/prescription/:id
// @access  Private (Pharmacy)
export const getPrescriptionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate('doctor', 'name email')
      .populate('appointment');

    if (!prescription) {
      res.status(404).json({
        status: 'error',
        message: 'Prescription not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { prescription },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch prescription',
    });
  }
};

