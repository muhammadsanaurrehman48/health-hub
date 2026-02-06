import mongoose, { Document, Schema } from 'mongoose';

export interface ILabTest extends Document {
  testNo: string;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  prescription?: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  testName: string;
  testType: string;
  requestedDate: Date;
  sampleCollectedDate?: Date;
  sampleCollectedBy?: mongoose.Types.ObjectId;
  results?: Record<string, any>;
  status: 'requested' | 'sample-collected' | 'in-progress' | 'completed' | 'cancelled';
  completedDate?: Date;
  completedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabTestSchema = new Schema<ILabTest>(
  {
    testNo: {
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
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor is required'],
    },
    prescription: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    testName: {
      type: String,
      required: [true, 'Test name is required'],
      trim: true,
    },
    testType: {
      type: String,
      required: [true, 'Test type is required'],
      trim: true,
    },
    requestedDate: {
      type: Date,
      default: Date.now,
    },
    sampleCollectedDate: {
      type: Date,
    },
    sampleCollectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    results: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['requested', 'sample-collected', 'in-progress', 'completed', 'cancelled'],
      default: 'requested',
    },
    completedDate: {
      type: Date,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
LabTestSchema.index({ testNo: 1 });
LabTestSchema.index({ patient: 1 });
LabTestSchema.index({ doctor: 1 });
LabTestSchema.index({ status: 1 });

const LabTest = mongoose.model<ILabTest>('LabTest', LabTestSchema);

export default LabTest;

