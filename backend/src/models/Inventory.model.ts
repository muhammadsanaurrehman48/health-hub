import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  itemCode: string;
  itemName: string;
  category: 'medicine' | 'equipment' | 'consumable';
  description?: string;
  unit: string;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  supplier?: string;
  batchNumber?: string;
  expiryDate?: Date;
  unitPrice: number;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    itemCode: {
      type: String,
      required: [true, 'Item code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['medicine', 'equipment', 'consumable'],
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: 0,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      required: [true, 'Minimum stock level is required'],
      min: 0,
      default: 0,
    },
    maxStockLevel: {
      type: Number,
      min: 0,
    },
    supplier: {
      type: String,
      trim: true,
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: 0,
    },
    department: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
InventorySchema.index({ itemCode: 1 });
InventorySchema.index({ category: 1 });
InventorySchema.index({ stockQuantity: 1 });

const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);

export default Inventory;

