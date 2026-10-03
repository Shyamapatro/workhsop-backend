import mongoose, { Schema, Document } from 'mongoose';

export interface ILearner extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  timezone: string;
  age: string;
  profession: string;
  marketingConsent: boolean;
  status: 'ACTIVE' | 'DELETED' | 'ONHOLD';
  createdAt: Date;
  updatedAt: Date;
}

const LearnerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    countryCode: { type: String, default: '+91' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    age: { type: String, required: true },
    profession: { type: String, required: true },
    marketingConsent: { type: Boolean, default: false },
    status: { type: String, enum: ['ACTIVE', 'DELETED', 'ONHOLD'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

// Indexes for fast querying (e.g., date ranges, email lookups)
LearnerSchema.index({ createdAt: -1 });

export default mongoose.models.Learner || mongoose.model<ILearner>('Learner', LearnerSchema);
