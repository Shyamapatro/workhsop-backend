import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkshopCommunityLink extends Document {
  category: string;
  route: string;
  whatsappLink: string;
  workshopDate: string;
  workshopTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const workshopCommunityLinkSchema = new Schema(
  {
    category: { type: String, required: true },
    route: { type: String, required: true },
    whatsappLink: { type: String, required: true },
    workshopDate: { type: String, required: true },
    workshopTime: { type: String, required: true },
  },
  { timestamps: true }
);

workshopCommunityLinkSchema.index({ route: 1 });

export default mongoose.models.WorkshopCommunityLink || mongoose.model<IWorkshopCommunityLink>('WorkshopCommunityLink', workshopCommunityLinkSchema);
