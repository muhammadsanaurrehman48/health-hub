import mongoose, { Document, Schema } from 'mongoose';

export interface IFamilyMember {
  name: string;
  relation: string;
  age: number;
  gender: 'male' | 'female' | 'other';
}

export interface IPatient extends Document {
  forceNo: string;
  mrNo: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: Date;
  bloodGroup?: string;
  cnic?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  familyMembers: IFamilyMember[];
  allergies?: string;
  existingConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FamilyMemberSchema = new Schema<IFamilyMember>({
  name: { type: String, required: true, trim: true },
  relation: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
});

const PatientSchema = new Schema<IPatient>(
  {
    forceNo: {
      type: String,
      required: [true, 'Force number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    mrNo: {
      type: String,
      required: [true, 'MR number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    cnic: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    emergencyContact: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      relation: { type: String, required: true, trim: true },
    },
    familyMembers: [FamilyMemberSchema],
    allergies: {
      type: String,
      trim: true,
    },
    existingConditions: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
PatientSchema.index({ forceNo: 1 });
PatientSchema.index({ mrNo: 1 });
PatientSchema.index({ phone: 1 });

const Patient = mongoose.model<IPatient>('Patient', PatientSchema);

export default Patient;

