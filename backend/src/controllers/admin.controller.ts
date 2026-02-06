import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User.model';
import Patient from '../models/Patient.model';
import Appointment from '../models/Appointment.model';
import Billing from '../models/Billing.model';
import Inventory from '../models/Inventory.model';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, department, search } = req.query;

    let query: any = {};

    if (role) {
      query.role = role;
    }

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch users',
    });
  }
};

// @desc    Create user
// @route   POST /api/admin/users
// @access  Private (Admin)
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create user',
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update user',
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete user',
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalPatients,
      todayAppointments,
      totalBills,
      totalRevenue,
      lowStockItems,
    ] = await Promise.all([
      User.countDocuments(),
      Patient.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      Billing.countDocuments(),
      Billing.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$paidAmount' },
          },
        },
      ]),
      Inventory.countDocuments({
        $expr: { $lte: ['$stockQuantity', '$minStockLevel'] },
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalPatients,
        todayAppointments,
        totalBills,
        totalRevenue: totalRevenue[0]?.total || 0,
        lowStockItems,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch dashboard stats',
    });
  }
};

// @desc    Get reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, type } = req.query;

    let start = startDate ? new Date(startDate as string) : new Date();
    start.setHours(0, 0, 0, 0);
    let end = endDate ? new Date(endDate as string) : new Date();
    end.setHours(23, 59, 59, 999);

    const reports: any = {};

    if (!type || type === 'billing') {
      const billingReports = await Billing.find({
        billingDate: { $gte: start, $lte: end },
      }).populate('patient', 'firstName lastName');

      reports.billing = {
        totalRevenue: billingReports.reduce((sum, b) => sum + b.paidAmount, 0),
        totalPending: billingReports.reduce((sum, b) => sum + b.remainingAmount, 0),
        totalInvoices: billingReports.length,
        invoices: billingReports,
      };
    }

    if (!type || type === 'appointments') {
      const appointments = await Appointment.find({
        appointmentDate: { $gte: start, $lte: end },
      })
        .populate('patient', 'firstName lastName')
        .populate('doctor', 'name');

      reports.appointments = {
        total: appointments.length,
        byStatus: {
          scheduled: appointments.filter((a) => a.status === 'scheduled').length,
          completed: appointments.filter((a) => a.status === 'completed').length,
          cancelled: appointments.filter((a) => a.status === 'cancelled').length,
        },
        appointments,
      };
    }

    res.status(200).json({
      status: 'success',
      data: { reports },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate reports',
    });
  }
};

