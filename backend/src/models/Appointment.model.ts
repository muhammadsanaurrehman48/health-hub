import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  appointmentDate: Date;
  appointmentTime: string;
  tokenNo: string;
  complaint: string;
  status: 'scheduled' | 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  type: 'OPD' | 'IPD';
  createdBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
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
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required'],
    },
    tokenNo: {
      type: String,
      required: true,
      unique: true,
    },
    complaint: {
      type: String,
      required: [true, 'Complaint is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'waiting', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    type: {
      type: String,
      enum: ['OPD', 'IPD'],
      required: [true, 'Appointment type is required'],
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
AppointmentSchema.index({ patient: 1 });
AppointmentSchema.index({ doctor: 1 });
AppointmentSchema.index({ appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });

const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;

