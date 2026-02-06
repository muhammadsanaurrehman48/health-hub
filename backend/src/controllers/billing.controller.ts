import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Billing from '../models/Billing.model';
import Patient from '../models/Patient.model';

// Generate invoice number
const generateInvoiceNo = async (): Promise<string> => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Billing.countDocuments({
    billingDate: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    },
  });
  return `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Create invoice
// @route   POST /api/billing
// @access  Private (Billing, Receptionist, Admin)
export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoiceNo = await generateInvoiceNo();

    // Calculate totals
    const subtotal = req.body.items.reduce((sum: number, item: any) => sum + item.total, 0);
    const discount = req.body.discount || 0;
    const tax = req.body.tax || 0;
    const totalAmount = subtotal - discount + tax;
    const paidAmount = req.body.paidAmount || 0;
    const remainingAmount = totalAmount - paidAmount;

    const paymentStatus =
      remainingAmount <= 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'pending';

    const billing = await Billing.create({
      ...req.body,
      invoiceNo,
      subtotal,
      totalAmount,
      paidAmount,
      remainingAmount,
      paymentStatus,
      createdBy: req.user?._id,
    });

    await billing.populate('patient createdBy');

    res.status(201).json({
      status: 'success',
      data: { billing },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create invoice',
    });
  }
};

// @desc    Get all invoices
// @route   GET /api/billing
// @access  Private (Billing, Receptionist, Admin)
export const getAllInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patient, department, paymentStatus, startDate, endDate } = req.query;

    let query: any = {};

    if (patient) {
      query.patient = patient;
    }

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

    const invoices = await Billing.find(query)
      .populate('patient', 'firstName lastName mrNo forceNo')
      .populate('createdBy', 'name')
      .sort({ billingDate: -1 });

    res.status(200).json({
      status: 'success',
      results: invoices.length,
      data: { invoices },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch invoices',
    });
  }
};

// @desc    Get invoice by ID
// @route   GET /api/billing/:id
// @access  Private (Billing, Receptionist, Admin)
export const getInvoiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await Billing.findById(req.params.id)
      .populate('patient')
      .populate('createdBy', 'name email');

    if (!invoice) {
      res.status(404).json({
        status: 'error',
        message: 'Invoice not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { billing: invoice },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch invoice',
    });
  }
};

// @desc    Process payment
// @route   PATCH /api/billing/:id/payment
// @access  Private (Billing, Receptionist, Admin)
export const processPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paidAmount, paymentMethod } = req.body;

    const invoice = await Billing.findById(req.params.id);

    if (!invoice) {
      res.status(404).json({
        status: 'error',
        message: 'Invoice not found',
      });
      return;
    }

    const newPaidAmount = invoice.paidAmount + paidAmount;
    const remainingAmount = invoice.totalAmount - newPaidAmount;
    const paymentStatus =
      remainingAmount <= 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending';

    const updatedInvoice = await Billing.findByIdAndUpdate(
      req.params.id,
      {
        paidAmount: newPaidAmount,
        remainingAmount,
        paymentStatus,
        paymentMethod,
      },
      { new: true, runValidators: true }
    ).populate('patient createdBy');

    res.status(200).json({
      status: 'success',
      data: { billing: updatedInvoice },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to process payment',
    });
  }
};

// @desc    Get billing reports
// @route   GET /api/billing/reports
// @access  Private (Billing, Admin)
export const getBillingReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, department } = req.query;

    let query: any = {};

    if (startDate && endDate) {
      query.billingDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    if (department) {
      query.department = department;
    }

    const invoices = await Billing.find(query);

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalPending = invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);
    const totalInvoices = invoices.length;

    // Group by department
    const departmentStats: Record<string, any> = {};
    invoices.forEach((inv) => {
      if (!departmentStats[inv.department]) {
        departmentStats[inv.department] = {
          totalRevenue: 0,
          totalPending: 0,
          count: 0,
        };
      }
      departmentStats[inv.department].totalRevenue += inv.paidAmount;
      departmentStats[inv.department].totalPending += inv.remainingAmount;
      departmentStats[inv.department].count += 1;
    });

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalRevenue,
          totalPending,
          totalInvoices,
        },
        departmentStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate reports',
    });
  }
};

