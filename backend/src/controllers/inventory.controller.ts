import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Inventory from '../models/Inventory.model';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private (Inventory, Admin)
export const getAllInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search, lowStock } = req.query;

    let query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
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

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private (Inventory, Admin)
export const createInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inventory = await Inventory.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { inventory },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create inventory item',
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Inventory, Admin)
export const updateInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!inventory) {
      res.status(404).json({
        status: 'error',
        message: 'Inventory item not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { inventory },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update inventory item',
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin)
export const deleteInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);

    if (!inventory) {
      res.status(404).json({
        status: 'error',
        message: 'Inventory item not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Inventory item deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete inventory item',
    });
  }
};

// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts
// @access  Private (Inventory, Admin)
export const getStockAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inventory = await Inventory.find({
      $expr: { $lte: ['$stockQuantity', '$minStockLevel'] },
    }).sort({ stockQuantity: 1 });

    res.status(200).json({
      status: 'success',
      results: inventory.length,
      data: { inventory },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch stock alerts',
    });
  }
};

// @desc    Get inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private (Inventory, Admin)
export const getInventoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      res.status(404).json({
        status: 'error',
        message: 'Inventory item not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { inventory },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch inventory item',
    });
  }
};

