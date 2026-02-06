import mongoose, { Document, Schema } from 'mongoose';

export interface IVitalSigns {
  temperature?: number;
  bloodPressure?: string;
  pulse?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface INurseRecord extends Document {
  patient: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  vitalSigns: IVitalSigns;
  medicationRecords?: Array<{
    medicineName: string;
    dosage: string;
    time: Date;
    administeredBy: mongoose.Types.ObjectId;
  }>;
  careNotes?: string;
  ward?: string;
  bedNumber?: string;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VitalSignsSchema = new Schema<IVitalSigns>({
  temperature: { type: Number },
  bloodPressure: { type: String },
  pulse: { type: Number },
  respiratoryRate: { type: Number },
  oxygenSaturation: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  bmi: { type: Number },
});

const MedicationRecordSchema = new Schema({
  medicineName: { type: String, required: true, trim: true },
  dosage: { type: String, required: true, trim: true },
  time: { type: Date, required: true },
  administeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const NurseRecordSchema = new Schema<INurseRecord>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    vitalSigns: {
      type: VitalSignsSchema,
      required: true,
    },
    medicationRecords: [MedicationRecordSchema],
    careNotes: {
      type: String,
      trim: true,
    },
    ward: {
      type: String,
      trim: true,
    },
    bedNumber: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recorded by is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NurseRecordSchema.index({ patient: 1 });
NurseRecordSchema.index({ recordedBy: 1 });

const NurseRecord = mongoose.model<INurseRecord>('NurseRecord', NurseRecordSchema);

export default NurseRecord;

