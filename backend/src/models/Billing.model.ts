import mongoose, { Document, Schema } from 'mongoose';

export interface IBillingItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  department: string;
}

export interface IBilling extends Document {
  invoiceNo: string;
  patient: mongoose.Types.ObjectId;
  billingDate: Date;
  items: IBillingItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: 'cash' | 'card' | 'online';
  department: string;
  createdBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BillingItemSchema = new Schema<IBillingItem>({
  itemName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  department: { type: String, required: true, trim: true },
});

const BillingSchema = new Schema<IBilling>(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
    },
    billingDate: {
      type: Date,
      default: Date.now,
    },
    items: [BillingItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    tax: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
BillingSchema.index({ invoiceNo: 1 });
BillingSchema.index({ patient: 1 });
BillingSchema.index({ billingDate: 1 });
BillingSchema.index({ paymentStatus: 1 });

const Billing = mongoose.model<IBilling>('Billing', BillingSchema);

export default Billing;

