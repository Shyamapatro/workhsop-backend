import mongoose, { Schema, Document } from 'mongoose';

export interface IPartialLead extends Document {
  name?: string;
  email?: string;
  phoneNumber?: string;
  status: 'PENDING' | 'CONVERTED' | 'ABANDONED';
  learnerId?: mongoose.Types.ObjectId;
  route?: string;
  createdAt: Date;
  updatedAt: Date;
}

const partialLeadSchema = new Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: false, lowercase: true },
    phoneNumber: { type: String, required: false },
    status: {
      type: String,
      default: 'PENDING',
      enum: ['PENDING', 'CONVERTED', 'ABANDONED'],
    },
    learnerId: { type: Schema.Types.ObjectId, ref: 'Learner', required: false },
    route: { type: String, required: false },
  },
  { timestamps: true }
);

// Indexes to ensure the upsert is fast and efficient
partialLeadSchema.index({ email: 1 });
partialLeadSchema.index({ phoneNumber: 1 });
partialLeadSchema.index({ createdAt: -1 });

export default mongoose.models.PartialLead || mongoose.model<IPartialLead>('PartialLead', partialLeadSchema);
