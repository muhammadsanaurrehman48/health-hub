import mongoose, { Document, Schema } from 'mongoose';

export interface IRadiologyTest extends Document {
  testNo: string;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  prescription?: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  testName: string;
  testType: 'X-Ray' | 'MRI' | 'CT-Scan' | 'Ultrasound' | 'Other';
  requestedDate: Date;
  reportFile?: string;
  reportUrl?: string;
  findings?: string;
  status: 'requested' | 'in-progress' | 'completed' | 'cancelled';
  completedDate?: Date;
  completedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RadiologyTestSchema = new Schema<IRadiologyTest>(
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
      enum: ['X-Ray', 'MRI', 'CT-Scan', 'Ultrasound', 'Other'],
      required: [true, 'Test type is required'],
    },
    requestedDate: {
      type: Date,
      default: Date.now,
    },
    reportFile: {
      type: String,
    },
    reportUrl: {
      type: String,
    },
    findings: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['requested', 'in-progress', 'completed', 'cancelled'],
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
RadiologyTestSchema.index({ testNo: 1 });
RadiologyTestSchema.index({ patient: 1 });
RadiologyTestSchema.index({ doctor: 1 });
RadiologyTestSchema.index({ status: 1 });

const RadiologyTest = mongoose.model<IRadiologyTest>('RadiologyTest', RadiologyTestSchema);

export default RadiologyTest;

