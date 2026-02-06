import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Appointment from '../models/Appointment.model';
import Billing from '../models/Billing.model';
import Patient from '../models/Patient.model';

// @desc    Get receptionist dashboard stats
// @route   GET /api/receptionist/dashboard
// @access  Private (Receptionist)
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayAppointments, todayBills, totalPatients, pendingBills] = await Promise.all([
      Appointment.countDocuments({
        appointmentDate: { $gte: today, $lt: tomorrow },
      }),
      Billing.countDocuments({
        billingDate: { $gte: today, $lt: tomorrow },
      }),
      Patient.countDocuments(),
      Billing.countDocuments({ paymentStatus: { $in: ['pending', 'partial'] } }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        todayAppointments,
        todayBills,
        totalPatients,
        pendingBills,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch dashboard stats',
    });
  }
};

// @desc    Get all payments and bills
// @route   GET /api/receptionist/bills
// @access  Private (Receptionist)
export const getAllBills = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { department, paymentStatus, startDate, endDate } = req.query;

    let query: any = {};

    if (department) {
      query.department = department;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (startDate && endDate) {
      query.billingDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const bills = await Billing.find(query)
      .populate('patient', 'firstName lastName mrNo forceNo')
      .populate('createdBy', 'name')
      .sort({ billingDate: -1 });

    res.status(200).json({
      status: 'success',
      results: bills.length,
      data: { bills },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch bills',
    });
  }
};

